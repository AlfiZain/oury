import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/auth/login/login-page";
import { checkAuthenticatedRoute, checkUnauthenticatedRoutesOnly } from "../utils/auth";
import RegisterPage from "../pages/auth/register/register-page";

const routes = {
  "/login": () => checkUnauthenticatedRoutesOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRoutesOnly(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/about": () => checkAuthenticatedRoute(new AboutPage()),
};

export default routes;
