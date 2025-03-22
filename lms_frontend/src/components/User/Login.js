//import { Link } from "react-router-dom";
import { useEffect,useState } from "react";
import axios from "axios";

const baseUrl= "http://127.0.0.1:8000/api"

function Login(){
    const [studentLoginData,setstudentLoginData]=useState({
        username:'',
        password:'',
    });

    const handleChange = (event)=>{
        setstudentLoginData({...studentLoginData,
            [event.target.name]:event.target.value})
    }

    const submitForm=()=>{
        const studentFormData = new FormData;
        studentFormData.append('username',studentLoginData.username);
        studentFormData.append('password',studentLoginData.password);
        try{
            axios.post(baseUrl+"/user-login",studentFormData)
            .then((res)=>{
                console.log(res.data);
                if(res.data.bool===true){
                    localStorage.setItem('studentLoginStatus','true');
                    localStorage.setItem('studentId',res.data.student_id);
                    window.location.href="/user-dashboard";
                }else {
                    alert("Invalid username or password.");
                }
            });  // Added missing semicolon
        }catch(error){
            console.log(error)
        }
    }

    const studentLoginStatus = localStorage.getItem('studentLoginStatus')
    if(studentLoginStatus === 'true'){
        window.location.href="/user-dashboard";
    }

    useEffect(()=>{
        document.title = 'User Login'
    });

    return (
        <div className="min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat"
             style={{ backgroundImage: "url('/assets/bakground.webp')" }}>
            {/* Main Content */}
            <div className="container mx-auto flex-grow flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h5 className="card-header text-center text-2xl font-bold text-blue-600 mb-6">User Login</h5>
                        <form onSubmit={submitForm}>
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={studentLoginData.username}
                                    name="username"
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={studentLoginData.password}
                                    name="password"
                                    type="password"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-check-input h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    id="rememberMe"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Login
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <a href="/user-register" className="text-blue-600 hover:text-blue-500">
                                    Register here
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;