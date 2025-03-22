import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaBook, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaDownload, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaUsers, 
  FaCalendarAlt,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight,
  FaEye
} from "react-icons/fa";
import CourseEnrollment from "./courseEnrollement";

const useAuthCheck = () => {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        userRole: null,
        userId: null,
        isLoading: true
    });
    

    useEffect(() => {
        const checkAuth = () => {
            const lecturerLoginStatus = localStorage.getItem("lecturerLoginStatus");
            const studentLoginStatus = localStorage.getItem("studentLoginStatus");
            const lecturerId = localStorage.getItem("lecturerId");
            const studentId = localStorage.getItem("studentId");

            if (lecturerLoginStatus === "true" && studentLoginStatus === "true") {
                localStorage.clear();
                navigate('/user-login', { 
                    state: { error: "Invalid login state detected. Please login again." }
                });
                return;
            }

            if (lecturerLoginStatus === "true" && lecturerId) {
                setAuthState({
                    isAuthenticated: true,
                    userRole: "lecturer",
                    userId: lecturerId,
                    isLoading: false
                });
                return;
            }

            if (studentLoginStatus === "true" && studentId) {
                setAuthState({
                    isAuthenticated: true,
                    userRole: "student",
                    userId: studentId,
                    isLoading: false
                });
                return;
            }

            setAuthState({
                isAuthenticated: false,
                userRole: null,
                userId: null,
                isLoading: false
            });
            navigate('/user-login');
        };

        checkAuth();
    }, [navigate]);

    return authState;
};

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-100 mr-2 text-xl" />;
            case 'error':
                return <FaExclamationCircle className="text-red-100 mr-2 text-xl" />;
            default:
                return <FaInfoCircle className="text-blue-100 mr-2 text-xl" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-green-600 to-green-500';
            case 'error':
                return 'bg-gradient-to-r from-red-600 to-red-500';
            default:
                return 'bg-gradient-to-r from-blue-600 to-blue-500';
        }
    };

    return (
        <div className={`fixed top-4 right-4 max-w-md rounded-lg shadow-lg border ${getBgColor()} border-gray-200 z-50 transform transition-all animate-fade-in-down`}>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    {getIcon()}
                    <span className="text-white font-medium">{message}</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-white ml-4 hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};

