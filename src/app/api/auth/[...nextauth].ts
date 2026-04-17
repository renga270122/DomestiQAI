import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Replace with real user lookup
        if (credentials?.email === "demo@demo.com" && credentials.password === "demo") {
          return { id: "1", name: "Demo User", email: "demo@demo.com" };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };