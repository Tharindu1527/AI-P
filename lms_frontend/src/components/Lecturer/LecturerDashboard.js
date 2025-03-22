import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LecturerSidebar from "./LecturerSidebar";
import { FaBook, FaCalendarAlt, FaTasks, FaEye, FaSpinner, FaImage, FaUser } from "react-icons/fa";

const baseUrl = "http://127.0.0.1:8000/api";

function LecturerDashboard() {
    const navigate = useNavigate();
    const [lecturerProfile, setLecturerProfile] = useState({
        name: "",
        email: "",
        profileImagePath: null,
        role: "",
        department: "",
        joinedDate: ""
    });
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [courses, setCourses] = useState([]);
    const [courseImages, setCourseImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch and create blob URL for profile image
    const fetchProfileImage = async (imagePath) => {
        if (!imagePath) return null;
        
        // Store the actual full path for reference
        console.log("Dashboard: Original image path:", imagePath);
        
        // First check if we have a successful URL from last time
        const lastSuccessfulUrl = sessionStorage.getItem('lastSuccessfulImageUrl');
        if (lastSuccessfulUrl) {
            try {
                console.log("Dashboard: Trying last successful URL:", lastSuccessfulUrl);
                const timestamp = new Date().getTime();
                const urlWithTimestamp = `${lastSuccessfulUrl}?t=${timestamp}`;
                
                const response = await fetch(urlWithTimestamp, { cache: 'no-store' });
                if (response.ok) {
                    console.log("Dashboard: Successfully loaded from previous URL");
                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                }
            } catch (error) {
                console.log("Dashboard: Failed with last successful URL, trying alternatives");
            }
        }
        
        // Try multiple possible URL patterns for profile images
        const possiblePaths = [
            // 1. Try with full path as is
            imagePath,
            
            // 2. Try extracting filename and using media/profile_imgs path
            `http://127.0.0.1:8000/media/profile_imgs/${imagePath.split('/').pop()}`,
            
            // 3. Try with API prefix
            `http://127.0.0.1:8000/api/media/profile_imgs/${imagePath.split('/').pop()}`,
            
            // 4. Try a different media folder structure
            `http://127.0.0.1:8000/media/${imagePath.split('/').pop()}`
        ];
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const pathsWithTimestamp = possiblePaths.map(path => `${path}?t=${timestamp}`);
        
        // Log the paths we're going to try
        console.log("Dashboard: Trying image paths:", pathsWithTimestamp);
        
        // Try each path in sequence until one works
        for (const path of pathsWithTimestamp) {
            try {
                console.log("Dashboard: Attempting to fetch from:", path);
                const response = await fetch(path, { cache: 'no-store' });
                
                if (response.ok) {
                    console.log("Dashboard: Successful fetch from:", path);
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    
                    // Save the successful path for next time
                    sessionStorage.setItem('lastSuccessfulImageUrl', path.split('?')[0]); // Store without timestamp
                    
                    return blobUrl;
                }
            } catch (error) {
                console.log(`Dashboard: Failed to fetch from ${path}:`, error.message);
            }
        }
        
        console.error("Dashboard: All image fetch attempts failed for:", imagePath);
        return null;
    };

    useEffect(() => {
        // Check if lecturer is logged in
        const lecturerLoginStatus = localStorage.getItem('lecturerLoginStatus');
        const lecturerId = localStorage.getItem('lecturerId');

        if (lecturerLoginStatus !== 'true' || !lecturerId) {
            // Redirect to login if not logged in
            navigate('/lecturer-login');
            return;
        }

        // Set up interval to check for profile updates
        const checkInterval = setInterval(() => {
            const updated = sessionStorage.getItem('profileImageUpdated');
            if (updated) {
                console.log("Dashboard: Profile image update detected");
                sessionStorage.removeItem('profileImageUpdated');
                loadProfileData();
            }
        }, 1000);

        const loadProfileData = async () => {
            try {
                // First check if there's a stored image path in sessionStorage
                const storedImagePath = sessionStorage.getItem('profileImagePath');
                if (storedImagePath) {
                    console.log("Dashboard: Using stored image path from session:", storedImagePath);
                    const imageUrl = await fetchProfileImage(storedImagePath);
                    if (imageUrl) {
                        // Cleanup previous blob URL if it exists
                        if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(profileImageUrl);
                        }
                        setProfileImageUrl(imageUrl);
                    }
                }
            } catch (error) {
                console.error("Dashboard: Error loading stored profile image:", error);
            }
        };

        loadProfileData();
        fetchLecturerDetails(lecturerId);

        // Clean up on unmount
        return () => {
            clearInterval(checkInterval);
            if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(profileImageUrl);
            }
        };
    }, [navigate]);

    // Function to fetch lecturer details
    const fetchLecturerDetails = async (lecturerId) => {
        try {
            console.log("Dashboard: Fetching lecturer details for ID:", lecturerId);
            
            // Fetch lecturer profile
            const profileResponse = await axios.get(`${baseUrl}/lecturer/${lecturerId}/`);
            const profileData = profileResponse.data;
            
            console.log("Dashboard: Lecturer data received:", profileData);
            
            setLecturerProfile({
                name: profileData.full_name,
                email: profileData.email,
                profileImagePath: profileData.profile_image,
                role: `Lecturer in ${profileData.department}`,
                department: profileData.department,
                joinedDate: profileData.joinedDate || "Not Available"
            });

            // Fetch profile image if it exists
            if (profileData.profile_image) {
                console.log("Dashboard: Found profile image path:", profileData.profile_image);
                
                // Store path in sessionStorage
                sessionStorage.setItem('profileImagePath', profileData.profile_image);
                
                // Fetch the image
                const imageUrl = await fetchProfileImage(profileData.profile_image);
                if (imageUrl) {
                    // Cleanup previous blob URL if it exists
                    if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(profileImageUrl);
                    }
                    setProfileImageUrl(imageUrl);
                }
            }

            // Fetch lecturer's courses
            const coursesResponse = await axios.get(`${baseUrl}/lecturer-courses/${lecturerId}/`);
            setCourses(coursesResponse.data);

            setLoading(false);
        } catch (err) {
            console.error("Dashboard: Error fetching lecturer details:", err);
            setError("Failed to load lecturer information");
            setLoading(false);
        }
    };

    // Fetch course images
    useEffect(() => {
        const fetchCourseImages = async () => {
            const images = {};
            
            for (const course of courses) {
                if (course.featured_img) {
                    try {
                        // Extract the filename from the path
                        const filename = course.featured_img.split('/').pop();
                        
                        // Add cache-busting parameter
                        const timestamp = new Date().getTime();
                        const imageUrl = `${baseUrl}/media/course_imgs/${filename}?t=${timestamp}`;
                        
                        console.log(`Fetching image for course ${course.id} from:`, imageUrl);
                        
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
                            const timestamp = new Date().getTime();
                            const alternativeUrl = `http://127.0.0.1:8000/media/course_imgs/${filename}?t=${timestamp}`;
                            
                            console.log(`Trying alternative URL:`, alternativeUrl);
                            
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

        if (courses.length > 0) {
            fetchCourseImages();
        }
        
        // Cleanup function to revoke object URLs when component unmounts or courses change
        return () => {
            // Clean up course images
            Object.values(courseImages).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [courses]);

    // Placeholder data for events and assignments
    const upcomingEvents = [
        { id: 1, title: "Lab Guidelines", time: "10:00 AM" },
        { id: 2, title: "Assignment Deadline", time: "11:59 PM" }
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <LecturerSidebar />

            {/* Main Content */}
            <div className="flex-1 p-8 ml-64 transition-all duration-300">
                {/* Lecturer Profile Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Your Profile</h3>
                        <Link
                            to="/lecturer-profile-settings"
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                            <FaEye className="mr-2" /> View Full Profile
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center bg-gray-200">
                            {profileImageUrl ? (
                                <img
                                    src={profileImageUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser className="text-4xl text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-gray-800">{lecturerProfile.name}</h4>
                            <p className="text-gray-600">{lecturerProfile.email}</p>
                            <p className="text-gray-500 mt-2">{lecturerProfile.role}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Courses Card */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-md text-white hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Total Courses</h3>
                                <p className="text-2xl font-bold">{courses.length}</p>
                            </div>
                            <FaBook className="text-3xl opacity-80" />
                        </div>
                    </div>

                    {/* Upcoming Events Card */}
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-md text-white hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Upcoming Events</h3>
                                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                            </div>
                            <FaCalendarAlt className="text-3xl opacity-80" />
                        </div>
                    </div>

                    {/* Pending Assignments Card */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-lg shadow-md text-white hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Pending Assignments</h3>
                                <p className="text-2xl font-bold">3</p>
                            </div>
                            <FaTasks className="text-3xl opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Your Courses</h3>
                        <Link
                            to={`/lecturer-courses`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="w-full h-40 rounded-md mb-4 overflow-hidden bg-gray-100">
                                    {courseImages[course.id] ? (
                                        <img
                                            src={courseImages[course.id]}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <FaImage className="text-gray-400 text-4xl" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-lg font-medium text-gray-700 line-clamp-1">{course.title}</h4>
                                <p className="text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                                <div className="flex justify-between items-center">
                                    <Link
                                        to={`/detail/${course.id}`}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Calendar</h3>
                        <Link
                            to="/lecturer-calendar"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View Full Calendar →
                        </Link>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        {upcomingEvents.length === 0 ? (
                            <p className="text-gray-600 mb-4">No events scheduled for today.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-700">{event.title}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{event.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LecturerDashboard;