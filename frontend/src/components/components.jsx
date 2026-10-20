import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  Package,
  MessageSquare,
  Briefcase,
  Bookmark,
  User as UserIcon,
  Search,
  Bell,
  LogOut,
  Heart,
  Code2,
  Wrench,
  Palette,
  BookOpen,
  Cpu,
  GraduationCap,
  ClipboardList,
  ListChecks,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSaved } from "../context/SavedContext";
import { ThemeToggle } from "./ThemeToggle";

/* ============================================================================
 * Category → visual (icon + gradient) mapping. There are no real product
 * photos in this project, so every listing/request/opportunity gets a
 * generated icon tile instead — keyed off its category/type so the same
 * kind of item always looks the same across the app.
 * ========================================================================= */
const CATEGORY_VISUALS = [
  { match: /tutor/i, icon: GraduationCap, gradient: "linear-gradient(135deg,#7C6CF0,#5B4FE9)" },
  { match: /software|web|backend|docker|devops/i, icon: Code2, gradient: "linear-gradient(135deg,#4FB6E8,#2B7BE8)" },
  { match: /design|ui|ux/i, icon: Palette, gradient: "linear-gradient(135deg,#E07FD1,#B85FC9)" },
  { match: /equipment|hardware|arduino|electronic/i, icon: Wrench, gradient: "linear-gradient(135deg,#F0A94E,#E8963D)" },
  { match: /study|notes|resource/i, icon: BookOpen, gradient: "linear-gradient(135deg,#54C2A6,#2FA88F)" },
  { match: /robot|iot|circuit/i, icon: Cpu, gradient: "linear-gradient(135deg,#EF8E7C,#C0392B)" },
];

function getVisual(category = "") {
  const found = CATEGORY_VISUALS.find((v) => v.match.test(category));
  return found || { icon: ClipboardList, gradient: "linear-gradient(135deg,#9CA3AF,#6B7280)" };
}

export function CategoryThumb({ category, size = "normal" }) {
  const { icon: Icon, gradient } = getVisual(category);
  return (
    <div className={`thumb thumb-${size}`} style={{ background: gradient }}>
      <Icon size={size === "large" ? 40 : 22} strokeWidth={1.8} color="white" />
    </div>
  );
}

/* ---------------------------- Initials Avatar --------------------------- */
export function Avatar({ name = "?", color = "#5B4FE9", size = 40 }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="avatar"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

/* --------------------------------- Sidebar -------------------------------- */
const SIDEBAR_LINKS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/my-listings", label: "My Listings", icon: Package },
  { to: "/my-requests", label: "My Requests", icon: ListChecks },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="brand">
        <span className="brand-mark">U+</span>
        Uni<span>Swap</span>+
      </Link>
      <nav className="sidebar-nav">
        {SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="sidebar-link">
            <Icon size={19} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <GraduationCap size={22} strokeWidth={1.8} />
        <p>A stronger university community, together.</p>
      </div>
    </aside>
  );
}

