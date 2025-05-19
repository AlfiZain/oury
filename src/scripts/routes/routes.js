import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/auth/login/login-page";
import { checkAuthenticatedRoute, checkUnauthenticatedRoutesOnly } from "../utils/auth";
import RegisterPage from "../pages/auth/register/register-page";
import NewStoryPage from "../pages/new/new-story-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import NotFoundPage from "../pages/not-found/not-found-page";

const routes = {
  "/login": () => checkUnauthenticatedRoutesOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRoutesOnly(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new NewStoryPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),

  "*": () => new NotFoundPage(),
};

export default routes;
