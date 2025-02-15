import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUserCircle, FaChalkboardTeacher } from "react-icons/fa";

function Header() {
  const [role, setRole] = useState(null); // Tracks the role: "student", "lecturer", or null.

  // Update role based on localStorage when the component mounts.
  useEffect(() => {
    const lecturerLoginStatus = localStorage.getItem("lecturerLoginStatus");
    const studentLoginStatus = localStorage.getItem("studentLoginStatus");

    if (lecturerLoginStatus === "true") {
      setRole("lecturer");
    } else if (studentLoginStatus === "true") {
      setRole("student");
    } else {
      setRole(null); // Not logged in
    }
  }, []);

  // Handles logout by clearing role and localStorage
  const handleLogout = () => {
    if (role === "lecturer") {
      localStorage.removeItem("lecturerLoginStatus");
    } else if (role === "student") {
      localStorage.removeItem("studentLoginStatus");
    }
    setRole(null);
  };

  return (
    <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link className="text-3xl font-bold text-yellow-400 hover:text-yellow-500" to="/">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-3xl font-semibold text-white">
              <span className="text-yellow-400">Plagiarism</span>Detector
            </h2>
          </div>
          </Link>
          <div className="flex items-center space-x-6">
            <Link className="text-lg hover:text-yellow-300" to="/">Home</Link>
            <Link className="text-lg hover:text-yellow-300" to="/all-courses">Courses</Link>

            {/* User and Lecturer Dropdowns */}
            {role === null && (
              <div className="relative">
                <button className="text-lg hover:text-yellow-300">User</button>
                <div className="absolute right-0 hidden mt-2 space-y-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg group-hover:block">
                  <Link className="block" to="/user-login">Login</Link>
                  <Link className="block" to="/user-register">Register</Link>
                </div>
              </div>
            )}

            {role === "lecturer" && (
              <div className="relative">
                <button className="text-lg hover:text-yellow-300">
                  <FaChalkboardTeacher className="inline-block mr-1" />
                  Lecturer
                </button>
                <div className="absolute right-0 hidden mt-2 space-y-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg group-hover:block">
                  <Link className="block" to="/lecturer-dashboard">Dashboard</Link>
                  <Link className="block" to="/" onClick={handleLogout}>Logout</Link>
                </div>
              </div>
            )}

            {role === "student" && (
              <div className="relative">
                <button className="text-lg hover:text-yellow-300">
                  <FaUserCircle className="inline-block mr-1" />
                  User
                </button>
                <div className="absolute right-0 hidden mt-2 space-y-2 bg-gray-800 text-white p-4 rounded-lg shadow-lg group-hover:block">
                  <Link className="block" to="/user-dashboard">Dashboard</Link>
                  <Link className="block" to="/" onClick={handleLogout}>Logout</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
