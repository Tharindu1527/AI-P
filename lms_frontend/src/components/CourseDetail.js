import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CourseDetail() {
    const { course_id } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [isLecturer, setIsLecturer] = useState(false);

    const studentId = localStorage.getItem("studentId");
    const lecturerId = localStorage.getItem("lecturerId");
    const baseUrl = "http://127.0.0.1:8000/api";

    // Fetch course and related data
    useEffect(() => {
        axios
            .get(`${baseUrl}/course/${course_id}/`)
            .then((res) => {
                setCourseData(res.data);
                if (lecturerId && res.data.lecturer === parseInt(lecturerId)) {
                    setIsLecturer(true);
                }
            })
            .catch((error) => console.log("Error fetching course details:", error));

        if (studentId) {
            axios
                .get(`${baseUrl}/fetch-enrolled-courses/${studentId}`)
                .then((res) => {
                    const isEnrolled = res.data.some(
                        (course) => course.id === parseInt(course_id)
                    );
                    setEnrollmentStatus(isEnrolled);
                })
                .catch((error) =>
                    console.log("Error checking enrollment status:", error)
                );
        }

        if (lecturerId || enrollmentStatus) {
            axios
                .get(`${baseUrl}/course/${course_id}/assignments/`)
                .then((res) => setAssignments(res.data))
                .catch((error) =>
                    console.log("Error fetching assignments:", error)
                );
        }
    }, [course_id, studentId, lecturerId, enrollmentStatus]);

    // Enroll in course
    const enrollCourse = () => {
        const enrollData = {
            student: studentId,
            course: course_id,
        };

        axios
            .post(`${baseUrl}/student-enroll-course/`, enrollData)
            .then(() => {
                setEnrollmentStatus(true);
                toast.success("Successfully enrolled in the course!");
            })
            .catch((error) => {
                if (error.response?.status === 400) {
                    toast.warning("You are already enrolled in this course.");
                } else {
                    toast.error("Error enrolling in course. Please try again.");
                }
            });
    };

    // Navigate to assignment submission
    const handleSubmit = (assignmentId) => {
        navigate(`/submit-assignment/${course_id}/${assignmentId}`);
    };

    return (
        <div className="container my-5">
            <ToastContainer />
            <div className="bg-light p-5 rounded shadow-lg">
                {/* Header Section */}
                <div className="row align-items-center">
                    <div className="col-lg-4 text-center mb-4 mb-lg-0">
                        <img
                            src={courseData?.featured_img || "/placeholder.png"}
                            className="rounded img-fluid shadow"
                            alt="Course"
                            style={{ maxHeight: "300px" }}
                        />
                    </div>
                    <div className="col-lg-8">
                        <h1 className="display-5 fw-bold">{courseData?.title}</h1>
                        <p className="lead text-muted">{courseData?.description}</p>
                        <p>
                            <strong>Lecturer:</strong>{" "}
                            <Link
                                to={`/lecturer-detail/${courseData?.lecturer}`}
                                className="text-primary"
                            >
                                Lecturer {courseData?.lecturer}
                            </Link>
                        </p>
                        <p>
                            <strong>Enrolled Students:</strong>{" "}
                            {courseData?.enrolled_count || 0}
                        </p>

                        {/* Actions */}
                        {isLecturer ? (
                            <Link
                                to={`/add-assignment/${course_id}`}
                                className="btn btn-success btn-lg mt-3"
                            >
                                Add Assignment
                            </Link>
                        ) : (
                            <>
                                {!enrollmentStatus ? (
                                    <button
                                        onClick={enrollCourse}
                                        className="btn btn-primary btn-lg mt-3"
                                    >
                                        Enroll Now
                                    </button>
                                ) : (
                                    <div className="alert alert-success mt-3">
                                        You are enrolled in this course.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Assignments Section */}
            {(isLecturer || enrollmentStatus) && (
                <div className="card mt-5 border-0 shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <h3>Assignments</h3>
                    </div>
                    <ul className="list-group list-group-flush">
                        {assignments.length > 0 ? (
                            assignments.map((assignment) => (
                                <li
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                    key={assignment.id}
                                >
                                    <div>
                                        <h5 className="mb-1">{assignment.title}</h5>
                                        <small className="text-muted">
                                            Uploaded on:{" "}
                                            {new Date(
                                                assignment.uploaded_at
                                            ).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <div>
                                        <a
                                            href={assignment.file}
                                            className="btn btn-outline-primary me-2"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Download
                                        </a>
                                        {enrollmentStatus && !isLecturer && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    handleSubmit(assignment.id)
                                                }
                                            >
                                                Submit
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item text-center text-muted">
                                No assignments available for this course.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default CourseDetail;

