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
