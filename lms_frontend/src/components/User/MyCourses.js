import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MyCourses() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const studentId = localStorage.getItem('studentId');
    const baseUrl = "http://127.0.0.1:8000/api";

    useEffect(() => {
        if (studentId) {
            axios.get(`${baseUrl}/fetch-enrolled-courses/${studentId}`)
                .then((res) => {
                    setEnrolledCourses(res.data);
                });
        }
    }, [studentId]);

    return (
        <div className="container mt-3">
            <h3 className="pb-1 mb-4">My Enrolled Courses</h3>
            <div className="row">
                {enrolledCourses.map((course, index) => (
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
        </div>
    );
}

export default MyCourses;