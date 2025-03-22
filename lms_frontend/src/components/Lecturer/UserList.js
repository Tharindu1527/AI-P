import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";
import { useEffect, useState } from "react";
import axios from "axios";

const baseUrl = "http://127.0.0.1:8000/api";

function UserList() {
  const [studentData, setStudentData] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseInfo, setCourseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const lecturerId = localStorage.getItem('lecturerId');
  
  // Fetch all courses for the lecturer (for dropdown)
  useEffect(() => {
    axios.get(`${baseUrl}/lecturer-courses/${lecturerId}/`)
      .then((res) => {
        setAllCourses(res.data);
        // If there are courses, pre-select the first one
        if (res.data.length > 0) {
          setSelectedCourseId(res.data[0].id.toString());
        }
      })
      .catch(error => {
        console.error("Error fetching lecturer courses:", error);
      });
  }, [lecturerId]);
  
  // Fetch students when a course is selected
  useEffect(() => {
    if (!selectedCourseId) return;
    
    setIsLoading(true);
    
    // First, fetch the course information
    axios.get(`${baseUrl}/course/${selectedCourseId}/`)
      .then((courseRes) => {
        setCourseInfo(courseRes.data);
        
        // Then fetch students enrolled in this course
        return axios.get(`${baseUrl}/course/${selectedCourseId}/enrolled-students/`);
      })
      .then((studentsRes) => {
        setStudentData(studentsRes.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, [selectedCourseId]);

  // Handle course selection change
  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  // Filter students based on search term
  const filteredStudents = studentData.filter(row => {
    // Check if we have student data in the format from the API
    const studentName = row.student ? row.student.full_name : row.full_name;
    const studentEmail = row.student ? row.student.email : row.email;
    const studentUsername = row.student ? row.student.username : row.username;
    
    return (
      (studentName && studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (studentEmail && studentEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (studentUsername && studentUsername.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Function to generate avatar if no profile picture
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Function to get student data in a consistent format
  const getStudentInfo = (row) => {
    if (row.student) {
      return row.student; // For existing API format
    }
    return row; // For direct student data format
  };
  
  return (
    <div className="container py-4">
      <div className="row g-4">
        <aside className="col-md-3">
          <LecturerSidebar />
        </aside>
        <section className="col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
              <h5 className="m-0">
                {courseInfo ? `Students Enrolled in ${courseInfo.title}` : "Enrolled Students"}
              </h5>
              <div className="d-flex align-items-center">
                <span className="badge bg-light text-primary me-2 rounded-pill">
                  {studentData.length} Students
                </span>
                <button className="btn btn-sm btn-light">
                  <i className="bi bi-download me-1"></i> Export
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-4">
                  <label htmlFor="courseSelect" className="form-label">Select Course</label>
                  <select 
                    id="courseSelect" 
                    className="form-select"
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                  >
                    {allCourses.length === 0 ? (
                      <option value="">No courses available</option>
                    ) : (
                      allCourses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="col-md-8">
                  <div className="input-group mt-4">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0" 
                      placeholder="Search students..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-people fs-1 text-muted"></i>
                  </div>
                  <h5>{searchTerm ? "No matching students found" : "No students enrolled yet"}</h5>
                  <p className="text-muted">
                    {searchTerm 
                      ? "Try using different search terms" 
                      : courseInfo 
                        ? `No students have enrolled in the course "${courseInfo.title}" yet`
                        : "Students will appear here once they enroll in your courses"
                    }
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Student</th>
                        <th scope="col">Contact</th>
                        <th scope="col">Interests</th>
                        <th scope="col" className="text-center">Assignments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((row, index) => {
                        const student = getStudentInfo(row);
                        return (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                {student.profile_pic ? (
                                  <img 
                                    src={student.profile_pic} 
                                    className="rounded-circle me-3" 
                                    width="40" 
                                    height="40"
                                    alt={student.full_name} 
                                  />
                                ) : (
                                  <div className="avatar-placeholder rounded-circle me-3 d-flex align-items-center justify-content-center bg-info text-white" style={{width: "40px", height: "40px", fontSize: "14px"}}>
                                    {getInitials(student.full_name)}
                                  </div>
                                )}
                                <div>
                                  <h6 className="mb-0">{student.full_name}</h6>
                                  <small className="text-muted">@{student.username}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="d-flex align-items-center mb-1">
                                  <i className="bi bi-envelope-fill text-muted me-2 small"></i>
                                  <span>{student.email}</span>
                                </div>
                                {student.phone && (
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-telephone-fill text-muted me-2 small"></i>
                                    <span>{student.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              {student.interested_categories ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {student.interested_categories.split(',').map((category, idx) => (
                                    <span key={idx} className="badge bg-light text-dark">
                                      {category.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted fst-italic">None specified</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <Link to={`/student-assignments/${student.id}`} className="btn btn-outline-primary btn-sm">
                                  <i className="bi bi-clipboard-check me-1"></i> View
                                </Link>
                                <Link to={`/add-student-assignment/${student.id}`} className="btn btn-outline-success btn-sm">
                                  <i className="bi bi-plus-circle me-1"></i> Assign
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserList;