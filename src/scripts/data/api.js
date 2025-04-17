import CONFIG from "../config";
import { getAccessToken } from "../utils/auth";

const ENDPOINTS = {
  // Auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // Story
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
  GET_ALL_STORIES: (params) => `${CONFIG.BASE_URL}/stories/${params}`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function addNewStory({ description, photos, lat, lon }) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.set("description", description);
  formData.set("lat", lat);
  formData.set("lon", lon);
  photos.forEach((photo) => {
    formData.append("photo", photo);
  });

  const fetchResponse = await fetch(ENDPOINTS.ADD_NEW_STORY, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories(page = null, size = null, location = null) {
  const accessToken = getAccessToken();

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    location: location.toString(),
  });

  const fetchResponse = await fetch(ENDPOINTS.GET_ALL_STORIES(queryParams), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function detailStory(id) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.DETAIL_STORY(id), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
