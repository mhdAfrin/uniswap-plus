import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { ListingCard, RequestCard, OpportunityCard, EmptyState } from "../components/components";

export default function Saved() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/saved");
        setSaved(res.data.saved);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Saved</h1>
          <p className="page-subtitle">Listings, requests and opportunities you've bookmarked for later.</p>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading your saved items…</p>
      ) : saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart icon on any listing, request or opportunity to save it here."
        />
      ) : (
        <div className="grid grid-3">
          {saved.map(({ _id, itemType, item }) => {
            if (itemType === "listing") {
              return (
                <ListingCard key={_id} listing={item} onClick={() => navigate(`/listings/${item._id}`)} />
              );
            }
            if (itemType === "request") {
              return (
                <RequestCard key={_id} request={item} onClick={() => navigate(`/requests/${item._id}`)} />
              );
            }
            return <OpportunityCard key={_id} opportunity={item} />;
          })}
        </div>
      )}
    </div>
  );
}
