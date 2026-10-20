/**
 * Populates the database from backend/data/dummyData.js — the single file
 * holding every piece of demo content (students, listings, requests,
 * opportunities, messages, reviews, saved items, and ad banners).
 *
 * Run with:  npm run seed   (from the backend/ folder)
 *
 * If data/dummyData.js has been deleted, this script does NOT touch your
 * database — it just logs a message and exits. That's the intended way to
 * remove all dummy data from the project: delete the file, run `npm run
 * seed` once more, and everything demo-related (including the ad banners)
 * disappears without needing any other code changes.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const {
  User,
  Listing,
  Request,
  Opportunity,
  Message,
  Review,
  SavedItem,
  Advertisement,
} = require("../models/models");

const DEMO_PASSWORD = "password123";

let dummy;
try {
  dummy = require("../data/dummyData");
} catch (err) {
  console.log("No backend/data/dummyData.js file found — nothing to seed.");
  console.log("Your database has not been changed.");
  process.exit(0);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Request.deleteMany({}),
    Opportunity.deleteMany({}),
    Message.deleteMany({}),
    Review.deleteMany({}),
    SavedItem.deleteMany({}),
    Advertisement.deleteMany({}),
  ]);

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const createdUsers = [];
  for (const u of dummy.students) {
    const user = await User.create({ ...u, password: hashedPassword });
    createdUsers.push(user);
  }
  const userId = (index) => createdUsers[index]._id;

  const createdListings = [];
  for (const l of dummy.listings) {
    const { ownerIndex, ...rest } = l;
    const listing = await Listing.create({ ...rest, owner: userId(ownerIndex) });
    createdListings.push(listing);
  }

  const createdRequests = [];
  for (const r of dummy.requests) {
    const { ownerIndex, ...rest } = r;
    const request = await Request.create({ ...rest, owner: userId(ownerIndex) });
    createdRequests.push(request);
  }

  for (const o of dummy.opportunities) {
    const { postedByIndex, deadline, ...rest } = o;
    await Opportunity.create({
      ...rest,
      postedBy: userId(postedByIndex),
      deadline: deadline ? new Date(deadline) : undefined,
    });
  }

  for (const m of dummy.messages || []) {
    const { senderIndex, receiverIndex, relatedListingIndex, relatedRequestIndex, ...rest } = m;
    await Message.create({
      ...rest,
      sender: userId(senderIndex),
      receiver: userId(receiverIndex),
      relatedListing:
        relatedListingIndex !== undefined ? createdListings[relatedListingIndex]._id : undefined,
      relatedRequest:
        relatedRequestIndex !== undefined ? createdRequests[relatedRequestIndex]._id : undefined,
    });
  }

  for (const r of dummy.reviews || []) {
    const { reviewerIndex, revieweeIndex, ...rest } = r;
    await Review.create({ ...rest, reviewer: userId(reviewerIndex), reviewee: userId(revieweeIndex) });
  }

  // Recompute rating aggregates the same way the API does after a review.
  for (const u of createdUsers) {
    const userReviews = await Review.find({ reviewee: u._id });
    const ratingCount = userReviews.length;
    const ratingAverage = ratingCount
      ? userReviews.reduce((sum, rv) => sum + rv.rating, 0) / ratingCount
      : 0;
    u.ratingCount = ratingCount;
    u.ratingAverage = Math.round(ratingAverage * 10) / 10;
    await u.save();
  }

  for (const s of dummy.savedItems || []) {
    const itemId =
      s.itemType === "listing"
        ? createdListings[s.itemIndex]._id
        : createdRequests[s.itemIndex]._id;
    await SavedItem.create({ user: userId(s.userIndex), itemType: s.itemType, itemId });
  }

  for (const ad of dummy.advertisements || []) {
    await Advertisement.create(ad);
  }

  console.log("Seed data created successfully:");
  console.log(`  - ${createdUsers.length} demo users (password for all: ${DEMO_PASSWORD})`);
  console.log(
    `  - ${createdListings.length} listings, ${createdRequests.length} requests, ${dummy.opportunities.length} opportunities`
  );
  console.log(
    `  - a populated inbox, reviews, saved items and ${dummy.advertisements ? dummy.advertisements.length : 0} demo ad banners`
  );

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
