import * as StoryAPI from "../../data/api.js";
import { generateStoriesListEmptyTemplate, generateStoriesListErrorTemplate, generateStoryItemTemplate } from "../../template.js";
import HomePresenter from "./home-presenter.js";

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <div class="stories-list__container">
          <div id="stories-list" class="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.showStoriesList();
  }

  populateStoriesList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      return accumulator.concat(
        generateStoryItemTemplate({
          ...story,
        })
      );
    }, "");

    document.getElementById("stories-list").innerHTML = `${html}`;
  }

  populateStoriesListEmpty() {
    document.getElementById("stories-list").innerHTML = generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById("stories-list").innerHTML = generateStoriesListErrorTemplate(message);
  }

  showLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = "";
  }
}
