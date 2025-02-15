import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const baseUrl = "http://127.0.0.1:8000/api";

function AddAssignment() {
    const { courseId } = useParams();
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                            'text/plain'];
        if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
            setError("Please upload only PDF, DOC, DOCX, or TXT files");
            return;
        }
        // Validate file size (10MB limit)
        if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
            setError("File size should not exceed 10MB");
            return;
        }
        setFile(selectedFile);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!file || !title || !courseId) {
            setError("Please fill all required fields");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("course", courseId);
        formData.append("file", file);
        formData.append("title", title);

        try {
            const response = await axios.post(`${baseUrl}/add_assignment/`, formData, {
                headers: { 
                    "Content-Type": "multipart/form-data"
                },
            });

            if (response.data && response.data.id) {
                setSuccess("Assignment added successfully!");
                setTitle("");
                setFile(null);
                // Reset the file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
            } else {
                setError("Error adding assignment. Please try again.");
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred while submitting the form.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Add Assignment for Course ID: {courseId}</h2>
            <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                
                <div className="mb-3">
                    <label className="form-label">Assignment Title*</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={200}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Upload File* (PDF, DOC, DOCX, or TXT, max 10MB)</label>
                    <input
                        type="file"
                        className="form-control"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
}

export default AddAssignment;