import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { redirect } from "next/navigation";

export default async function ProtectedDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return (
    <main className="page-shell app-screen dashboard-page">
      {/* Dashboard content goes here */}
      <h1>Dashboard (Protected)</h1>
      <p>Welcome, {session?.user?.name || session?.user?.email}!</p>
    </main>
  );
}
