import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBook, FaHeart, FaStar, FaUserCog, FaSignOutAlt, FaBars } from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Sidebar visibility state

  const toggleSidebar = () => setIsOpen(!isOpen); // Toggle the sidebar state

  const isActive = (path) => (location.pathname === path ? "bg-gray-700" : ""); // Add active class for active links

  return (
    <div className="flex">
      
      <div
        className={`fixed top-24 left-6 h-auto w-60 bg-gray-800 text-white p-5 space-y-6 transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxHeight: "75vh", overflowY: "auto" }} // Adjusted height with scrollable content
      >
        <h5 className="text-2xl font-bold text-center mb-8">Dashboard</h5>

        <div className="space-y-4">
          <Link
            to="/my-courses"
            className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ${isActive(
              "/my-courses"
            )} hover:bg-gray-700`}
            onClick={() => setIsOpen(false)} // Close sidebar on link click
          >
            <FaBook className="mr-3" /> My Courses
          </Link>
          <Link
            to="/favorite-courses"
            className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ${isActive(
              "/favorite-courses"
            )} hover:bg-gray-700`}
            onClick={() => setIsOpen(false)}
          >
            <FaHeart className="mr-3" /> Favorite Courses
          </Link>
          <Link
            to="/recommended-course"
            className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ${isActive(
              "/recommended-course"
            )} hover:bg-gray-700`}
            onClick={() => setIsOpen(false)}
          >
            <FaStar className="mr-3" /> Recommended Courses
          </Link>
          <Link
            to="/profile-settings"
            className={`flex items-center px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition duration-300 ${isActive(
              "/profile-settings"
            )}`}
            aria-disabled="true"
            onClick={() => setIsOpen(false)}
          >
            <FaUserCog className="mr-3" /> Profile Settings
          </Link>
          <Link
            to="/user-logout"
            className={`flex items-center px-4 py-2 rounded-lg text-red-500 hover:bg-gray-700 transition duration-300 ${isActive(
              "/user-logout"
            )}`}
            aria-disabled="true"
            onClick={() => setIsOpen(false)}
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </Link>
        </div>
      </div>

     
      <button
        className="fixed top-28 left-8 bg-gray-800 text-white p-2 rounded-md shadow-md z-50"
        onClick={toggleSidebar}
      >
        <FaBars size={20} />
      </button>

      
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}

export default Sidebar;