import { reportMapper } from "../../data/api-mapper";

export default class HomePresenter {
  #view;
  #apiModel;
  #dbModel;

  constructor({ view, apiModel, dbModel }) {
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
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

  async saveStory(id) {
    try {
      const response = await this.#apiModel.getStoryById(id);
      await this.#dbModel.putStory(response.story);

      this.#view.saveToBookmarkSuccessfully("Success to save to bookmark");
    } catch (error) {
      console.error("saveStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory(id) {
    try {
      await this.#dbModel.removeStory(id);

      this.#view.removeFromBookmarkSuccessfully("Success to remove from bookmark");
    } catch (error) {
      console.error("removeReport: error:", error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton(id) {
    if (await this.#isStorySaved(id)) {
      this.#view.renderUnbookmarkButton(id);
      return;
    }

    this.#view.renderBookmarkButton(id);
  }

  async #isStorySaved(id) {
    return !!(await this.#dbModel.getStoryById(id));
  }

  async initialStoriesAndMap() {
    this.#view.showLoading();
    try {
      await this.showStoriesListMap();

      const response = await this.#apiModel.getAllStories();

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
