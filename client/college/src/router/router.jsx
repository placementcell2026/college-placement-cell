import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import AuthenticationLayout from "../layout/AuthenticationLayout";

const Home = lazy(() => import("../pages/Home"));
const Index = lazy(() => import("../pages/Index"));
const Login = lazy(() => import("../pages/authentication/Login"));
const Register = lazy(() => import("../pages/authentication/Register"));
const RegisterPCF = lazy(() => import("../pages/authentication/RegisterPCF"));
const Notifications = lazy(() => import("../pages/Notifications"));
const StudentProfile = lazy(() => import("../pages/Users/StudentProfile"));

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
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "profile",
        element: <StudentProfile />,
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
    path: "/register-pcf",
    element: <Navigate to="/authentication/register-pcf" replace />,
  },
  {
    path: "/authentication",
    element: <AuthenticationLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "register-pcf", element: <RegisterPCF /> },
    ],
  },
]);

export default router;
