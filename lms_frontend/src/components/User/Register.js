import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const Alert = ({ type, title, message, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';

  return (
    <div className={`${bgColor} ${textColor} ${borderColor} border rounded-lg p-4 relative`}>
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm">{message}</div>
    </div>
  );
};

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

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    document.title = "User Register";
    const studentLoginStatus = localStorage.getItem("studentLoginStatus");
    if (studentLoginStatus === "true") {
      window.location.href = "/user-dashboard";
    }
  }, []);

  const handleChange = (event) => {
    setStudentData({
      ...studentData,
      [event.target.name]: event.target.value,
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const studentFormData = new FormData();
    studentFormData.append("full_name", studentData.full_name);
    studentFormData.append("email", studentData.email);
    studentFormData.append("username", studentData.username);
    studentFormData.append("password", studentData.password);
    studentFormData.append("department", studentData.department);
    studentFormData.append("interested_categories", studentData.interested_categories);

    try {
      const response = await fetch(`${baseUrl}/student/`, {
        method: 'POST',
        body: studentFormData
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          title: 'Registration Successful!',
          message: 'You can now log in to your account.'
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

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/user-login";
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error("Registration error:", error);
      setNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Something went wrong. Please try again.'
      });
      setStudentData({ ...studentData, status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat "
         style={{ backgroundImage: "url('/assets/bakground.webp')" }}>
      <div className="container mx-auto flex-grow flex items-center justify-center mt-5">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {notification && (
              <div className="mb-6">
                <Alert 
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  onClose={() => setNotification(null)}
                />
              </div>
            )}
            
            <form onSubmit={submitForm} className="space-y-6">
              <h1 className="text-4xl text-center text-blue-600 mb-8">
                User Registration
              </h1>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="full_name"
                  value={studentData.full_name}
                  onChange={handleChange}
                  name="full_name"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  value={studentData.email}
                  onChange={handleChange}
                  name="email"
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  value={studentData.username}
                  onChange={handleChange}
                  name="username"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  placeholder="Enter a unique username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  value={studentData.password}
                  onChange={handleChange}
                  name="password"
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  id="department"
                  value={studentData.department}
                  onChange={handleChange}
                  name="department"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  placeholder="Enter your department"
                />
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Interests
                </label>
                <textarea
                  id="interests"
                  name="interested_categories"
                  value={studentData.interested_categories}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="PHP, Python, JavaScript, etc."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Registering...</span>
                  </div>
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/user-login" className="text-blue-600 hover:text-blue-500">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;