import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PatientAuthProvider } from "../context/PatientAuthContext";
import { OwnerAuthProvider } from "../context/OwnerAuthContext";
import { BookingProvider } from "../context/BookingContext";
import { ToastProvider } from "../components/Toast";
import { BottomNav } from "../components/BottomNav";

function NotFoundComponent() {
  return (
    <div className="app-wrapper no-nav" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <h1 style={{ fontSize: 64, fontWeight: 800 }}>404</h1>
        <p className="text-secondary mt-8">Page not found</p>
        <Link to="/home" className="btn-primary" style={{ display: "inline-block", marginTop: 16, textDecoration: "none", textAlign: "center" }}>
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="app-wrapper no-nav" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <h2 className="bold">Something went wrong</h2>
        <p className="text-secondary text-sm mt-8">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="btn-primary" style={{ marginTop: 16 }}>Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0066CC" },
      { title: "CarePoint — Book & Track Live Token" },
      { name: "description", content: "Book clinic appointments and track your token live, like a sports scoreboard." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

const HIDDEN_NAV = ["/login", "/", "/book/success"];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const isOwner = pathname.startsWith("/owner");
  const showNav = !isOwner && !HIDDEN_NAV.includes(pathname) && !pathname.startsWith("/token/");

  return (
    <QueryClientProvider client={queryClient}>
      <PatientAuthProvider>
        <OwnerAuthProvider>
          <BookingProvider>
            <ToastProvider>
              <div className={`app-wrapper ${showNav ? "" : "no-nav"}`}>
                <Outlet />
                {showNav && <BottomNav />}
              </div>
            </ToastProvider>
          </BookingProvider>
        </OwnerAuthProvider>
      </PatientAuthProvider>
    </QueryClientProvider>
  );
}
