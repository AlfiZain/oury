import CONFIG from "../config";
import { getAccessToken } from "../utils/auth";

const ENDPOINTS = {
  // Auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // Story
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function addNewStory({ description, photo, lat, lon }) {
  const accessToken = getAccessToken();
  console.log(description);
  console.log(photo);
  console.log(lat);
  console.log(lon);

  const formData = new FormData();
  formData.set("description", description);
  formData.set("photo", photo);
  formData.set("lat", lat);
  formData.set("lon", lon);

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

export async function getAllStories(page, size, location) {
  const accessToken = getAccessToken();

  let url = ENDPOINTS.GET_ALL_STORIES;

  const queryParams = new URLSearchParams();

  if (page !== undefined && page !== null) queryParams.append("page", page);
  if (size !== undefined && size !== null) queryParams.append("size", size);
  if (location !== undefined && location !== null) queryParams.append("location", location);

  if ([...queryParams].length > 0) {
    url += `?${queryParams.toString()}`;
  }

  const fetchResponse = await fetch(url, {
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
