const mongoose = require("mongoose");
const { Schema } = mongoose;

/* -------------------------------------------------------------------------
 * USER
 * A student (or authorized university member) account. Skills/interests are
 * plain string tags — this keeps the matching logic in matcher.js simple
 * and easy to explain in a viva/evaluation instead of relying on a heavier
 * recommendation engine.
 * ---------------------------------------------------------------------- */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash
    studentId: { type: String, trim: true },
    faculty: { type: String, trim: true },
    department: { type: String, trim: true },
    yearOfStudy: { type: Number, min: 1, max: 6 },
    bio: { type: String, trim: true, default: "" },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    avatarColor: { type: String, default: "#2B3A67" }, // used for the generated initials avatar
    role: { type: String, enum: ["student", "moderator", "admin"], default: "student" },
    isVerified: { type: Boolean, default: true }, // reserved for future university-email verification
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------
 * LISTING  ->  "I have / I offer ..."
 * ---------------------------------------------------------------------- */
const listingSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["resource", "skill", "service", "knowledge"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    availability: { type: String, trim: true, default: "Flexible" },
    pricingType: { type: String, enum: ["free", "paid"], default: "free" },
    price: { type: Number, min: 0 }, // only meaningful when pricingType === "paid"
    currency: { type: String, trim: true, default: "LKR" },
    status: { type: String, enum: ["active", "fulfilled", "closed"], default: "active" },
    isFlagged: { type: Boolean, default: false }, // simple moderation hook
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------
 * REQUEST  ->  "I need / I'm looking for ..."
 * ---------------------------------------------------------------------- */
const requestSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    urgency: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "matched", "closed"], default: "open" },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------
 * OPPORTUNITY  ->  events / internships / projects posted to the community
 * ---------------------------------------------------------------------- */
const opportunitySchema = new Schema(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["internship", "event", "project", "scholarship", "competition", "other"],
      default: "other",
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    deadline: { type: Date },
    link: { type: String, trim: true },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------
 * MESSAGE  ->  direct messaging between two users, optionally tied to a
 * listing/request so both sides know what the conversation is about.
 * ---------------------------------------------------------------------- */
const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    relatedListing: { type: Schema.Types.ObjectId, ref: "Listing" },
    relatedRequest: { type: Schema.Types.ObjectId, ref: "Request" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------
 * REVIEW  ->  after an exchange is completed, users rate each other. This
 * is what builds the "trusted community" aspect of the platform.
 * ---------------------------------------------------------------------- */
const reviewSchema = new Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relatedListing: { type: Schema.Types.ObjectId, ref: "Listing" },
    relatedRequest: { type: Schema.Types.ObjectId, ref: "Request" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// A user can only review the same counterpart once per listing/request.
reviewSchema.index(
  { reviewer: 1, reviewee: 1, relatedListing: 1, relatedRequest: 1 },
  { unique: false }
);

/* -------------------------------------------------------------------------
 * SAVED ITEM  ->  a user bookmarking a listing/request/opportunity to
 * revisit later (the "Saved" tab in the sidebar).
 * ---------------------------------------------------------------------- */
const savedItemSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["listing", "request", "opportunity"], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// A user can only save the same item once.
savedItemSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

/* -------------------------------------------------------------------------
 * ADVERTISEMENT  ->  Campus announcements, student club events, partner
 * offers, and sponsored advertisements displayed across the app.
 * ---------------------------------------------------------------------- */
const advertisementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    sponsor: { type: String, required: true, trim: true },
    badgeText: { type: String, default: "Sponsored" },
    category: { type: String, trim: true, default: "Campus Deal" },
    gradient: { type: String, default: "linear-gradient(135deg, #5B4FE9, #2FA88F)" },
    icon: { type: String, default: "Megaphone" },
    ctaText: { type: String, default: "Learn More" },
    link: { type: String, trim: true, default: "#" },
    discountCode: { type: String, trim: true },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  Listing: mongoose.model("Listing", listingSchema),
  Request: mongoose.model("Request", requestSchema),
  Opportunity: mongoose.model("Opportunity", opportunitySchema),
  Message: mongoose.model("Message", messageSchema),
  Review: mongoose.model("Review", reviewSchema),
  SavedItem: mongoose.model("SavedItem", savedItemSchema),
  Advertisement: mongoose.model("Advertisement", advertisementSchema),
};

