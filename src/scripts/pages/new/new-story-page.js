import * as StoryAPI from "../../data/api.js";
import { generateLoaderAbsoluteTemplate } from "../../template.js";
import Camera from "../../utils/camera.js";
import NewStoryPresenter from "./new-story-presenter.js";
import Map from "../../utils/map.js";

export default class NewStoryPage {
  #presenter;
  #form;
  #isCameraOpen = false;
  #camera;
  #takenPicture;
  #map = null;

  async render() {
    return `
      <section class="new-story-page">
        <article class="form-container">
          <header class="form-header">
            <h1 class="form-title">Add New Story</h1>
            <p class="form-subtitle">Share your wonderful story</p>
          </header>

          <form id="new-story-form" class="form">
            <!-- Description -->
            <div class="form-control">
              <label for="description-input" class="form-label">Description</label>
              <div class="form-field">
                <svg xmlns="http://www.w3.org/2000/svg" class="description-icon" fill="currentColor" viewBox="0 0 448 512" height="1em" width="1em">
                  <path d="M0 216C0 149.7 53.7 96 120 96l8 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-8 0c-30.9 0-56 25.1-56 56l0 8 64 0c35.3 0 64 28.7 64 64l0 64c0 35.3-28.7 64-64 64l-64 0c-35.3 0-64-28.7-64-64l0-32 0-32 0-72zm256 0c0-66.3 53.7-120 120-120l8 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-8 0c-30.9 0-56 25.1-56 56l0 8 64 0c35.3 0 64 28.7 64 64l0 64c0 35.3-28.7 64-64 64l-64 0c-35.3 0-64-28.7-64-64l0-32 0-32 0-72z"/>
                </svg>
                <textarea id="description-input" name="description" placeholder="Write your story here..." required rows="5"></textarea>
              </div>
            </div>

            <!-- Photo -->
            <div class="form-control">
              <label for="photo-upload-input" class="form-label">Photo</label>
              <div class="field-info">Add photo to your story (max size 1MB)</div>

              <div class="photo-upload-group">
                <div class="photo-upload-button-container">
                  <button id="photo-upload-button" type="button" class="outline-btn">Upload Photo</button>
                  <input id="photo-upload-input" type="file" name="photo" accept="image/*" hidden="hidden" aria-describedby="photo-info" />
                  <button id="toggle-camera-button" type="button" class="outline-btn">Open Camera</button>
                </div>

                <div id="camera-container" class="camera-container">
                  <video id="camera-stream" class="camera-video">Video stream not available.</video>
                  <canvas id="camera-canvas" class="camera-canvas"></canvas>

                  <div class="camera-controls">
                    <select id="camera-device-select"></select>
                    <button id="take-photo-button" type="button" class="solid-btn">Take Photo</button>
                  </div>
                </div>

                <div id="photo-preview" class="photo-preview"></div>
              </div>
            </div>

            <!-- Location -->
            <div class="form-control">
              <div class="form-label">Location</div>
              <div class="field-info">Give your story a place</div>

              <div class="location-group">
                <div class="map-container">
                  <div id="map" class="map"></div>
                  <div id="map-loading" class="map-loading"></div>
                </div>
                <div class="coordinates">
                  <input id="latitude-input" type="number" name="latitude" disabled />
                  <input id="longitude-input" type="number" name="longitude" disabled />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <span id="submit-action" class="submit-action">
                <button class="solid-btn upload-btn" type="submit">Upload Your Story</button>
              </span>
              <a href="#/" class="outline-btn cancel-btn">Cancel</a>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewStoryPresenter({ view: this, model: StoryAPI });
    this.#takenPicture = null;

    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #formValidation(data) {
    if (!data.description) throw new Error("Description is required");
    if (!data.photo) throw new Error("Photo is required");
    if (data.photo.size > 1024 * 1024) throw new Error("Photo size must be less than 1MB");
    if (!data.photo.type.startsWith("image/")) throw new Error("Only image files are allowed");
    return data;
  }

  #setupForm() {
    this.#form = document.getElementById("new-story-form");
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const data = {
          description: this.#form.elements.description.value,
          photo: this.#takenPicture.blob,
          lat: this.#form.elements.latitude.value,
          lon: this.#form.elements.longitude.value,
        };
        const validated = this.#formValidation(data);
        await this.#presenter.postNewStory(validated);
      } catch (error) {
        alert(error.message);
      }
    });

    // Photo upload listeners
    document.getElementById("photo-upload-button").addEventListener("click", () => document.getElementById("photo-upload-input").click());
    document.getElementById("photo-upload-input").addEventListener("change", async (event) => {
      await this.#addTakenPicture(event.target.files[0]);
      await this.#populateTakenPicture();
    });

    // Camera toggle
    document.getElementById("toggle-camera-button").addEventListener("click", async (event) => {
      const container = document.getElementById("camera-container");
      container.classList.toggle("open");
      this.#isCameraOpen = container.classList.contains("open");
      event.currentTarget.textContent = this.#isCameraOpen ? "Close Camera" : "Open Camera";
      if (this.#isCameraOpen) {
        this.#setupCamera();
        await this.#camera.launch();
      } else {
        this.#camera.stop();
      }
    });
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-stream"),
        cameraSelect: document.getElementById("camera-device-select"),
        canvas: document.getElementById("camera-canvas"),
      });
      this.#camera.addCheeseButtonListener("#take-photo-button", async () => {
        const img = await this.#camera.takePicture();
        await this.#addTakenPicture(img);
        await this.#populateTakenPicture();
      });
    }
  }

  async #addTakenPicture(image) {
    this.#takenPicture = { id: `${Date.now()}`, blob: image };
  }

  async #populateTakenPicture() {
    const photoPreview = document.getElementById("photo-preview");
    const url = URL.createObjectURL(this.#takenPicture.blob);

    photoPreview.innerHTML = `
      <p class="form-label">Photo Preview</p>
      <button type="button" data-id="${this.#takenPicture.id}" class="delete-photo-btn">
        <img src="${url}" alt="Photo Preview">
      </button>
    `;

    document.querySelector(".delete-photo-btn").addEventListener("click", () => {
      this.#takenPicture = null;
      photoPreview.innerHTML = "";
    });
  }

  async initialMap() {
    this.#map = await Map.build("#map", { zoom: 15, locate: true });
    const center = this.#map.getCenter();
    this.#updateCoordinates(center.latitude, center.longitude);

    const draggableMarker = this.#map.addMarker([center.latitude, center.longitude], { draggable: true });

    draggableMarker.addEventListener("move", (e) => {
      const { lat, lng } = e.target.getLatLng();
      this.#updateCoordinates(lat, lng);
    });

    this.#map.addMapEventListener("click", (e) => {
      draggableMarker.setLatLng(e.latlng);
      e.sourceTarget.flyTo(e.latlng);
    });
  }

  #updateCoordinates(lat, lng) {
    document.getElementById("latitude-input").value = lat;
    document.getElementById("longitude-input").value = lng;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();
    location.hash = "/";
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById("map-loading").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-action").innerHTML = `
      <button class="solid-btn upload-btn" type="submit" disabled>
      Upload Your Story
      <svg fill="currentColor" viewBox="0 0 512 512" stroke-linecap="round" stroke-linejoin="round" class="spinner-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/>
      </svg>
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-action").innerHTML = `<button class="solid-btn upload-btn" type="submit">Upload Your Story</button>`;
  }
}
