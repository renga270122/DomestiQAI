import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";

const quickActions = [
  { href: "/dashboard", title: "Open tasks", detail: "Manage chores and reminders" },
  { href: "/assistant", title: "Ask AI", detail: "Get a fast cleaning plan" },
];

const todayTasks = [
  { title: "Kitchen reset", meta: "High priority" },
  { title: "Bathroom sink wipe", meta: "Next up" },
  { title: "Laundry reload", meta: "Reminder at 8:00 PM" },
];

const homeSections = ["Kitchen", "Bathroom", "Bedroom", "Laundry"];

export default function Home() {
  return (
    <main className="page-shell app-screen">
      <section className="screen-header screen-header--hero">
        <div className="screen-header__stack">
          <BrandLockup
            kicker="AI home reset companion"
            title="DomestiQ AI"
            tagline="Calm cleaning plans, faster resets, and one place to keep your home flow in sync."
          />
          <p className="screen-header__summary">
            Open tasks, check reminders, or ask for a room-by-room plan built around what actually needs attention today.
          </p>
        </div>
        <div className="hero-metrics" aria-label="App highlights">
          <div className="metric-pill">
            <span>Today</span>
            <strong>3 tasks active</strong>
          </div>
          <div className="metric-pill metric-pill--accent">
            <span>Assistant</span>
            <strong>Quick reset plans</strong>
          </div>
        </div>
      </section>

      <section className="home-grid">
        <div className="home-card home-card--accent">
          <div>
            <span className="home-card__label">Today</span>
            <strong>3 active tasks</strong>
            <p>Kitchen reset, bathroom wipe, and laundry review.</p>
          </div>
          <Link className="primary-action compact-action" href="/dashboard">
            Open tasks
          </Link>
        </div>

        <div className="quick-actions">
          {quickActions.map((action) => (
            <Link className="home-card home-card--action" href={action.href} key={action.href}>
              <span className="home-card__label">Shortcut</span>
              <strong>{action.title}</strong>
              <p>{action.detail}</p>
            </Link>
          ))}
        </div>

        <div className="home-card">
          <div className="section-title">
            <span className="home-card__label">Next tasks</span>
            <strong>Queue</strong>
          </div>
          <div className="mini-list">
            {todayTasks.map((task) => (
              <div className="mini-list__item" key={task.title}>
                <span className="mini-list__dot" aria-hidden="true" />
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="home-card">
          <div className="section-title">
            <span className="home-card__label">Areas</span>
            <strong>Rooms</strong>
          </div>
          <div className="chip-row">
            {homeSections.map((section) => (
              <span key={section} className="room-chip">{section}</span>
            ))}
          </div>
        </div>

        <div className="home-card home-card--assistant">
          <div>
            <span className="home-card__label">AI assistant</span>
            <strong>Instant room-by-room guidance</strong>
            <p>Ask for a balcony cleanup, a guest-ready reset, or a short plan for the next 15 minutes.</p>
          </div>
          <Link className="secondary-action compact-action" href="/assistant">
            Open chat
          </Link>
        </div>
      </section>
    </main>
  );
}