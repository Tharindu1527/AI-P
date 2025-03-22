import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBook, FaHeart, FaStar, FaUserCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Tooltip } from "react-tooltip"; // For tooltips

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && 
          !event.target.closest('.sidebar') && 
          !event.target.closest('.sidebar-toggle')) {
        toggleSidebar();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleSidebar]);

  // Add resize handler to close sidebar on larger screens
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768 && isOpen) {
        toggleSidebar();
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, toggleSidebar]);

  const isActive = (path) => (location.pathname === path ? "bg-gray-700" : "");

  // Sidebar style
  const sidebarStyle = {
    maxHeight: 'calc(100vh - 64px)', // Adjust based on header height
    overflowY: 'auto',
    paddingBottom: '100px', // Extra padding to avoid footer overlap
    width: "64px", // Thin sidebar width
    borderRadius: "0 20px 20px 0", // Curved corners on the right side
  };

  return (
    <>
      {/* Sidebar toggle button */}
      <button
        className="sidebar-toggle fixed top-28 left-4 z-30 bg-gray-800 text-white p-2 rounded-md shadow-lg hover:bg-gray-700 focus:outline-none md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <FaBars size={18} />
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar fixed top-16 left-0 bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out z-20 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={sidebarStyle}
      >
        <div className="px-2 py-6 mt-2">
          <nav className="space-y-4">
            {/* Dashboard Link */}
            

            {/* My Courses Link */}
            <Link
              to="/my-courses"
              className={`flex items-center justify-center p-3 rounded-lg transition-colors ${isActive(
                "/my-courses"
              )} hover:bg-gray-700`}
              onClick={() => toggleSidebar}
              data-tooltip-id="courses-tooltip"
              data-tooltip-content="My Courses"
            >
              <FaBook size={20} />
            </Link>

            {/* Favorite Courses Link */}
            <Link
              to="/favorite-courses"
              className={`flex items-center justify-center p-3 rounded-lg transition-colors ${isActive(
                "/favorite-courses"
              )} hover:bg-gray-700`}
              onClick={() => toggleSidebar}
              data-tooltip-id="favorites-tooltip"
              data-tooltip-content="Favorite Courses"
            >
              <FaHeart size={20} />
            </Link>

            {/* Recommended Courses Link */}
            <Link
              to="/all-courses"
              className={`flex items-center justify-center p-3 rounded-lg transition-colors ${isActive(
                "/all-courses"
              )} hover:bg-gray-700`}
              onClick={() => toggleSidebar}
              data-tooltip-id="recommended-tooltip"
              data-tooltip-content=" Courses"
            >
              <FaStar size={20} />
            </Link>

            {/* Profile Settings Link */}
            <Link
              to="/profile"
              className={`flex items-center justify-center p-3 rounded-lg transition-colors ${isActive(
                "/profile-settings"
              )} hover:bg-gray-700`}
              onClick={() => toggleSidebar}
              data-tooltip-id="profile-tooltip"
              data-tooltip-content="Profile Settings"
            >
              <FaUserCog size={20} />
            </Link>

            {/* Logout Link */}
            
            <Link to='/user-logout'button type="button" class="flex items-center justify-center p-3 rounded-lg transition-colors text-red-400 hover:bg-gray-700 hover:text-red-300" ><FaSignOutAlt size={20} /></Link>
          </nav>
        </div>
      </aside>

      {/* Tooltips */}
      <Tooltip id="dashboard-tooltip" />
      <Tooltip id="courses-tooltip" />
      <Tooltip id="favorites-tooltip" />
      <Tooltip id="recommended-tooltip" />
      <Tooltip id="profile-tooltip" />
      <Tooltip id="logout-tooltip" />

      {/* Overlay for better mobile experience */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

export default Sidebar;