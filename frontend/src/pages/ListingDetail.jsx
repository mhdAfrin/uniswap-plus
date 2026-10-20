import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Avatar,
  RatingStars,
  TagList,
  MatchRow,
  CategoryThumb,
  PriceTag,
  SaveButton,
} from "../components/components";
import { CATEGORY_OPTIONS, AVAILABILITY_OPTIONS } from "../constants/formOptions";

const TYPES = ["resource", "skill", "service", "knowledge"];
const STATUS_OPTIONS = ["active", "fulfilled", "closed"];

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [matches, setMatches] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendStatus, setSendStatus] = useState("");

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Safe delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [listingRes, matchesRes] = await Promise.all([
        api.get(`/listings/${id}`),
        api.get(`/listings/${id}/matches`),
      ]);
      setListing(listingRes.data.listing);
      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      console.error("Failed to load listing details:", err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!listing) return <div className="page">Loading listing details…</div>;

  const isOwner = listing.owner?._id === user?._id;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendStatus("");
    try {
      await api.post("/messages", {
        receiver: listing.owner._id,
        content: messageText,
        relatedListing: listing._id,
      });
      setMessageText("");
      setSendStatus("Message sent — check your Messages inbox.");
    } catch (err) {
      setSendStatus(err.response?.data?.message || "Could not send message.");
    }
  };

  const openEditModal = () => {
    const isStandardCat = CATEGORY_OPTIONS.includes(listing.category);
    const isStandardAvail = AVAILABILITY_OPTIONS.includes(listing.availability);

    setEditForm({
      type: listing.type || "resource",
      title: listing.title || "",
      description: listing.description || "",
      category: isStandardCat ? listing.category : "Other",
      categoryOther: isStandardCat ? "" : listing.category,
      tags: Array.isArray(listing.tags) ? listing.tags.join(", ") : (listing.tags || ""),
      availability: isStandardAvail ? listing.availability : "Other",
      availabilityOther: isStandardAvail ? "" : listing.availability,
      pricingType: listing.pricingType || "free",
      price: listing.price !== undefined && listing.price !== null ? String(listing.price) : "",
      status: listing.status || "active",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editForm.title || editForm.title.trim().length < 3) {
      setEditError("Title must be at least 3 characters.");
      return;
    }
    if (!editForm.description || editForm.description.trim().length < 10) {
      setEditError("Description must be at least 10 characters.");
      return;
    }
    if (editForm.pricingType === "paid" && (editForm.price === "" || Number(editForm.price) < 0)) {
      setEditError("Price must be a valid non-negative amount.");
      return;
    }

    setSubmittingEdit(true);
    try {
      const resolvedCategory =
        editForm.category === "Other" ? editForm.categoryOther.trim() : editForm.category;
      const resolvedAvailability =
        editForm.availability === "Other"
          ? editForm.availabilityOther.trim()
          : editForm.availability;

      const res = await api.put(`/listings/${listing._id}`, {
        type: editForm.type,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: resolvedCategory,
        availability: resolvedAvailability,
        tags: editForm.tags,
        pricingType: editForm.pricingType,
        price: editForm.pricingType === "paid" ? Number(editForm.price) : undefined,
        status: editForm.status,
      });

      setListing(res.data.listing);
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update listing.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/listings/${listing._id}`);
      navigate("/my-listings");
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete listing.");
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>
        <ChevronLeft size={16} /> Back
      </button>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-hero">
            <CategoryThumb category={listing.category} size="large" />
            <SaveButton itemType="listing" itemId={listing._id} size={20} className="detail-save" />
          </div>

          <div className="detail-top-row">
            <span className={`badge badge-${listing.type}`}>{listing.type}</span>
            <PriceTag pricingType={listing.pricingType} price={listing.price} currency={listing.currency} />
          </div>
          <h1>{listing.title}</h1>
          <p className="card-category">{listing.category}</p>
          <p className="detail-desc">{listing.description}</p>
          <TagList tags={listing.tags} />
          <p className="muted">Availability: {listing.availability}</p>
          <p className="muted">
            Status: <span className={`status-pill status-${listing.status}`}>{listing.status}</span>
          </p>

          {/* Owner Management Controls (Full CRUD from Detail View) */}
          {isOwner && (
            <div
              style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                marginTop: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "0.95rem" }}>You own this listing</strong>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  You have full permission to update or remove this record.
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn btn-outline" onClick={openEditModal} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Pencil size={15} /> Edit Listing
                </button>
                <button type="button" className="btn-danger" onClick={() => setShowDeleteModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          )}

          {!isOwner && (
            <div className="message-box">
              <h3>Contact {listing.owner?.name}</h3>
              <form onSubmit={handleSendMessage} className="form">
                <textarea
                  rows={3}
                  required
                  placeholder={`Hi ${listing.owner?.name?.split(" ")[0] || "there"}, I'm interested in "${listing.title}"...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button className="btn btn-primary">Send message</button>
              </form>
              {sendStatus && <p className="muted">{sendStatus}</p>}
            </div>
          )}

          <section className="section">
            <h3>Best-matching requests</h3>
            <p className="muted">
              Ranked by shared tags, category and keyword overlap — powered by the UniSwap+ matching engine.
            </p>
            {matches.length === 0 ? (
              <p className="muted">No matching open requests right now.</p>
            ) : (
              <div className="match-list">
                {matches.map((m) => (
                  <MatchRow key={m.item._id} result={m} kind="request" />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="owner-card">
            <Avatar name={listing.owner?.name || "User"} color={listing.owner?.avatarColor} size={56} />
            <h4>{listing.owner?.name}</h4>
            <p className="muted">{listing.owner?.department}</p>
            <RatingStars value={listing.owner?.ratingAverage || 0} />
            {listing.owner?.bio && <p className="owner-bio">{listing.owner.bio}</p>}
          </div>
        </aside>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && editForm && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Listing</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateListing}>
              <div className="modal-body">
                {editError && (
                  <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} />
                    <span>{editError}</span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label>
                    Type
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Category
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                {editForm.category === "Other" && (
                  <label>
                    Custom Category
                    <input
                      required
                      value={editForm.categoryOther}
                      onChange={(e) => setEditForm({ ...editForm, categoryOther: e.target.value })}
                    />
                  </label>
                )}

                <label>
                  Title *
                  <input
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </label>

                <label>
                  Description *
                  <textarea
                    required
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </label>

                <label>
                  Tags (comma separated)
                  <input
                    placeholder="e.g. math, notes, exam"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label>
                    Pricing Model
                    <select
                      value={editForm.pricingType}
                      onChange={(e) => setEditForm({ ...editForm, pricingType: e.target.value })}
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </label>

                  {editForm.pricingType === "paid" && (
                    <label>
                      Price (LKR)
                      <input
                        type="number"
                        min="0"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingEdit}>
                  {submittingEdit ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-container" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={20} /> Delete Listing
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to permanently delete this listing?</p>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.04)",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  borderLeft: "4px solid #ef4444",
                }}
              >
                {listing.title}
              </div>
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                This record will be completely removed from the database.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
