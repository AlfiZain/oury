import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/auth/login/login-page";
import { checkAuthenticatedRoute, checkUnauthenticatedRoutesOnly } from "../utils/auth";
import RegisterPage from "../pages/auth/register/register-page";
import NewPage from "../pages/new/new-page";

const routes = {
  "/login": () => checkUnauthenticatedRoutesOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRoutesOnly(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new NewPage()),
  "/about": () => checkAuthenticatedRoute(new AboutPage()),
};

export default routes;
