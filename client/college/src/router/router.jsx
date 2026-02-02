import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import AuthenticationLayout from "../layout/AuthenticationLayout";

const Home = lazy(() => import("../pages/Home"));
const Index = lazy(() => import("../pages/Index"));
const Login = lazy(() => import("../pages/authentication/Login"));
const Register = lazy(() => import("../pages/authentication/Register"));

const router = createBrowserRouter([
  {
 path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/index" replace />,
      },
      {
        path: "index",
        element: <Index />,
      },
      {
        path: "home",
        element: <Home />,
      },
    ],
  },
    {
    path: "/login",
    element: <Navigate to="/authentication/login" replace />,
  },
    {
    path: "/register",
    element: <Navigate to="/authentication/register" replace />,
  },
  {
    path: "/authentication",
    element: <AuthenticationLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

export default router;
