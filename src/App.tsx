import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

const PORTAL_BG = "/assets/library-middle-layer.png";
const CURTAIN_LEFT = "/assets/publishing-curtain-left.png";
const CURTAIN_RIGHT = "/assets/publishing-curtain-right.png";
const ROMANTASY_HERO_BG = "/assets/romantasy-hero-bg.png";
const SPIRITUAL_HERO_BG = "/assets/spiritual-hero-bg.png";
const CHILDREN_HERO_BG = "/assets/children-hero-bg.png";
const ARTS_EDUCATIONAL_HERO_BG = "/assets/arts-education-hero-bg.png";
const WORLD_BG =
  "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706392/image_2_gkcdlx.png";
const BOTTOM_CLOUDS =
  "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706555/bottom_clouds_xskut6.png";

const CARD_IMAGES = [
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85",
];

const BODY_COPY =
  "Indie-made visual books where stories, art, and wonder come together on every page.";

const HERO_CATEGORIES = {
  spiritual: { title: "Spiritual", href: "#/spiritual" },
  romantasy: { title: "Romantasy", href: "#/romantasy" },
  forChildren: { title: "For Children", href: "#/for-children" },
} as const;

const ARC_CARDS = [
  {
    title: "Spiritual",
    desc: "Visual faith guides, devotionals, and Bible-inspired journeys",
    color: "#f3cdd6",
    href: "#/spiritual",
  },
  {
    title: "Romantasy",
    desc: "Bookish fantasy romance worlds, tropes, and reader gifts",
    color: "#dcedc2",
    href: "#/romantasy",
  },
  {
    title: "For Children",
    desc: "Playful visual books for curious young readers",
    color: "#c3e3f4",
    href: "#/for-children",
  },
  {
    title: "Arts Crafts & Educational",
    desc: "Creative learning books, drawing guides, and hands-on ideas",
    color: "#f0e4c0",
    href: "#/arts-crafts-educational",
  },
  {
    title: "Non-English",
    desc: "Visual books and editions for readers beyond English",
    color: "#dcd2f2",
    href: "#/non-english",
  },
];

type ArcCard = (typeof ARC_CARDS)[number];

type Mouse = { x: number; y: number };

const MAG = {
  world: 6,
  clouds: 9,
  portal: 7,
  curtainL: 14,
  curtainR: 14,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function navigateToHref(href: string) {
  if (href.startsWith("#/")) {
    window.location.hash = href.slice(1);
    window.scrollTo({ top: 0, behavior: "auto" });
  } else {
    window.location.href = href;
  }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function StarLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.6" />
      <circle cx="6" cy="6" r="1" fill="white" opacity="0.4" />
      <circle cx="22" cy="6" r="1" fill="white" opacity="0.4" />
    </svg>
  );
}

function PlayIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3.2 2.1v7.8L9.2 6 3.2 2.1z" fill="#3b1a0a" />
    </svg>
  );
}

function ScrollChevron() {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "1.5px solid rgba(255,255,255,0.5)",
        display: "grid",
        placeItems: "center",
        animation: "bobUp 1.8s ease-in-out infinite",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 5l4 4 4-4"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Nav({ onCategoriesClick }: { onCategoriesClick: () => void }) {
  const navLinkStyle: CSSProperties = {
    fontFamily: "'Imprima', sans-serif",
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#fff",
    opacity: 0.9,
    textDecoration: "none",
  };

  const buttonReset: CSSProperties = {
    border: 0,
    background: "transparent",
    padding: 0,
    cursor: "pointer",
  };

  const memberStyle: CSSProperties = {
    ...navLinkStyle,
    padding: "10px 15px",
    border: "1px solid rgba(255,255,255,0.38)",
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.22)",
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      <div className="md:hidden" style={{ padding: "18px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={onCategoriesClick}
            style={{ ...buttonReset, ...navLinkStyle, fontSize: 11 }}
          >
            Categories
          </button>
          <StarLogo />
          <a
            href="#member"
            style={{ ...memberStyle, fontSize: 10, padding: "8px 11px" }}
          >
            Free Member
          </a>
        </div>
      </div>

      <div
        className="hidden md:flex"
        style={{
          padding: "22px 48px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <button
            type="button"
            onClick={onCategoriesClick}
            style={{ ...buttonReset, ...navLinkStyle }}
          >
            Categories
          </button>
          <a href="#bestsellers" style={navLinkStyle}>
            Bestsellers
          </a>
        </div>
        <StarLogo />
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <a href="#member" style={memberStyle}>
            Become a Member <span style={{ opacity: 0.72 }}>(Free)</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

function HeadingLines({ desktop = false }: { desktop?: boolean }) {
  const color = desktop ? "#fff" : "#3b1a0a";
  const topSize = desktop
    ? "clamp(32px, 4.5vw, 54px)"
    : "clamp(26px, 7vw, 42px)";
  const bottomSize = desktop
    ? "clamp(50px, 7.5vw, 88px)"
    : "clamp(52px, 16vw, 80px)";

  return (
    <h1 style={{ margin: 0, fontFamily: "'Viaoda Libre', serif", color }}>
      <span
        style={{
          display: "block",
          fontSize: topSize,
          lineHeight: desktop ? 1.1 : 1.05,
          letterSpacing: desktop ? "0.04em" : "0.12em",
          textTransform: "uppercase",
        }}
      >
        FALL{" "}
        <span
          style={{
            color: desktop ? "rgba(255,220,180,0.7)" : "#6b2e0e",
            fontSize: "0.8em",
          }}
        >
          ›
        </span>{" "}
        <em style={{ fontStyle: "italic" }}>INTO</em>
      </span>
      <span
        style={{
          display: "block",
          fontSize: bottomSize,
          lineHeight: desktop ? 0.9 : 0.88,
          letterSpacing: desktop ? "-0.02em" : "-0.04em",
          textTransform: "uppercase",
        }}
      >
        REVERIE
      </span>
    </h1>
  );
}

function ReelCard({
  image,
  size,
  radius,
  label,
  labelSize = 13,
  href,
  onClick,
}: {
  image: string;
  size: number;
  radius: number;
  label: string;
  labelSize?: number;
  href?: string;
  onClick?: () => void;
}) {
  const cardStyle: CSSProperties = {
    position: "relative",
    display: "block",
    width: size,
    height: size,
    overflow: "hidden",
    borderRadius: radius,
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    textDecoration: "none",
    color: "#fff",
    cursor: "pointer",
  };

  const content = (
    <>
      <CardGlassOverlay />
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: size > 150 ? 30 : 26,
            height: size > 150 ? 30 : 26,
            borderRadius: "50%",
            background: "#fff",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <PlayIcon size={size > 150 ? 14 : 12} />
        </span>
        <span
          style={{
            color: "#fff",
            fontSize: labelSize,
            lineHeight: 1.05,
            textShadow: "0 1px 8px rgba(0,0,0,0.55)",
          }}
        >
          {label}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{ ...cardStyle, border: 0, padding: 0 }}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={href ?? "#"}
      onClick={(event) => {
        if (href?.startsWith("#/")) {
          event.preventDefault();
          navigateToHref(href);
        }
      }}
      style={cardStyle}
    >
      {content}
    </a>
  );
}

function CategoryCard({
  image,
  size,
  radius,
  title,
  href,
  titleSize = 18,
}: {
  image: string;
  size: number;
  radius: number;
  title: string;
  href: string;
  titleSize?: number;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (href.startsWith("#/")) {
          event.preventDefault();
          navigateToHref(href);
        }
      }}
      style={{
        position: "relative",
        display: "block",
        width: size,
        height: size,
        overflow: "hidden",
        borderRadius: radius,
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      <CardGlassOverlay />
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 14 }}>
        <div
          style={{
            color: "#fff",
            fontSize: titleSize,
            lineHeight: 1.08,
            textShadow: "0 1px 10px rgba(0,0,0,0.65)",
          }}
        >
          {title}
        </div>
      </div>
    </a>
  );
}

function CardGlassOverlay() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.34) 42%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "44%",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          maskImage:
            "linear-gradient(to top, black 0%, rgba(0,0,0,0.8) 40%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, rgba(0,0,0,0.8) 40%, transparent 100%)",
        }}
      />
    </>
  );
}

