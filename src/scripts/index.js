// CSS imports
import "../styles/styles.css";
import "leaflet/dist/leaflet.css";

import App from "./pages/app";
import Camera from "./utils/camera";
import { registerServiceWorker } from "./utils";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    header: document.getElementById("main-header"),
    content: document.getElementById("main-content"),
  });
  await app.renderPage();
  await registerServiceWorker();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();

    // Stop all active media
    Camera.stopAllStreams();
  });
});
