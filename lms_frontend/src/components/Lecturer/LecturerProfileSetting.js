import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaGraduationCap, FaTrash, FaCamera, FaArrowLeft, FaEdit, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "http://127.0.0.1:8000/api";

function LecturerProfile() {
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [lecturerData, setLecturerData] = useState({
    id: '',
    full_name: '',
    email: '',
    department: '',
    mobile_no: '',
    address: '',
    qualification: '',
    bio: "Experienced Lecturer with a passion for teaching and research.",
    profile_image: null
  });
  const [isEditing, setIsEditing] = useState({
    bio: false,
    profile: false
  });
  const [editableData, setEditableData] = useState({});
  const navigate = useNavigate();

  // Function to fetch and create blob URL for profile image
  const fetchProfileImage = async (imagePath) => {
    if (!imagePath) return null;
    
    // Store the actual full path for reference
    console.log("Original image path:", imagePath);
    
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
    console.log("Trying image paths:", pathsWithTimestamp);
    
    // Try each path in sequence until one works
    for (const path of pathsWithTimestamp) {
      try {
        console.log("Attempting to fetch from:", path);
        const response = await fetch(path, { cache: 'no-store' });
        
        if (response.ok) {
          console.log("Successful fetch from:", path);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          // Also save to sessionStorage for other components to use
          sessionStorage.setItem('profileImagePath', imagePath);
          sessionStorage.setItem('lastSuccessfulImageUrl', path.split('?')[0]); // Store without timestamp
          
          return blobUrl;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${path}:`, error.message);
      }
    }
    
    console.error("All image fetch attempts failed for:", imagePath);
    return null;
  };

  // Fetch lecturer details on component mount
  useEffect(() => {
    // Check if lecturer is logged in
    const lecturerLoginStatus = localStorage.getItem('lecturerLoginStatus');
    const lecturerId = localStorage.getItem('lecturerId');

    if (lecturerLoginStatus !== 'true' || !lecturerId) {
      // Redirect to login if not logged in
      navigate('/lecturer-login');
      return;
    }

    const loadLecturerData = async () => {
      try {
        console.log("Fetching lecturer details for ID:", lecturerId);
        
        // Fetch lecturer profile
        const response = await axios.get(`${baseUrl}/lecturer/${lecturerId}/`);
        const lecturerDetails = response.data;
        
        console.log("Lecturer details received:", lecturerDetails);
        
        setLecturerData({
          id: lecturerDetails.id,
          full_name: lecturerDetails.full_name || 'Dr. Jane Doe',
          email: lecturerDetails.email || '',
          department: lecturerDetails.department || 'Not Specified',
          mobile_no: lecturerDetails.mobile_no || 'N/A',
          address: lecturerDetails.address || 'N/A',
          qualification: lecturerDetails.qualification || 'N/A',
          bio: lecturerDetails.bio || "Experienced Lecturer with a passion for teaching and research.",
          profile_image: lecturerDetails.profile_image
        });

        // Set initial editable data
        setEditableData({
          full_name: lecturerDetails.full_name,
          mobile_no: lecturerDetails.mobile_no,
          address: lecturerDetails.address,
          qualification: lecturerDetails.qualification,
          bio: lecturerDetails.bio || "Experienced Lecturer with a passion for teaching and research."
        });

        // Fetch profile image if it exists
        if (lecturerDetails.profile_image) {
          const imageUrl = await fetchProfileImage(lecturerDetails.profile_image);
          if (imageUrl) {
            setProfileImageUrl(imageUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching lecturer details:", error);
        toast.error("Failed to fetch lecturer details");
      }
    };

    loadLecturerData();
    
    // Clean up blob URL when component unmounts
    return () => {
      if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrl);
      }
    };
  }, [navigate]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Image file selected:", file.name);
      
      // Create a preview of the image
      const imagePreviewUrl = URL.createObjectURL(file);
      
      // Clean up previous blob URL if exists
      if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageUrl);
      }
      
      // Show preview immediately
      setProfileImageUrl(imagePreviewUrl);

      // Create FormData to upload image
      const formData = new FormData();
      formData.append('profile_image', file);
      formData.append('lecturer_id', lecturerData.id);

      console.log("Uploading profile image for lecturer ID:", lecturerData.id);

      // Send image to backend
      axios.post(`${baseUrl}/update-profile-image/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(response => {
        console.log("Profile image upload response:", response.data);
        toast.success("Profile image updated successfully");
        
        // If the response contains the updated image path, update it
        if (response.data && response.data.image_url) {
          const newImagePath = response.data.image_url;
          console.log("New profile image path:", newImagePath);
          
          // Update lecturer data with new image path
          setLecturerData(prev => ({
            ...prev,
            profile_image: newImagePath
          }));
          
          // Store the path in sessionStorage
          sessionStorage.setItem('profileImagePath', newImagePath);
          sessionStorage.setItem('profileImageUpdated', Date.now().toString());
        }
      }).catch(error => {
        console.error("Error uploading profile image:", error);
        toast.error("Failed to update profile image");
        
        // Revoke the preview URL since upload failed
        URL.revokeObjectURL(imagePreviewUrl);
        
        // Reset to previous image if there was one
        if (lecturerData.profile_image) {
          fetchProfileImage(lecturerData.profile_image)
            .then(url => {
              if (url) setProfileImageUrl(url);
            });
        } else {
          setProfileImageUrl(null);
        }
      });
    }
  };

  const handleRemoveImage = () => {
    // Clean up blob URL
    if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(profileImageUrl);
    }
    
    // Send request to backend to remove profile image
    console.log("Removing profile image for lecturer:", lecturerData.id);
    
    axios.post(`${baseUrl}/remove-profile-image/`, {
      lecturer_id: lecturerData.id
    }).then(response => {
      console.log("Profile image removal response:", response.data);
      
      setProfileImageUrl(null);
      setLecturerData(prev => ({
        ...prev,
        profile_image: null
      }));
      
      // Clear from sessionStorage
      sessionStorage.removeItem('profileImagePath');
      sessionStorage.removeItem('lastSuccessfulImageUrl');
      sessionStorage.setItem('profileImageUpdated', Date.now().toString());
      
      toast.success("Profile image removed");
    }).catch(error => {
      console.error("Error removing profile image:", error);
      toast.error("Failed to remove profile image");
    });
  };

  const handleGoToDashboard = () => {
    navigate("/lecturer-dashboard");
  };

  const toggleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));

    // If switching from edit to view, save changes
    if (isEditing[field]) {
      // Prepare update data
      const updateData = {
        ...lecturerData,
        ...editableData
      };

      console.log("Updating profile with data:", updateData);

      // Send update to backend
      axios.patch(`${baseUrl}/lecturer/${lecturerData.id}/`, updateData)
        .then(response => {
          console.log("Profile update response:", response.data);
          
          // Update local state with response data
          setLecturerData(prev => ({
            ...prev,
            ...response.data
          }));
          
          toast.success("Profile updated successfully");
        })
        .catch(error => {
          console.error("Error updating profile:", error);
          toast.error("Failed to update profile");
        });
    }
  };

  const handleInputChange = (e, field) => {
    setEditableData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleLogout = () => {
    // Clean up blob URL before logout
    if (profileImageUrl && profileImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(profileImageUrl);
    }
    
    // Clear localStorage and sessionStorage
    localStorage.removeItem('lecturerLoginStatus');
    localStorage.removeItem('lecturerId');
    
    // Redirect to login page
    navigate('/lecturer-login');
  };

  return (
    <div className="bg-gradient-to-r mt-2 from-green-50 to-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto border border-gray-300">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleGoToDashboard}
            className="flex items-center space-x-2 text-green-500 hover:text-green-700 transition duration-200"
          >
            <FaArrowLeft className="text-lg" />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white rounded-lg py-2 px-4 transition duration-200"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 p-4">
            <div className="relative w-48 h-48 mx-auto">
              <div className="rounded-full w-full h-full bg-gray-200 flex items-center justify-center shadow-md overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-8xl text-gray-600" />
                )}
              </div>
              <label
                htmlFor="imageUpload"
                className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-700 text-white rounded-full p-2 cursor-pointer"
              >
                <FaCamera className="text-sm" />
                <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {profileImageUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-2 cursor-pointer"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full md:w-2/3 p-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Lecturer Profile</h2>
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                  <FaUser className="text-xl text-gray-600" />
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500">Full Name</p>
                  {isEditing.profile ? (
                    <input
                      type="text"
                      value={editableData.full_name}
                      onChange={(e) => handleInputChange(e, 'full_name')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-800">{lecturerData.full_name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <ProfileDetail icon={<FaEnvelope />} label="Email" value={lecturerData.email} />

              {/* Department */}
              <ProfileDetail icon={<FaGraduationCap />} label="Department" value={lecturerData.department} />

              {/* Mobile Number */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                  <FaPhone className="text-xl text-gray-600" />
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  {isEditing.profile ? (
                    <input
                      type="text"
                      value={editableData.mobile_no}
                      onChange={(e) => handleInputChange(e, 'mobile_no')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-800">{lecturerData.mobile_no}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                  <FaMapMarkerAlt className="text-xl text-gray-600" />
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500">Address</p>
                  {isEditing.profile ? (
                    <textarea
                      value={editableData.address}
                      onChange={(e) => handleInputChange(e, 'address')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-800">{lecturerData.address}</p>
                  )}
                </div>
              </div>

              {/* Qualification */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                  <FaGraduationCap className="text-xl text-gray-600" />
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500">Qualification</p>
                  {isEditing.profile ? (
                    <input
                      type="text"
                      value={editableData.qualification}
                      onChange={(e) => handleInputChange(e, 'qualification')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-800">{lecturerData.qualification}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                  <FaEdit className="text-xl text-gray-600" />
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500">Bio</p>
                  {isEditing.bio ? (
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={editableData.bio}
                      onChange={(e) => handleInputChange(e, 'bio')}
                      rows={3}
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-800">{lecturerData.bio}</p>
                  )}
                </div>
              </div>

              {/* Edit buttons */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => toggleEdit('profile')}
                  className="bg-green-500 hover:bg-green-700 text-white rounded-lg py-2 px-4 transition duration-200"
                >
                  {isEditing.profile ? 'Save Profile' : 'Edit Profile'}
                </button>
                <button
                  onClick={() => toggleEdit('bio')}
                  className="bg-blue-500 hover:bg-blue-700 text-white rounded-lg py-2 px-4 transition duration-200"
                >
                  {isEditing.bio ? 'Save Bio' : 'Edit Bio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileDetail = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4 hover:bg-gray-100 p-2 rounded transition duration-200">
    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export default LecturerProfile;