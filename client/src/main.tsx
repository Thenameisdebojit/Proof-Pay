import { Buffer } from "buffer";
// Polyfill Buffer for Stellar SDK
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";

createRoot(document.getElementById("root")!).render(
  <App />
);
