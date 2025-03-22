import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaUpload, FaTrash, FaBullhorn, FaEdit, FaSave, FaLink } from "react-icons/fa";

const baseUrl = "http://127.0.0.1:8000/api";

function AddAssignment() {
    const { courseId } = useParams();
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Announcement State with markdown-style formatting
    const [announcement, setAnnouncement] = useState(
        localStorage.getItem(`announcement_${courseId}`) || "Enter your announcement here..."
    );
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        localStorage.setItem(`announcement_${courseId}`, announcement);
    }, [announcement, courseId]);

    // Apply text formatting to the announcement text
    const applyFormatting = (style) => {
        const textarea = document.getElementById("announcementText");
        const text = textarea.value;
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const selectedText = text.substring(selectionStart, selectionEnd);
        
        let formattedText = "";
        switch (style) {
            case "bold":
                formattedText = `**${selectedText}**`;
                break;
            case "italic":
                formattedText = `*${selectedText}*`;
                break;
            case "heading":
                formattedText = `### ${selectedText}`;
                break;
            case "link":
                const url = prompt("Enter URL");
                formattedText = `[${selectedText}](${url})`;
                break;
            default:
                break;
        }

        // Replace selected text with formatted text
        const newText = text.slice(0, selectionStart) + formattedText + text.slice(selectionEnd);
        setAnnouncement(newText);
    };

    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ];
        if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
            setError("Please upload only PDF, DOC, DOCX, or TXT files");
            return;
        }
        if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
            setError("File size should not exceed 10MB");
            return;
        }
        setFile(selectedFile);
        setError("");
    };

    const handleFileRemove = () => {
        setFile(null);
        document.querySelector('input[type="file"]').value = "";
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
                }
            });

            if (response.data && response.data.id) {
                setSuccess("Assignment added successfully!");
                setTitle("");
                setFile(null);
                document.querySelector('input[type="file"]').value = "";
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
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow-lg border-0">
                        
                        {/* Announcement Section */}
                        <div className="card-header bg-white text-dark d-flex align-items-center">
                            <FaBullhorn className="me-2" size={24} />
                            <h5>Announcement</h5>
                        </div>
                        <div className="card-body">
                            {/* Formatting Toolbar */}
                            <div className="d-flex mb-3">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => applyFormatting("bold")}
                                >
                                    <strong>B</strong>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => applyFormatting("italic")}
                                >
                                    <em>I</em>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => applyFormatting("heading")}
                                >
                                    H3
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => applyFormatting("link")}
                                >
                                    <FaLink />
                                </button>
                            </div>

                            <div className="alert alert-info">
                                {/* Editable Announcement Section */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center w-100">
                                        {isEditing ? (
                                            <textarea
                                                id="announcementText"
                                                className="form-control"
                                                value={announcement}
                                                onChange={(e) => setAnnouncement(e.target.value)}
                                                rows={4}
                                            />
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: announcement }} />
                                        )}
                                    </div>
                                    <button
                                        className={`btn btn-sm ${isEditing ? "btn-success" : "btn-warning"} ms-3`}
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? <FaSave /> : <FaEdit />} {isEditing ? "Save" : "Edit"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Assignment Form */}
                    <div className="card mt-4 shadow-lg border-0">
                        <h5 className="card-header bg-white text-dark d-flex align-items-center">
                            <FaUpload className="text-primary me-2" size={24} />
                            Add Assignment for Course ID: {courseId}
                        </h5>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}

                                {/* Assignment Title */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Assignment Title*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        maxLength={200}
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold d-flex align-items-center">
                                        <FaUpload className="text-danger me-2" size={20} />
                                        Upload File* (PDF, DOC, DOCX, or TXT, max 10MB)
                                    </label>
                                    <input
                                        type="file"
                                        name="file"
                                        className="form-control"
                                        onChange={handleFileUpload}
                                        accept=".pdf,.doc,.docx,.txt"
                                        required
                                    />
                                </div>

                                {/* File Preview & Delete Option */}
                                {file && (
                                    <div className="mb-3 alert alert-secondary d-flex justify-content-between align-items-center">
                                        <span>{file.name}</span>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={handleFileRemove}
                                        >
                                            <FaTrash className="me-1" /> Remove
                                        </button>
                                    </div>
                                )}
                        

                                {/* Submit Button */}
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? "Submitting..." : "Submit Assignment"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddAssignment;