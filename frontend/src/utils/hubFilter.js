/**
 * Shared Hub filter utility to guarantee 100% exact parity between
 * the post counts displayed on the Home Hub cards and the actual
 * filtered posts rendered in the Explore view.
 */

export const HUB_CONFIGS = {
  academic: {
    id: "academic",
    title: "Academic Hub",
    subtitle: "Learn and study",
    color: "#0ea5e9",
    tagline: "Tutoring, past papers, notes & academic materials",
  },
  marketplace: {
    id: "marketplace",
    title: "Marketplace",
    subtitle: "Buy, sell, swap, lend",
    color: "#f59e0b",
    tagline: "Lab equipment, hardware, gadgets & tools",
  },
  skills: {
    id: "skills",
    title: "Skill Exchange",
    subtitle: "Learn and share",
    color: "#a855f7",
    tagline: "Software development, UI/UX design & languages",
  },
  lostFound: {
    id: "lostFound",
    title: "Lost & Found",
    subtitle: "Find and return",
    color: "#f43f5e",
    tagline: "Items found or lost across campus grounds",
  },
  community: {
    id: "community",
    title: "Campus Community",
    subtitle: "Events and clubs",
    color: "#10b981",
    tagline: "Student competitions, internships, hackathons & projects",
  },
  services: {
    id: "services",
    title: "Campus Services",
    subtitle: "Print, food, repairs",
    color: "#06b6d4",
    tagline: "Campus event media, career coaching & tech services",
  },
  mobility: {
    id: "mobility",
    title: "Mobility & Community",
    subtitle: "Ride-sharing and carpooling",
    color: "#f97316",
    tagline: "Daily faculty carpooling and student ride-sharing",
  },
};

/**
 * Filter items strictly and identically for each hub
 */
export function getItemsForHub(hubId, { listings = [], requests = [], opportunities = [] }) {
  const combined = [...listings, ...requests];

  switch (hubId) {
    case "academic":
      return {
        listings: listings.filter(
          (l) => l.category === "Tutoring" || l.category === "Study Resources"
        ),
        requests: requests.filter(
          (r) => r.category === "Tutoring" || r.category === "Study Resources"
        ),
        opportunities: [],
      };

    case "marketplace":
      return {
        listings: listings.filter(
          (l) =>
            l.category === "Equipment" ||
            (l.type === "resource" && l.category !== "Study Resources")
        ),
        requests: requests.filter(
          (r) => r.category === "Equipment"
        ),
        opportunities: [],
      };

    case "skills":
      return {
        listings: listings.filter(
          (l) =>
            l.category === "Software Development" ||
            l.category === "Design" ||
            l.category === "Language Exchange"
        ),
        requests: requests.filter(
          (r) =>
            r.category === "Software Development" ||
            r.category === "Design" ||
            r.category === "Language Exchange"
        ),
        opportunities: [],
      };

    case "lostFound":
      return {
        listings: listings.filter((l) => l.category === "Lost & Found"),
        requests: requests.filter((r) => r.category === "Lost & Found"),
        opportunities: [],
      };

    case "community":
      return {
        listings: [],
        requests: [],
        opportunities: opportunities,
      };

    case "services":
      return {
        listings: listings.filter(
          (l) =>
            l.category === "Event Support" ||
            l.category === "Career & Mentorship" ||
            l.category === "Campus Services" ||
            l.type === "service"
        ),
        requests: requests.filter(
          (r) =>
            r.category === "Event Support" ||
            r.category === "Career & Mentorship" ||
            r.category === "Campus Services"
        ),
        opportunities: [],
      };

    case "mobility":
      return {
        listings: listings.filter((l) => l.category === "Mobility & Carpooling"),
        requests: requests.filter((r) => r.category === "Mobility & Carpooling"),
        opportunities: [],
      };

    default:
      return {
        listings,
        requests,
        opportunities,
      };
  }
}

/**
 * Returns the exact total count of items in a hub
 */
export function getHubCount(hubId, { listings = [], requests = [], opportunities = [] }) {
  const { listings: l, requests: r, opportunities: o } = getItemsForHub(hubId, {
    listings,
    requests,
    opportunities,
  });
  return l.length + r.length + o.length;
}
