import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/common/Icon";

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  image: string;
  badgeTone: string;
  queueCount: number;
  rating: number;
  reviewsCount: number;
  price: number;
}

const FEATURED_SERVICES: ServiceItem[] = [
  {
    id: "serv-1",
    title: "Website Link Building And Traffic Generation...",
    category: "SEO & SMM",
    badgeTone: "purple",
    author: {
      name: "Edward Mendez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 14,
    price: 300.0,
  },
  {
    id: "serv-2",
    title: "Generate Leads And Social Media Marketing Campaigns...",
    category: "Digital Marketing",
    badgeTone: "amber",
    author: {
      name: "Edward Mendez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 8,
    price: 150.0,
  },
  {
    id: "serv-3",
    title: "Looking To Hire An Digital Marketing Channel Pro...",
    category: "SEO",
    badgeTone: "blue",
    author: {
      name: "Edward Mendez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 22,
    price: 350.0,
  },
  {
    id: "serv-4",
    title: "I Will Share Your Post To A Large Social Media Network...",
    category: "Social Media",
    badgeTone: "cyan",
    author: {
      name: "Matthew Jason",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 19,
    price: 50.0,
  },
  {
    id: "serv-5",
    title: "I Will Impeccably Translate Any Language Content...",
    category: "Translation",
    badgeTone: "orange",
    author: {
      name: "Matthew Jason",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 31,
    price: 30.0,
  },
  {
    id: "serv-6",
    title: "I Will Create A Responsive WordPress & React Website...",
    category: "Web Development",
    badgeTone: "indigo",
    author: {
      name: "Matthew Jason",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 45,
    price: 280.0,
  },
  {
    id: "serv-7",
    title: "I Will Build Up Your Android And iOS Mobile App...",
    category: "Mobile Apps",
    badgeTone: "emerald",
    author: {
      name: "Hannah Khan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 27,
    price: 400.0,
  },
  {
    id: "serv-8",
    title: "I Will Be Your Social Media Marketing Manager...",
    category: "Marketing",
    badgeTone: "rose",
    author: {
      name: "Hannah Khan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&auto=format&fit=crop&q=80",
    queueCount: 0,
    rating: 5.0,
    reviewsCount: 16,
    price: 100.0,
  },
];

const TRENDING_KEYWORDS = [
  "React Native",
  "Flutter",
  "Plumber",
  "Artist",
  "Singer",
  "Writer",
  "WordPress",
  "UI/UX Design",
  "SEO Audit",
];

const CATEGORIES = [
  { value: "", label: "Choose category" },
  { value: "Web Development", label: "Web Development" },
  { value: "Mobile Apps", label: "Mobile Apps" },
  { value: "Digital Marketing", label: "Digital Marketing" },
  { value: "Design & Creative", label: "Design & Creative" },
  { value: "Writing & Translation", label: "Writing & Translation" },
  { value: "SEO & SMM", label: "SEO & Social Media" },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("search", searchTerm.trim());
    if (selectedCategory) params.append("category", selectedCategory);
    navigate(`/projects?${params.toString()}`);
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchTerm(keyword);
    navigate(`/projects?search=${encodeURIComponent(keyword)}`);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredServices = FEATURED_SERVICES.filter((service) => {
    if (activeTab === "all") return true;
    if (activeTab === "dev") return service.category.includes("Web") || service.category.includes("Mobile");
    if (activeTab === "marketing") return service.category.includes("Marketing") || service.category.includes("SEO") || service.category.includes("Social");
    if (activeTab === "writing") return service.category.includes("Translation") || service.category.includes("Writing");
    return true;
  });

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section className="exertio-hero">
        <div className="exertio-hero__container">
          <div className="exertio-hero__left">
            <span className="exertio-hero__eyebrow">GET STARTED</span>
            <h1 className="exertio-hero__title">
              Buy Expert Services for <span>Any Job Done</span>
            </h1>
            <p className="exertio-hero__subtitle">
              Using Exertio, you can make your own service based deals with no extra
              effort. Jumpstart your business with a premium freelance network.
            </p>

            {/* Search Box */}
            <form className="exertio-search-box" onSubmit={handleSearch}>
              <div className="exertio-search-box__input-group">
                <input
                  type="text"
                  className="exertio-search-box__input"
                  placeholder="What are you look for"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search services or projects"
                />
              </div>

              <div className="exertio-search-box__divider" />

              <div className="exertio-search-box__select-group">
                <select
                  className="exertio-search-box__select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by category"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="exertio-search-box__submit" aria-label="Search">
                <Icon name="search" size={17} />
                <span>Search</span>
              </button>
            </form>

            {/* Trending Keywords */}
            <div className="exertio-trending">
              <span className="exertio-trending__label">Trending Keywords:</span>
              <div className="exertio-trending__tags">
                {TRENDING_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    className="exertio-trending__tag"
                    onClick={() => handleKeywordClick(kw)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Watch Demo */}
            <div className="exertio-demo-cta">
              <button
                type="button"
                className="exertio-demo-cta__btn"
                onClick={() => setShowDemoModal(true)}
              >
                <span className="exertio-demo-cta__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
                <span className="exertio-demo-cta__text">
                  <strong>Watch Demo</strong>
                  <small>Get started in minutes</small>
                </span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic */}
          <div className="exertio-hero__right">
            <div className="exertio-hero__art-wrapper">
              <div className="exertio-hero__blob-backdrop" />
              <div className="exertio-hero__ring-accent" />
              <div className="exertio-hero__dots-matrix" />
              <img
                src="/images/hero_freelancer.jpg"
                alt="Excited professional pointing to search"
                className="exertio-hero__image"
              />
              <div className="exertio-hero__floating-card exertio-hero__floating-card--top">
                <span className="floating-badge-icon">⭐</span>
                <div>
                  <strong>4.9 / 5.0</strong>
                  <small>5,000+ Happy Clients</small>
                </div>
              </div>
              <div className="exertio-hero__floating-card exertio-hero__floating-card--bottom">
                <span className="floating-badge-icon">⚡</span>
                <div>
                  <strong>Verified Talent</strong>
                  <small>Fast Delivery</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTNER / CLIENT LOGOS */}
      <section className="exertio-logos">
        <div className="exertio-logos__inner">
          <div className="exertio-logo-item">
            <span className="exertio-logo-icon exertio-logo-icon--treva">●</span>
            <span className="exertio-logo-text">treva.</span>
          </div>
          <div className="exertio-logo-item">
            <span className="exertio-logo-icon exertio-logo-icon--liva">☘</span>
            <span className="exertio-logo-text">liva</span>
          </div>
          <div className="exertio-logo-item">
            <span className="exertio-logo-icon exertio-logo-icon--hexa">⬡</span>
            <span className="exertio-logo-text">hexa</span>
          </div>
          <div className="exertio-logo-item">
            <span className="exertio-logo-icon exertio-logo-icon--circle">◎</span>
            <span className="exertio-logo-text">circle</span>
          </div>
          <div className="exertio-logo-item">
            <span className="exertio-logo-icon exertio-logo-icon--zootv">⏣</span>
            <span className="exertio-logo-text">zootv</span>
          </div>
          <div className="exertio-logo-item">
            <span className="exertio-logo-icon exertio-logo-icon--amara">▲</span>
            <span className="exertio-logo-text">amara</span>
          </div>
        </div>
      </section>

      {/* 3. HAND PICKED TOP SERVICES */}
      <section className="exertio-services-section">
        <div className="exertio-container">
          <div className="exertio-section-header">
            <h2 className="exertio-section-header__title">Hand Picked Top Services</h2>
            <p className="exertio-section-header__subtitle">
              Most viewed and all-time top-selling services.
            </p>

            <div className="exertio-filter-tabs">
              <button
                type="button"
                className={`exertio-tab-btn ${activeTab === "all" ? "exertio-tab-btn--active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Services
              </button>
              <button
                type="button"
                className={`exertio-tab-btn ${activeTab === "dev" ? "exertio-tab-btn--active" : ""}`}
                onClick={() => setActiveTab("dev")}
              >
                Development & IT
              </button>
              <button
                type="button"
                className={`exertio-tab-btn ${activeTab === "marketing" ? "exertio-tab-btn--active" : ""}`}
                onClick={() => setActiveTab("marketing")}
              >
                Digital Marketing & SEO
              </button>
              <button
                type="button"
                className={`exertio-tab-btn ${activeTab === "writing" ? "exertio-tab-btn--active" : ""}`}
                onClick={() => setActiveTab("writing")}
              >
                Writing & Translation
              </button>
            </div>
          </div>

          <div className="exertio-services-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="exertio-service-card">
                <div className="exertio-service-card__thumb-wrap">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="exertio-service-card__thumb"
                    loading="lazy"
                  />
                  <span className={`exertio-service-badge exertio-service-badge--${service.badgeTone}`}>
                    {service.category}
                  </span>
                </div>

                <div className="exertio-service-card__content">
                  <div className="exertio-service-card__author">
                    <img
                      src={service.author.avatar}
                      alt={service.author.name}
                      className="exertio-service-card__avatar"
                    />
                    <span className="exertio-service-card__author-name">
                      {service.author.name}
                    </span>
                    {service.author.verified && (
                      <span className="exertio-service-card__verified" title="Verified Pro">
                        ✓
                      </span>
                    )}
                  </div>

                  <h3 className="exertio-service-card__title">
                    <Link to="/projects">{service.title}</Link>
                  </h3>

                  <div className="exertio-service-card__meta">
                    <span className="exertio-service-card__queue">
                      {service.queueCount} Order in queue
                    </span>
                    <span className="exertio-service-card__rating">
                      ⭐ {service.rating.toFixed(1)} ({service.reviewsCount})
                    </span>
                  </div>

                  <div className="exertio-service-card__footer">
                    <div className="exertio-service-card__price">
                      <small>Starting from:</small>
                      <strong>${service.price.toFixed(2)}</strong>
                    </div>

                    <button
                      type="button"
                      className={`exertio-service-card__favorite ${favorites[service.id] ? "is-fav" : ""}`}
                      onClick={(e) => toggleFavorite(service.id, e)}
                      aria-label="Save to favorites"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={favorites[service.id] ? "#ff4359" : "none"} stroke={favorites[service.id] ? "#ff4359" : "currentColor"} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="exertio-services-cta">
            <Link to="/projects" className="button button--primary button--lg">
              Explore All Top Services & Projects
            </Link>
          </div>
        </div>
      </section>

      {/* 4. COSMIC GRADIENT CTA BANNER */}
      <section className="exertio-gradient-banner">
        <div className="exertio-gradient-banner__mesh" />
        <div className="exertio-gradient-banner__glow-left" />
        <div className="exertio-gradient-banner__glow-right" />
        <div className="exertio-gradient-banner__content">
          <span className="exertio-gradient-banner__eyebrow">SINCE THE START</span>
          <h2 className="exertio-gradient-banner__title">
            We Provide Stable Service With Experts
          </h2>
          <p className="exertio-gradient-banner__desc">
            Freelancers around the globe are looking for work and provide the best they have.
            Start now and grow your business without boundaries.
          </p>

          <div className="exertio-gradient-banner__actions">
            <Link to="/projects" className="exertio-banner-btn exertio-banner-btn--glass">
              View Projects
            </Link>
            {isAuthenticated && user?.role === "CLIENT" ? (
              <Link to="/projects/create" className="exertio-banner-btn exertio-banner-btn--primary">
                Post a Project
              </Link>
            ) : (
              <Link to="/register" className="exertio-banner-btn exertio-banner-btn--primary">
                Post a Service
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 5. "AMAZING MARKETPLACE WEBSITE IN MINUTES ?" SECTION */}
      <section className="exertio-features-section">
        <div className="exertio-container exertio-features-layout">
          <div className="exertio-features__left">
            <span className="exertio-features__eyebrow">HOW IT WORKS</span>
            <h2 className="exertio-features__title">
              Amazing Marketplace Website in Minutes ?
            </h2>
            <p className="exertio-features__copy">
              Experience state-of-the-art marketplace platform with Exertio. We combine the
              experience of our global community around the globe for a seamless marketplace
              ecosystem.
            </p>
            <p className="exertio-features__copy">
              With Exertio, you can connect directly with verified freelancers that will provide
              their best solutions to clients who are looking for remote experts.
            </p>

            <div className="exertio-key-points">
              <div className="exertio-key-point">
                <span className="exertio-key-point__check">✓</span>
                <span>Get commission on project or service</span>
              </div>
              <div className="exertio-key-point">
                <span className="exertio-key-point__check">✓</span>
                <span>Services addons and micro earnings</span>
              </div>
              <div className="exertio-key-point">
                <span className="exertio-key-point__check">✓</span>
                <span>Communicate easily with live chat</span>
              </div>
              <div className="exertio-key-point">
                <span className="exertio-key-point__check">✓</span>
                <span>Send media & attachments in chat</span>
              </div>
            </div>

            <div className="exertio-features__actions">
              <Link to="/projects" className="button button--primary button--md">
                Read More
              </Link>
            </div>
          </div>

          <div className="exertio-features__right">
            <div className="exertio-features__frame">
              <img
                src="/images/marketplace_collab.jpg"
                alt="Freelancers collaborating on platform"
                className="exertio-features__img"
              />
              <button
                type="button"
                className="exertio-features__play-btn"
                onClick={() => setShowDemoModal(true)}
                aria-label="Play feature demo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COUNTERS / STATS STRIP */}
      <section className="exertio-stats-bar">
        <div className="exertio-container">
          <div className="exertio-stats-grid">
            <div className="exertio-stat-item">
              <div className="exertio-stat-item__icon">
                <Icon name="briefcase" size={32} />
              </div>
              <div className="exertio-stat-item__content">
                <strong className="exertio-stat-item__number">5000+</strong>
                <span className="exertio-stat-item__label">Total Sales & Deliveries</span>
              </div>
            </div>

            <div className="exertio-stat-item">
              <div className="exertio-stat-item__icon">
                <Icon name="message" size={32} />
              </div>
              <div className="exertio-stat-item__content">
                <strong className="exertio-stat-item__number">4507+</strong>
                <span className="exertio-stat-item__label">Good Client Reviews</span>
              </div>
            </div>

            <div className="exertio-stat-item">
              <div className="exertio-stat-item__icon">
                <Icon name="users" size={32} />
              </div>
              <div className="exertio-stat-item__content">
                <strong className="exertio-stat-item__number">10000+</strong>
                <span className="exertio-stat-item__label">Active Platform Users</span>
              </div>
            </div>

            <div className="exertio-stat-item">
              <div className="exertio-stat-item__icon">
                <Icon name="check-circle" size={32} />
              </div>
              <div className="exertio-stat-item__content">
                <strong className="exertio-stat-item__number">1150+</strong>
                <span className="exertio-stat-item__label">Verified Top Freelancers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO MODAL */}
      {showDemoModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setShowDemoModal(false)} />
          <div className="modal-container exertio-demo-modal">
            <div className="modal-header">
              <h3>Exertio Platform Tour</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDemoModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body exertio-demo-modal__body">
              <div className="exertio-demo-video-box">
                <img
                  src="/images/marketplace_collab.jpg"
                  alt="Platform overview"
                  className="exertio-demo-video-poster"
                />
                <div className="exertio-demo-overlay">
                  <span className="demo-play-badge">▶</span>
                  <h4>Welcome to Exertio Freelancer Marketplace</h4>
                  <p>Discover projects, send proposals, collaborate in real-time, and get paid securely.</p>
                </div>
              </div>
              <div className="exertio-demo-highlights">
                <div className="demo-highlight-item">
                  <strong>🔍 Smart Search</strong>
                  <p>Filter by skill, budget, duration, and client verification.</p>
                </div>
                <div className="demo-highlight-item">
                  <strong>💬 Direct Chat</strong>
                  <p>Collaborate smoothly with live project messaging.</p>
                </div>
                <div className="demo-highlight-item">
                  <strong>🛡️ Protected Payments</strong>
                  <p>Milestone releases and transparent accounting.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Link
                to="/register"
                className="button button--primary button--md"
                onClick={() => setShowDemoModal(false)}
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
