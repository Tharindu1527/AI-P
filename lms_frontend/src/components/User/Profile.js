import React, { useState } from "react";
import { FaUser, FaEnvelope, FaGraduationCap, FaTrash, FaCamera, FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Profile({ summary }) {
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("Aspiring software developer with a passion for learning new technologies.");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const handleGoToDashboard = () => {
    navigate("/user-dashboard");
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleBioChange = (event) => {
    setBio(event.target.value);
  };

  return (
    <div className="bg-gradient-to-r mt-2 from-blue-50 to-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto border border-gray-300">
      <div className="p-8">
        <button
          onClick={handleGoToDashboard}
          className="flex items-center space-x-2 mb-6 text-blue-500 hover:text-blue-700 transition duration-200"
        >
          <FaArrowLeft className="text-lg" />
          <span>Go to Dashboard</span>
        </button>

        <div className="flex">
          <div className="w-1/3 p-4">
            <div className="relative w-48 h-48 mx-auto">
              <div className="rounded-full w-full h-full bg-gray-200 flex items-center justify-center shadow-md overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-8xl text-gray-600" />
                )}
              </div>
              <label
                htmlFor="imageUpload"
                className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer"
              >
                <FaCamera className="text-sm" />
                <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-2 cursor-pointer"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
          </div>

          <div className="w-2/3 p-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Full Profile</h2>
            <div className="space-y-6">
              <ProfileDetail icon={<FaUser />} label="Name" value="John Doe" />
              <ProfileDetail icon={<FaEnvelope />} label="Email" value="johndoe@example.com" />
              <ProfileDetail icon={<FaGraduationCap />} label="Department" value="Computer Science" />

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                  <FaGraduationCap className="text-xl text-gray-600" />
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500">Bio</p>
                  {isEditing ? (
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bio}
                      onChange={handleBioChange}
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-800">{bio}</p>
                  )}
                </div>
                <button
                  onClick={toggleEdit}
                  className="bg-blue-500 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer"
                >
                  {isEditing ? <FaSave /> : <FaEdit />}
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

export default Profile;