/* ---------------------------- Mobile bottom nav ---------------------------- */
const MOBILE_LINKS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/opportunities", label: "Deals", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export function MobileNav() {
  return (
    <nav className="mobile-nav">
      {MOBILE_LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="mobile-nav-link">
          <Icon size={20} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/* --------------------------------- Topbar -------------------------------- */
export function Topbar({ onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = e.target.elements.q.value.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <form className="topbar-search" onSubmit={onSearch || handleSubmit}>
        <Search size={17} strokeWidth={2} />
        <input name="q" placeholder="Search for skills, resources, opportunities…" />
      </form>
      <div className="topbar-actions">
        <ThemeToggle />
        <button className="icon-btn notification-btn" title="Notifications" type="button">
          <Bell size={19} strokeWidth={2} />
          <span className="notification-dot" />
        </button>
        <Link to="/profile" className="topbar-user">
          <Avatar name={user?.name || "?"} color={user?.avatarColor} size={36} />
          <div className="topbar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.department}</span>
          </div>
        </Link>
        <button className="icon-btn" title="Log out" onClick={handleLogout} type="button">
          <LogOut size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

/* ----------------------------- Route guarding ---------------------------- */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* -------------------------------- Loaders -------------------------------- */
export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" />
      <p>Loading UniSwap+…</p>
    </div>
  );
}

/* -------------------------------- Tag chip ------------------------------- */
export function TagList({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------ Rating stars ----------------------------- */
export function RatingStars({ value = 0, count }) {
  const rounded = Math.round(value);
  return (
    <span className="rating-stars" title={`${value.toFixed(1)} / 5`}>
      {"★".repeat(rounded)}
      {"☆".repeat(5 - rounded)}
      {typeof count === "number" && <span className="rating-count"> ({count})</span>}
    </span>
  );
}

/* --------------------------------- Price tag ------------------------------ */
export function PriceTag({ pricingType, price, currency = "LKR" }) {
  if (pricingType !== "paid" || !price) {
    return <span className="price-tag price-tag-free">Free</span>;
  }
  return (
    <span className="price-tag price-tag-paid">
      {currency} {price}
    </span>
  );
}

/* --------------------------------- Save button ---------------------------- */
export function SaveButton({ itemType, itemId, size = 18, className = "" }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(itemType, itemId);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSaved(itemType, itemId);
  };

  return (
    <button
      className={`save-btn ${saved ? "save-btn-active" : ""} ${className}`}
      onClick={handleClick}
      title={saved ? "Remove from saved" : "Save for later"}
      type="button"
    >
      <Heart size={size} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

/* ------------------------------- Tag picker ------------------------------- */
/**
 * A comma-separated tags text input plus a row of clickable suggestion
 * chips underneath. Clicking a chip appends it to the field instead of
 * requiring the student to type it — the field stays a plain text input
 * so custom tags are always still possible.
 */
export function TagPicker({ value, onChange, suggestions, max = 10 }) {
  const currentTags = value
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const handleChipClick = (tag) => {
    if (currentTags.includes(tag)) return;
    const next = [...currentTags, tag].slice(0, max).join(", ");
    onChange(next);
  };

  return (
    <div className="tag-picker">
      <input placeholder="react, tutoring, matlab…" value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="tag-picker-suggestions">
        {suggestions.slice(0, 14).map((tag) => (
          <button
            key={tag}
            type="button"
            className={`tag-chip ${currentTags.includes(tag) ? "tag-chip-active" : ""}`}
            onClick={() => handleChipClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Empty state ---------------------------- */
export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ------------------------------ Quick action tile -------------------------- */
export function QuickActionTile({ icon: Icon, label, sublabel, to, tint }) {
  return (
    <Link to={to} className="quick-tile" style={{ "--tile-tint": tint }}>
      <div className="quick-tile-icon">
        <Icon size={20} strokeWidth={2} />
      </div>
      <strong>{label}</strong>
      <span>{sublabel}</span>
    </Link>
  );
}

/* --------------------------------- Cards --------------------------------- */
export function ListingCard({ listing, onClick, onCardClick }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onCardClick) {
      onCardClick(e);
    } else if (listing?._id) {
      navigate(`/listings/${listing._id}`);
    }
  };

  return (
    <div
      className="card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <CategoryThumb category={listing.category} />
      <SaveButton itemType="listing" itemId={listing._id} className="card-save" />
      <div className="card-body">
        <div className="card-top">
          <span className={`badge badge-${listing.type}`}>{listing.type}</span>
          <span className="card-category">{listing.category}</span>
        </div>
        <h4>{listing.title}</h4>
        <p className="card-desc">{listing.description}</p>
        <TagList tags={listing.tags} />
        <div className="card-footer">
          <div className="card-owner">
            <Avatar name={listing.owner?.name || "?"} color={listing.owner?.avatarColor} size={26} />
            <span>{listing.owner?.name}</span>
          </div>
          <PriceTag pricingType={listing.pricingType} price={listing.price} currency={listing.currency} />
        </div>
      </div>
    </div>
  );
}

export function RequestCard({ request, onClick, onCardClick }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onCardClick) {
      onCardClick(e);
    } else if (request?._id) {
      navigate(`/requests/${request._id}`);
    }
  };

  return (
    <div
      className="card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <CategoryThumb category={request.category} />
      <SaveButton itemType="request" itemId={request._id} className="card-save" />
      <div className="card-body">
        <div className="card-top">
          <span className={`badge badge-urgency-${request.urgency}`}>{request.urgency} urgency</span>
          <span className="card-category">{request.category}</span>
        </div>
        <h4>{request.title}</h4>
        <p className="card-desc">{request.description}</p>
        <TagList tags={request.tags} />
        <div className="card-footer">
          <div className="card-owner">
            <Avatar name={request.owner?.name || "?"} color={request.owner?.avatarColor} size={26} />
            <span>{request.owner?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OpportunityCard({ opportunity, onClick, onCardClick }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onCardClick) {
      onCardClick(e);
    } else if (opportunity?.link) {
      window.open(opportunity.link, "_blank", "noreferrer");
    } else {
      navigate("/opportunities");
    }
  };

  return (
    <div
      className="card card-opportunity"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <CategoryThumb category={opportunity.type} />
      <SaveButton itemType="opportunity" itemId={opportunity._id} className="card-save" />
      <div className="card-body">
        <div className="card-top">
          <span className="badge badge-opportunity">{opportunity.type}</span>
          {opportunity.deadline && (
            <span className="card-category">
              Apply before {new Date(opportunity.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        <h4>{opportunity.title}</h4>
        <p className="card-desc">{opportunity.description}</p>
        <TagList tags={opportunity.tags} />
        <div className="card-footer">
          <div className="card-owner">
            <Avatar
              name={opportunity.postedBy?.name || "?"}
              color={opportunity.postedBy?.avatarColor}
              size={26}
            />
            <span>{opportunity.postedBy?.name}</span>
          </div>
          {opportunity.link && (
            <a
              href={opportunity.link}
              target="_blank"
              rel="noreferrer"
              className="card-link"
              onClick={(e) => e.stopPropagation()}
            >
              Apply ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function MatchRow({ result, kind }) {
  const item = result.item;
  return (
    <div className="match-row">
      <div className="match-score" title="Match score">
        {result.score}
      </div>
      <div className="match-body">
        <h5>{item.title}</h5>
        <p>{item.description}</p>
        <TagList tags={item.tags} />
        <div className="match-owner">
          <Avatar name={item.owner?.name || "?"} color={item.owner?.avatarColor} size={24} />
          <span>{item.owner?.name}</span>
          <span className="match-kind">{kind}</span>
        </div>
      </div>
    </div>
  );
}
