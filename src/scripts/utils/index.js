export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function setupSkipToContent(element, content) {
  element.addEventListener("click", () => content.focus());
}

export function transitionHelper({ skipTransition = false, updateDOM }) {
  // Instantly update dom if startViewTransition is not supported or skipTransition is true
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

    // Return viewTransition property so even if view transition is not supported, transitionHelper behive like view transition supported
    return {
      ready: Promise.reject(Error("View Transition unsupported")),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  return document.startViewTransition(updateDOM);
}

export function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable) {
    console.error("Service worker API unsupported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.bundle.js");
    console.log("Service Worker successfully installed", registration);
  } catch (error) {
    console.error("registerServiceWorker: error: ", error);
  }
}
