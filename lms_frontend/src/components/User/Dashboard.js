import React from "react";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import Assignments from "./Assignments";
import MyCourses from "./MyCourses";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  School,
  Assignment,
  CalendarToday,
  Person,
  Announcement,
  Notifications,
  Event,
  LibraryBooks,
} from "@mui/icons-material";

function Dashboard() {
  // Mock profile data
  const profile = {
    name: "John Doe",
    email: "johndoe@example.com",
    department: "Computer Science",
    profileImage: "https://via.placeholder.com/150", // Replace with actual image URL
  };

  // Mock data for additional features
  const announcements = [
    { id: 1, text: "Midterm exams start next week." },
    { id: 2, text: "New course materials uploaded." },
  ];

  const notifications = [
    { id: 1, text: "Assignment 1 deadline is approaching." },
    { id: 2, text: "You have a new message from your instructor." },
  ];

  const upcomingEvents = [
    { id: 1, text: "Final Exam - December 15", date: "2023-12-15" },
    { id: 2, text: "Workshop on AI - December 20", date: "2023-12-20" },
  ];

  const quickLinks = [
    { id: 1, text: "Course Materials", icon: <LibraryBooks />, link: "/materials" },
    { id: 2, text: "Grades", icon: <School />, link: "/grades" },
    { id: 3, text: "Messages", icon: <Notifications />, link: "/messages" },
  ];

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-1">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="col-md-7">
          <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
            🎓 Welcome to Your Dashboard
          </Typography>

          {/* First Row */}
          <Grid container spacing={3} alignItems="stretch">
            {/* My Courses Summary */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <School sx={{ fontSize: 40, color: "#1976d2", mr: 2 }} />
                    <Typography variant="h6">My Courses</Typography>
                  </Box>
                  <MyCourses summary={true} />
                  <Button component={Link} to="/my-courses" size="small" sx={{ mt: 2 }}>
                    View All Courses
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Assignments Overview */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Assignment sx={{ fontSize: 40, color: "#d32f2f", mr: 2 }} />
                    <Typography variant="h6">Assignments</Typography>
                  </Box>
                  <Assignments summary={true} />
                  <Button component={Link} to="/user-assignments" size="small" sx={{ mt: 2 }}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Second Row */}
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Calendar Overview */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CalendarToday sx={{ fontSize: 40, color: "#388e3c", mr: 2 }} />
                    <Typography variant="h6">Upcoming Deadlines</Typography>
                  </Box>
                  <Calendar summary={true} />
                  <Button component={Link} to="/user-calendar" size="small" sx={{ mt: 2 }}>
                    View Full Calendar
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <LibraryBooks sx={{ fontSize: 40, color: "#009688", mr: 2 }} />
                    <Typography variant="h6">Quick Links</Typography>
                  </Box>
                  <List>
                    {quickLinks.map((link) => (
                      <ListItem
                        key={link.id}
                        button
                        component={Link}
                        to={link.link}
                      >
                        <ListItemIcon>{link.icon}</ListItemIcon>
                        <ListItemText primary={link.text} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Third Row */}
          <Grid container spacing={3} sx={{ mt: 0 }}>
            
          </Grid>
        </main>

        {/* Right-Hand Column */}
        <aside className="col-md-4">
          <Grid container spacing={3}>
            {/* Profile Summary */}
            <Grid item xs={12}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    {/* Profile Picture */}
                    <Avatar
                      src={profile.profileImage}
                      alt={profile.name}
                      sx={{ width: 80, height: 80, mb: 2 }}
                    />
                    {/* Profile Details */}
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      {profile.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                      {profile.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                      {profile.department}
                    </Typography>
                    {/* Link to Full Profile */}
                    <Button
                      component={Link}
                      to="/profile"
                      variant="outlined"
                      size="small"
                      startIcon={<Person />}
                    >
                      View Full Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Notifications */}
            <Grid item xs={12}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Notifications sx={{ fontSize: 40, color: "#9c27b0", mr: 2 }} />
                    <Typography variant="h6">Notifications</Typography>
                  </Box>
                  <List>
                    {notifications.map((notification) => (
                      <ListItem key={notification.id}>
                        <ListItemText primary={notification.text} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Announcements */}
            <Grid item xs={12}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Announcement sx={{ fontSize: 40, color: "#ff9800", mr: 2 }} />
                    <Typography variant="h6">Announcements</Typography>
                  </Box>
                  <List>
                    {announcements.map((announcement) => (
                      <ListItem key={announcement.id}>
                        <ListItemText primary={announcement.text} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;