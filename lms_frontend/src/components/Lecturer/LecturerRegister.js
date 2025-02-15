import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "http://127.0.0.1:8000/api/lecturer/";

function LecturerRegister() {
  const [lecturerData, setLecturerData] = useState({
    "full_name": "",
    "email": "",
    "password": "",
    "qualification": "",
    "department": "",
    "mobile_no": "",
    "address": "",
  });

  // Handle form input changes
  const handleChange = (event) => {
    setLecturerData({
      ...lecturerData,
      [event.target.name]: event.target.value
    });
  };

  // Submit form data
  const submitForm = async (event) => {
    event.preventDefault();

    const lecturerFormData = new FormData();
    lecturerFormData.append("full_name", lecturerData.full_name);
    lecturerFormData.append("email", lecturerData.email);
    lecturerFormData.append("password", lecturerData.password);
    lecturerFormData.append("qualification", lecturerData.qualification);
    lecturerFormData.append("department", lecturerData.department);
    lecturerFormData.append("mobile_no", lecturerData.mobile_no);
    lecturerFormData.append("address", lecturerData.address);

    try {
      const response = await axios.post(baseUrl, lecturerFormData);
      setLecturerData({
        "full_name": "",
        "email": "",
        "password": "",
        "qualification": "",
        "department": "",
        "mobile_no": "",
        "address": "",
      });
      toast.success("Registration successful! You can now log in.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const lecturerLoginStatus = localStorage.getItem('lecturerLoginStatus');
  if (lecturerLoginStatus === 'true') {
    window.location.href = '/lecturer-dashboard';
  }

  useEffect(() => {
    document.title = 'Lecturer Register';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Lecturer Registration</h2>

        <form onSubmit={submitForm}>
          <div className="mb-4">
            <label htmlFor="full_name" className="block text-lg font-medium">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={lecturerData.full_name}
              onChange={handleChange}
              id="full_name"
              className="mt-2 p-3 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={lecturerData.email}
              onChange={handleChange}
              id="email"
              className="mt-2 p-3 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={lecturerData.password}
              onChange={handleChange}
              id="password"
              className="mt-2 p-3 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="qualification" className="block text-lg font-medium">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={lecturerData.qualification}
              onChange={handleChange}
              id="qualification"
              className="mt-2 p-3 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your qualification"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="department" className="block text-lg font-medium">Department</label>
            <input
              type="text"
              name="department"
              value={lecturerData.department}
              onChange={handleChange}
              id="department"
              className="mt-2 p-3 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your department"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="mobile_no" className="block text-lg font-medium">Mobile Number</label>
            <input
              type="number"
              name="mobile_no"
              value={lecturerData.mobile_no}
              onChange={handleChange}
              id="mobile_no"
              className="mt-2 p-3 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your mobile number"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="address" className="block text-lg font-medium">Address</label>
            <textarea
              name="address"
              value={lecturerData.address}
              onChange={handleChange}
              id="address"
              className="mt-2 p-3 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your address"
            ></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">Register</button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">Already have an account? <Link to="/lecturer-login" className="text-blue-600 hover:underline">Login here</Link></p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LecturerRegister;
