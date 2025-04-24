import * as StoryAPI from "../../data/api.js";
import Camera from "../../utils/camera.js";
import NewPresenter from "./new-presenter.js";

export default class NewPage {
  #presenter;
  #form;
  #isCameraOpen;
  #camera;
  #takenPicture;

  async render() {
    return `
        <section>
            <div class="new-story__header">
                <div class="container">
                    <h1 class="new-story__header__title">Add New Story</h1>
                    <p class="new-story__header__description">
                        Share your wonderful story
                    </p>
                </div>
            </div>
        </section>

        <section class="container">
            <div class="new-story__form-container">
                <form id="new-story-form" class="new-story__form">
                    <!-- Description -->
                    <div class="form-control">
                        <label for="description" class="new-story__label">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Write your story here..."
                            required
                            rows="4"
                        ></textarea>
                    </div>

                    <!-- Photo -->
                    <div class="form-control">
                        <label for="photo-input" class="new-form__photo__title">Photos</label> 
                        <div id="photo-more-info"> 
                            Capture the moment! A photo will make your story more meaningful and unforgettable.
                        </div>

                        <div class="new-form__photo__container"> 
                            <div class="new-form__photo__buttons"> 
                            <button id="photo-input-button" class="btn btn-outline" type="button"> 
                                Upload Photo
                            </button>
                            <input
                                id="photo-input" 
                                name="photo" 
                                type="file"
                                accept="image/*"
                                hidden="hidden"
                                aria-describedby="photo-more-info" 
                            >
                            <button id="open-photo-camera-button" class="btn btn-outline" type="button"> 
                                Open Camera
                            </button>
                            </div>

                            <div id="camera-container" class="new-form__camera__container">
                            <video id="camera-video" class="new-form__camera__video">
                                Video stream not available.
                            </video>
                            <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>

                            <div class="new-form__camera__tools">
                                <select id="camera-select"></select>
                                <div class="new-form__camera__tools_buttons">
                                <button id="camera-take-button" class="btn" type="button">
                                    Take Photo
                                </button>
                                </div>
                            </div>
                            </div>

                            <ul id="photo-taken" class="new-form__photo__output"></ul> 
                        </div>
                    </div>

                    <!-- Location -->
                    <div class="form-control">
                        <div class="new-form__location__title">Location</div>
                        <div id="new-form__location__more-info">
                            Give your story a place — add location to make it truly come alive.
                        </div>

                        <div class="new-form__location__container">
                            <div class="new-form__location__map__container">
                                <div id="map" class="new-form__location__map"></div>
                                <div id="map-loading-container"></div>
                            </div>
                            <div class="new-form__location__lat-lng">
                                <input type="number" name="latitude" value="-6.175389" disabled>
                                <input type="number" name="longitude" value="106.827139" disabled>
                            </div>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="form-buttons">
                        <span id="submit-button-container">
                            <button class="btn" type="submit">Upload Your Story</button>
                        </span>
                        <a class="btn btn-outline" href="#/">Cancel</a>
                    </div>
                </form>
            </div>
        </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryAPI,
    });
    this.#takenPicture = "";

    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById("new-story-form");
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = {
        description: this.#form.elements.namedItem("description").value,
        photo: this.#form.elements.namedItem("photo").value,
        lat: this.#form.elements.namedItem("latitude").value,
        long: this.#form.elements.namedItem("longitude").value,
      };

      await this.#presenter.postNewStory(data);
    });

    // Manual photo upload
    document.getElementById("photo-input").addEventListener("change", async (event) => {
      await this.#addTakenPicture(event.target.files[0]);
      await this.#populateTakenPicture();
    });

    // Button listener to click photo input
    document.getElementById("photo-input-button").addEventListener("click", () => {
      this.#form.elements.namedItem("photo-input").click();
    });

    // Open and closing the camera
    const cameraContainer = document.getElementById("camera-container");
    document.getElementById("open-photo-camera-button").addEventListener("click", async (event) => {
      cameraContainer.classList.toggle("open");
      this.#isCameraOpen = cameraContainer.classList.contains("open");

      if (this.#isCameraOpen) {
        event.currentTarget.textContent = "Close Camera";
        this.#setupCamera();
        await this.#camera.launch();

        return;
      }

      event.currentTarget.textContent = "Open Camera";
      this.#camera.stop();
    });
  }

  //   Setup camera and taking picture
  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        cameraSelect: document.getElementById("camera-select"),
        canvas: document.getElementById("camera-canvas"),
      });
    }

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPicture();
    });
  }

  // Add taken picture to array
  async #addTakenPicture(image) {
    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, "image/png");
    }

    const newPicture = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenPicture = newPicture;
  }

  // Populate taken pictures to view
  async #populateTakenPicture() {
    const imageUrl = URL.createObjectURL(this.#takenPicture.blob);
    const html = `
        <li class="new-form__photo__outputs-item">
          <button type="button" data-deletepictureid="${this.#takenPicture.id}" class="new-form__photo__outputs-item__delete-btn">
            <img src="${imageUrl}" alt="Your Photo">
          </button>
        </li>
        `;

    const photoTaken = document.getElementById("photo-taken");
    photoTaken.innerHTML = html;

    // Add event listener for button to delete the photo
    document.querySelector("button[data-deletepictureid]").addEventListener("click", () => {
      this.#takenPicture = "";

      // Clear taken picture
      photoTaken.innerHTML = "";
      console.log(`Picture successfully deleted`);
    });
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();

    // Redirect page
    location.hash = "/";
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Upload Your Story
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Upload Your Story</button>
    `;
  }
}
