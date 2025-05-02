// CSS imports
import "../styles/styles.css";
import "leaflet/dist/leaflet.css";

import App from "./pages/app";
import Camera from "./utils/camera";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    header: document.getElementById("main-header"),
    content: document.getElementById("main-content"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();

    // Stop all active media
    Camera.stopAllStreams();
  });
});
