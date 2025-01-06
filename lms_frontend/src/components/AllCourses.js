import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AllCourses() {
    const [courseData, setCourseData] = useState([]);
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

    return (
        <div className="container mt-3">
            {/* Latest Courses */}
            <h3 className="pb-1 mb-4 mt-5">Latest Courses</h3>
            <div className="row">
                {courseData.map((course, index) => (
                    <div className="col-md-3 mb-4" key={index}>
                        <div className="card">
                            <img 
                                src={course.featured_img} 
                                className="card-img-top" 
                                alt={course.title}
                                style={{height: "200px", objectFit: "cover"}}
                            />
                            <div className="card-body">
                                <h5 className="card-title">
                                    <Link to={`/detail/${course.id}`}>{course.title}</Link>
                                </h5>
                                <p className="card-text">{course.techs}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-center">
                    <li className="page-item">
                        <a className="page-link" href="#" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item">
                        <a className="page-link" href="#" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default AllCourses;