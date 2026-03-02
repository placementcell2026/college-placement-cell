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
const Jobs = lazy(() => import("../pages/Jobs"));
const Student = lazy(() => import("../pages/Users/Student"));
const Teacher = lazy(() => import("../pages/Users/Teacher"));
const PlacementOfficer = lazy(() => import("../pages/Users/PlacementOfficer"));

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
        children: [
          { index: true, element: <Home /> },
          { path: "student", element: <Student /> },
          { path: "teacher", element: <Teacher /> },
          { path: "placement", element: <PlacementOfficer /> },
        ]
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "profile",
        children: [
          { index: true, element: <StudentProfile /> },
          { path: "student", element: <StudentProfile /> },
          { path: "teacher", element: <StudentProfile /> },
          { path: "placement", element: <StudentProfile /> },
        ]
      },
      {
        path: "jobs",
        element: <Jobs />,
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
