import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFacebookF, FaGoogle } from "react-icons/fa";

const baseUrl = "http://127.0.0.1:8000/api";

function LecturerLogin() {
    const [lecturerLoginData,setlecturerLoginData]=useState({
        email:'',
        password:'',
    });
    const handleChange =(event)=>{
       setlecturerLoginData ({
            ...lecturerLoginData,
            [event.target.name] : event.target.value
       })
    }

    const submitForm=()=>{
        const lecturerFormData= new FormData;
        lecturerFormData.append('email',lecturerLoginData.email)
        lecturerFormData.append('password',lecturerLoginData.password)
        try{
            axios.post(baseUrl+ '/lecturer-login',lecturerFormData) 
            .then((res)=>{
                console.log(res.data);
            if(res.data.bool===true){
                localStorage.setItem('lecturerLoginStatus','true');
                localStorage.setItem('lecturerId',res.data.lecturer_id);
                window.location.href ='/lecturer-dashboard';
            }
            }
         );

        }catch(error){
            console.log(error);
        }
        }
    
    const lecturerLoginStatus = localStorage.getItem('lecturerLoginStatus')
     if(lecturerLoginStatus === 'true'){
        window.location.href= '/lecturer-dashboard';
     }

    useEffect(()=>{
        document.title='Lecturer Login'
    });
  return (
    <div
    style={{ backgroundImage: "url('/assets/lecture.webp')", backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.9 }}
      
    >
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Lecturer Login
        </h2>
        <form onSubmit={submitForm}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={lecturerLoginData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={lecturerLoginData.password}
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
        <div className="mt-6">
          <p className="text-center text-gray-500 font-medium">Or login with:</p>
          <div className="flex justify-center space-x-4 mt-4">
            <button className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
              <FaFacebookF className="mr-2" /> Login with Facebook
            </button>
            <button className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition duration-300">
              <FaGoogle className="mr-2" /> Login with Google
            </button>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/lecturer-register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LecturerLogin;