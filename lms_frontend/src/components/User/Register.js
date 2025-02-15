import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "http://127.0.0.1:8000/api";

function Register() {
  const [studentData, setStudentData] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    department: "",
    interested_categories: "",
    status: "",
  });

  const handleChange = (event) => {
    setStudentData({
      ...studentData,
      [event.target.name]: event.target.value,
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const studentFormData = new FormData();
    studentFormData.append("full_name", studentData.full_name);
    studentFormData.append("email", studentData.email);
    studentFormData.append("username", studentData.username);
    studentFormData.append("password", studentData.password);
    studentFormData.append("department", studentData.department);
    studentFormData.append("interested_categories", studentData.interested_categories);

    try {
      const response = await axios.post(`${baseUrl}/student/`, studentFormData);

      if (response.status === 201 || response.status === 200) {
        toast.success("Registration successful! You can now log in.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setStudentData({
          full_name: "",
          email: "",
          username: "",
          password: "",
          department: "",
          interested_categories: "",
          status: "success",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMsg = "Something went wrong. Please try again.";
      if (error.response && error.response.data) {
        errorMsg = JSON.stringify(error.response.data);
      }
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    document.title = "User Register";
    const studentLoginStatus = localStorage.getItem("studentLoginStatus");
    if (studentLoginStatus === "true") {
      window.location.href = "/user-dashboard";
    }
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
        style={{
          zIndex: 1,
          marginTop: "80px", // Add some margin at the top to create a gap with the fixed header
        }}
      >
        <ToastContainer />
        <div className="max-w-lg w-full bg-white bg-opacity-90 rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-semibold text-center text-gray-800">User Registration</h2>

          <form onSubmit={submitForm}>
            <div className="mb-4">
              <label htmlFor="full_name" className="block text-lg font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="full_name"
                value={studentData.full_name}
                onChange={handleChange}
                name="full_name"
                type="text"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                value={studentData.email}
                onChange={handleChange}
                name="email"
                type="email"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-lg font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                value={studentData.username}
                onChange={handleChange}
                name="username"
                type="text"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
                placeholder="Enter a unique username"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                value={studentData.password}
                onChange={handleChange}
                name="password"
                type="password"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="department" className="block text-lg font-medium text-gray-700">
                Department
              </label>
              <input
                id="department"
                value={studentData.department}
                onChange={handleChange}
                name="department"
                type="text"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
                placeholder="Enter your department"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="interests" className="block text-lg font-medium text-gray-700">
                Interests
              </label>
              <textarea
                id="interests"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                name="interested_categories"
                value={studentData.interested_categories}
                onChange={handleChange}
                placeholder="PHP, Python, JavaScript, etc."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Register
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/user-login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
