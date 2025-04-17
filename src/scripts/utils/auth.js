import { getActiveRoute } from "../routes/url-parser";
import CONFIG from "../config";

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);

    if (accessToken === "null" || accessToken === "undefined") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken: error: ", error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("putAccessToken: error: ", error);
    return false;
  }
}
