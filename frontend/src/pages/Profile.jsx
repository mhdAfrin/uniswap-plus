import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Avatar, RatingStars, ListingCard } from "../components/components";

export default function Profile() {
  const { user, updateCachedUser } = useAuth();
  const [form, setForm] = useState({
    bio: user?.bio || "",
    skills: (user?.skills || []).join(", "),
    interests: (user?.interests || []).join(", "),
  });
  const [saved, setSaved] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [listingsRes, reviewsRes] = await Promise.all([
        api.get("/listings/mine"),
        api.get(`/reviews/user/${user._id}`),
      ]);
      setMyListings(listingsRes.data.listings);
      setReviews(reviewsRes.data.reviews);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      bio: form.bio,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const res = await api.put("/users/me", payload);
    updateCachedUser(res.data.user);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <div className="profile-header">
        <Avatar name={user.name} color={user.avatarColor} size={72} />
        <div>
          <h1>{user.name}</h1>
          <p className="muted">
            {user.department} {user.yearOfStudy ? `· Year ${user.yearOfStudy}` : ""}
          </p>
          <RatingStars value={user.ratingAverage || 0} count={user.ratingCount || 0} />
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="section">
            <h3>Edit profile</h3>
            <form className="form" onSubmit={handleSave}>
              <label>
                Bio
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </label>
              <label>
                Skills (comma separated)
                <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              </label>
              <label>
                Interests (comma separated)
                <input
                  value={form.interests}
                  onChange={(e) => setForm({ ...form, interests: e.target.value })}
                />
              </label>
              <button className="btn btn-primary">Save changes</button>
              {saved && <span className="muted"> Saved!</span>}
            </form>
          </section>

          <section className="section">
            <h3>Your listings</h3>
            <div className="grid grid-3">
              {myListings.length === 0 && <p className="muted">You haven't posted any listings yet.</p>}
              {myListings.map((listing) => (
                <ListingCard key={listing._id} listing={{ ...listing, owner: user }} />
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-side">
          <div className="owner-card">
            <h4>Reviews received</h4>
            {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-item-top">
                  <Avatar name={review.reviewer.name} color={review.reviewer.avatarColor} size={24} />
                  <strong>{review.reviewer.name}</strong>
                  <RatingStars value={review.rating} />
                </div>
                {review.comment && <p>{review.comment}</p>}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
