/**
 * Personal / portfolio details shown in the site footer.
 * Sourced from resume (AayushCv.pdf) — edit here to update.
 */

export const PORTFOLIO = {
  name: "Aayush Kumar Dubey",
  role: "SWE Intern @ Flywheel",
  tagline:
    "Hiring-demo Airbnb clone — explore, book, host, and ship. Built end-to-end as a production-style interview project.",
  email: "aayushdubey.work@gmail.com",
  college: "B.Tech · Instrumentation & Control · NSUT, New Delhi",
  githubUrl: "https://github.com/nexus69420",
  githubLabel: "nexus69420",
  linkedinUrl: "https://www.linkedin.com/in/aayush-kumar-dubey-917bb9285",
  linkedinLabel: "LinkedIn",
  repoUrl: "https://github.com/nexus69420/Airbnb-clone",
  liveAppUrl: "https://airbnb-clone-sand-five.vercel.app",
} as const;

/** Destinations shown in the “Inspiration” footer strip (link to home search). */
export const FOOTER_DESTINATIONS = [
  { city: "Bali", blurb: "Villa stays" },
  { city: "Tokyo", blurb: "Apartment rentals" },
  { city: "London", blurb: "City flats" },
  { city: "Rome", blurb: "Holiday rentals" },
  { city: "San Francisco", blurb: "House stays" },
  { city: "Paris", blurb: "Boutique stays" },
  { city: "Florence", blurb: "Historic homes" },
  { city: "Malibu", blurb: "Beach houses" },
] as const;

export const TECH_STACK = {
  frontend: [
    "Next.js 15 (App Router)",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "TanStack Query",
    "Axios",
    "Framer Motion",
    "Zod + React Hook Form",
  ],
  backend: [
    "FastAPI",
    "SQLAlchemy 2",
    "Alembic",
    "SQLite",
    "Pydantic Settings",
    "JWT + bcrypt",
  ],
  platform: ["Vercel (frontend)", "Render (API)", "GitHub"],
} as const;
