import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUserCircle, FaChalkboardTeacher } from "react-icons/fa";

function Header() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const lecturerLoginStatus = localStorage.getItem("lecturerLoginStatus");
    const studentLoginStatus = localStorage.getItem("studentLoginStatus");

    if (lecturerLoginStatus === "true") {
      setRole("lecturer");
    } else if (studentLoginStatus === "true") {
      setRole("student");
    } else {
      setRole(null);
    }
  }, []);

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
          <Link className="text-3xl font-bold" to="/">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                <span className="text-yellow-400">Plagiarism</span>Detector
              </h2>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <Link className="text-lg hover:text-yellow-300" to="/">Home</Link>
            <Link className="text-lg hover:text-yellow-300" to="/all-courses">Courses</Link>

            {role === null && (
              <>
                <div className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle text-lg hover:text-yellow-300 flex items-center"
                    href="#"
                    id="navbarDropdownUser"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaUserCircle className="mr-2" />
                    User
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdownUser">
                    <li><Link className="dropdown-item" to="/user-login">Login</Link></li>
                    <li><Link className="dropdown-item" to="/user-register">Register</Link></li>
                  </ul>
                </div>

                <div className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle text-lg hover:text-yellow-300 flex items-center"
                    href="#"
                    id="navbarDropdownLecturer"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaChalkboardTeacher className="mr-2" />
                    Lecturer
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdownLecturer">
                    <li><Link className="dropdown-item" to="/lecturer-login">Login</Link></li>
                    <li><Link className="dropdown-item" to="/lecturer-register">Register</Link></li>
                  </ul>
                </div>
              </>
            )}

            {role === "lecturer" && (
              <div className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-lg hover:text-yellow-300 flex items-center"
                  href="#"
                  id="navbarDropdownLecturer"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaChalkboardTeacher className="mr-2" />
                  Lecturer
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdownLecturer">
                  <li><Link className="dropdown-item" to="/lecturer-dashboard">Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/" onClick={handleLogout}>Logout</Link></li>
                </ul>
              </div>
            )}

            {role === "student" && (
              <div className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-lg hover:text-yellow-300 flex items-center"
                  href="#"
                  id="navbarDropdownUser"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUserCircle className="mr-2" />
                  User
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdownUser">
                  <li><Link className="dropdown-item" to="/user-dashboard">Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/" onClick={handleLogout}>Logout</Link></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;