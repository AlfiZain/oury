import * as StoryAPI from "../../../data/api.js";
import * as AuthModel from "../../../utils/auth.js";
import LoginPresenter from "./login-presenter";
import Swal from "sweetalert2";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="login-page">
        <article class="form-container">
          <header class="form-header">
            <h1 class="form-title">Hi, Welcome Back!</h1>
            <p class="form-subtitle">Please log in with your account</p>
          </header>
          <form id="login-form" class="form">
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
                <input id="password-input" type="password" name="password" placeholder="Type your password" required />
              </div>
            </div>
            <div class="form-actions">
              <span id="submit-action">
                <button type="submit" class="solid-btn login-btn">Log In</button>
              </span>
              <p class="form-redirect">New here? <a href="#/register">Let’s get you started!</a></p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({ view: this, model: StoryAPI, authModel: AuthModel });
    this.#setupForm();
  }

  #setupForm() {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        email: document.getElementById("email-input").value,
        password: document.getElementById("password-input").value,
      };
      await this.#presenter.getLogin(data);
    });
  }

  loginSuccessfully(message) {
    location.hash = "/";
  }

  loginFailed(message) {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: message,
    });
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-action").innerHTML = `
      <button class="solid-btn login-btn" type="submit" disabled>
        <svg  fill="currentColor" viewBox="0 0 512 512" stroke-linecap="round" stroke-linejoin="round" class="spinner-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/></svg> Log In
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-action").innerHTML = `
      <button class="solid-btn login-btn" type="submit">Log In</button>
    `;
  }
}
