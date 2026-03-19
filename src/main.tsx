import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("./sw.js", window.location.href);
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {
      // Silent fallback is fine for local dev.
    });
  });
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
