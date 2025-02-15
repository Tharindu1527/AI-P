import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Font Awesome icons
import { FaFacebookF, FaGoogle } from "react-icons/fa";

const baseUrl = "http://127.0.0.1:8000/api";

function UserLogin() {
  const [LoginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setLoginData({
      ...LoginData,
      [event.target.name]: event.target.value,
    });
  };

  const submitForm = (event) => {
    event.preventDefault();
    if (!LoginData.email || !LoginData.password) {
      toast.error("Email and Password are required.");
      return;
    }

    const userFormData = new FormData();
    userFormData.append("email", LoginData.email);
    userFormData.append("password", LoginData.password);

    axios
      .post(baseUrl + "/user-login", userFormData)
      .then((res) => {
        if (res.data.bool === true) {
          toast.success("User login successful!");
          localStorage.setItem("UserLoginStatus", "true");
          localStorage.setItem("UserId", res.data.user_id);
          setTimeout(() => {
            window.location.href = "/user-dashboard";
          }, 1500); // Redirect after showing toast
        } else {
          toast.error("Invalid user credentials. Please try again.");
        }
      })
      .catch(() => {
        toast.error("An error occurred while logging in. Please try again.");
      });
  };

  const LoginStatus = localStorage.getItem("UserLoginStatus");
  if (LoginStatus === "true") {
    window.location.href = "/user-dashboard";
  }

  useEffect(() => {
    document.title = "User Login";
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/assets/bakground.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay with transparency */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Black overlay with 50% opacity
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg"
        style={{ zIndex: 1 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          User Login
        </h2>
        <form onSubmit={submitForm}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={LoginData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-lg font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={LoginData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
        <ToastContainer />
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/user-register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
