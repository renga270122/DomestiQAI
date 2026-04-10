import Link from "next/link";

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
      <section className="screen-header">
        <div>
          <span className="eyebrow">Home</span>
          <h1>DomestiQ AI</h1>
          <p>Open tasks, check reminders, or ask for a cleaning plan.</p>
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
            <strong>First AI entry point</strong>
            <p>Ask for a quick plan before guests, after work, or for a weekend reset.</p>
          </div>
          <Link className="secondary-action compact-action" href="/assistant">
            Open chat
          </Link>
        </div>
      </section>
    </main>
  );
}