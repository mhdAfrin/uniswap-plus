import { useEffect, useState, useRef } from "react";
import {
  Megaphone,
  Sparkles,
  Coffee,
  Code2,
  BookOpen,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Tag,
  X,
} from "lucide-react";
import api from "../api/api";

const ICON_MAP = {
  BookOpen,
  Code2,
  Coffee,
  Sparkles,
  Printer,
  Megaphone,
};

export function AdvertisementBanner() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get("/advertisements");
        if (res.data.advertisements && res.data.advertisements.length > 0) {
          setAds(res.data.advertisements);
        }
      } catch (err) {
        console.error("Failed to fetch demo advertisements:", err);
      }
    };
    fetchAds();
  }, []);

  // Auto-advance banner every 6 seconds if not paused
  useEffect(() => {
    if (ads.length <= 1 || isPaused || dismissed) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);

    return () => clearInterval(timerRef.current);
  }, [ads.length, isPaused, dismissed]);

  if (dismissed || ads.length === 0) return null;

  const currentAd = ads[currentIndex];
  const IconComponent = ICON_MAP[currentAd.icon] || Megaphone;

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2500);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  return (
    <div
      className="ad-banner-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="ad-banner-card"
        style={{
          background: currentAd.gradient || "linear-gradient(135deg, #5B4FE9, #2FA88F)",
        }}
      >
        <div className="ad-banner-content">
          <div className="ad-banner-left">
            <div className="ad-badge-row">
              <span className="ad-pill">
                <Megaphone size={12} strokeWidth={2.5} />
                <span>{currentAd.badgeText || "Sponsored"}</span>
              </span>
              <span className="ad-sponsor-label">{currentAd.sponsor}</span>
              <span className="ad-category-tag">{currentAd.category}</span>
            </div>

            <h3 className="ad-title">{currentAd.title}</h3>
            {currentAd.tagline && <p className="ad-tagline">{currentAd.tagline}</p>}
            <p className="ad-description">{currentAd.description}</p>

            <div className="ad-action-row">
              {currentAd.discountCode && (
                <button
                  type="button"
                  className="ad-code-btn"
                  onClick={() => handleCopy(currentAd.discountCode)}
                  title="Click to copy coupon code"
                >
                  <Tag size={14} />
                  <span>Code: <strong>{currentAd.discountCode}</strong></span>
                  {copiedCode === currentAd.discountCode ? (
                    <span className="copied-text"><Check size={13} /> Copied!</span>
                  ) : (
                    <Copy size={13} className="copy-icon" />
                  )}
                </button>
              )}

              <a
                href={currentAd.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="ad-cta-btn"
                onClick={(e) => {
                  if (!currentAd.link || currentAd.link === "#") {
                    e.preventDefault();
                    alert(`Demo Offer: ${currentAd.title}\nSponsored by ${currentAd.sponsor}`);
                  }
                }}
              >
                <span>{currentAd.ctaText || "Learn More"}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="ad-banner-right">
            <div className="ad-icon-halo">
              <IconComponent size={56} strokeWidth={1.7} color="white" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="ad-banner-footer">
          <div className="ad-dots">
            {ads.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`ad-dot ${idx === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to advertisement slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="ad-nav-btns">
            <button
              type="button"
              className="ad-nav-btn"
              onClick={prevSlide}
              aria-label="Previous advertisement"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="ad-counter">
              {currentIndex + 1} / {ads.length}
            </span>
            <button
              type="button"
              className="ad-nav-btn"
              onClick={nextSlide}
              aria-label="Next advertisement"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="ad-close-btn"
          onClick={() => setDismissed(true)}
          title="Dismiss ad banner"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export function AdvertisementCard({ ad }) {
  const [copied, setCopied] = useState(false);
  const IconComponent = ICON_MAP[ad.icon] || Megaphone;

  const handleCopy = () => {
    if (!ad.discountCode) return;
    navigator.clipboard.writeText(ad.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="ad-card">
      <div className="ad-card-banner" style={{ background: ad.gradient }}>
        <div className="ad-card-badge">
          <Megaphone size={11} />
          <span>{ad.badgeText || "Campus Partner"}</span>
        </div>
        <div className="ad-card-icon">
          <IconComponent size={28} strokeWidth={1.8} color="white" />
        </div>
      </div>
      <div className="ad-card-body">
        <span className="ad-card-sponsor">{ad.sponsor}</span>
        <h4 className="ad-card-title">{ad.title}</h4>
        <p className="ad-card-desc">{ad.description}</p>

        {ad.discountCode && (
          <div className="ad-card-code-row">
            <span className="ad-card-code-label">Promo:</span>
            <button type="button" className="ad-card-code-chip" onClick={handleCopy}>
              <strong>{ad.discountCode}</strong>
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}

        <div className="ad-card-footer">
          <span className="ad-card-category">{ad.category}</span>
          <a
            href={ad.link || "#"}
            target="_blank"
            rel="noreferrer"
            className="ad-card-cta"
            onClick={(e) => {
              if (!ad.link || ad.link === "#") {
                e.preventDefault();
                alert(`Demo Offer: ${ad.title}\nSponsored by: ${ad.sponsor}`);
              }
            }}
          >
            <span>{ad.ctaText || "Claim Deal"}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
