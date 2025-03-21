import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Button, Form, Table, 
  Modal, Spinner, Alert, Badge, ProgressBar, Tabs, Tab
} from 'react-bootstrap';
import { 
  FaUpload, FaCompareArrows, FaFileAlt, FaDownload, 
  FaTrash, FaCheck, FaTimes, FaGlobe, FaSearch 
} from 'react-icons/fa';

// Base API URL - Change this to match your Django backend URL
const API_URL = 'http://localhost:8000/api';

const WebSimilarityChecker = () => {
  // State for assignments
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for web similarity check
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState(null);

  // State for reports
  const [webReports, setWebReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // State for modals
  const [showResultModal, setShowResultModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch assignments and reports on component mount
  useEffect(() => {
    fetchAssignments();
    fetchWebReports();
  }, []);

  // Fetch assignments from the backend
  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/list/`);
      if (response.data.status === 'success') {
        setAssignments(response.data.assignments || []);
      } else {
        setError(response.data.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      setError('Error connecting to server: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch web reports from the backend
  const fetchWebReports = async () => {
    setLoadingReports(true);
    try {
      const response = await axios.get(`${API_URL}/web-reports/`);
      if (response.data.status === 'success') {
        setWebReports(response.data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching web reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Handle assignment selection for web check
  const handleSelectAssignment = (id) => {
    setSelectedAssignment(id);
    setCheckError(null);
    setCheckResult(null);
  };

  // Handle web similarity check
  const handleWebCheck = async () => {
    if (!selectedAssignment) {
      setCheckError('Please select an assignment to check');
      return;
    }
    
    setChecking(true);
    setCheckError(null);
    setCheckResult(null);
    
    try {
      const response = await axios.post(`${API_URL}/web-similarity/`, {
        assignment_id: selectedAssignment,
      });
      
      if (response.data.status === 'success') {
        setCheckResult(response.data);
        // Refresh reports list
        fetchWebReports();
      } else {
        setCheckError(response.data.message || 'Check failed');
      }
    } catch (err) {
      setCheckError('Error checking web similarity: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setChecking(false);
    }
  };

  // Handle web report deletion
  const handleDeleteReport = async (filename) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-web-report/${filename}`);
      if (response.data.status === 'success') {
        // Refresh reports list
        fetchWebReports();
      } else {
        alert(response.data.message || 'Failed to delete report');
      }
    } catch (err) {
      alert('Error deleting report: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  // Show result details in modal
  const showResultDetails = (result) => {
    setCheckResult(result);
    setShowResultModal(true);
  };

  // Get similarity color based on score
  const getSimilarityColor = (score) => {
    if (score < 20) return 'success';
    if (score < 40) return 'info';
    if (score < 60) return 'warning';
    return 'danger';
  };

  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Confirm deletion of a report
  const confirmDelete = (filename) => {
    if (window.confirm(`Are you sure you want to delete the report "${filename}"?`)) {
      handleDeleteReport(filename);
    }
  };

  return (
    <Container fluid className="mt-4 mb-5">
      <h1 className="text-center mb-4">Assignment Web Similarity Checker</h1>
      
      <Row>
        {/* Assignment Selection Section */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0"><FaFileAlt className="me-2" />Select Assignment</h4>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : assignments.length === 0 ? (
                <Alert variant="info">No assignments available. Upload one to get started!</Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th width="5%">Select</th>
                        <th>Title</th>
                        <th width="20%">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td className="text-center">
                            <Form.Check
                              type="radio"
                              name="assignmentRadio"
                              checked={selectedAssignment === assignment.id}
                              onChange={() => handleSelectAssignment(assignment.id)}
                            />
                          </td>
                          <td>{assignment.title}</td>
                          <td>
                            {assignment.uploaded_at ? new Date(assignment.uploaded_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              
              <Button
                variant="outline-secondary"
                className="w-100 mt-2"
                onClick={fetchAssignments}
              >
                Refresh List
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Web Check Section */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0"><FaGlobe className="me-2" />Web Similarity Check</h4>
            </Card.Header>
            <Card.Body>
              <p>Check assignment against web content to detect potential plagiarism:</p>
              
              {checkError && (
                <Alert variant="danger" className="mb-3">
                  {checkError}
                </Alert>
              )}
              
              <Button
                variant="success"
                className="w-100 mb-3"
                onClick={handleWebCheck}
                disabled={checking || !selectedAssignment}
              >
                {checking ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FaSearch className="me-2" />
                    Check Web Similarity
                  </>
                )}
              </Button>
              
              {checkResult && (
                <div className="mt-3">
                  <h5>Check Result:</h5>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6>{checkResult.assignment_title}</h6>
                      <p>
                        <Badge 
                          bg={getSimilarityColor(checkResult.web_similarity_score)}
                          className="p-2 mb-2"
                        >
                          {checkResult.web_similarity_score}% Web Similarity
                        </Badge>
                      </p>
                      <p className="mb-2"><strong>Summary:</strong> {checkResult.analysis_summary}</p>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => window.open(checkResult.report_url, '_blank')}
                        >
                          View Report
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => window.open(checkResult.download_url, '_blank')}
                        >
                          Download
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        {/* Web Reports List */}
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header className="bg-dark text-white">
              <h4 className="mb-0"><FaFileAlt className="me-2" />Web Similarity Reports</h4>
            </Card.Header>
            <Card.Body>
              {loadingReports ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : webReports.length === 0 ? (
                <Alert variant="info">No web similarity reports available yet. Check an assignment to generate a report!</Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Report Filename</th>
                        <th>Created</th>
                        <th>Size</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webReports.map((report, index) => (
                        <tr key={index}>
                          <td>{report.filename}</td>
                          <td>{formatDate(report.created)}</td>
                          <td>{Math.round(report.size / 1024)} KB</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => window.open(report.view_url, '_blank')}
                              >
                                View
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => window.open(report.download_url, '_blank')}
                              >
                                <FaDownload />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => confirmDelete(report.filename)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              
              <Button
                variant="outline-dark"
                className="w-100 mt-2"
                onClick={fetchWebReports}
              >
                Refresh Reports
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Result Details Modal */}
      <Modal
        show={showResultModal}
        onHide={() => setShowResultModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Web Similarity Analysis Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkResult && (
            <>
              <h5 className="mb-3">Analysis Details</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <th width="30%">Assignment:</th>
                    <td>{checkResult.assignment_title}</td>
                  </tr>
                  <tr>
                    <th>Web Similarity Score:</th>
                    <td>
                      <h4>
                        <Badge 
                          bg={getSimilarityColor(checkResult.web_similarity_score)}
                          className="p-2"
                        >
                          {checkResult.web_similarity_score}%
                        </Badge>
                      </h4>
                    </td>
                  </tr>
                  <tr>
                    <th>Analysis Summary:</th>
                    <td>
                      {checkResult.analysis_summary}
                    </td>
                  </tr>
                </tbody>
              </Table>
              
              <h5 className="mb-3 mt-4">Similarity Visualization</h5>
              <ProgressBar>
                <ProgressBar 
                  variant={getSimilarityColor(checkResult.web_similarity_score)} 
                  now={checkResult.web_similarity_score} 
                  key={1} 
                  label={`${checkResult.web_similarity_score}% Web Match`}
                />
                <ProgressBar 
                  variant="light" 
                  now={100 - checkResult.web_similarity_score} 
                  key={2} 
                  label={`${100 - checkResult.web_similarity_score}% Original`}
                />
              </ProgressBar>
              
              <div className="mt-4 text-center">
                <p>For detailed analysis, please view the full report:</p>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => window.open(checkResult.report_url, '_blank')}
                >
                  <FaFileAlt className="me-2" />
                  View Full Report
                </Button>
                <Button
                  variant="success"
                  onClick={() => window.open(checkResult.download_url, '_blank')}
                >
                  <FaDownload className="me-2" />
                  Download Report
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResultModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WebSimilarityChecker;