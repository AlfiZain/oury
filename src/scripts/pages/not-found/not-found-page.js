export default class NotFoundPage {
  async render() {
    return `
      <section class="not-found-page">
        <h2 class="not-found-title">404 - Page Not Found</h2>
        <p class="not-found-subtitle">Sorry, the page you are looking for is not available..</p>
        <a href="#/" class="not-found-link">Back to Home</a>
      </section>
    `;
  }
}
