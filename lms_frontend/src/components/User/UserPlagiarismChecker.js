import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
} from "@mui/material";
import { Upload, X, CheckCircle, AlertTriangle, FileText } from "lucide-react";

function UserPlagiarismChecker() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const handleCheckPlagiarism = () => {
    if (!file) {
      setError("Please upload a file before checking for plagiarism.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    // Simulate a plagiarism check API call
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 100); // Simulated plagiarism score
      setResult({ score: randomScore });
      setLoading(false);
    }, 3000);
  };

  // Generate similarity report
  const handleGenerateReport = () => {
    if (!result) return;

    const reportContent = `Plagiarism Similarity Report\n\nFile: ${file.name}\nPlagiarism Score: ${result.score}%\n\nGenerated on: ${new Date().toLocaleString()}`;
    const blob = new Blob([reportContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Similarity_Report_${file.name}.txt`;
    link.click();
  };

  // Determine icon based on plagiarism score
  const getPlagiarismIcon = (score) => {
    if (score >= 70) {
      return <AlertTriangle size={32} color="#D32F2F" />;
    } // High plagiarism risk
    if (score >= 40) {
      return <AlertTriangle size={32} color="#FF9800" />;
    } // Moderate plagiarism risk
    return <CheckCircle size={32} color="#388E3C" />;
  }; // Low plagiarism risk

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 4,
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
        Plagiarism Checker
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}>
        Upload your document to check for plagiarism.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, fontWeight: "bold" }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={<Upload size={16} />}
        >
          Upload File
          <input type="file" hidden onChange={handleFileChange} accept=".docx, .pdf, .txt" />
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
        color="primary"
        fullWidth
        sx={{ mb: 3 }}
        disabled={loading || !file}
        onClick={handleCheckPlagiarism}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Check Plagiarism"}
      </Button>

      {result && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "background.default",
            mt: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {getPlagiarismIcon(result.score)}
          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
            Plagiarism Score: {result.score}%
          </Typography>

          <Button
            variant="outlined"
            startIcon={<FileText size={16} />}
            sx={{ mt: 2 }}
            onClick={handleGenerateReport}
          >
            Generate Similarity Report
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default UserPlagiarismChecker;