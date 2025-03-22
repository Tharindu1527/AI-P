import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const baseUrl = "http://127.0.0.1:8000/api";

function EditAddAssignment() {
    const { course_id, assignment_id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState({
        title: "",
        file: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [newFile, setNewFile] = useState(null);
    const [fileAction, setFileAction] = useState("keep"); // 'keep', 'delete', or 'replace'
    const [originalFileName, setOriginalFileName] = useState(""); 
    
    // Add auth token if needed
    const authToken = localStorage.getItem("authToken");
    const axiosConfig = {
        headers: {
            "Authorization": authToken ? `Bearer ${authToken}` : "",
        }
    };
    
    useEffect(() => {
        console.log("URL Parameters:", { course_id, assignment_id });
        
        const fetchAssignment = async () => {
            setLoading(true);
            console.log(`Fetching assignment: ${course_id}/assignment/${assignment_id}`);
            
            try {
                console.log(`Full URL: ${baseUrl}/course/${course_id}/assignment/${assignment_id}/`);
                const response = await axios.get(
                    `${baseUrl}/course/${course_id}/assignment/${assignment_id}/`, 
                    axiosConfig
                );
                console.log("Assignment data:", response.data);
                setAssignment(response.data);
                
                // Store the original file name
                if (response.data.file) {
                    const fileName = typeof response.data.file === 'string' 
                        ? response.data.file.split('/').pop() 
                        : (response.data.file.name || "Attached file");
                    setOriginalFileName(fileName);
                }
                
                setError("");
            } catch (err) {
                console.error("Error details:", {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    message: err.message
                });
                setError("Failed to fetch assignment details. " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };
    
        if (course_id && assignment_id) {
            fetchAssignment();
        } else {
            console.error("Missing parameters:", { course_id, assignment_id });
            setError("Missing course ID or assignment ID");
            setLoading(false);
        }
    }, [course_id, assignment_id]);

    const handleFileUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            setNewFile(event.target.files[0]);
            setFileAction("replace");
        }
    };

    const handleDeleteFile = () => {
        setFileAction("delete");
        setNewFile(null);
    };
    
    const cancelFileAction = () => {
        setFileAction("keep");
        setNewFile(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("title", assignment.title);
        
        // Handle file operations based on the selected action
        if (fileAction === "delete") {
            // Try multiple common backend options for deleting files
            formData.append("delete_file", "true");
            formData.append("file_action", "delete");
            formData.append("remove_file", "true");
        } else if (fileAction === "replace" && newFile) {
            formData.append("file", newFile);
        }

        console.log("Form data entries:", [...formData.entries()]);
        
        try {
            console.log(`Updating assignment at: ${baseUrl}/course/${course_id}/assignment/${assignment_id}/`);
            
            // Add additional logging for debugging
            console.log("Request headers:", {
                ...axiosConfig.headers,
                "Content-Type": "multipart/form-data"
            });
            
            const response = await axios.put(
                `${baseUrl}/course/${course_id}/assignment/${assignment_id}/`, 
                formData, 
                {
                    headers: {
                        ...axiosConfig.headers,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log("Update response:", response.data);
            
            setSuccess("Assignment updated successfully!");
            navigate(`/detail/${course_id}`);
        } catch (error) {
            console.error("Error updating assignment:", error);
            console.error("Error response:", error.response?.data);
            
            setError("An error occurred while updating the assignment: " + 
                    (error.response?.data?.message || error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-white text-dark">
                            <h5>Edit Assignment for Course ID: {course_id}</h5>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2">Loading assignment data...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {/* Assignment Title */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Assignment Title*</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={assignment.title || ""}
                                            onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Current File Section */}
                                    {assignment.file && fileAction === "keep" && (
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Current File</label>
                                            <div className="d-flex align-items-center">
                                                <div className="p-2 bg-light rounded me-2 flex-grow-1">
                                                    <i className="bi bi-file-earmark-text me-2"></i>
                                                    {originalFileName}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-danger"
                                                    onClick={handleDeleteFile}
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete File Notification */}
                                    {fileAction === "delete" && (
                                        <div className="mb-3 alert alert-warning">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                                    File will be deleted upon submission
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={cancelFileAction}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* New File Selected */}
                                    {fileAction === "replace" && newFile && (
                                        <div className="mb-3 alert alert-info">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <i className="bi bi-file-arrow-up me-2"></i>
                                                    New file selected: {newFile.name}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={cancelFileAction}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Upload */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            {fileAction === "delete" ? "Upload New File" : 
                                             (assignment.file && fileAction === "keep" ? "Replace File" : "Upload File")}
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.doc,.docx,.txt"
                                        />
                                        <small className="text-muted">
                                            {assignment.file && fileAction === "keep" ? 
                                                "Upload a new file to replace the current one, or leave empty to keep the current file" : 
                                                "Select a file to upload"}
                                        </small>
                                    </div>

                                    
                                    {/* Submit Button */}
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? "Updating..." : "Update Assignment"}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary"
                                            onClick={() => navigate(`/detail/${course_id}`)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditAddAssignment;