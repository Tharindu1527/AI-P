import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AllCourses() {
    const [courseData, setCourseData] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [courseImages, setCourseImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const baseUrl = "http://127.0.0.1:8000/api";
    const navigate = useNavigate();
    const [courseEnrollmentCounts, setCourseEnrollmentCounts] = useState({});

    // Fetch courses based on user role
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                
                // Check login status
                const lecturerLoginStatus = localStorage.getItem('lecturerLoginStatus');
                const studentLoginStatus = localStorage.getItem('studentLoginStatus');
                const lecturerId = localStorage.getItem('lecturerId');
                
                // If lecturer is logged in, fetch only their courses
                if (lecturerLoginStatus === 'true' && lecturerId) {
                    console.log("Fetching courses for lecturer ID:", lecturerId);
                    setUserRole('lecturer');
                    
                    const res = await axios.get(`${baseUrl}/lecturer-courses/${lecturerId}/`);
                    setCourseData(res.data);
                    
                    // Pre-fetch images for all courses
                    res.data.forEach(course => {
                        if (course.featured_img) {
                            fetchCourseImage(course.id, course.featured_img);
                        }
                    });
                }
                // If student is logged in, fetch all courses
                else if (studentLoginStatus === 'true') {
                    console.log("Fetching all courses for student view");
                    setUserRole('student');
                    
                    const res = await axios.get(`${baseUrl}/course/`);
                    setCourseData(res.data);
                    
                    // Pre-fetch images for all courses
                    res.data.forEach(course => {
                        if (course.featured_img) {
                            fetchCourseImage(course.id, course.featured_img);
                        }
                    });
                }
                // If no user is logged in, redirect to login
                else {
                    navigate('/user-login');
                    return;
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError("Failed to load courses");
                setLoading(false);
            }
        };

        fetchCourses();
    }, [navigate]);

    // Function to fetch and process course images
    const fetchCourseImage = async (courseId, imagePath) => {
        if (!imagePath) return;
        
        try {
            // Extract just the filename if it's a full path
            const filename = imagePath.includes('/') 
                ? imagePath.split('/').pop() 
                : imagePath;
                
            const imageUrl = `${baseUrl}/media/course_imgs/${filename}`;
            
            const response = await axios.get(imageUrl, {
                responseType: 'blob'
            });
            
            const blobUrl = URL.createObjectURL(response.data);
            setCourseImages(prev => ({
                ...prev,
                [courseId]: blobUrl
            }));
        } catch (error) {
            console.error('Error loading image for course', courseId, error);
            
            // Try alternative URL as fallback
            try {
                const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
                const alternativeUrl = `http://127.0.0.1:8000/media/course_imgs/${filename}`;
                
                const response = await axios.get(alternativeUrl, {
                    responseType: 'blob'
                });
                
                const blobUrl = URL.createObjectURL(response.data);
                setCourseImages(prev => ({
                    ...prev,
                    [courseId]: blobUrl
                }));
            } catch (secondError) {
                console.error(`Alternative URL also failed for course ${courseId}:`, secondError);
            }
        }
    };

    const fetchAllEnrollmentCounts = async (courses) => {
        if (!courses || courses.length === 0) return;
        
        const counts = {};
        
        // Fetch all counts in parallel for better performance
        const fetchPromises = courses.map(async (course) => {
            try {
                const response = await axios.get(`${baseUrl}/course/${course.id}/enrollment-count/`);
                if (response.data && response.data.count !== undefined) {
                    counts[course.id] = response.data.count;
                }
            } catch (error) {
                console.error(`Error fetching count for course ${course.id}:`, error);
                // Fallback to any embedded count in course data
                counts[course.id] = course.enrolled_count || 0;
            }
        });
        
        // Wait for all fetches to complete
        await Promise.all(fetchPromises);
        
        // Update state with all counts
        setCourseEnrollmentCounts(counts);
    };

    // Handle course selection
    const handleSelectCourse = (id) => {
        setSelectedCourseId(id);
    };

    useEffect(() => {
        if (courseData.length > 0) {
            fetchAllEnrollmentCounts(courseData);
        }
    }, [courseData]);

    // Cleanup function for blob URLs
    useEffect(() => {
        return () => {
            // Clean up all blob URLs when component unmounts
            Object.values(courseImages).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [courseImages]);
    
    // Show loading state
    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading courses...</p>
            </div>
        );
    }
    
    // Show error state
    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }
    
    // Show empty state
    if (courseData.length === 0) {
        return (
            <div className="container my-5 text-center">
                <h2>No Courses Found</h2>
                <p className="text-muted">
                    {userRole === 'lecturer' 
                        ? "You haven't created any courses yet." 
                        : "There are no courses available at the moment."}
                </p>
                
                {/* Only show "Create Course" button for lecturers with no courses */}
                {userRole === 'lecturer' && (
                    <Link to="/add-course" className="btn btn-primary mt-3">
                        Create Your First Course
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="text-center mb-5">
                <h1 className="display-5 fw-bold">
                    {userRole === 'lecturer' ? 'Your Courses' : 'Available Courses'}
                </h1>
                <p className="text-muted">
                    {userRole === 'lecturer' 
                        ? 'Manage and explore your created courses' 
                        : ''}
                </p>
                
                {/* "Add New Course" button removed from here */}
            </div>

            <div className="row g-4">
                {courseData.map((course) => (
                    <div className="col-md-6 col-lg-4 col-xl-3" key={course.id}>
                        <div
                            className="card h-100 shadow-sm"
                            style={{
                                border: selectedCourseId === course.id ? '3px solid #0d6efd' : '1px solid #ddd',
                                backgroundColor: selectedCourseId === course.id ? '#f0f8ff' : '#fff',
                                transition: 'all 0.3s ease',
                            }}
                            onClick={() => handleSelectCourse(course.id)}
                        >
                            <div className="position-relative">
                                {courseImages[course.id] ? (
                                    <img
                                        src={courseImages[course.id]}
                                        className="card-img-top rounded-top"
                                        alt={course.title}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div 
                                        className="card-img-top bg-light d-flex justify-content-center align-items-center" 
                                        style={{ height: '200px' }}
                                    >
                                        <span className="text-muted">Loading image...</span>
                                    </div>
                                )}
                                <div className="badge bg-primary position-absolute top-0 end-0 m-2">
                                    {courseEnrollmentCounts[course.id] !== undefined 
                                        ? `${courseEnrollmentCounts[course.id]} Students` 
                                        : "0 Students"}
                                </div>
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-truncate">{course.title}</h5>
                                <p className="card-text text-muted small">{course.techs}</p>
                                <div className="mt-auto d-flex justify-content-between align-items-center">
                                    <Link
                                        to={`/detail/${course.id}`}
                                        className="btn btn-outline-primary"
                                    >
                                        View Details
                                    </Link>
                                    
                                    {/* Only show Edit button for lecturers */}
                                    {userRole === 'lecturer' && (
                                        <Link
                                            to={`/edit-course/${course.id}`}
                                            className="btn btn-outline-secondary"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Edit
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Only show pagination if there are enough courses */}
            {courseData.length > 12 && (
                <nav className="mt-5">
                    <ul className="pagination justify-content-center">
                        <li className="page-item">
                            <button className="page-link text-primary" aria-label="Previous">
                                <span aria-hidden="true">&laquo; Previous</span>
                            </button>
                        </li>
                        <li className="page-item">
                            <button className="page-link text-dark">1</button>
                        </li>
                        <li className="page-item">
                            <button className="page-link text-dark">2</button>
                        </li>
                        <li className="page-item">
                            <button className="page-link text-dark">3</button>
                        </li>
                        <li className="page-item">
                            <button className="page-link text-primary" aria-label="Next">
                                <span aria-hidden="true">Next &raquo;</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default AllCourses;