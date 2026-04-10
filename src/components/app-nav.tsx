"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/dashboard", label: "Tasks", icon: "Tasks" },
  { href: "/assistant", label: "AI", icon: "AI" },
];

export function AppNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/") {
    return null;
  }

  return (
    <nav className="app-nav" aria-label="Primary navigation">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            className={`app-nav__item ${isActive ? "app-nav__item--active" : ""}`}
            href={item.href}
          >
            <span className="app-nav__icon" aria-hidden="true">{item.icon}</span>
            <span className="app-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
