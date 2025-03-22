import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';
import { Upload, FileText, Calendar as CalendarIcon } from 'lucide-react';

function Assignments({ summary }) {
  const navigate = useNavigate();
  const { course_id } = useParams();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        if (!studentId) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        if (course_id) {
          // If course_id is available, fetch assignments for that specific course
          const response = await axios.get(
            `http://127.0.0.1:8000/api/course/${course_id}/assignments/`
          );
          setAssignments(response.data);
        } else {
          // Otherwise, fetch assignments for all enrolled courses
          const enrolledResponse = await axios.get(
            `http://127.0.0.1:8000/api/fetch-enrolled-courses/${studentId}?user_type=student`
          );
          
          const enrolledCourses = enrolledResponse.data;
          
          // Then fetch assignments for each course
          const assignmentPromises = enrolledCourses.map(course => 
            axios.get(`http://127.0.0.1:8000/api/course/${course.id}/assignments/`)
              .then(response => response.data.map(assignment => ({
                ...assignment,
                courseName: course.title,
                courseId: course.id
              })))
              .catch(err => {
                console.error(`Error fetching assignments for course ${course.id}:`, err);
                return [];
              })
          );
          
          const assignmentsArrays = await Promise.all(assignmentPromises);
          const allAssignmentsData = assignmentsArrays.flat();
          setAssignments(allAssignmentsData);
        }
      } catch (err) {
        setError('Failed to fetch assignments');
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [course_id]);

  if (loading) {
    return <Typography variant="body1">Loading assignments...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (summary) {
    const pendingAssignments = assignments.filter(a => !a.submitted);
    return (
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <FileText size={20} style={{ marginRight: "8px" }} />
          Pending Assignments: {pendingAssignments.length}
        </Typography>
      </Card>
    );
  }

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <FileText size={24} style={{ marginRight: "8px" }} />
        Assignments
      </Typography>

      {assignments.length === 0 ? (
        <Typography variant="body1">No assignments found.</Typography>
      ) : (
        assignments
          .filter(a => !a.submitted)
          .map((assignment) => (
            <Card key={assignment.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{assignment.title}</Typography>
                {assignment.courseName && (
                  <Typography 
                    variant="subtitle2" 
                    color="primary"
                    sx={{ mt: 0.5 }}
                  >
                    Course: {assignment.courseName}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1, display: "flex", alignItems: "center" }}
                >
                  <CalendarIcon size={16} style={{ marginRight: "8px" }} />
                  Due Date: {assignment.due || 'Not specified'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Upload size={16} />}
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                  sx={{ mt: 2 }}
                >
                  Submit Assignment
                </Button>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}

export default Assignments;