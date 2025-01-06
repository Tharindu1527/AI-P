import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Learn Online</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ms-auto">
            {/* Always Show Home and Courses */}
            <Link className="nav-link active" aria-current="page" to="/">Home</Link>
            <Link className="nav-link" to="/all-courses">Courses</Link>

            {/* Show Links for Not Logged-In Users */}
            {role === null && (
              <>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdownUser"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    User
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdownUser">
                    <li><Link className="dropdown-item" to="/user-login">Login</Link></li>
                    <li><Link className="dropdown-item" to="/user-register">Register</Link></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdownLecturer"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Lecturer
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdownLecturer">
                    <li><Link className="dropdown-item" to="/lecturer-login">Login</Link></li>
                    <li><Link className="dropdown-item" to="/lecturer-register">Register</Link></li>
                  </ul>
                </li>
              </>
            )}

            {/* Show Lecturer Menu If Role is Lecturer */}
            {role === "lecturer" && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdownLecturer"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Lecturer
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdownLecturer">
                  <li><Link className="dropdown-item" to="/lecturer-dashboard">Dashboard</Link></li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/"
                      onClick={handleLogout}
                    >
                      Logout
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Show User Menu If Role is Student */}
            {role === "student" && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdownUser"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  User
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdownUser">
                  <li><Link className="dropdown-item" to="/user-dashboard">Dashboard</Link></li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/"
                      onClick={handleLogout}
                    >
                      Logout
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