function SliderDots({
  uiVisible,
  scene1Opacity,
  isDesktop,
}: {
  uiVisible: boolean;
  scene1Opacity: number;
  isDesktop: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: isDesktop ? 60 : "50%",
        bottom: isDesktop ? 40 : 28,
        zIndex: 21,
        display: "flex",
        gap: 7,
        transform: isDesktop ? "none" : "translateX(-50%)",
        opacity: uiVisible ? scene1Opacity : 0,
        transition: "opacity 0.9s ease 0.8s, transform 0.9s ease 0.8s",
      }}
    >
      {[0, 1, 2, 3].map((dot) => (
        <span
          key={dot}
          style={{
            width: dot === 0 ? 28 : 14,
            height: 4,
            borderRadius: 2,
            background:
              dot === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </div>
  );
}

function ArcCardSlider({
  cards,
  rotationOffset,
  isMobile,
}: {
  cards: ArcCard[];
  rotationOffset: number;
  isMobile: boolean;
}) {
  const totalCards = cards.length;
  // Keep neighboring cards from covering each other's top-right CTA area.
  // Overlapping anchors caused a click on one card to activate the next card.
  const cardSpacingDeg = isMobile ? 14 : 12;
  const centerIndex = Math.floor(totalCards / 2);
  const arcRadius = isMobile ? 700 : 1100;
  const cardW = isMobile ? 160 : 220;
  const cardH = cardW;
  const sliderH = isMobile ? 280 : 360;
  const bottomLift = isMobile ? 140 : 200;

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: sliderH,
        overflow: "visible",
        pointerEvents: "auto",
      }}
    >
      {cards.map((card, i) => {
        const baseDeg = (i - centerIndex) * cardSpacingDeg;
        const deg = baseDeg - rotationOffset + centerIndex * cardSpacingDeg;
        const rad = (deg * Math.PI) / 180;
        const x = Math.sin(rad) * arcRadius;
        const y = arcRadius - Math.cos(rad) * arcRadius;

        return (
          <a
            key={card.title}
            href={card.href}
            onClick={(event) => {
              if (card.href.startsWith("#/")) {
                event.preventDefault();
                navigateToHref(card.href);
              }
            }}
            style={{
              position: "absolute",
              width: cardW,
              height: cardH,
              bottom: -y + bottomLift,
              left: `calc(50% + ${x}px - ${cardW / 2}px)`,
              transform: `rotate(${deg}deg)`,
              transformOrigin: `${cardW / 2}px ${arcRadius}px`,
              borderRadius: isMobile ? 18 : 26,
              background: card.color,
              boxShadow: "0 8px 40px rgba(80,40,60,0.18)",
              padding: isMobile ? 18 : 24,
              overflow: "hidden",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: isMobile ? 14 : 18,
                right: isMobile ? 14 : 18,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "1.5px solid rgba(80,50,60,0.3)",
                color: "rgba(80,50,60,0.6)",
                display: "grid",
                placeItems: "center",
                fontSize: 10,
                fontFamily: "'Imprima', sans-serif",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div
              style={{
                position: "absolute",
                left: isMobile ? 18 : 24,
                right: isMobile ? 18 : 24,
                bottom: isMobile ? 18 : 24,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Viaoda Libre', serif",
                  fontSize: isMobile ? 22 : 30,
                  lineHeight: 1.04,
                  color: "#3a2530",
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: isMobile ? 12 : 15,
                  lineHeight: 1.35,
                  color: "rgba(58,37,48,0.65)",
                }}
              >
                {card.desc}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}


type Book = {
  title: string;
  eyebrow: string;
  hook: string;
  bestFor: string[];
  tags: string[];
  image: string;
  href: string;
  badge?: string;
};

type CategoryConfig = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  accent: string;
  softAccent: string;
  gradient: string;
  heroImage?: string;
  heroImageTint?: string;
  heroOverlay?: string;
  books: Book[];
};

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  spiritual: {
    slug: "spiritual",
    title: "Spiritual",
    kicker: "Christian visual books for readers who seek beauty, meaning, and a deeper way to reflect.",
    description:
      "A calm shelf of indie-made Christian books for adults, young readers, families, Bible study, devotional reflection, and meaningful gifts.",
    accent: "#f4d28b",
    softAccent: "rgba(244,210,139,0.18)",
    gradient:
      "radial-gradient(circle at 78% 12%, rgba(244,210,139,0.30), transparent 34%), radial-gradient(circle at 18% 82%, rgba(47,75,68,0.22), transparent 34%), linear-gradient(145deg, #080b12 0%, #171108 48%, #050304 100%)",
    heroImage: SPIRITUAL_HERO_BG,
    heroImageTint: "linear-gradient(180deg, rgba(9,8,6,0.04), rgba(9,8,6,0.24))",
    heroOverlay: "linear-gradient(90deg, rgba(12,10,8,0.48) 0%, rgba(30,22,10,0.16) 46%, rgba(18,14,8,0.26) 100%), radial-gradient(circle at 50% 38%, rgba(244,210,139,0.10), transparent 40%)",
    books: [
      {
        title: "Visual Faith Guides",
        eyebrow: "Best First Pick",
        badge: "Start Here",
        hook: "Beautiful Christian visual books for reflection, Scripture, history, and wonder.",
        bestFor: ["Christian readers", "Bible study", "Meaningful gifts"],
        tags: ["Visual Faith", "Christian", "Gift Pick"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "Bible Stories for Young Readers",
        eyebrow: "For Families",
        badge: "Family Pick",
        hook: "Visual Bible-inspired books made accessible for curious children and families.",
        bestFor: ["Young readers", "Parents", "Sunday school"],
        tags: ["Children", "Bible", "Family"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "Christian Reflection Books",
        eyebrow: "Quiet Study",
        badge: "Reflective Pick",
        hook: "Gentle visual books for prayerful reading, journaling, and deeper reflection.",
        bestFor: ["Adults", "Devotional reading", "Faith gifts"],
        tags: ["Devotional", "Reflection", "Visual"],
        image: CARD_IMAGES[2],
        href: "#",
      },
      {
        title: "Women of Scripture",
        eyebrow: "Visual Study",
        hook: "Elegant visual studies for modern readers exploring biblical women and faith.",
        bestFor: ["Women readers", "Study groups", "Gift buyers"],
        tags: ["Bible Study", "Women", "Faith"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "Bible Mysteries & Questions",
        eyebrow: "Curious Faith",
        hook: "Visual guides that explore Scripture, history, tradition, and thoughtful questions.",
        bestFor: ["Curious Christians", "History readers", "Discussion groups"],
        tags: ["Bible History", "Questions", "Guide"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "Teen Faith & Encouragement",
        eyebrow: "For Young Readers",
        hook: "Encouraging visual books for teens navigating worries, identity, and hope.",
        bestFor: ["Teens", "Parents", "Youth groups"],
        tags: ["Teen", "Encouragement", "Christian"],
        image: CARD_IMAGES[2],
        href: "#",
      },
    ],
  },
  "for-children": {
    slug: "for-children",
    title: "For Children",
    kicker: "Creative visual books that make learning, faith, and stories feel like an adventure.",
    description:
      "A bright shelf of indie-made books for curious kids, busy families, classrooms, Sunday school, and gift-giving grown-ups.",
    accent: "#ffd56f",
    softAccent: "rgba(255,213,111,0.18)",
    gradient:
      "radial-gradient(circle at 16% 12%, rgba(120,190,210,0.26), transparent 34%), radial-gradient(circle at 84% 18%, rgba(255,213,111,0.24), transparent 32%), linear-gradient(145deg, #0b1820 0%, #173b43 44%, #0a0f12 100%)",
    heroImage: CHILDREN_HERO_BG,
    heroImageTint: "linear-gradient(180deg, rgba(6,12,16,0.04), rgba(6,12,16,0.22))",
    heroOverlay: "linear-gradient(90deg, rgba(8,18,22,0.44) 0%, rgba(20,40,46,0.13) 46%, rgba(8,18,22,0.24) 100%), radial-gradient(circle at 50% 38%, rgba(255,213,111,0.12), transparent 40%)",
    books: [
      {
        title: "Bible Workbook Adventures",
        eyebrow: "Best First Pick",
        badge: "Start Here",
        hook: "A visual adventure-style book that helps young readers explore faith with curiosity.",
        bestFor: ["Ages 7–11", "Christian families", "Gift buyers"],
        tags: ["Bible", "Adventure", "Kids"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "Busting Myths for Curious Kids",
        eyebrow: "Most Fun",
        badge: "Curious Pick",
        hook: "Visual myth-busting books that turn big questions into friendly discoveries.",
        bestFor: ["Curious readers", "Family reading", "Classroom discussion"],
        tags: ["Facts", "Questions", "Visual"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "Creative Learning Books",
        eyebrow: "Activity Shelf",
        badge: "Learning Pick",
        hook: "Beautiful activity and learning books for drawing, thinking, creating, and exploring.",
        bestFor: ["Creative kids", "Parents", "Homeschool shelves"],
        tags: ["Learning", "Activities", "Creative"],
        image: CARD_IMAGES[2],
        href: "#",
      },
      {
        title: "Storybook Nature Friends",
        eyebrow: "Gentle Story",
        hook: "Warm visual stories with animals, facts, feelings, and soft adventure energy.",
        bestFor: ["Young readers", "Bedtime reading", "Animal lovers"],
        tags: ["Story", "Animals", "Gentle"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "Draw, Make & Imagine",
        eyebrow: "Creative Play",
        hook: "Visual books that make creativity feel simple, joyful, and possible.",
        bestFor: ["Art-loving kids", "Rainy-day activities", "Gift browsing"],
        tags: ["Drawing", "Craft", "Imagination"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "Faith & Feelings for Kids",
        eyebrow: "Encouraging Shelf",
        hook: "Gentle Christian visual books for feelings, courage, kindness, and everyday hope.",
        bestFor: ["Parents", "Young readers", "Sunday school"],
        tags: ["Faith", "Feelings", "Encouragement"],
        image: CARD_IMAGES[2],
        href: "#",
      },
    ],
  },
  "arts-crafts-educational": {
    slug: "arts-crafts-educational",
    title: "Arts, Crafts & Educational",
    kicker: "Visual books for making, learning, drawing, thinking, and creating with purpose.",
    description:
      "A creative shelf of indie-made books for artists, makers, families, learners, classrooms, and anyone who loves hands-on visual discovery.",
    accent: "#d9ab72",
    softAccent: "rgba(217,171,114,0.18)",
    gradient:
      "radial-gradient(circle at 16% 14%, rgba(204,146,98,0.22), transparent 32%), radial-gradient(circle at 84% 18%, rgba(136,157,128,0.22), transparent 34%), linear-gradient(145deg, #120e0a 0%, #2a1d14 42%, #080605 100%)",
    heroImage: ARTS_EDUCATIONAL_HERO_BG,
    heroImageTint: "linear-gradient(180deg, rgba(10,8,6,0.04), rgba(10,8,6,0.22))",
    heroOverlay: "linear-gradient(90deg, rgba(18,14,10,0.42) 0%, rgba(45,32,20,0.12) 46%, rgba(18,14,10,0.24) 100%), radial-gradient(circle at 50% 38%, rgba(217,171,114,0.10), transparent 40%)",
    books: [
      {
        title: "Creative Learning Books",
        eyebrow: "Best First Pick",
        badge: "Start Here",
        hook: "Beautiful visual books that blend learning, creativity, and hands-on discovery.",
        bestFor: ["Curious learners", "Homeschool shelves", "Gift buyers"],
        tags: ["Learning", "Creative", "Visual"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "Draw, Make & Imagine",
        eyebrow: "Most Creative",
        badge: "Maker Pick",
        hook: "Friendly visual books for drawing, crafting, making, and trying new ideas.",
        bestFor: ["Art-loving kids", "Families", "Creative downtime"],
        tags: ["Drawing", "Craft", "Activities"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "Visual Study Guides",
        eyebrow: "Educational Pick",
        badge: "Learn Visually",
        hook: "Clear, visual books that help readers understand concepts through design and structure.",
        bestFor: ["Students", "Visual learners", "Classrooms"],
        tags: ["Educational", "Workbook", "Guide"],
        image: CARD_IMAGES[2],
        href: "#",
      },
      {
        title: "Creative Workbook Collection",
        eyebrow: "Hands-On Shelf",
        hook: "Open-ended visual workbooks for sketching, noticing, and making ideas tangible.",
        bestFor: ["Teens", "Makers", "Independent study"],
        tags: ["Workbook", "Sketch", "Projects"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "Paper, Pattern & Play",
        eyebrow: "Craft Shelf",
        hook: "A playful visual shelf for paper craft, pattern, collage, and creative exploration.",
        bestFor: ["Craft lovers", "Parents", "Rainy-day projects"],
        tags: ["Paper Craft", "Collage", "Fun"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "Learn by Making",
        eyebrow: "Project-Based",
        hook: "Visual books that make ideas easier to grasp through projects, layouts, and experiments.",
        bestFor: ["Project learners", "Teachers", "Creative families"],
        tags: ["Projects", "Learning", "Hands-On"],
        image: CARD_IMAGES[2],
        href: "#",
      },
    ],
  },
  romantasy: {
    slug: "romantasy",
    title: "Romantasy",
    kicker: "For readers who love magic, longing, danger, and impossible choices.",
    description:
      "A curated shelf of indie-made visual books for fantasy romance fans, BookTok readers, trope collectors, and lovers of beautiful fictional worlds.",
    accent: "#cfa0ff",
    softAccent: "rgba(207,160,255,0.18)",
    gradient:
      "radial-gradient(circle at 22% 18%, rgba(170,92,200,0.30), transparent 34%), radial-gradient(circle at 78% 14%, rgba(246,180,120,0.18), transparent 30%), linear-gradient(145deg, #10070f 0%, #1a0c19 42%, #070407 100%)",
    heroImage: ROMANTASY_HERO_BG,
    heroImageTint: "linear-gradient(180deg, rgba(10,6,8,0.03), rgba(10,6,8,0.30))",
    heroOverlay: "linear-gradient(90deg, rgba(11,7,10,0.32) 0%, rgba(20,10,22,0.10) 42%, rgba(13,8,12,0.28) 100%), radial-gradient(circle at 50% 38%, rgba(110,65,105,0.10), transparent 40%)",
    books: [
      {
        title: "BookTok Must-Reads",
        eyebrow: "Best First Pick",
        badge: "Start Here",
        hook: "A visual guide to addictive fantasy romance, dark academia, and BookTok obsession.",
        bestFor: ["Romantasy beginners", "BookTok readers", "Gift buyers"],
        tags: ["Visual Guide", "BookTok", "Gift Pick"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "The Ultimate Romantasy Yearbook",
        eyebrow: "Most Giftable",
        badge: "Fan Favorite",
        hook: "A playful visual yearbook of tropes, ships, kingdoms, quizzes, and reader-core moments.",
        bestFor: ["Trope lovers", "Reading groups", "Aesthetic shelf collectors"],
        tags: ["Yearbook", "Tropes", "Bookish Fun"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "How to Survive K-Pop Demon Idol Romantasy",
        eyebrow: "Most Original",
        badge: "Indie Pick",
        hook: "A sharp, funny romantasy for readers who like their demons dramatic and their idols dangerous.",
        bestFor: ["Satirical romance fans", "K-pop fantasy readers", "Fast, funny reads"],
        tags: ["Novel", "Humor", "Demon Idol"],
        image: CARD_IMAGES[2],
        href: "#",
      },
      {
        title: "Fae Courts & Forbidden Vows",
        eyebrow: "Visual Shelf Pick",
        hook: "Elegant visual prompts, moodboards, and reading notes for court-intrigue romantasy fans.",
        bestFor: ["Fae court readers", "Slow-burn fans", "Aesthetic planners"],
        tags: ["Fae", "Court Intrigue", "Slow Burn"],
        image: CARD_IMAGES[0],
        href: "#",
      },
      {
        title: "Dark Academia Romance Notes",
        eyebrow: "Reader Companion",
        hook: "A moody visual companion for secret societies, forbidden libraries, and dangerous attraction.",
        bestFor: ["Dark academia fans", "Visual journalers", "Library lovers"],
        tags: ["Dark Academia", "Companion", "Moodbook"],
        image: CARD_IMAGES[1],
        href: "#",
      },
      {
        title: "Dragons, Daggers & Devotion",
        eyebrow: "Coming Shelf Concept",
        hook: "A visual fantasy-romance shelf for high-stakes kingdoms, bonded beasts, and impossible loyalties.",
        bestFor: ["Dragon romantasy fans", "Epic fantasy readers", "Gift browsing"],
        tags: ["Dragons", "Kingdoms", "Adventure"],
        image: CARD_IMAGES[2],
        href: "#",
      },
    ],
  },
};

const FALLBACK_CATEGORY: CategoryConfig = {
  slug: "visual-books",
  title: "Visual Books",
  kicker: "Creative visual books for curious readers, families, and gift buyers.",
  description:
    "Explore indie-made books where stories, art, and wonder come together on every page.",
  accent: "#f0d8a8",
  softAccent: "rgba(240,216,168,0.16)",
  gradient:
    "radial-gradient(circle at 24% 14%, rgba(240,216,168,0.24), transparent 34%), linear-gradient(145deg, #0a0608 0%, #15100c 45%, #050304 100%)",
  books: CATEGORY_CONFIGS?.romantasy?.books ?? [],
};

function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CategoryPage({ config }: { config: CategoryConfig }) {
  const topBooks = config.books.slice(0, 3);
  const allBooks = config.books;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [config.slug]);

  const pageLinkStyle: CSSProperties = {
    fontFamily: "'Imprima', sans-serif",
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#fff",
    opacity: 0.9,
    textDecoration: "none",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: config.gradient,
        color: "#fff",
        fontFamily: "'Imprima', sans-serif",
        overflow: "hidden",
      }}
    >
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "20px clamp(20px, 4vw, 56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.48), rgba(0,0,0,0))",
          pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
          <a href="#/" style={pageLinkStyle}>
            Home
          </a>
          <button
            type="button"
            onClick={() => scrollToId("all-books")}
            style={{
              ...pageLinkStyle,
              border: 0,
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            All Books
          </button>
        </div>
        <a
          href="#member"
          style={{
            ...pageLinkStyle,
            padding: "10px 15px",
            border: "1px solid rgba(255,255,255,0.32)",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.24)",
          }}
        >
          Become a Member <span style={{ opacity: 0.72 }}>(Free)</span>
        </a>
      </nav>

      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "grid",
          alignItems: "center",
          padding: "110px clamp(22px, 5vw, 72px) 70px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: config.heroImage
              ? `${config.heroImageTint ?? "linear-gradient(180deg, rgba(10,6,8,0.06), rgba(10,6,8,0.34))"}, url(${config.heroImage})`
              : `url(${PORTAL_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: config.heroImage ? 0.96 : 0.18,
            filter: config.heroImage ? "none" : "blur(1px)",
            transform: config.heroImage ? "scale(1.01)" : "scale(1.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: config.heroImage
              ? config.heroOverlay ?? "linear-gradient(90deg, rgba(11,7,10,0.42) 0%, rgba(20,10,22,0.16) 42%, rgba(13,8,12,0.34) 100%), radial-gradient(circle at 50% 38%, rgba(110,65,105,0.10), transparent 40%)"
              : "linear-gradient(90deg, rgba(5,2,5,0.94) 0%, rgba(10,4,10,0.72) 46%, rgba(10,4,10,0.88) 100%)",
          }}
        />
        <div
          className="grid xl:grid-cols-[1.05fr_0.95fr]"
          style={{
            position: "relative",
            zIndex: 2,
            gap: 46,
            alignItems: "center",
            maxWidth: 1240,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 999,
                background: config.softAccent,
                border: `1px solid ${config.accent}55`,
                color: config.accent,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Discover Visually Shelf
            </div>
            <h1
              style={{
                margin: "22px 0 0",
                fontFamily: "'Viaoda Libre', serif",
                fontSize: "clamp(64px, 11vw, 148px)",
                lineHeight: 0.86,
                letterSpacing: "-0.04em",
                color: "#fff",
                textShadow: "0 12px 45px rgba(0,0,0,0.55)",
              }}
            >
              {config.title}
            </h1>
            <p
              style={{
                margin: "26px 0 0",
                maxWidth: 620,
                fontSize: "clamp(19px, 2vw, 28px)",
                lineHeight: 1.36,
                color: "rgba(255,244,238,0.94)",
              }}
            >
              {config.kicker}
            </p>
            <p
              style={{
                margin: "16px 0 0",
                maxWidth: 560,
                fontSize: 17,
                lineHeight: 1.75,
                color: "rgba(255,244,238,0.72)",
              }}
            >
              {config.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 30,
              }}
            >
              <button
                type="button"
                onClick={() => scrollToId("top-picks")}
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: "14px 20px",
                  background: "#fff",
                  color: "#2b1028",
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Explore Top Picks
              </button>
              <button
                type="button"
                onClick={() => scrollToId("all-books")}
                style={{
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 999,
                  padding: "14px 20px",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Browse All Books
              </button>
            </div>
          </div>

          <div
            className="hidden xl:block"
            style={{ position: "relative", minHeight: 540 }}
          >
            {topBooks.map((book, i) => (
              <a
                key={book.title}
                href={book.href}
                style={{
                  position: "absolute",
                  right: i === 0 ? 120 : i === 1 ? 0 : 260,
                  top: i === 0 ? 20 : i === 1 ? 138 : 230,
                  width: i === 0 ? 280 : 230,
                  height: i === 0 ? 370 : 300,
                  borderRadius: 28,
                  overflow: "hidden",
                  backgroundImage: `url(${book.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `rotate(${i === 0 ? -4 : i === 1 ? 7 : -9}deg)`,
                  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  textDecoration: "none",
                }}
              >
                <CardGlassOverlay />
                <span
                  style={{
                    position: "absolute",
                    left: 18,
                    bottom: 18,
                    fontSize: 14,
                    color: "#fff",
                    textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                  }}
                >
                  {book.badge ?? book.eyebrow}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="top-picks"
        style={{
          padding: "76px clamp(22px, 5vw, 72px) 48px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <SectionIntro
          eyebrow="Start here"
          title="The three books readers open first"
          body="Different readers need different first doors. These featured picks make the category easier to browse, gift, and understand at a glance."
        />
        <div
          className="grid xl:grid-cols-3"
          style={{ gap: 20, marginTop: 32 }}
        >
          {topBooks.map((book, i) => (
            <FeaturedBookCard key={book.title} book={book} featured={i === 1} />
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "58px clamp(22px, 5vw, 72px)",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <SectionIntro
          eyebrow="Look inside"
          title="A peek at the visual reading experience"
          body="Visual books sell through proof. Use this area for real interior spreads, open-book mockups, or category-specific page previews."
        />
        <div
          className="grid xl:grid-cols-3"
          style={{ gap: 18, marginTop: 30 }}
        >
          {CARD_IMAGES.map((image, i) => (
            <div
              key={image}
              style={{
                minHeight: 250,
                borderRadius: 30,
                overflow: "hidden",
                position: "relative",
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <CardGlassOverlay />
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  right: 22,
                  bottom: 20,
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    opacity: 0.78,
                  }}
                >
                  Preview {i + 1}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "'Viaoda Libre', serif",
                    fontSize: 30,
                    lineHeight: 1,
                  }}
                >
                  Designed to be browsed, gifted, and kept
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="all-books"
        style={{
          padding: "72px clamp(22px, 5vw, 72px)",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <SectionIntro
          eyebrow="Complete shelf"
          title={`All ${config.title} books`}
          body="A clean product grid for the full category. Replace placeholder links with Amazon, Etsy, Gumroad, or dedicated product pages when each listing is ready."
        />
        <div
          className="grid md:grid-cols-2 xl:grid-cols-3"
          style={{ gap: 18, marginTop: 32 }}
        >
          {allBooks.map((book) => (
            <CompactBookCard key={book.title} book={book} />
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "46px clamp(22px, 5vw, 72px) 82px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          className="grid xl:grid-cols-3"
          style={{ gap: 16 }}
        >
          <TrustCard
            title="Made for visual readers"
            body="Built around atmosphere, page design, hooks, spreads, and visual discovery—not plain catalogue browsing."
          />
          <TrustCard
            title="Easy to gift"
            body="Clear category positioning helps buyers choose quickly for birthdays, holidays, book clubs, and reader friends."
          />
          <TrustCard
            title="Indie-made with personality"
            body="Less corporate, more curious. A small visual press for readers who still like wonder on the page."
          />
        </div>
      </section>

      <section
        id="member"
        style={{
          padding: "72px clamp(22px, 5vw, 72px) 96px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Viaoda Libre', serif",
              fontSize: "clamp(42px, 7vw, 86px)",
              lineHeight: 0.95,
            }}
          >
            Join the free reader list
          </h2>
          <p
            style={{
              margin: "18px auto 0",
              maxWidth: 620,
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(255,244,238,0.76)",
            }}
          >
            Get new releases, visual previews, category drops, and behind-the-scenes book ideas before they go public.
          </p>
          <a
            href="mailto:hello@discovervisually.com?subject=Free%20Reader%20Membership"
            style={{
              display: "inline-block",
              marginTop: 28,
              borderRadius: 999,
              padding: "15px 24px",
              background: "#fff",
              color: "#2b1028",
              textDecoration: "none",
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Become a Member — Free
          </a>
        </div>
      </section>
    </main>
  );
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div style={{ maxWidth: 760 }}>
      <div
        style={{
          color: "rgba(255,255,255,0.58)",
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          margin: "10px 0 0",
          fontFamily: "'Viaoda Libre', serif",
          fontSize: "clamp(40px, 6vw, 76px)",
          lineHeight: 0.98,
          color: "#fff",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: "16px 0 0",
          fontSize: 17,
          lineHeight: 1.7,
          color: "rgba(255,244,238,0.68)",
        }}
      >
        {body}
      </p>
    </div>
  );
}

function FeaturedBookCard({ book, featured }: { book: Book; featured?: boolean }) {
  return (
    <article
      style={{
        position: "relative",
        padding: featured ? 26 : 22,
        borderRadius: 34,
        background: featured
          ? "linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))"
          : "rgba(255,255,255,0.07)",
        border: featured
          ? "1px solid rgba(255,255,255,0.22)"
          : "1px solid rgba(255,255,255,0.10)",
        boxShadow: featured ? "0 30px 90px rgba(0,0,0,0.30)" : "none",
        transform: featured ? "translateY(-10px)" : "none",
      }}
    >
      {book.badge && (
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            padding: "7px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.16)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {book.badge}
        </div>
      )}
      <div
        style={{
          height: 250,
          borderRadius: 24,
          backgroundImage: `url(${book.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "inset 0 -80px 80px rgba(0,0,0,0.24)",
        }}
      />
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            color: "rgba(255,255,255,0.56)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {book.eyebrow}
        </div>
        <h3
          style={{
            margin: "8px 0 0",
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 36,
            lineHeight: 0.95,
          }}
        >
          {book.title}
        </h3>
        <p
          style={{
            margin: "14px 0 0",
            color: "rgba(255,244,238,0.74)",
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          {book.hook}
        </p>
        <div style={{ marginTop: 16 }}>
          {book.bestFor.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "rgba(255,244,238,0.72)",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              <span style={{ color: "#f0d8a8" }}>•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          <a
            href={book.href}
            style={{
              borderRadius: 999,
              padding: "12px 15px",
              background: "#fff",
              color: "#2b1028",
              textDecoration: "none",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            View Book
          </a>
          <a
            href="#all-books"
            style={{
              borderRadius: 999,
              padding: "12px 15px",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Look Inside
          </a>
        </div>
      </div>
    </article>
  );
}

function CompactBookCard({ book }: { book: Book }) {
  return (
    <a
      href={book.href}
      style={{
        display: "grid",
        gridTemplateColumns: "112px 1fr",
        gap: 16,
        padding: 14,
        borderRadius: 26,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        textDecoration: "none",
        color: "#fff",
      }}
    >
      <div
        style={{
          minHeight: 146,
          borderRadius: 18,
          backgroundImage: `url(${book.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div>
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {book.eyebrow}
        </div>
        <h3
          style={{
            margin: "7px 0 0",
            fontFamily: "'Viaoda Libre', serif",
            fontSize: 28,
            lineHeight: 0.98,
          }}
        >
          {book.title}
        </h3>
        <p
          style={{
            margin: "10px 0 0",
            color: "rgba(255,244,238,0.66)",
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          {book.hook}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {book.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "5px 8px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.09)",
                color: "rgba(255,244,238,0.74)",
                fontSize: 11,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

function TrustCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 26,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: "'Viaoda Libre', serif",
          fontSize: 34,
          lineHeight: 0.98,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "12px 0 0",
          color: "rgba(255,244,238,0.68)",
          fontSize: 15,
          lineHeight: 1.65,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function HomePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);
  const entranceDone = true;
  const [mouse, setMouse] = useState<Mouse>({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1100px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const uiTimer = window.setTimeout(() => setUiVisible(true), 300);
    return () => {
      window.clearTimeout(uiTimer);
    };
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const node = containerRef.current;
      if (!node) return;
      const maxScroll = node.scrollHeight - window.innerHeight;
      setScrollProgress(clamp(window.scrollY / maxScroll, 0, 1));
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let raw: Mouse = { x: 0, y: 0 };
    let smooth: Mouse = { x: 0, y: 0 };
    let frame = 0;

    const onMove = (event: MouseEvent) => {
      raw = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const tick = () => {
      smooth = {
        x: lerp(smooth.x, raw.x, 0.07),
        y: lerp(smooth.y, raw.y, 0.07),
      };
      setMouse(smooth);
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  const ep = easeInOut(scrollProgress);
  const scene1Opacity = clamp(1 - scrollProgress / 0.22, 0, 1);
  const scene2Opacity = clamp((scrollProgress - 0.68) / 0.16, 0, 1);
  const finalArcOffset =
    Math.floor(ARC_CARDS.length / 2) * (isMobile ? 14 : 12);
  const rotationOffset = lerp(
    0,
    finalArcOffset,
    clamp((scrollProgress - 0.7) / 0.3, 0, 1),
  );
  const portalOpacity =
    scrollProgress < 0.65 ? 1 : clamp(1 - (scrollProgress - 0.65) / 0.2, 0, 1);
  const cloudOpacity = lerp(0.7, 1, clamp(scrollProgress / 0.05, 0, 1));

  const transforms = useMemo(() => {
    const offset = (mag: number, yDamp = 1) => ({
      x: -mouse.x * mag,
      y: -mouse.y * mag * yDamp,
    });

    const world = offset(MAG.world);
    const clouds = offset(MAG.clouds, 0.4);
    const portal = offset(MAG.portal);
    const curtainL = offset(MAG.curtainL, 0.3);
    const curtainR = offset(MAG.curtainR, 0.3);

    // New publishing-house curtain PNGs are narrow side assets.
    // Keep them visible on initial load, then slide them outward on scroll.
    const curtainScrollShift = lerp(0, isMobile ? 78 : 58, ep);
    const curtainScale = lerp(1, 1.08, ep);

    return {
      world: `translate3d(${world.x}px, ${world.y}px, 0) scale(${lerp(1, 1.18, ep)})`,
      clouds: `translate3d(${clouds.x}px, ${clouds.y}px, 0) scale(${lerp(1, 1.4, ep)})`,
      portal: `translate3d(${portal.x}px, ${portal.y}px, 0) scale(${lerp(1, 7.5, ep)})`,
      curtainL: `translate3d(calc(-${curtainScrollShift}vw + ${curtainL.x}px), ${curtainL.y}px, 0) scale(${curtainScale})`,
      curtainR: `translate3d(calc(${curtainScrollShift}vw + ${curtainR.x}px), ${curtainR.y}px, 0) scale(${curtainScale})`,
    };
  }, [ep, isMobile, mouse.x, mouse.y]);

  const fadeIn = (delay: string, opacity = 1): CSSProperties => ({
    opacity: uiVisible ? opacity : 0,
    transform: uiVisible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.9s ease ${delay}, transform 0.9s ease ${delay}`,
  });

  const handleCategoriesClick = () => {
    const node = containerRef.current;
    const target = node
      ? node.getBoundingClientRect().top +
        window.scrollY +
        node.scrollHeight -
        window.innerHeight
      : document.documentElement.scrollHeight - window.innerHeight;
    const start = window.scrollY;
    const end = Math.max(0, target);
    const distance = end - start;
    const duration = 3000;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - startedAt) / duration, 0, 1);
      window.scrollTo(0, start + distance * easeInOut(t));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const scene1Style: CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 40,
    opacity: scene1Opacity,
    pointerEvents: scene1Opacity > 0.05 ? "auto" : "none",
  };

  const subtext = BODY_COPY;

  return (
    <main
      ref={containerRef}
      style={{ height: "480vh", position: "relative", background: "#0a0608" }}
    >
      <section
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#0a0608",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: transforms.world,
            transformOrigin: "50% 50%",
            willChange: "transform",
          }}
        >
          <img
            src={WORLD_BG}
            alt="Dreamlike mountain world"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            pointerEvents: "none",
            transform: transforms.clouds,
            transformOrigin: "50% 100%",
            opacity: cloudOpacity,
            willChange: "transform, opacity",
          }}
        >
          <img
            src={BOTTOM_CLOUDS}
            alt=""
            aria-hidden="true"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: isMobile ? 60 : 80,
            zIndex: 47,
            opacity: scene2Opacity,
            pointerEvents: scene2Opacity > 0.2 ? "auto" : "none",
          }}
        >
          <ArcCardSlider
            cards={ARC_CARDS}
            rotationOffset={rotationOffset}
            isMobile={isMobile}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 15,
            transform: transforms.portal,
            transformOrigin: "52% 38%",
            opacity: portalOpacity,
            willChange: "transform, opacity",
          }}
        >
          <img
            src={PORTAL_BG}
            alt="Grand library portal frame"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 16,
            height: "40%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: isMobile ? "64vw" : "42vw",
            maxWidth: 640,
            minWidth: isMobile ? 280 : 420,
            zIndex: 34,
            pointerEvents: "none",
            transform: transforms.curtainL,
            transformOrigin: "left center",
            transition: entranceDone
              ? "none"
              : "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "transform",
          }}
        >
          <img
            src={CURTAIN_LEFT}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "left center",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: isMobile ? "64vw" : "42vw",
            maxWidth: 640,
            minWidth: isMobile ? 280 : 420,
            zIndex: 34,
            pointerEvents: "none",
            transform: transforms.curtainR,
            transformOrigin: "right center",
            transition: entranceDone
              ? "none"
              : "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "transform",
          }}
        >
          <img
            src={CURTAIN_RIGHT}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "right center",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 45,
            height: "42vh",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        <Nav onCategoriesClick={handleCategoriesClick} />

        <div style={scene1Style}>
          <div
            className="md:hidden"
            style={{
              minHeight: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 24px 100px",
            }}
          >
            <div
              style={{
                ...fadeIn("0.3s", 1),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 22,
                textAlign: "center",
              }}
            >
              <HeadingLines />
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "#5c2d0e",
                  maxWidth: 280,
                }}
              >
                {subtext}
              </p>
              <ReelCard
                image={CARD_IMAGES[0]}
                size={140}
                radius={22}
                label="Categories"
                onClick={handleCategoriesClick}
              />
            </div>
          </div>

          <div
            className="hidden md:flex xl:hidden"
            style={{
              minHeight: "100%",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 32px 96px",
            }}
          >
            <div
              style={{
                ...fadeIn("0.3s", 1),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 28,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "clamp(28px, 5vw, 44px)" }}>
                <HeadingLines />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: "#5c2d0e",
                  maxWidth: 400,
                }}
              >
                {subtext}
              </p>
              <div style={{ display: "flex", gap: 14 }}>
                <CategoryCard
                  image={CARD_IMAGES[0]}
                  size={140}
                  radius={22}
                  title={HERO_CATEGORIES.spiritual.title}
                  href={HERO_CATEGORIES.spiritual.href}
                />
                <CategoryCard
                  image={CARD_IMAGES[1]}
                  size={140}
                  radius={22}
                  title={HERO_CATEGORIES.romantasy.title}
                  href={HERO_CATEGORIES.romantasy.href}
                />
                <CategoryCard
                  image={CARD_IMAGES[2]}
                  size={140}
                  radius={22}
                  title={HERO_CATEGORIES.forChildren.title}
                  href={HERO_CATEGORIES.forChildren.href}
                />
              </div>
            </div>
          </div>

          <div
            className="hidden xl:block"
            style={{
              position: "absolute",
              top: "46%",
              left: 60,
              maxWidth: 440,
              transform: "translateY(-50%)",
              ...fadeIn("0.3s", 1),
            }}
          >
            <div
              style={{
                textShadow:
                  "0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)",
              }}
            >
              <HeadingLines desktop />
            </div>
            <p
              style={{
                margin: "22px 0 0",
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(255,245,235,0.88)",
                maxWidth: 300,
                textShadow: "0 1px 12px rgba(0,0,0,0.8)",
              }}
            >
              {subtext}
            </p>
          </div>

          <div
            className="hidden xl:flex"
            style={{
              position: "absolute",
              right: 40,
              top: "50%",
              transform: "translateY(-50%)",
              gap: 12,
              ...fadeIn("0.55s", 1),
            }}
          >
            <CategoryCard
              image={CARD_IMAGES[0]}
              size={158}
              radius={28}
              title={HERO_CATEGORIES.spiritual.title}
              href={HERO_CATEGORIES.spiritual.href}
              titleSize={18}
            />
            <CategoryCard
              image={CARD_IMAGES[1]}
              size={158}
              radius={28}
              title={HERO_CATEGORIES.romantasy.title}
              href={HERO_CATEGORIES.romantasy.href}
              titleSize={18}
            />
            <CategoryCard
              image={CARD_IMAGES[2]}
              size={158}
              radius={28}
              title={HERO_CATEGORIES.forChildren.title}
              href={HERO_CATEGORIES.forChildren.href}
              titleSize={18}
            />
          </div>

          <SliderDots
            uiVisible={uiVisible}
            scene1Opacity={scene1Opacity}
            isDesktop={isDesktop}
          />

          <div
            className="hidden xl:flex"
            style={{
              position: "absolute",
              left: "50%",
              bottom: 36,
              transform: "translateX(-50%)",
              zIndex: 22,
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              opacity: uiVisible ? scene1Opacity : 0,
              transition: "opacity 0.9s ease 0.9s",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Descend
            </div>
            <ScrollChevron />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 46,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            textAlign: "center",
            pointerEvents: scene2Opacity > 0.2 ? "auto" : "none",
            opacity: scene2Opacity,
            transition: "opacity 0.12s linear",
          }}
        >
          <div
            style={{ marginTop: isMobile ? "8vh" : "12vh", padding: "0 24px" }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Viaoda Libre', serif",
                fontSize: isMobile
                  ? "clamp(28px, 8vw, 44px)"
                  : "clamp(38px, 6.5vw, 78px)",
                lineHeight: 1.05,
                letterSpacing: "0.03em",
                color: "#fff",
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              EXPLORE OUR VISUAL WORLDS
            </h2>
            <p
              style={{
                margin: "18px auto 0",
                fontSize: isMobile ? 14 : 20,
                lineHeight: 1.6,
                letterSpacing: "-0.01em",
                maxWidth: isMobile ? 260 : 480,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Choose a shelf: spiritual guides, romantasy worlds, children's
              books, creative learning, and non-English editions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}


function getRouteSlug() {
  const hash = window.location.hash.replace(/^#\/?/, "").replace(/^\//, "");
  if (hash) return hash.split("/")[0];
  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return last;
}

export default function App() {
  const [route, setRoute] = useState(getRouteSlug());

  useEffect(() => {
    const update = () => setRoute(getRouteSlug());
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  const normalized = route === "" || route === "home" ? "" : route;

  if (normalized && CATEGORY_CONFIGS[normalized]) {
    return <CategoryPage config={CATEGORY_CONFIGS[normalized]} />;
  }

  return <HomePage />;
}
