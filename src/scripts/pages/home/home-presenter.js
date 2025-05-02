import { reportMapper } from "../../data/api-mapper";

export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoriesListMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialStoriesAndMap() {
    this.#view.showLoading();
    try {
      await this.showStoriesListMap();

      const response = await this.#model.getAllStories();

      if (!response.ok) {
        console.error("showStoryList: response: ", response);
        this.#view.populateStoriesListError(response.message);
        return;
      }

      const stories = await Promise.all(response.listStory.map(async (story) => await reportMapper(story)));

      this.#view.populateStoriesList(response.message, stories);
    } catch (error) {
      console.error("showStoriesList: error: ", error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
