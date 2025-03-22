import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChalkboardTeacher, FaBookOpen, FaLaptopCode } from "react-icons/fa";

function LecturerDetail() {
  const { lecturer_id } = useParams();
  const [lecturer, setLecturer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLecturerDetails = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        
        // Fetch lecturer details
        const lecturerResponse = await fetch(`${baseUrl}/lecturer/${lecturer_id}/`);

        

        const lecturerData = await lecturerResponse.json();
        setLecturer(lecturerData);

        // Fetch courses for this lecturer
        const coursesResponse = await fetch(`${baseUrl}/lecturer-courses/${lecturer_id}/`,
        );

        if (!coursesResponse.ok) {
          throw new Error(`Failed to fetch courses: ${coursesResponse.status}`);
        }

        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      } catch (err) {
        console.error('Error in fetchLecturerDetails:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerDetails();
  }, [lecturer_id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lecturer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No Data</p>
          <p>Lecturer information not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Lecturer Profile Section */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {/* Lecturer Image */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
            <img
              src="/logo512.png"
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
              alt={lecturer?.full_name || 'Lecturer'}
            />
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md">
              <FaChalkboardTeacher className="text-xl" />
            </div>
          </div>

          {/* Lecturer Details */}
          <div className="md:ml-8 mt-6 md:mt-0 text-center md:text-left w-full">
            <h3 className="text-3xl font-bold text-gray-800">{lecturer.full_name}</h3>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Email:</span> {lecturer.email}
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Qualification:</span> {lecturer.qualification}
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Department:</span> {lecturer.department}
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Contact:</span> {lecturer.mobile_no}
            </p>
            <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg">
              <p className="text-gray-700">
                <span className="font-semibold">Address:</span><br />
                {lecturer.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course List Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h5 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-4 flex items-center">
          <FaBookOpen className="mr-2" /> Courses by {lecturer.full_name}
        </h5>
        <div className="divide-y divide-gray-100">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between px-6 py-4 hover:bg-blue-50 transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-3">•</span>
                    <div>
                      <h6 className="text-gray-800 font-medium">{course.title}</h6>
                      <p className="text-gray-600 text-sm mt-1">
                        {course.description?.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                  {course.techs && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {course.techs.split(',').map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  to={`/detail/${course.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition duration-300 shadow-md ml-4"
                >
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-600">
              <FaBookOpen className="mx-auto text-4xl text-gray-400 mb-2" />
              <p>No courses available for this lecturer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LecturerDetail;