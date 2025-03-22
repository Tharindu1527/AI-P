import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";
import { useState } from "react";
import axios from "axios";
import { FaGraduationCap } from "react-icons/fa";
const baseUrl = "http://127.0.0.1:8000/api";


function AddCourses() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [courseData, setCourseData] = useState({
        category: '1',  // Setting default category ID for Python
        title: '',
        description: '',
        f_img: '',
        techs: '',
        enrollment_key: '' // Add enrollment key field
    });
    const [imagePreview, setImagePreview] = useState(null);

    // Get lecturer ID from localStorage
    const lecturerId = localStorage.getItem('lecturerId');

    const handleChange = (event) => {
        setCourseData({
            ...courseData,
            [event.target.name]: event.target.value
        });
        setErrorMessage('');
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && !file.type.startsWith('image/')) {
            setErrorMessage('Please upload an image file');
            event.target.value = '';
            return;
        }
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
        // Add size validation
        if (file && file.size > 5 * 1024 * 1024) {
            setErrorMessage('Image size should be less than 5MB');
            event.target.value = '';
            return;
        }
        setCourseData({
            ...courseData,
            [event.target.name]: file
        });
        setErrorMessage('');
    }
    const validateForm = () => {
        if (!courseData.title.trim()) {
            setErrorMessage('Please enter a title');
            return false;
        }
        if (!courseData.description.trim()) {
            setErrorMessage('Please enter a description');
            return false;
        }
        if (!courseData.techs.trim()) {
            setErrorMessage('Please enter technologies');
            return false;
        }
        if (!courseData.enrollment_key.trim()) {
            setErrorMessage('Please enter an enrollment key');
            return false;
        }
        return true;
    }

    const formSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const formData = new FormData();
            
            formData.append('category', courseData.category); // Sending fixed category ID
            formData.append('lecturer', lecturerId);
            formData.append('title', courseData.title.trim());
            formData.append('description', courseData.description.trim());
            formData.append('techs', courseData.techs.trim());
            formData.append('enrollment_key', courseData.enrollment_key.trim()); // Add enrollment key

            if (courseData.f_img && courseData.f_img instanceof File) {
                formData.append('featured_img', courseData.f_img);
            }

            const response = await axios({
                method: 'POST',
                url: `${baseUrl}/course/`,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200 || response.status === 201) {
                alert('Course has been added successfully!');
                setCourseData({
                    category: '1',  // Reset to default category ID
                    title: '',
                    description: '',
                    f_img: '',
                    techs: '',
                    enrollment_key: '' // Reset enrollment key
                });
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
            }
        } catch (error) {
            console.error('Error details:', error);
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errorMessages = [];
                    for (const field in error.response.data) {
                        errorMessages.push(`${field}: ${error.response.data[field]}`);
                    }
                    setErrorMessage(errorMessages.join('\n'));
                } else {
                    setErrorMessage(error.response.data);
                }
            } else {
                setErrorMessage('Error adding course. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex">
                <aside className="w-1/4">
                    <LecturerSidebar />
                </aside>
                <div className="w-3/4 pl-6">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center">
                            <FaGraduationCap size={24} className="mr-2 text-blue-500 "/>Add New Course
                        </h2>
                        
                        <div className="card-body">
                            {errorMessage && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMessage.split('\n').map((msg, idx) => (
                                        <div key={idx}>{msg}</div>
                                    ))}
                                </div>
                            )}
                            <form onSubmit={formSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="title" className="block text-gray-700 font-medium"> Course Title</label>
                                    <input 
                                        type="text" 
                                        id="title"
                                        name="title" 
                                        value={courseData.title}
                                        onChange={handleChange} 
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter Course Title"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="description" className="block text-gray-700 font-medium">Description</label>
                                    <textarea 
                                        id="description"
                                        name="description"
                                        value={courseData.description}
                                        onChange={handleChange} 
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe the Course Content"
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="f_img" className="block text-gray-700 font-medium">Featured Image</label>
                                    <input 
                                        type="file"
                                        id="f_img"
                                        name="f_img"
                                        onChange={handleFileChange}
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        accept="image/*"
                                    />
                                    
                                        {imagePreview && (
                                            <div className="mt-4">
                                                <img src={imagePreview} alt="Featured" className="w-full h-48 object-cover rounded-lg" />
                                            </div>
                                        )}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="techs" className="block text-gray-700 font-medium">Technologies</label>
                                    <textarea 
                                        id="techs"
                                        name="techs"
                                        value={courseData.techs}
                                        onChange={handleChange}
                                        placeholder="Php,Python,js,HTML,CSS"
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="techs" className="block text-gray-700 font-medium">Enrollment Key</label>
                                    <textarea 
                                        id="enrollment_key"
                                        name="enrollment_key"
                                        value={courseData.enrollment_key}
                                        onChange={handleChange}
                                        
                                        className="w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Adding Course...' : 'Submit'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddCourses;