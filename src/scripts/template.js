import { showFormattedDate } from "./utils";

// Story Item Template
export function generateStoryItemTemplate({ id, name, description, photoUrl, createdAt, lat, lon }) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
        <img class="story-item__image" src="${photoUrl}" alt="${description}">
        <div class="story-item__body">
          <div id="story-description" class="story-item__description">
            ${description}
          </div>
          <div class="story-item__main">
            <div class="story-item__more-info">
              <div class="story-item__author">
                ${name}
              </div>
              <div class="story-item__location">
                <i class="fas fa-location-dot"></i> ${lat} - ${lon}
              </div>
              <div class="story-item__createdat">
                <i class="fas fa-calendar-days"></i> ${showFormattedDate(createdAt, "id-ID")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
}

// Empty Stories Template
export function generateStoriesListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>There is no stories available</h2>
    </div>
    `;
}

// Error Stories Template
export function generateStoriesListErrorTemplate(message) {
  return `
      <div id="stories-list-error" class="stories-list__error">
        <h2>Terjadi kesalahan pengambilan cerita</h2>
        <p>${message ? message : "Gunakan jaringan lain atau laporkan error ini."}</p>
      </div>
    `;
}

// Loader Template
export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
    `;
}

// Navigation Template
// Unauthenticated
export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

// Authenticated
export function generateAuthenticatedNavigationListTemplate() {
  return `
  <li><a id="home-button" href="#/"><i class="fa-solid fa-house"></i>Home</a></li>
  <li><a id="create-story-button" href="#/new"><i class="fa-solid fa-plus"></i>Create a Story</a></li>
  <li><a id="logout-button" href="#/logout"><i class="fa-solid fa-right-from-bracket"></i>Logout</a></li>
  `;
}