function CourseDetail() {
    const { course_id } = useParams();
    const { isAuthenticated, userRole, userId, isLoading: authLoading } = useAuthCheck();
    const [courseData, setCourseData] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [isCourseLecturer, setIsCourseLecturer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [imageBlob, setImageBlob] = useState(null);

    const baseUrl = "http://127.0.0.1:8000/api";
    const navigate = useNavigate();

    const navigateToLecturer = (lecturerId) => {
        navigate(`/lecturer-detail/${lecturerId}`);
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const clearNotification = () => {
        setNotification(null);
    };

    const handleDeleteAssignment = async (assignmentId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
        if (!confirmDelete) return;
    
        try {
            // Updated URL to match the new endpoint
            await axios.delete(`${baseUrl}/course/${course_id}/assignment/${assignmentId}/`);
            setAssignments(prevAssignments => prevAssignments.filter(assignment => assignment.id !== assignmentId));
            showNotification('Assignment deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting assignment:', error);
            showNotification('Failed to delete assignment.', 'error');
        }
    };
    

    const handleDeleteCourse = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this course?');
        if (!confirmDelete) return;

        try {
            await axios.delete(`${baseUrl}/course/${course_id}`);
            showNotification('Course deleted successfully.', 'success');
            setTimeout(() => navigate('/courses'), 1500);
        } catch (error) {
            console.error('Error deleting course:', error);
            showNotification('Failed to delete course.', 'error');
        }
    };

    const handleDownloadAssignment = async (assignment) => {
        try {
            // Extract just the filename from the assignment.file path
            const filenameParts = assignment.file.split('/');
            const filename = filenameParts[filenameParts.length - 1];
            
            // Construct the correct URL using just the filename
            const fileUrl = `${baseUrl}/media/course_assignment/${filename}`;
            
            console.log("Loading file from:", fileUrl);
            
            // Fetch the file blob
            const response = await axios.get(fileUrl, {
                responseType: 'blob'
            });
    
            // Create a blob with the correct MIME type for PDFs
            let blob;
            const isPdf = filename.toLowerCase().endsWith('.pdf');
            
            if (isPdf) {
                // Force the correct MIME type for PDFs
                blob = new Blob([response.data], { type: 'application/pdf' });
            } else {
                // Use the original blob
                blob = new Blob([response.data]);
            }
            
            // Create a blob URL for the file
            const blobUrl = window.URL.createObjectURL(blob);
            
            if (isPdf) {
                // Create modal container
                const modal = document.createElement('div');
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                modal.style.zIndex = '9999';
                modal.style.display = 'flex';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
                
                // Create preview container
                const previewContainer = document.createElement('div');
                previewContainer.style.width = '80%';
                previewContainer.style.height = '85%';
                previewContainer.style.backgroundColor = 'white';
                previewContainer.style.borderRadius = '8px';
                previewContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                previewContainer.style.display = 'flex';
                previewContainer.style.flexDirection = 'column';
                previewContainer.style.overflow = 'hidden';
                
                // Create header
                const header = document.createElement('div');
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';
                header.style.padding = '12px 16px';
                header.style.borderBottom = '1px solid #e0e0e0';
                
                // Add title
                const title = document.createElement('h3');
                title.textContent = filename;
                title.style.margin = '0';
                title.style.fontSize = '18px';
                
                // Add buttons container
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '10px';
                
                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = 'Download';
                downloadBtn.style.backgroundColor = '#4CAF50';
                downloadBtn.style.color = 'white';
                downloadBtn.style.border = 'none';
                downloadBtn.style.padding = '8px 16px';
                downloadBtn.style.borderRadius = '4px';
                downloadBtn.style.cursor = 'pointer';
                
                // Add close button
                const closeBtn = document.createElement('button');
                closeBtn.textContent = 'Close';
                closeBtn.style.backgroundColor = '#f44336';
                closeBtn.style.color = 'white';
                closeBtn.style.border = 'none';
                closeBtn.style.padding = '8px 16px';
                closeBtn.style.borderRadius = '4px';
                closeBtn.style.cursor = 'pointer';
                
                // Create PDF viewer
                const viewer = document.createElement('iframe');
                viewer.style.width = '100%';
                viewer.style.height = '100%';
                viewer.style.border = 'none';
                viewer.src = blobUrl + '#toolbar=0';
                
                // Add event listeners
                downloadBtn.addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showNotification('File downloaded successfully', 'success');
                });
                
                closeBtn.addEventListener('click', () => {
                    document.body.removeChild(modal);
                    window.URL.revokeObjectURL(blobUrl);
                });
                
                // Assemble modal
                buttonContainer.appendChild(downloadBtn);
                buttonContainer.appendChild(closeBtn);
                header.appendChild(title);
                header.appendChild(buttonContainer);
                previewContainer.appendChild(header);
                previewContainer.appendChild(viewer);
                modal.appendChild(previewContainer);
                
                // Add modal to body
                document.body.appendChild(modal);
                
                // Also allow clicking outside to close
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                        window.URL.revokeObjectURL(blobUrl);
                    }
                });
            } else {
                // For non-PDF files, just download directly
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                showNotification('File downloaded successfully', 'success');
            }
        } catch (error) {
            console.error('Preview/download failed:', error);
            showNotification('Failed to load the file', 'error');
        }
    };

    useEffect(() => {
        const fetchCourseImage = async () => {
          if (!courseData || !courseData.featured_img) return;
      
          try {
            // Construct the URL directly
            const imageUrl = `http://127.0.0.1:8000/api/media/course_imgs/${courseData.featured_img.split('/').pop()}`;
      
            console.log("Attempting to fetch image from:", imageUrl);
      
            const response = await axios.get(imageUrl, {
              responseType: 'blob',
            });
      
            const blobUrl = URL.createObjectURL(response.data);
            setImageBlob(blobUrl);
            
          } catch (error) {
            console.error('Error loading course image:', error);
      
            // If you still want to try an alternative URL, handle it here
            if (error.response?.status === 404 && courseData.featured_img) {
              try {
                // Try with an alternative construction if needed
                const alternativeUrl = `http://127.0.0.1:8000/api/media/course_imgs/${courseData.featured_img.split('/').pop()}`;
                console.log("Trying alternative URL:", alternativeUrl);
      
                const response = await axios.get(alternativeUrl, {
                  responseType: 'blob',
                });
      
                const blobUrl = URL.createObjectURL(response.data);
                setImageBlob(blobUrl);
      
              } catch (secondError) {
                console.error('Second attempt failed:', secondError);
              }
            }
          }
        };
      
        if (courseData?.featured_img) {
          fetchCourseImage();
        }
      
        // Cleanup
        return () => {
          if (imageBlob) {
            URL.revokeObjectURL(imageBlob);
          }
        };
      }, [courseData]); // Removed imageBlob from the dependency array
      
      

    useEffect(() => {
        if (!isAuthenticated || authLoading) return;
        if (!course_id) {
            setError('No course ID provided');
            setIsLoading(false);
            return;
        }

        const loadCourseData = async () => {
            setIsLoading(true);
            try {
                const courseResponse = await axios.get(`${baseUrl}/course/${course_id}/`);
                setCourseData(courseResponse.data);

                if (userRole === "lecturer") {
                    const isLecturer = courseResponse.data.lecturer === parseInt(userId);
                    setIsCourseLecturer(isLecturer);
                    if (isLecturer) {
                        setEnrollmentStatus(true);
                    }
                }

                if (userRole === "student") {
                    const enrollmentResponse = await axios.get(
                        `${baseUrl}/fetch-enrolled-courses/${userId}?user_type=student`
                    );
                    const isEnrolled = enrollmentResponse.data.some(
                        (course) => course.id === parseInt(course_id)
                    );
                    setEnrollmentStatus(isEnrolled);
                }

                const assignmentsResponse = await axios.get(
                    `${baseUrl}/course/${course_id}/assignments/`
                );
                console.log("Assignments Data:", assignmentsResponse.data);
                setAssignments(assignmentsResponse.data);
                

            } catch (error) {
                console.error("Error loading course data:", error);
                setError(error.response?.data?.message || "Failed to load course data");
            } finally {
                setIsLoading(false);
            }
        };

        loadCourseData();
    }, [course_id, isAuthenticated, userRole, userId, authLoading]);

    const [enrollmentCount, setEnrollmentCount] = useState(0);

