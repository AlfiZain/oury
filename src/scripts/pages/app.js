import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { generateAuthenticatedNavigationListTemplate, generateUnauthenticatedNavigationListTemplate } from "../template";
import { transitionHelper } from "../utils";
import { getAccessToken, getLogout } from "../utils/auth";

class App {
  #header = null;
  #content = null;
  #drawerButton = null;
  #closeButton = null;
  #navigationDrawer = null;

  constructor({ header, content }) {
    this.#header = header;
    this.#content = content;

    this.#renderHeader();
    this.#setupDrawer();
  }

  #renderHeader() {
    this.#header.innerHTML = `
      <div class="main-header container"
        <a href="#/"><img class="logo" src="images/oury-logo-fit.png" alt="Oury" /></a>

        <nav id="navigation-drawer" class="navigation-drawer">
          <div class="header-drawer">
            <a href="#/"><img class="logo" src="images/oury-logo-fit.png" alt="Oury" /></a>
            <button id="close-button" class="close-button">X</button>
          </div>
          <ul id="nav-list" class="nav-list"></ul>
        </nav>

        <button id="drawer-button" class="drawer-button">☰</button>
      </div>
    `;

    this.#drawerButton = document.getElementById("drawer-button");
    this.#closeButton = document.getElementById("close-button");
    this.#navigationDrawer = document.getElementById("navigation-drawer");
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.add("open");
    });

    this.#closeButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.remove("open");
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

      if (confirm("Are you sure you want to log out?")) {
        getLogout();

        // Redirect
        location.hash = "/login";
      }
    });
  }

  async renderPage() {
    // Close navigation if it's open
    if (this.#navigationDrawer.classList.contains("open")) {
      this.#navigationDrawer.classList.remove("open");
    }

    const url = getActiveRoute();
    const route = routes[url];

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
    });
  }
}

export default App;
