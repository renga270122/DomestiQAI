import Link from "next/link";
import { MvpDashboard } from "@/components/mvp-dashboard";

export default function DashboardPage() {
  return (
    <main className="page-shell app-screen dashboard-page">
      <section className="screen-header">
        <div>
          <span className="eyebrow">Tasks</span>
          <h1>Daily cleaning dashboard</h1>
          <p>Manage today&apos;s chores, reminders, and progress from one place.</p>
        </div>
        <Link className="secondary-action compact-action" href="/assistant">
          Open AI
        </Link>
      </section>
      <MvpDashboard />
    </main>
  );
}