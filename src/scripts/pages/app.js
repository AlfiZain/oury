import Swal from "sweetalert2";
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { generateAuthenticatedNavigationListTemplate, generateUnauthenticatedNavigationListTemplate, generateSubscribeButtonTemplate, generateUnsubscribeButtonTemplate } from "../template";
import { setupSkipToContent, transitionHelper, isServiceWorkerAvailable } from "../utils";
import { getAccessToken, getLogout } from "../utils/auth";
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from "../utils/notification-helper";

class App {
  #header = null;
  #content = null;
  #drawerButton = null;
  #closeButton = null;
  #navigationDrawer = null;
  #skipToContent = null;

  constructor({ header, content }) {
    this.#header = header;
    this.#content = content;

    this.#renderHeader();
    this.#init();
  }

  #renderHeader() {
    this.#header.innerHTML = `
      <button id="skip-link" class="skip-link">Skip to Main Content</button>
      <div class="main-header container">
        <a id="header-icon" href="#/">
          <img class="logo" src="images/oury-logo-fit.png" alt="Oury" />
        </a>

        <nav id="navigation-drawer" class="navigation-drawer" aria-label="Main Navigation" aria-hidden="true" inert>
          <div class="header-drawer">
            <a id="navigation-drawer-icon" href="#/"><img class="logo" src="images/oury-logo-fit.png" alt="Oury" /></a>
            <button id="close-button" class="close-button" aria-label="Close Navigation Menu">X</button>
          </div>
          <ul id="nav-list" class="nav-list"></ul>
        </nav>

        <button id="drawer-button" class="drawer-button" aria-label="Open Navigation Menu" aria-expanded="false" aria-controls="navigation-drawer">☰</button>
      </div>
    `;

    this.#drawerButton = document.getElementById("drawer-button");
    this.#closeButton = document.getElementById("close-button");
    this.#navigationDrawer = document.getElementById("navigation-drawer");
    this.#skipToContent = document.getElementById("skip-link");
  }

  #init() {
    setupSkipToContent(this.#skipToContent, this.#content);
    this.#setupDrawer();
  }

  #applyDrawerAccessibility() {
    const isDesktop = window.matchMedia("(min-width: 64rem)").matches;

    if (isDesktop) {
      // On desktop drawer is always visible and focusable
      this.#navigationDrawer.removeAttribute("inert");
      this.#navigationDrawer.setAttribute("aria-hidden", "false");
    } else {
      // On mobile drawer can only focus when open
      const isOpen = this.#navigationDrawer.classList.contains("open");
      if (isOpen) {
        this.#navigationDrawer.removeAttribute("inert");
        this.#navigationDrawer.setAttribute("aria-hidden", "false");
        document.getElementById("navigation-drawer-icon").focus();
      } else {
        this.#navigationDrawer.setAttribute("inert", "");
        this.#navigationDrawer.setAttribute("aria-hidden", "true");
        this.#closeButton.blur();
      }
    }
  }

  #openDrawerEventHandler() {
    this.#navigationDrawer.classList.add("open");
    this.#drawerButton.setAttribute("aria-expanded", "true");
    this.#applyDrawerAccessibility();
  }

  #closeDrawerEventHandler() {
    this.#navigationDrawer.classList.remove("open");
    this.#drawerButton.setAttribute("aria-expanded", "false");
    this.#applyDrawerAccessibility();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      if (!this.#navigationDrawer.classList.contains("open")) {
        this.#openDrawerEventHandler();
        return;
      }
      this.#closeDrawerEventHandler();
    });

    this.#closeButton.addEventListener("click", () => {
      this.#closeDrawerEventHandler();
    });

    document.body.addEventListener("click", (event) => {
      const isTargetInsideDrawer = this.#navigationDrawer.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#closeDrawerEventHandler();
      }

      this.#navigationDrawer.querySelectorAll(".nav-link").forEach((link) => {
        if (link.contains(event.target)) {
          this.#closeDrawerEventHandler();
        }
      });
    });

    this.#applyDrawerAccessibility();

    window.addEventListener("resize", () => {
      this.#applyDrawerAccessibility();
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem("nav-list");

    // User is not Login
    if (!isLogin) {
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      Swal.fire({
        title: "Are you sure you want to log out?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          getLogout();

          // Redirect
          location.hash = "/login";
        }
      });
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById("push-notification-tools");

    if (!pushNotificationTools) {
      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById("unsubscribe-button").addEventListener("click", () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });

      return;
    }

    document.getElementById("subscribe-button").addEventListener("click", () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    // Close navigation if it's open
    if (this.#navigationDrawer.classList.contains("open")) {
      this.#navigationDrawer.classList.remove("open");
    }

    const url = getActiveRoute();
    // If url is null, fallback to not found page
    const route = routes[url] || routes["*"];

    // Get page instance
    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}

export default App;
