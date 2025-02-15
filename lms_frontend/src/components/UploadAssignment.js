import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UploadAssignment() {
  const { course_id, assignment_id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [comments, setComments] = useState([]);
  const studentId = localStorage.getItem('studentId');
  const baseUrl = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    // Fetch assignment details
    axios.get(`${baseUrl}/assignment/${assignment_id}/`)
      .then((response) => {
        setAssignment(response.data);
      })
      .catch((error) => {
        console.error('Error fetching assignment:', error);
        toast.error('Failed to load assignment details.');
      });

    // Fetch submission details
    axios.get(`${baseUrl}/submission/${assignment_id}/student/${studentId}/`)
      .then((response) => {
        console.log('Submission Response:', response.data); // Debug response
        setSubmission(response.data);
      })
      .catch((error) => {
        console.error('Error fetching submission:', error);
        toast.warn('No submission found for this assignment.');
      });

    // Fetch lecturer comments
    axios.get(`${baseUrl}/assignment/${assignment_id}/comments/`)
      .then((response) => {
        setComments(response.data);
      })
      .catch((error) => {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load lecturer comments.');
      })
      .finally(() => setLoading(false));
  }, [assignment_id, studentId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('student', studentId);
    formData.append('assignment', assignment_id);

    try {
      await axios.post(`${baseUrl}/upload-assignment/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Assignment uploaded successfully!');
      navigate(`/course-detail/${course_id}`);
    } catch (error) {
      console.error('Error uploading assignment:', error.response?.data || error);
      toast.error('Error uploading assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-indigo-50">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-indigo-600">Upload Assignment</h2>
          <p className="text-gray-600">{assignment?.description}</p>
          {assignment?.due_date && (
            <p className="text-red-500 mt-2">
              Due Date: {new Date(assignment.due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {submission ? (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Your Submission</h3>
            <p className="text-gray-600">
              Submitted on: {new Date(submission.timestamp).toLocaleString()}
            </p>
            <p className="text-gray-600">Progress: {submission.progress}%</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-500">No submission found. Please upload your assignment.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Assignment File
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              accept=".pdf,.doc,.docx,.zip,.rar"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX, ZIP, RAR
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/course-detail/${course_id}`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Uploading...' : 'Upload Assignment'}
            </button>
          </div>
        </form>

        {comments.length > 0 && (
          <div className="mt-8 bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold text-gray-700">Lecturer Comments</h3>
            <ul className="mt-4 space-y-3">
              {comments.map((comment, index) => (
                <li
                  key={index}
                  className="p-3 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <p className="text-gray-700">{comment.text}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Posted on: {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default UploadAssignment;
