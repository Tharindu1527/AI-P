import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';

function CourseDetail() {
    let { course_id } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [isLecturer, setIsLecturer] = useState(false);
    
    const studentId = localStorage.getItem('studentId');
    const lecturerId = localStorage.getItem('lecturerId'); // Add this to store lecturer ID
    const baseUrl = "http://127.0.0.1:8000/api";

    // Fetch course details, enrollment status, and check if user is lecturer
    useEffect(() => {
        // Fetch course details
        axios.get(`${baseUrl}/course/${course_id}/`)
            .then((res) => {
                setCourseData(res.data);
                // Check if the logged-in lecturer is the course owner
                if (lecturerId && res.data.lecturer === parseInt(lecturerId)) {
                    setIsLecturer(true);
                }
            })
            .catch(error => {
                console.log('Error fetching course details:', error);
            });

        // Check enrollment status if student is logged in
        if (studentId) {
            axios.get(`${baseUrl}/fetch-enrolled-courses/${studentId}`)
                .then((res) => {
                    const isEnrolled = res.data.some(course => course.id === parseInt(course_id));
                    setEnrollmentStatus(isEnrolled);
                })
                .catch(error => {
                    console.log('Error checking enrollment status:', error);
                });
        }

        // Fetch assignments if user is either the lecturer or an enrolled student
        if (lecturerId || enrollmentStatus) {
            axios.get(`${baseUrl}/course/${course_id}/assignments/`)
                .then((res) => {
                    setAssignments(res.data);
                })
                .catch(error => {
                    console.log('Error fetching assignments:', error);
                });
        }
    }, [course_id, studentId, lecturerId, enrollmentStatus]);

    // Handle course enrollment
    const enrollCourse = () => {
        const enrollData = {
            student: studentId,
            course: course_id
        };

        axios.post(`${baseUrl}/student-enroll-course/`, enrollData)
            .then((res) => {
                setEnrollmentStatus(true);
                alert('Successfully enrolled in the course!');
            })
            .catch((error) => {
                if (error.response?.status === 400) {
                    alert('You are already enrolled in this course.');
                } else {
                    alert('Error enrolling in course. Please try again.');
                }
            });
    };
    

    return (
        <div className="container mt-3">
            {/* Course Details Section */}
            <div className="row">
                <div className="col-4">
                    <img 
                        src={courseData?.featured_img || "/logo512.png"} 
                        className="img-thumbnail" 
                        alt="Course" 
                    />
                </div>
                <div className="col-8">
                    <h3>{courseData?.title || `Course Title (ID: ${course_id})`}</h3>
                    <p>{courseData?.description}</p>
                    <p className="fw-bold">Course By: <Link to={`/lecturer-detail/${courseData?.lecturer}`}>Lecturer {courseData?.lecturer}</Link></p>
                    <p className="fw-bold">Total Enrolled: {courseData?.enrolled_count || 0} Students</p>
                    
                    {/* Show Add Assignment button for lecturer */}
                    {isLecturer && (
                        <Link to={`/add-assignment/${course_id}`} className="btn btn-success mb-3">
                            Add New Assignment
                        </Link>
                    )}

                    {/* Enrollment Section for students */}
                    {studentId && !enrollmentStatus && (
                        <button 
                            onClick={enrollCourse}
                            className="btn btn-primary mt-3"
                        >
                            Enroll in Course
                        </button>
                    )}
                    {enrollmentStatus && (
                        <div className="alert alert-success mt-3">
                            You are enrolled in this course
                        </div>
                    )}
                </div>
            </div>

            {/* Assignments Section - Only visible to lecturer and enrolled students */}
            {(isLecturer || enrollmentStatus) && (
                <div className="card mt-4">
                    <h3 className="card-header">Course Assignments</h3>
                    <ul className="list-group list-group-flush">
                        {assignments.map((assignment, index) => (
                            <li className="list-group-item" key={index}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-1">{assignment.title}</h5>
                                        <small className="text-muted">
                                            Uploaded: {new Date(assignment.uploaded_at).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <a 
                                        href={assignment.file}
                                        className="btn btn-primary btn-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Download
                                    </a>
                                </div>
                            </li>
                        ))}
                        {assignments.length === 0 && (
                            <li className="list-group-item text-muted">
                                No assignments available for this course.
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Rest of your existing code (Course Videos, Related Courses, etc.) */}
        </div>
    );
}

export default CourseDetail;