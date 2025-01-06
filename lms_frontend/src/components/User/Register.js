import { useEffect, useState } from "react";
import axios from "axios";

const baseUrl = "http://127.0.0.1:8000/api";

function Register() {
    const [studentData, setStudentData] = useState({
        full_name: "",
        email: "",
        username: "",
        password: "",
        department: "",
        interested_categories: "",
        status: ""
    });

    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        setStudentData({
            ...studentData,
            [event.target.name]: event.target.value
        });
    }

    const submitForm = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const studentFormData = new FormData();
        studentFormData.append("full_name", studentData.full_name);
        studentFormData.append("email", studentData.email);
        studentFormData.append("username", studentData.username);
        studentFormData.append("password", studentData.password);
        studentFormData.append("department", studentData.department);
        studentFormData.append("interested_categories", studentData.interested_categories);

        try {
            // Notice the trailing slash here
            const response = await axios.post(`${baseUrl}/student/`, studentFormData);
            
            if (response.status === 201 || response.status === 200) {
                setStudentData({
                    full_name: "",
                    email: "",
                    username: "",
                    password: "",
                    department: "",
                    interested_categories: "",
                    status: "success"
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            
            // More specific error handling
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.data) {
                    setErrorMessage(JSON.stringify(error.response.data));
                } else {
                    setErrorMessage(`Server Error: ${error.response.status}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                setErrorMessage("No response received from server. Please try again.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setErrorMessage("Error setting up the request. Please try again.");
            }
            
            setStudentData(prev => ({
                ...prev,
                status: "error"
            }));
        }
    };

    useEffect(() => {
        document.title = 'User Register';
        const studentLoginStatus = localStorage.getItem('studentLoginStatus');
        if (studentLoginStatus === "true") {
            window.location.href = "/user-dashboard";
        }
    }, []);

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-6 offset-3">
                    {studentData.status === "success" && 
                        <div className="alert alert-success">Thanks for Registration</div>
                    }
                    {studentData.status === "error" && 
                        <div className="alert alert-danger">
                            {errorMessage || "Something went wrong"}
                        </div>
                    }
                    <div className="card">
                        <h5 className="card-header">User Register</h5>
                        <div className="card-body">
                            <form onSubmit={submitForm}>
                                <div className="mb-3">
                                    <label htmlFor="full_name" className="form-label">Full Name</label>
                                    <input 
                                        id="full_name"
                                        value={studentData.full_name} 
                                        onChange={handleChange} 
                                        name="full_name" 
                                        type="text" 
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input 
                                        id="email"
                                        value={studentData.email} 
                                        onChange={handleChange} 
                                        name="email" 
                                        type="email" 
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input 
                                        id="username"
                                        value={studentData.username}
                                        onChange={handleChange} 
                                        name="username" 
                                        type="text" 
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input 
                                        id="password"
                                        value={studentData.password}
                                        onChange={handleChange} 
                                        name="password" 
                                        type="password" 
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="department" className="form-label">Department</label>
                                    <input 
                                        id="department"
                                        value={studentData.department}
                                        onChange={handleChange} 
                                        name="department" 
                                        type="text" 
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="interests" className="form-label">Interests</label>
                                    <textarea 
                                        id="interests"
                                        className="form-control"
                                        name="interested_categories"
                                        value={studentData.interested_categories}
                                        onChange={handleChange}
                                        placeholder="Php, Python, Javascript, etc"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">Register</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;