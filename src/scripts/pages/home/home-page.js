import Swal from "sweetalert2";
import { generateBookmarkStoryButtonTemplate, generateLoaderAbsoluteTemplate, generateStoriesListEmptyTemplate, generateStoriesListErrorTemplate, generateStoryItemTemplate, generateUnbookmarkStoryButtonTemplate } from "../../template.js";
import Map from "../../utils/map.js";
import HomePresenter from "./home-presenter.js";
import * as StoryAPI from "../../data/api.js";
import Database from "../../data/database.js";

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section id="map-section" class="map-section">
        <h1 class="map-title">Authors Across the Map</h1>
        <div class="map-container">
          <div id="map" class="map"></div>
          <div id="map-loading" class="map-loading"></div>
        </div>
      </section>

      <section id="stories-section" class="stories-section">
        <h2 class="stories-title">Our Stories</h2>
        <div class="stories-list-container">
          <div id="stories-list" class="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      apiModel: StoryAPI,
      dbModel: Database,
    });

    await this.#presenter.initialStoriesAndMap();
  }

  populateStoriesList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      if (this.#map && story.lat && story.lon) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.name };

        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }
      return accumulator.concat(
        generateStoryItemTemplate({
          ...story,
        })
      );
    }, "");

    document.getElementById("stories-list").innerHTML = `${html}`;
    stories.forEach(async (story) => {
      await this.#presenter.showSaveButton(story.id);
    });
  }

  renderBookmarkButton(id) {
    const buttonContainer = document.querySelector(`[data-storyid="${id}"]`);
    if (!buttonContainer) return;

    const storyId = buttonContainer.dataset.storyid;
    buttonContainer.innerHTML = generateBookmarkStoryButtonTemplate(storyId);

    const button = buttonContainer.querySelector("button");
    button.addEventListener("click", async () => {
      await this.#presenter.saveStory(id);
      await this.#presenter.showSaveButton(id);
    });
  }

  saveToBookmarkSuccessfully(message) {
    Swal.fire({
      icon: "success",
      title: "Bookmarked Successfully",
      text: message,
    });
  }

  saveToBookmarkFailed(message) {
    Swal.fire({
      icon: "error",
      title: "Bookmarked Failed",
      text: message,
    });
  }

  renderUnbookmarkButton(id) {
    const buttonContainer = document.querySelector(`[data-storyid="${id}"]`);
    if (!buttonContainer) return;

    const storyId = buttonContainer.dataset.storyid;
    buttonContainer.innerHTML = generateUnbookmarkStoryButtonTemplate(storyId);

    const button = buttonContainer.querySelector("button");
    button.addEventListener("click", async () => {
      await this.#presenter.removeStory(id);
      await this.#presenter.showSaveButton(id);
    });
  }

  removeFromBookmarkSuccessfully(message) {
    Swal.fire({
      icon: "success",
      title: "Unbookmarked Successfully",
      text: message,
    });
  }

  removeFromBookmarkFailed(message) {
    Swal.fire({
      icon: "success",
      title: "Unbookmarked Failed",
      text: message,
    });
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 10,
      location: true,
    });
  }

  populateStoriesListEmpty() {
    document.getElementById("map-section").classList.add("hidden");
    const storyList = document.getElementById("stories-list");
    storyList.classList.add("empty");
    storyList.innerHTML = generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById("map-section").classList.add("hidden");
    const storyList = document.getElementById("stories-list");
    storyList.classList.add("error");
    Swal.fire({
      icon: "error",
      title: "Populate Stories List Failed",
      text: message,
    });
    document.getElementById("stories-list").innerHTML = generateStoriesListErrorTemplate(message);
  }

  showMapLoading() {
    document.getElementById("map-loading").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading").innerHTML = "";
  }

  showLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = "";
  }
}
