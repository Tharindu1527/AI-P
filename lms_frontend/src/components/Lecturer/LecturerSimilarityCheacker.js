import { useState, useRef, useEffect } from "react";
import LecturerSidebar from "./LecturerSidebar";
import axios from "axios";

function SimilarityChecker() {
  const [files, setFiles] = useState([]);
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("web");
  const [webResults, setWebResults] = useState(null);
  const [assignmentResults, setAssignmentResults] = useState(null);
  const [error, setError] = useState(null);
  const [reportContent, setReportContent] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "web", or "assignment"
  const [threshold, setThreshold] = useState(0); // Similarity threshold (0-100)
  const fileInputRef = useRef(null);

  const baseUrl = "http://127.0.0.1:8000/api";

  // Fetch existing assignments when component mounts
  useEffect(() => {
    fetchExistingAssignments();
  }, []);

  // Fetch all existing assignments from the backend
  const fetchExistingAssignments = async () => {
    try {
      const response = await axios.get(`${baseUrl}/list/`);
      if (response.data.status === 'success') {
        const assignments = response.data.assignments.map(assignment => ({
          ...assignment,
          selected: false
        }));
        setExistingAssignments(assignments);
      } else {
        console.error('Failed to fetch assignments:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  // Remove a file from the list
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload files to the backend
  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Upload each file to the backend
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('title', file.name);
        formData.append('file', file);

        const response = await axios.post(`${baseUrl}/upload/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        return response.data;
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Refresh the list of assignments
      fetchExistingAssignments();
      
      // Clear the selected files
      clearFiles();
      
      setLoading(false);
      return results;
    } catch (error) {
      setError(`Upload failed: ${error.response?.data?.message || error.message}`);
      setLoading(false);
      return [];
    }
  };

  // Toggle selection of existing assignments
  const toggleAssignmentSelection = (assignmentId) => {
    setExistingAssignments(prevAssignments => 
      prevAssignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, selected: !assignment.selected }
          : assignment
      )
    );
  };

  // Check web similarity
  const checkWebSimilarity = async () => {
    const selectedAssignments = existingAssignments.filter(a => a.selected);
    
    if (files.length === 0 && selectedAssignments.length === 0) {
      setError("Please select at least one file or assignment to check");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let assignmentIds = [];
      
      // If new files are uploaded, add them first
      if (files.length > 0) {
        const uploadResults = await uploadFiles();
        if (uploadResults.length === 0) {
          setLoading(false);
          return;
        }
        
        assignmentIds = uploadResults.map(result => result.assignment_id);
      } else {
        // Otherwise use selected existing assignments
        assignmentIds = selectedAssignments.map(assignment => assignment.id);
      }
      
      // Check web similarity for each uploaded/selected assignment
      const webCheckPromises = assignmentIds.map(async (assignmentId) => {
        const response = await axios.post(`${baseUrl}/web-similarity/`, {
          assignment_id: assignmentId
        });
        
        return response.data;
      });
      
      const results = await Promise.all(webCheckPromises);
      setWebResults(results);
      setActiveTab("web");
    } catch (error) {
      setError(`Web similarity check failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check assignment-to-assignment similarity
  const checkAssignmentSimilarity = async () => {
    const selectedAssignments = existingAssignments.filter(a => a.selected);
    const totalAssignments = files.length + selectedAssignments.length;
    
    if (totalAssignments < 2) {
      setError("Please select at least two files or assignments to compare");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let assignmentIds = [];
      
      // If new files are uploaded, add them first
      if (files.length > 0) {
        const uploadResults = await uploadFiles();
        if (uploadResults.length === 0 && selectedAssignments.length < 2) {
          setLoading(false);
          return;
        }
        
        assignmentIds = uploadResults.map(result => result.assignment_id);
      }
      
      // Add selected existing assignments
      assignmentIds = [
        ...assignmentIds,
        ...selectedAssignments.map(assignment => assignment.id)
      ];
      
      if (assignmentIds.length < 2) {
        setError("Please select at least two assignments to compare");
        setLoading(false);
        return;
      }
      
      // Send comparison request to backend
      const response = await axios.post(`${baseUrl}/compare/`, {
        assignment_ids: assignmentIds
      });
      
      if (response.data.status === 'success') {
        setAssignmentResults(response.data.results);
        setActiveTab("assignment");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(`Assignment similarity check failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get color based on similarity percentage
  const getSimilarityColor = (percentage) => {
    if (percentage < 30) return "success"; // Low similarity
    if (percentage < 60) return "warning"; // Medium similarity
    return "danger"; // High similarity
  };

  // View report in new tab
  const viewReport = (reportUrl) => {
    window.open(`${baseUrl}${reportUrl}`, '_blank');
  };

  // Download report
  const downloadReport = (reportUrl) => {
    window.open(`${baseUrl}${reportUrl}`, '_blank');
  };

  // Filter results based on similarity threshold
  const filterResults = (results) => {
    if (!results) return [];
    return results.filter((result) => {
      const similarityScore = 
        result.web_similarity_score || 
        result.similarity_score || 
        result.similarity || 0;
      return similarityScore >= threshold;
    });
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        <aside className="col-md-3">
          <LecturerSidebar />
        </aside>
        <section className="col-md-9">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
              <h5 className="m-0">Assignment Similarity Checker</h5>
            </div>
            <div className="card-body">
              {/* File Upload Section */}
              <div className="mb-4">
                <h6 className="mb-3">Upload Assignments</h6>
                <div className="upload-area p-4 border border-dashed rounded mb-3 bg-light text-center">
                  <input
                    type="file"
                    multiple
                    className="d-none"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2 d-block"></i>
                  <p>Drag and drop files here or</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </button>
                  <p className="mt-2 text-muted small">Supported formats: PDF, DOC, DOCX, TXT</p>
                </div>

                {/* Selected Files List */}
                {files.length > 0 && (
                  <div className="selected-files mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Selected Files ({files.length})</h6>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={clearFiles}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="list-group">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <i className="bi bi-file-earmark-text me-2"></i>
                            {file.name}
                            <span className="badge bg-secondary ms-2">
                              {(file.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                          <button
                            className="btn btn-sm btn-close"
                            onClick={() => removeFile(index)}
                          ></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Assignments */}
                {existingAssignments.length > 0 && (
                  <div className="existing-files mb-3">
                    <h6 className="mb-2">Existing Assignments</h6>
                    <p className="text-muted mb-2 small">Select assignments to check</p>
                    <div className="list-group">
                      {existingAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                            assignment.selected ? "active" : ""
                          }`}
                          onClick={() => toggleAssignmentSelection(assignment.id)}
                        >
                          <div>
                            <i className="bi bi-file-earmark-text me-2"></i>
                            {assignment.title}
                            {assignment.uploaded_at && (
                              <span className="badge bg-secondary ms-2">
                                {new Date(assignment.uploaded_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={assignment.selected || false}
                              onChange={() => {}}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-success"
                    onClick={checkWebSimilarity}
                    disabled={loading || (files.length === 0 && !existingAssignments.some(a => a.selected))}
                  >
                    {loading && activeTab === "web" ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-globe me-2"></i>
                    )}
                    Check Web Similarity
                  </button>
                  <button
                    className="btn btn-info text-white"
                    onClick={checkAssignmentSimilarity}
                    disabled={loading || (files.length + existingAssignments.filter(a => a.selected).length < 2)}
                  >
                    {loading && activeTab === "assignment" ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-arrow-left-right me-2"></i>
                    )}
                    Compare Assignments
                  </button>
                </div>
              </div>

              {/* Filter Section */}
              <div className="mb-4">
                <h6 className="mb-3">Filter Results</h6>
                <div className="d-flex gap-2 align-items-center">
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={`btn btn-sm ${filter === "web" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setFilter("web")}
                    >
                      Web Similarity
                    </button>
                    <button
                      className={`btn btn-sm ${filter === "assignment" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setFilter("assignment")}
                    >
                      Assignment Similarity
                    </button>
                  </div>
                  <div className="ms-3">
                    <label htmlFor="threshold" className="form-label me-2">
                      Show results above:
                    </label>
                    <input
                      type="number"
                      id="threshold"
                      className="form-control form-control-sm"
                      style={{ width: "80px" }}
                      min="0"
                      max="100"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                    />
                    <span className="ms-2">%</span>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {(filter === "web" || filter === "all") && webResults && webResults.length > 0 && (
                <div className="web-results mb-4">
                  <h6 className="mb-3">Web Similarity Results</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Assignment</th>
                          <th className="text-center">Similarity %</th>
                          <th>Summary</th>
                          <th>Report</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterResults(webResults).map((result, index) => (
                          <tr key={index}>
                            <td>{result.assignment_title || `Assignment ${result.assignment_id}`}</td>
                            <td className="text-center">
                              <div className={`badge bg-${getSimilarityColor(result.web_similarity_score)} p-2 fs-6`}>
                                {result.web_similarity_score}%
                              </div>
                            </td>
                            <td>{result.analysis_summary}</td>
                            <td>
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => viewReport(result.report_url)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => downloadReport(result.download_url)}
                                >
                                  <i className="bi bi-download me-1"></i> Download
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Assignment-to-Assignment Similarity Results */}
              {(filter === "assignment" || filter === "all") && assignmentResults && assignmentResults.length > 0 && (
                <div className="assignment-results">
                  <h6 className="mb-3">Assignment-to-Assignment Comparison</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Assignment 1</th>
                          <th>Assignment 2</th>
                          <th className="text-center">Similarity %</th>
                          <th>Report</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterResults(assignmentResults).map((result, index) => (
                          <tr key={index}>
                            <td>{result.assignment1_title}</td>
                            <td>{result.assignment2_title}</td>
                            <td className="text-center">
                              <div className={`badge bg-${getSimilarityColor(result.similarity_score)} p-2 fs-6`}>
                                {result.similarity_score}%
                              </div>
                            </td>
                            <td>
                              {result.report_url ? (
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => viewReport(result.report_url)}
                                  >
                                    <i className="bi bi-eye me-1"></i> View
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => downloadReport(result.download_url)}
                                  >
                                    <i className="bi bi-download me-1"></i> Download
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted">No report available</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {(!webResults && !assignmentResults) && (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
                  <h5 className="mt-3">No results to display</h5>
                  <p className="text-muted">Please check web similarity or compare assignments to view results.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SimilarityChecker;