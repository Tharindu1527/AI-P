import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MyCourses({ summary = false }) {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [courseImages, setCourseImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const studentId = localStorage.getItem('studentId');
    const baseUrl = "http://127.0.0.1:8000/api";
    
    useEffect(() => {
        if (studentId) {
            setLoading(true);
            axios.get(`${baseUrl}/fetch-enrolled-courses/${studentId}`)
                .then((res) => {
                    setEnrolledCourses(res.data);
                })
                .catch(error => {
                    console.error("Error fetching enrolled courses:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [studentId]);
    
    // Fetch images for courses
    useEffect(() => {
        const fetchCourseImages = async () => {
            const images = {};
            
            for (const course of enrolledCourses) {
                if (course.featured_img) {
                    try {
                        // Extract the filename from the path
                        const filename = course.featured_img.split('/').pop();
                        
                        // Construct the correct URL using just the filename
                        const imageUrl = `${baseUrl}/media/course_imgs/${filename}`;
                        
                        const response = await axios.get(imageUrl, {
                            responseType: 'blob'
                        });
                        
                        // Create a blob URL for the image
                        const blobUrl = URL.createObjectURL(response.data);
                        images[course.id] = blobUrl;
                    } catch (error) {
                        console.error(`Error fetching image for course ${course.id}:`, error);
                        // Try alternative URL as fallback
                        try {
                            const filename = course.featured_img.split('/').pop();
                            const alternativeUrl = `http://127.0.0.1:8000/media/course_imgs/${filename}`;
                            
                            const response = await axios.get(alternativeUrl, {
                                responseType: 'blob'
                            });
                            
                            const blobUrl = URL.createObjectURL(response.data);
                            images[course.id] = blobUrl;
                        } catch (secondError) {
                            console.error(`Alternative URL also failed:`, secondError);
                            images[course.id] = null;
                        }
                    }
                }
            }
            
            setCourseImages(images);
        };

        if (enrolledCourses.length > 0) {
            fetchCourseImages();
        }
        
        // Cleanup function to revoke object URLs when component unmounts
        return () => {
            Object.values(courseImages).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [enrolledCourses, baseUrl]);

    // Handle course selection
    const handleSelectCourse = (id) => {
        setSelectedCourseId(id);
    };

    // For dashboard summary view
    if (summary) {
        if (loading) {
            return (
                <div className="summary-loading">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (enrolledCourses.length === 0) {
            return (
                <div className="text-center py-3">
                    <p className="text-muted mb-2">No enrolled courses</p>
                    <Link to="/courses" className="btn btn-sm btn-outline-primary">Browse Courses</Link>
                </div>
            );
        }

        // Show just a few courses in a compact list for dashboard
        const displayCourses = enrolledCourses.slice(0, 3);
        
        return (
            <div>
                <ul className="list-group">
                    {displayCourses.map((course, index) => (
                        <li className="list-group-item d-flex align-items-center p-2" key={index}>
                            <div className="course-thumbnail me-3">
                                {courseImages[course.id] ? (
                                    <img 
                                        src={courseImages[course.id]} 
                                        alt={course.title}
                                        className="img-thumbnail"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="placeholder-thumbnail">
                                        <span>...</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="mb-0">
                                    <Link to={`/detail/${course.id}`} className="text-decoration-none">
                                        {course.title}
                                    </Link>
                                </h6>
                                {course.techs && (
                                    <small className="text-muted">{course.techs}</small>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
                
                {enrolledCourses.length > 3 && (
                    <div className="text-end mt-2">
                        <Link to="/my-courses" className="btn btn-sm btn-primary">
                            View All ({enrolledCourses.length})
                        </Link>
                    </div>
                )}
                
                <style jsx="true">{`
                    .placeholder-thumbnail {
                        width: 60px;
                        height: 60px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: #f8f9fa;
                        border-radius: 0.25rem;
                    }
                    .summary-loading {
                        display: flex;
                        justify-content: center;
                        padding: 1rem;
                    }
                `}</style>
            </div>
        );
    }

    // Full view for the MyCourses page - using AllCourses box style
    if (loading) {
        return (
            <div className="container mt-3">
                <h3 className="pb-1 mb-4">My Enrolled Courses</h3>
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-3">
            <h3 className="pb-1 mb-4">My Enrolled Courses</h3>
            
            {enrolledCourses.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">You are not enrolled in any courses yet.</p>
                    <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                </div>
            ) : (
                <div className="row g-4">
                    {enrolledCourses.map((course) => (
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
                                    <div className="badge bg-success position-absolute top-0 end-0 m-2">
                                        Enrolled
                                    </div>
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-truncate">{course.title}</h5>
                                    <p className="card-text text-muted small">{course.techs}</p>
                                    <Link
                                        to={`/detail/${course.id}`}
                                        className="btn btn-outline-primary mt-auto align-self-start"
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyCourses;