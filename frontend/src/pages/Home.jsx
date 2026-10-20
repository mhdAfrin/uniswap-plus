import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ShoppingBag,
  HeartHandshake,
  Search,
  Megaphone,
  Store,
  Car,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { ListingCard, OpportunityCard } from "../components/components";
import { AdvertisementBanner } from "../components/AdvertisementBanner";
import { getHubCount } from "../utils/hubFilter";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({ listings: 0, requests: 0 });
  const [hubCounts, setHubCounts] = useState({
    academic: 5,
    marketplace: 10,
    skills: 10,
    lostFound: 5,
    community: 7,
    services: 8,
    mobility: 5,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [listingsRes, requestsRes, opportunitiesRes, mineListings, mineRequests] =
          await Promise.all([
            api.get("/listings"),
            api.get("/requests"),
            api.get("/opportunities"),
            api.get("/listings/mine"),
            api.get("/requests/mine"),
          ]);

        const allListings = listingsRes.data.listings || [];
        const allRequests = requestsRes.data.requests || [];
        const allOpps = opportunitiesRes.data.opportunities || [];

        setRecommended(allListings.slice(0, 4));
        setOpportunities(allOpps.slice(0, 3));
        setStats({
          listings: mineListings.data.listings.length,
          requests: mineRequests.data.requests.length,
        });

        // Compute exact post counts strictly based on actual database items
        const hubItemsPayload = {
          listings: allListings,
          requests: allRequests,
          opportunities: allOpps,
        };

        setHubCounts({
          academic: getHubCount("academic", hubItemsPayload),
          marketplace: getHubCount("marketplace", hubItemsPayload),
          skills: getHubCount("skills", hubItemsPayload),
          lostFound: getHubCount("lostFound", hubItemsPayload),
          community: getHubCount("community", hubItemsPayload),
          services: getHubCount("services", hubItemsPayload),
          mobility: getHubCount("mobility", hubItemsPayload),
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  const CATEGORY_HUBS = [
    {
      id: "academic",
      title: "Academic Hub",
      subtitle: "Learn and study",
      posts: `${hubCounts.academic} posts`,
      icon: GraduationCap,
      color: "#0ea5e9", // Sky blue
      to: "/explore?hub=academic",
    },
    {
      id: "marketplace",
      title: "Marketplace",
      subtitle: "Buy, sell, swap, lend",
      posts: `${hubCounts.marketplace} posts`,
      icon: ShoppingBag,
      color: "#f59e0b", // Amber/Gold
      to: "/explore?hub=marketplace",
    },
    {
      id: "skills",
      title: "Skill Exchange",
      subtitle: "Learn and share",
      posts: `${hubCounts.skills} posts`,
      icon: HeartHandshake,
      color: "#a855f7", // Vivid Purple
      to: "/explore?hub=skills",
    },
    {
      id: "lostFound",
      title: "Lost & Found",
      subtitle: "Find and return",
      posts: `${hubCounts.lostFound} posts`,
      icon: Search,
      color: "#f43f5e", // Rose/Red
      to: "/explore?hub=lostFound",
    },
    {
      id: "community",
      title: "Campus Community",
      subtitle: "Events and clubs",
      posts: `${hubCounts.community} posts`,
      icon: Megaphone,
      color: "#10b981", // Mint/Emerald
      to: "/explore?hub=community",
    },
    {
      id: "services",
      title: "Campus Services",
      subtitle: "Print, food, repairs",
      posts: `${hubCounts.services} posts`,
      icon: Store,
      color: "#06b6d4", // Cyan
      to: "/explore?hub=services",
    },
    {
      id: "mobility",
      title: "Mobility & Community",
      subtitle: "Ride-sharing and carpooling",
      posts: `${hubCounts.mobility} posts`,
      icon: Car,
      color: "#f97316", // Warm Orange-Red
      to: "/explore?hub=mobility",
      fullWidth: true,
    },
  ];

  const displayName = user?.name || "Mohamed Afrin";

  return (
    <div className="page trending-home-page">
      {/* Search Input Bar (Matching mobile/trending layout in attached screenshot) */}
      <form className="trending-search-bar" onSubmit={handleQuickSearch}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search everything on campus…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-submit-btn">
          Search
        </button>
      </form>

      {/* Greeting Header (Matching serif styled layout in attached screenshot) */}
      <div className="trending-greeting-section">
        <h1 className="trending-serif-title">Hello, {displayName}</h1>
        <p className="trending-tagline">
          <strong>UniSwap+</strong> &middot; Your Campus. Your Community.
        </p>
      </div>

      {/* Trending Category Hubs Grid (Exact look & feel from screenshot) */}
      <div className="hub-grid">
        {CATEGORY_HUBS.map((hub) => {
          const Icon = hub.icon;
          return (
            <Link
              key={hub.id}
              to={hub.to}
              className={`hub-card ${hub.fullWidth ? "hub-card-wide" : ""}`}
              style={{ "--hub-accent": hub.color }}
            >
              <span className="hub-accent-bar" style={{ backgroundColor: hub.color }} />
              <div className="hub-card-inner">
                <div className="hub-icon-wrap" style={{ color: hub.color }}>
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                <div className="hub-details">
                  <h3 className="hub-title">{hub.title}</h3>
                  <p className="hub-subtitle">{hub.subtitle}</p>
                  <span className="hub-posts-badge">{hub.posts}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Featured Campus Advertisements & Partner Deals Banner */}
      <div className="home-banner-wrapper">
        <AdvertisementBanner />
      </div>

      {/* Quick stats row */}
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-number">{stats.listings}</span>
          <span className="stat-label">Your active listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.requests}</span>
          <span className="stat-label">Your open requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{user?.ratingAverage?.toFixed(1) || "0.0"}</span>
          <span className="stat-label">
            Your trust rating ({user?.ratingCount || 0} reviews)
          </span>
        </div>
      </div>

      {/* Recommended listings */}
      {loading ? (
        <div className="card-skeleton" />
      ) : (
        <>
          <div className="section-header">
            <div>
              <h2>Recommended for you</h2>
              <p className="page-subtitle">Based on your department and campus activity.</p>
            </div>
            <Link to="/explore" className="section-link">
              See all &rarr;
            </Link>
          </div>

          <div className="card-grid">
            {recommended.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onClick={() => navigate(`/listings/${listing._id}`)}
              />
            ))}
          </div>

          {/* Opportunities preview */}
          <div className="section-header" style={{ marginTop: 40 }}>
            <div>
              <h2>Latest opportunities</h2>
              <p className="page-subtitle">Campus internships, competitions and team projects.</p>
            </div>
            <Link to="/opportunities" className="section-link">
              See all &rarr;
            </Link>
          </div>

          <div className="card-grid">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp._id} opportunity={opp} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
