import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return (
    <main className="page-shell app-screen">
      <h1>Household Profile</h1>
      <p>Welcome, {session?.user?.name || session?.user?.email}!</p>
      <p>Household management coming soon.</p>
    </main>
  );
}
