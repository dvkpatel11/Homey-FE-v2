import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Service Worker registration for PWA
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration: ServiceWorkerRegistration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError: Error) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Performance monitoring
if (import.meta.env.DEV) {
  // Development-only performance monitoring
  const observer = new PerformanceObserver((list: PerformanceObserverEntryList) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "largest-contentful-paint") {
        console.log("LCP:", entry.startTime);
      }
      if (entry.entryType === "first-input") {
        const fidEntry = entry as PerformanceEventTiming;
        console.log("FID:", fidEntry.processingStart - fidEntry.startTime);
      }
    }
  });

  observer.observe({ entryTypes: ["largest-contentful-paint", "first-input"] });
}

// Mobile-specific optimizations
if (window.matchMedia("(max-width: 768px)").matches) {
  // Disable zoom on input focus for iOS
  const metaViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (metaViewport) {
    metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
  }

  // Prevent pull-to-refresh on mobile
  document.body.style.overscrollBehavior = "none";
}

// Error handling for uncaught errors
window.addEventListener("error", (event: ErrorEvent) => {
  console.error("Uncaught error:", event.error);
  // In production, you might want to send this to an error reporting service
});

window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  console.error("Unhandled promise rejection:", event.reason);
  // In production, you might want to send this to an error reporting service
});

// App mounting with error boundary
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
