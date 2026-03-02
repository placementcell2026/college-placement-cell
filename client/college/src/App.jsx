import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return(
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </Suspense>
  ) 
}

export default App;
