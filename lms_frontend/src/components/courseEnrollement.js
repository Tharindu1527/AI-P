import { useState } from 'react';
import axios from 'axios';
import { FaLock, FaCheck, FaExclamationCircle } from 'react-icons/fa';

function CourseEnrollment({ course_id, user_id, setEnrollmentStatus }) {
    const [enrollmentKey, setEnrollmentKey] = useState('');
    const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const baseUrl = "http://127.0.0.1:8000/api";

    console.log('CourseEnrollment component received props:', { course_id, user_id });
    
    const handleEnrollment = async (e) => {
        e.preventDefault();

        if (!course_id) {
            setError('Course ID is missing');
            console.error('Course ID is missing', { course_id });
            return;
        }

        if (!user_id) {
            setError('User ID is missing');
            console.error('User ID is missing', { user_id });
            return;
        }

        if (!enrollmentKey.trim()) {
            setError('Please enter the enrollment key');
            return;
        }

        setEnrolling(true);
        setError(null);
        setSuccess(null);

        try {
            // Ensure all IDs are properly parsed as integers
            const userIdInt = parseInt(user_id);
            const courseIdInt = parseInt(course_id);
            
            if (isNaN(userIdInt) || isNaN(courseIdInt)) {
                throw new Error('Invalid user ID or course ID');
            }
            
            // Trim the enrollment key to remove any whitespace
            const trimmedKey = enrollmentKey.trim();
            
            console.log('Submitting enrollment with:', {
                user_type: 'student',
                user_id: userIdInt,
                course_id: courseIdInt,
                enrollment_key: trimmedKey
            });
            
            // First verify the enrollment key
            const verifyResponse = await axios.post(`${baseUrl}/verify-enrollment/`, {
                user_type: 'student',
                user_id: userIdInt,
                course_id: courseIdInt,
                enrollment_key: trimmedKey
            });

            console.log('Verify response:', verifyResponse.data);

            if (verifyResponse.data.status === 'success') {
                // If verification successful, create the enrollment
                const enrollResponse = await axios.post(`${baseUrl}/student-enroll-course/`, {
                    student: userIdInt,
                    course: courseIdInt
                });
                
                console.log('Enrollment response:', enrollResponse.data);
                
                setSuccess('Successfully enrolled in the course!');
                setShowEnrollmentForm(false);
                setEnrollmentKey('');
                
                // Update parent component state
                if (setEnrollmentStatus) {
                    setEnrollmentStatus(true);
                }
            } else {
                // Handle unexpected success response without success status
                setError('Verification failed: ' + (verifyResponse.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            
            if (error.response?.status === 400 && 
                error.response?.data?.message === 'Invalid enrollment key') {
                setError('The enrollment key you entered is incorrect. Please try again.');
            } else {
                setError(
                    error.response?.data?.message || 
                    'Error during enrollment. Please try again.'
                );
            }
        } finally {
            setEnrolling(false);
        }
    };

    if (!showEnrollmentForm) {
        return (
            <button 
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition duration-200 font-medium shadow-md"
                onClick={() => setShowEnrollmentForm(true)}
            >
                <FaLock className="mr-2" />
                Enroll in This Course
            </button>
        );
    }

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Course Enrollment Key</h3>
            
            {success && (
                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start">
                    <FaCheck className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                    <p>{success}</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
                    <FaExclamationCircle className="mt-1 mr-2 text-red-500 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            
            <form onSubmit={handleEnrollment}>
                <div className="mb-4">
                    <label htmlFor="enrollmentKey" className="block text-gray-700 mb-2">
                        Enrollment Key
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="enrollmentKey"
                        value={enrollmentKey}
                        onChange={(e) => setEnrollmentKey(e.target.value)}
                        placeholder="Enter the course enrollment key"
                        required
                    />
                    <p className="mt-2 text-sm text-gray-600">
                        This key is provided by your course instructor. Enter it exactly as provided.
                    </p>
                </div>
                
                <div className="flex space-x-4">
                    <button 
                        type="submit" 
                        className={`px-6 py-2 rounded-lg text-white font-medium ${
                            enrolling 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700'
                        } transition duration-200 shadow-sm`}
                        disabled={enrolling}
                    >
                        {enrolling ? 'Enrolling...' : 'Submit'}
                    </button>
                    <button
                        type="button"
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
                        onClick={() => {
                            setShowEnrollmentForm(false);
                            setError(null);
                            setEnrollmentKey('');
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CourseEnrollment;