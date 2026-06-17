import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePatientAuth } from "../context/PatientAuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { token, isLoading } = usePatientAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoading) return;
    navigate({ to: token ? "/home" : "/login", replace: true });
  }, [token, isLoading, navigate]);
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><LoadingSpinner /></div>;
}
