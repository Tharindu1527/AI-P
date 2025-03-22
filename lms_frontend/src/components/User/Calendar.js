import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { ClipboardList, Calendar as CalendarIcon } from 'lucide-react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useTheme, 
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Calendar({ summary }) {
  const theme = useTheme();
  const navigate = useNavigate();
  
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

        // Fetch all enrolled courses
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
      } catch (err) {
        setError('Failed to fetch assignments');
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Format assignments for FullCalendar
  const calendarEvents = assignments.map(assignment => ({
    title: assignment.title,
    date: assignment.due,
    id: assignment.id,
    extendedProps: {
      courseName: assignment.courseName,
      submitted: assignment.submitted
    }
  }));

  // Sort assignments by due date for the upcoming deadlines list
  const sortedAssignments = [...assignments]
    .filter(a => !a.submitted)
    .sort((a, b) => new Date(a.due) - new Date(b.due));
  
  if (loading) {
    return <Typography variant="body1">Loading calendar...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (summary) {
    return (
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <CalendarIcon size={20} style={{ marginRight: "8px" }} />
          Upcoming Deadlines
        </Typography>
        <List dense>
          {sortedAssignments.slice(0, 3).map((a, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ClipboardList size={18} />
              </ListItemIcon>
              <ListItemText
                primary={a.title}
                secondary={`Due: ${new Date(a.due).toLocaleDateString()} (${a.courseName})`}
              />
            </ListItem>
          ))}
        </List>
      </Card>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <CalendarIcon size={24} style={{ marginRight: "8px" }} />
        Calendar
      </Typography>
      
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          eventClick={(info) => {
            if (!info.event.extendedProps.submitted) {
              navigate(`/assignments/${info.event.id}`);
            }
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          themeSystem="standard"
          eventColor={(info) => 
            info.event.extendedProps.submitted ? 
            theme.palette.success.main : 
            theme.palette.primary.main
          }
          eventTextColor="#fff"
          height="auto"
        />
      </Paper>
      
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
          <ClipboardList size={20} style={{ marginRight: "8px" }} />
          All Upcoming Assignments
        </Typography>
        
        {sortedAssignments.length === 0 ? (
          <Typography variant="body1">No pending assignments found.</Typography>
        ) : (
          <List>
            {sortedAssignments.map((a, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate(`/assignments/${a.id}`)}
              >
                <ListItemIcon>
                  <ClipboardList size={24} />
                </ListItemIcon>
                <ListItemText
                  primary={a.title}
                  secondary={
                    <>
                      <Typography variant="body2" component="span" color="textSecondary">
                        Due: {new Date(a.due).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" component="span" color="primary.main" sx={{ ml: 2 }}>
                        {a.courseName}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default Calendar;