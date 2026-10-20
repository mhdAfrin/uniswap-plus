import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { ListingCard, RequestCard, OpportunityCard, EmptyState } from "../components/components";
import { AdvertisementCard } from "../components/AdvertisementBanner";
import { getItemsForHub, HUB_CONFIGS } from "../utils/hubFilter";

const TABS = [
  { key: "all", label: "All" },
  { key: "resource", label: "Resources" },
  { key: "skill", label: "Skills" },
  { key: "service", label: "Services" },
  { key: "knowledge", label: "Knowledge" },
  { key: "collaboration", label: "Collaboration" },
  { key: "opportunity", label: "Opportunities" },
  { key: "offers", label: "Campus Ads & Deals" },
];

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("type") || "all";
  const activeHub = searchParams.get("hub");
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("newest");
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all categories from backend API with optional search query & sort order
  const fetchAll = async (q, sort) => {
    setLoading(true);
    try {
      const activeSort = sort !== undefined ? sort : sortBy;
      const params = {};
      if (q) params.q = q;
      if (activeSort) params.sortBy = activeSort;

      const [listingsRes, requestsRes, opportunitiesRes, adsRes] = await Promise.all([
        api.get("/listings", { params }),
        api.get("/requests", { params }),
        api.get("/opportunities", { params }),
        api.get("/advertisements").catch(() => ({ data: { advertisements: [] } })),
      ]);
      setListings(listingsRes.data.listings || []);
      setRequests(requestsRes.data.requests || []);
      setOpportunities(opportunitiesRes.data.opportunities || []);
      setAdvertisements(adsRes.data.advertisements || []);
    } catch (err) {
      console.error("Failed to fetch community items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(initialQuery, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = {};
    if (query) newParams.q = query;
    if (activeHub) newParams.hub = activeHub;
    else if (activeTab !== "all") newParams.type = activeTab;
    setSearchParams(newParams);
    fetchAll(query, sortBy);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    fetchAll(query, newSort);
  };

  const setTab = (tabKey) => {
    const newParams = {};
    if (query) newParams.q = query;
    if (tabKey !== "all") newParams.type = tabKey;
    setSearchParams(newParams);
  };

  const clearHubFilter = () => {
    const newParams = {};
    if (query) newParams.q = query;
    setSearchParams(newParams);
  };

  // Determine visible items based on whether a hub filter is active or regular tab
  let visibleListings = [];
  let visibleRequests = [];
  let visibleOpportunities = [];
  let visibleAds = [];

  const currentHubConfig = activeHub ? HUB_CONFIGS[activeHub] : null;

  if (activeHub && currentHubConfig) {
    // Strictly filter through shared hubFilter utility for 100% count accuracy
    const filtered = getItemsForHub(activeHub, {
      listings,
      requests,
      opportunities,
    });
    visibleListings = filtered.listings;
    visibleRequests = filtered.requests;
    visibleOpportunities = filtered.opportunities;
    visibleAds = [];
  } else {
    visibleListings =
      activeTab === "all" || ["resource", "skill", "service", "knowledge"].includes(activeTab)
        ? listings.filter((l) => activeTab === "all" || l.type === activeTab)
        : [];
    visibleRequests = activeTab === "all" || activeTab === "collaboration" ? requests : [];
    visibleOpportunities =
      activeTab === "all" || activeTab === "opportunity" ? opportunities : [];
    visibleAds = activeTab === "all" || activeTab === "offers" ? advertisements : [];
  }

  // Client-side sorting logic to ensure instant responsive feedback
  const sortedListings = [...visibleListings].sort((a, b) => {
    if (sortBy === "price_asc") {
      const priceA = a.pricingType === "paid" ? (Number(a.price) || 0) : 0;
      const priceB = b.pricingType === "paid" ? (Number(b.price) || 0) : 0;
      return priceA - priceB;
    }
    if (sortBy === "price_desc") {
      const priceA = a.pricingType === "paid" ? (Number(a.price) || 0) : 0;
      const priceB = b.pricingType === "paid" ? (Number(b.price) || 0) : 0;
      return priceB - priceA;
    }
    if (sortBy === "title_asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "title_desc") {
      return (b.title || "").localeCompare(a.title || "");
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const sortedRequests = [...visibleRequests].sort((a, b) => {
    if (sortBy === "title_asc") return (a.title || "").localeCompare(b.title || "");
    if (sortBy === "title_desc") return (b.title || "").localeCompare(a.title || "");
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const sortedOpportunities = [...visibleOpportunities].sort((a, b) => {
    if (sortBy === "title_asc") return (a.title || "").localeCompare(b.title || "");
    if (sortBy === "title_desc") return (b.title || "").localeCompare(a.title || "");
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalResults =
    sortedListings.length +
    sortedRequests.length +
    sortedOpportunities.length +
    visibleAds.length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Explore</h1>
          <p className="page-subtitle">
            Discover resources, skills, services, opportunities and campus collaborators.
          </p>
        </div>
      </div>

      {/* If filtering by a Category Hub from Home */}
      {currentHubConfig && (
        <div
          className="hub-filter-active-card"
          style={{ borderLeftColor: currentHubConfig.color }}
        >
          <div className="hub-filter-info">
            <span
              className="hub-filter-badge"
              style={{ backgroundColor: `${currentHubConfig.color}20`, color: currentHubConfig.color }}
            >
              Active Hub Filter
            </span>
            <h3>
              {currentHubConfig.title} &mdash;{" "}
              <span className="hub-filter-count">{totalResults} posts found</span>
            </h3>
            <p>{currentHubConfig.tagline}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm clear-hub-btn"
            onClick={clearHubFilter}
          >
            Clear Hub Filter ✕
          </button>
        </div>
      )}

      {/* Search and Sort Row */}
      <div className="filter-controls-row">
        <form className="filter-bar" onSubmit={handleSearch}>
          <input
            placeholder="Search for anything across campus…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </form>

        <div className="sort-control">
          <label htmlFor="sort-select" className="sort-label">Sort by:</label>
          <select
            id="sort-select"
            className="sort-dropdown"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title_asc">Title: A to Z</option>
            <option value="title_desc">Title: Z to A</option>
          </select>
        </div>
      </div>

      {/* Tabs row (shown when not filtered by specific hub, or allows switching) */}
      <div className="tab-row">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${!activeHub && activeTab === tab.key ? "tab-active" : ""}`}
            onClick={() => setTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Searching the community…</p>
      ) : totalResults === 0 ? (
        <EmptyState
          title="Nothing found"
          description="Try a different search term, sort option, or explore a different category."
        />
      ) : (
        <div className="grid grid-3">
          {visibleAds.map((ad) => (
            <AdvertisementCard key={`ad-${ad._id}`} ad={ad} />
          ))}
          {sortedListings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onClick={() => navigate(`/listings/${listing._id}`)}
            />
          ))}
          {sortedRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onClick={() => navigate(`/requests/${request._id}`)}
            />
          ))}
          {sortedOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity._id} opportunity={opportunity} />
          ))}
        </div>
      )}
    </div>
  );
}
