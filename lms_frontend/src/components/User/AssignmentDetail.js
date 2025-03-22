import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X, Check, AlertCircle } from "lucide-react";

function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [similarityScore, setSimilarityScore] = useState(null);

  useEffect(() => {
    const isSubmitted = localStorage.getItem(`assignment_${id}_status`);
    if (isSubmitted === "submitted") {
      setSubmitted(true);
      const randomScore = Math.floor(Math.random() * 100); // Simulated score
      setSimilarityScore(randomScore);
    }
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const handleCheckPlagiarism = () => {
    if (!file) {
      setError("Please upload a file before checking plagiarism.");
      return;
    }
    navigate(`/plagiarism-check/${id}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!file) {
      setError("Please upload a file before submitting.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem(`assignment_${id}_status`, "submitted");
      setSubmitted(true);
      const randomScore = Math.floor(Math.random() * 100); // Simulated score
      setSimilarityScore(randomScore);
      setLoading(false);
      setSnackbarOpen(true);
    }, 2500);
  };

  const handleRemove = () => {
    setOpenDialog(false);
    localStorage.removeItem(`assignment_${id}_status`);
    setSubmitted(false);
    setFile(null);
    setName("");
  };

  // Determine color based on similarity score
  const getSimilarityColor = (score) => {
    if (score >= 70) return "#D32F2F"; // Red for high similarity
    if (score >= 40) return "#FFEB3B"; // Yellow for moderate similarity
    return "#388E3C"; // Green for low similarity
  };

  return (
    <Box
      sx={{
        maxWidth: 650,
        mx: "auto",
        mt: 4,
        p: 4,
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: 2,
        minHeight: "500px",
        mb: 6,
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
        Submit Assignment {id}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}>
        Upload your assignment file and check for plagiarism before submission.
      </Typography>

      {submitted ? (
        <>
          <Alert severity="success" sx={{ mb: 3, fontWeight: "bold" }}>
            <Check size={20} style={{ marginRight: "8px" }} />
            Assignment {id} has been successfully submitted!
          </Alert>

          
  {similarityScore !== null && (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: 3,
        mb: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", mr: 1 }}>
        Similarity Score:
      </Typography>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: "50px",
          fontWeight: "bold",
          color: "white",
          bgcolor: getSimilarityColor(similarityScore),
          display: "inline-block",
          minWidth: "60px",
          textAlign: "center",
        }}
      >
        {similarityScore}%
      </Box>
    </Box>
  )}
  



          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 3 }}
            fullWidth
            onClick={() => setOpenDialog(true)}
          >
            Remove Submission & Upload New File
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, fontWeight: "bold" }}>
              <AlertCircle size={20} style={{ marginRight: "8px" }} />
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Your Name"
            variant="outlined"
            sx={{ mb: 2 }}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<Upload size={16} />}
            >
              Upload File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {file && (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                  Selected file: {file.name}
                </Typography>
                <IconButton onClick={handleClearFile} size="small">
                  <X size={16} />
                </IconButton>
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            color="red"
            fullWidth
            sx={{ mb: 3 }}
            disabled={!file}
            onClick={() => navigate("/plagiarism-checker")}>
            Check Plagiarism
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || !name || !file}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Assignment"}
          </Button>
        </form>
      )}

      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        sx={{ mt: 3 }}
        onClick={() => navigate("/user-assignments")}
      >
        Back to Assignments
      </Button>

      {/* Confirmation Dialog for Remove Submission */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Remove Submission</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove your submission and upload a new file?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRemove} color="error">
            Yes, Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Assignment Submitted Successfully!"
      />
    </Box>
  );
}

export default AssignmentDetail;