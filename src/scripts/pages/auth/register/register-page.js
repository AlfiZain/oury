import * as StoryAPI from "../../../data/api.js";
import RegisterPresenter from "./register-presenter.js";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-page">
        <article class="form-container">
          <header class="form-header">
            <h1 class="form-title">Create an Account</h1>
            <p class="form-subtitle">Please sign up to create your account.</p>
          </header>
          <form id="register-form" class="form">
            <div class="form-control">
              <label for="name-input" class="form-label">Full Name</label>
              <div class="form-field">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="fullname-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input id="name-input" type="text" name="name" placeholder="Enter your full name" required />
              </div>
            </div>
            <div class="form-control">
              <label for="email-input" class="form-label">Email Address</label>
              <div class="form-field">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="email-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
                <input id="email-input" type="email" name="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div class="form-control">
              <label for="password-input" class="form-label">Password</label>
              <div class="form-field">
                <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="password-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input id="password-input" type="password" name="password" placeholder="Create a new password" required />
              </div>
            </div>
            <div class="form-actions">
              <span id="submit-action">
                <button type="submit" class="solid-btn register-btn">Sign Up</button>
              </span>
              <p class="form-redirect">Already have an account? <a href="#/login">Log In</a></p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({ view: this, model: StoryAPI });
    this.#setupForm();
  }

  #setupForm() {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("name-input").value,
        email: document.getElementById("email-input").value,
        password: document.getElementById("password-input").value,
      };
      await this.#presenter.getRegistered(data);
    });
  }

  registeredSuccessfully(message) {
    location.hash = "/login";
  }

  registeredFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-action").innerHTML = `
      <button class="solid-btn register-btn" type="submit" disabled>
        <svg  fill="currentColor" viewBox="0 0 512 512" stroke-linecap="round" stroke-linejoin="round" class="spinner-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/></svg> Sign Up
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-action").innerHTML = `
      <button class="solid-btn register-btn" type="submit">Sign Up</button>
    `;
  }
}
