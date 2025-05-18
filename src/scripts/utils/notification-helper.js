import Swal from "sweetalert2";
import CONFIG from "../config";
import { subscribePushNotification, unsubscribePushNotification } from "../data/api";
import { convertBase64ToUint8Array } from "./index";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported");
    return;
  }

  //   If permission is granted, we don't have to ask permission again
  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    Swal.fire({
      icon: "error",
      title: "Notification access is denied",
      text: "Please enable notification to receive updates",
    });
    return false;
  }

  if (status === "default") {
    Swal.fire({
      icon: "error",
      title: "Notification permission is closed",
      text: "Please enable notification to receive updates",
    });
    return false;
  }
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    Swal.fire({
      title: "Already subscribed to push notifications",
    });
    return;
  }

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error("subscribe: response: ", response);
      subscriptionFailedMessage();

      // Undo subscribe to push notification
      await pushSubscription.unsubscribe();

      return;
    }

    subscriptionSuccessMessage();
  } catch (error) {
    console.error("subscribe: error:", error);
    subscriptionFailedMessage();

    // Undo subscribe to push notification
    await pushSubscription.unsubscribe();

    return false;
  }
}

export async function unsubscribe() {
  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      Swal.fire({
        icon: "error",
        title: "Unsubscribe Failed",
        text: "Cannot unsubscribe from push notifications because you have not subscribed before",
      });

      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      unsubscribeFailedMessage();
      console.error("unsubscribe: response: ", response);

      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      unsubscribeFailedMessage();
      await subscribePushNotification({ endpoint, keys });

      return;
    }

    unsubscribeSuccessMessage();
  } catch (error) {
    unsubscribeFailedMessage();
    console.error("unsubscribe: error: ", error);
  }
}

function subscriptionSuccessMessage() {
  Swal.fire({
    icon: "success",
    title: "Subscription Successfully",
    text: "Push notification subscription successfully activated",
  });
}

function subscriptionFailedMessage() {
  Swal.fire({
    icon: "error",
    title: "Subscription Failed",
    text: "Push notification subscription failed to activate",
  });
}

function unsubscribeSuccessMessage() {
  Swal.fire({
    icon: "success",
    title: "Unsubscribe Successfully",
    text: "Push notification subscription successfully to deactivate",
  });
}

function unsubscribeFailedMessage() {
  Swal.fire({
    icon: "error",
    title: "Unsubscribe Failed",
    text: "Push notification subscription failed to deactivate",
  });
}
