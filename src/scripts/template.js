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

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>There is no stories available</h2>
    </div>
    `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
    `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
      <div id="stories-list-error" class="stories-list__error">
        <h2>Terjadi kesalahan pengambilan cerita</h2>
        <p>${message ? message : "Gunakan jaringan lain atau laporkan error ini."}</p>
      </div>
    `;
}
