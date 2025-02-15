import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AllCourses() {
    const [courseData, setCourseData] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const baseUrl = "http://127.0.0.1:8000/api";

    // Fetch all courses
    useEffect(() => {
        try {
            axios.get(baseUrl + '/course/')
                .then((res) => {
                    setCourseData(res.data);
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

    // Handle course selection
    const handleSelectCourse = (id) => {
        setSelectedCourseId(id);
    };

    return (
        <div className="container my-5">
            <div className="text-center mb-5">
                <h1 className="display-5 fw-bold">Discover Your Next Course</h1>
                <p className="text-muted">Browse through our latest and greatest offerings!</p>
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
                                <img
                                    src={course.featured_img}
                                    className="card-img-top rounded-top"
                                    alt={course.title}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="badge bg-primary position-absolute top-0 end-0 m-2">
                                    New
                                </div>
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-truncate">{course.title}</h5>
                                <p className="card-text text-muted small">{course.techs}</p>
                                <Link
                                    to={`/detail/${course.id}`}
                                    className="btn btn-outline-primary mt-auto align-self-start"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {/* Pagination */}
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

        </div>
    );
}

export default AllCourses;