// Add this function to fetch enrollment count
const fetchEnrollmentCount = async () => {
    if (!course_id) return;
    
    try {
        // Assuming your backend has this endpoint
        const response = await axios.get(`${baseUrl}/course/${course_id}/enrollment-count/`);
        if (response.data && response.data.count !== undefined) {
            setEnrollmentCount(response.data.count);
        }
    } catch (error) {
        console.error("Error fetching enrollment count:", error);
        
        // Alternative approach if the endpoint doesn't exist
        try {
            // Try getting all enrollments for this course
            const allEnrollmentsResponse = await axios.get(`${baseUrl}/course-enrollments/${course_id}/`);
            if (allEnrollmentsResponse.data && Array.isArray(allEnrollmentsResponse.data)) {
                setEnrollmentCount(allEnrollmentsResponse.data.length);
            }
        } catch (secondError) {
            console.error("Alternative enrollment count fetch failed:", secondError);
            // Use the count from courseData as a fallback
            if (courseData?.enrolled_count) {
                setEnrollmentCount(courseData.enrolled_count);
            }
        }
    }
};

// Add this to your existing useEffect
useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (!course_id) return;
    
    fetchEnrollmentCount();
}, [course_id, courseData, isAuthenticated, authLoading]);

    if (authLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200 max-w-md">
                    <FaInfoCircle className="text-blue-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-700 mb-6">Please log in to view course details.</p>
                    <Link to="/user-login" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition duration-200 font-medium">
                        Login to Continue
                    </Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200 max-w-md">
                    <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
                    <p className="text-red-500 font-medium mb-2">Error</p>
                    <p className="text-gray-700">{error}</p>
                    <Link to="/courses" className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Notification Component */}
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={clearNotification} 
                />
            )}

            {/* Course Header */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="bg-white p-1 rounded-lg shadow-md">
                    {imageBlob ? (
                        <img 
                        src={imageBlob} 
                        className="w-36 h-36 rounded-lg object-cover"
                        alt="Course" 
                        />
                    ) : (
                        <div className="w-36 h-36 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Loading...</span>
                        </div>
                    )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{courseData?.title || `Course Title (ID: ${course_id})`}</h1>
                            <p className="text-blue-100 mb-4 max-w-3xl">{courseData?.description}</p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center text-blue-100 bg-gray-300 bg-opacity-50 px-4 py-2 rounded-full">
                                    <FaChalkboardTeacher className="mr-2" />
                                    <span className="mr-2">Lecturer:</span>
                                    {courseData?.lecturer ? (
                                              <button
                                              onClick={() => navigateToLecturer(courseData?.lecturer)}
                                              className="bg-white text-gray-300 font-medium px-3 py-1 rounded-full hover:bg-blue-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 flex items-center"
                                              type="button"
                                          >
                                              {courseData?.lecturer_name || `ID: ${courseData?.lecturer}`}
                                          </button>
                                    ) : (
                                        <span>Not assigned</span>
                                    )}
                                </div>
                                <div className="flex items-center text-blue-100 bg-gray-300 bg-opacity-50 px-4 py-2 rounded-full">
                                    <FaUserGraduate className="mr-2" />
                                    <span>Enrolled: {enrollmentCount} Students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-6">
                {userRole === "lecturer" && isCourseLecturer && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Course Management</h2>
                        <div className="flex flex-wrap gap-4">
                            <Link to={`/add-assignment/${course_id}`} className="flex items-center px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition duration-200">
                                <FaPlus className="mr-2" />
                                Add Assignment
                            </Link>
                            <Link to={`/edit-course/${course_id}`} className="flex items-center px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition duration-200">
                                <FaEdit className="mr-2" />
                                Edit Course
                            </Link>
                            <button 
                                className="flex items-center px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-600 transition duration-200"
                                onClick={handleDeleteCourse}
                            >
                                <FaTrash className="mr-2" />
                                Delete Course
                            </button>
                        </div>
                    </div>
                )}

                    {userRole === "student" && !enrollmentStatus && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Enroll in this Course</h2>
                            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 mb-6">
                                <div className="flex items-start">
                                    <FaInfoCircle className="text-blue-500 mt-1 mr-3 text-xl" />
                                    <p className="text-gray-700">To access course details and assignments, please enroll in this course. Enrollment gives you access to all course materials and assignments.</p>
                                </div>
                            </div>
                            {/* Fixed CourseEnrollment component props */}
                            <CourseEnrollment 
                                course_id={course_id} 
                                user_id={userId}
                                setEnrollmentStatus={setEnrollmentStatus}
                            />
                        </div>
                    )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
                        {isCourseLecturer && (
                            <Link to={`/add-assignment/${course_id}`} className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition duration-200">
                                <FaPlus className="mr-2" />
                                Add New Assignment
                            </Link>
                        )}
                    </div>
                    
                    {assignments.length > 0 ? (
                        <div className="grid gap-4">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition duration-200 transform hover:-translate-y-1">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                        <div className="flex items-center mb-2">
                                                <FaBook className="mr-3 text-blue-600" />
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {`${assignment.title}` || `Assignment ${assignment.id}`}
                                                </h3>
                                            </div>
                                            <div className="flex items-center text-gray-600 mb-2">
                                                <FaCalendarAlt className="mr-2" />
                                                <span>Uploaded: {new Date(assignment.uploaded_at).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}</span>
                                            </div>
                                            {assignment.description && (
                                                <p className="text-gray-600 mb-3">{assignment.description}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                        <div className="flex flex-wrap gap-2">
                                                    
                                                    
                                        {assignment.file && (
                                                    
                                                        
                                                        <button 
                                                            onClick={() => handleDownloadAssignment(assignment)}
                                                            className="flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition duration-200"
                                                        >
                                                            <FaDownload className="mr-2" />
                                                            Download
                                                        </button>
                                                   
                                                )}
                                            </div>
                                            {isCourseLecturer && (
                                                <>
                                                    <Link 
                                                        to={`/edit-assignment/${course_id}/${assignment.id}`} 
                                                        className="flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition duration-200"
                                                    >
                                                        <FaEdit className="mr-2" />
                                                        Edit
                                                    </Link>
                                                    <Link 
                                                to={`/view-assignment`} 
                                                className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                                            >
                                                <FaEye className="mr-2" />
                                                View Submission
                                            </Link>
                                                    <button 
                                                        className="flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition duration-200"
                                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                                    >
                                                        <FaTrash className="mr-2" />
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                            <FaBook className="text-gray-400 text-4xl mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No assignments available for this course yet.</p>
                            {isCourseLecturer && (
                                <Link 
                                    to={`/add-assignment/${course_id}`}
                                    className="mt-4 inline-block px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                                >
                                    <FaPlus className="inline-block mr-2" />
                                    Add First Assignment
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;