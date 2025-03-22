import { useState, useEffect } from "react";
import axios from "axios";
import { FaGraduationCap } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";

const baseUrl = "http://127.0.0.1:8000/api";

function EditCourse() {
    const { id } = useParams(); // Get the course ID from the URL
    const navigate = useNavigate(); // Used to navigate to other pages
    const [courseData, setCourseData] = useState({
        category: '1',
        title: '',
        description: '',
        f_img: '',
        techs: '',
        enrollment_key: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Fetch course data when the component mounts
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await axios.get(`${baseUrl}/course/${id}`);
                setCourseData(response.data);
                setImagePreview(response.data.f_img); // If image URL is returned
            } catch (error) {
                console.error('Error fetching course data:', error);
                setStatusMessage({ type: 'error', text: 'Error loading course data.' });
            }
        };

        fetchCourseData();
    }, [id]);

    const handleChange = (event) => {
        setCourseData({ ...courseData, [event.target.name]: event.target.value });
        setStatusMessage({ type: '', text: '' });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && !file.type.startsWith('image/')) {
            setStatusMessage({ type: 'error', text: 'Please upload an image file.' });
            event.target.value = '';
            return;
        }
        if (file && file.size > 5 * 1024 * 1024) {
            setStatusMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
            event.target.value = '';
            return;
        }
        setImagePreview(URL.createObjectURL(file));
        setCourseData({ ...courseData, [event.target.name]: file });
        setStatusMessage({ type: '', text: '' });
    };

    const validateForm = () => {
        if (!courseData.title.trim()) return setStatusMessage({ type: 'error', text: 'Please enter a title.' }), false;
        if (!courseData.description.trim()) return setStatusMessage({ type: 'error', text: 'Please enter a description.' }), false;
        if (!courseData.techs.trim()) return setStatusMessage({ type: 'error', text: 'Please enter technologies.' }), false;
        if (!courseData.enrollment_key.trim()) return setStatusMessage({ type: 'error', text: 'Please enter an enrollment key.' }), false;
        return true;
    };

    const formSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setStatusMessage({ type: 'info', text: 'Updating course...' });

        try {
            const formData = new FormData();
            formData.append('category', courseData.category);
            formData.append('title', courseData.title.trim());
            formData.append('description', courseData.description.trim());
            formData.append('techs', courseData.techs.trim());
            formData.append('enrollment_key', courseData.enrollment_key.trim());

            if (courseData.f_img instanceof File) {
                formData.append('featured_img', courseData.f_img);
            }

            const response = await axios.put(`${baseUrl}/course/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 200 || response.status === 201) {
                setStatusMessage({ type: 'success', text: 'Course updated successfully!' });
                navigate(`/course-detail/${id}`); // Navigate back to the course detail page
            }
        } catch (error) {
            console.error('Error details:', error);
            setStatusMessage({
                type: 'error',
                text: error.response?.data ? Object.values(error.response.data).join(', ') : 'Error updating course. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex">
                <aside className="w-1/4">
                    <LecturerSidebar />
                </aside>
                <div className="w-3/4 pl-6">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center">
                            <FaGraduationCap size={24} className="mr-2 text-blue-500"/> Edit Course
                        </h2>

                        {/* Status Message Display */}
                        {statusMessage.text && (
                            <div className={`p-3 rounded-md mb-4 text-white ${statusMessage.type === 'success' ? 'bg-green-500' : statusMessage.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                {statusMessage.text}
                            </div>
                        )}

                        <form onSubmit={formSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium">Course Title</label>
                                <input type="text" name="title" value={courseData.title} onChange={handleChange} className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter Course Title" required />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium">Description</label>
                                <textarea name="description" value={courseData.description} onChange={handleChange} className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describe the Course Content" required></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium">Featured Image</label>
                                <input type="file" name="f_img" onChange={handleFileChange} className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" accept="image/*"/>
                                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg"/>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium">Technologies</label>
                                <textarea name="techs" value={courseData.techs} onChange={handleChange} className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Php, Python, JS, HTML, CSS" required></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium">Enrollment Key</label>
                                <input type="text" name="enrollment_key" value={courseData.enrollment_key} onChange={handleChange} className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating Course...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditCourse;