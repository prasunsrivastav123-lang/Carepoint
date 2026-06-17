import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, ClipboardList, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/book", label: "Book", Icon: Calendar },
  { to: "/appointments", label: "Visits", Icon: ClipboardList },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon }) => {
        const active = pathname === to || pathname.startsWith(to + "/");
        return (
          <Link key={to} to={to} className={active ? "active" : ""}>
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
