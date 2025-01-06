import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";
import { useEffect, useState } from "react";
import axios from "axios";
const baseUrl = "http://127.0.0.1:8000/api";

function AddCourses() {
    const [cats, setCats] = useState([]);
    const [courseData, setCourseData] = useState({
        category: '',
        title: '',
        description: '',
        f_img: '',
        techs: ''
    });

    // Get lecturer ID from localStorage
    const lecturerId = localStorage.getItem('lecturerId');

    useEffect(() => {
        try {
            axios.get(baseUrl + '/category/')
                .then((res) => {
                    setCats(res.data);
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

    const handleChange = (event) => {
        setCourseData({
            ...courseData,
            [event.target.name]: event.target.value
        });
    }

    const handleFileChange = (event) => {
        setCourseData({
            ...courseData,
            [event.target.name]: event.target.files[0]
        });
    }

    const formSubmit = (e) => {
        e.preventDefault();
        
        const _formData = new FormData();
        _formData.append('category', courseData.category);
        _formData.append('lecturer', lecturerId); // Use dynamic lecturer ID instead of hardcoded value
        _formData.append('title', courseData.title);
        _formData.append('description', courseData.description);
        if (courseData.f_img) {
            _formData.append('featured_img', courseData.f_img);
        }
        _formData.append('techs', courseData.techs);

        try {
            axios.post(baseUrl + '/course/', _formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((res) => {
                if (res.status === 200 || res.status === 201) {
                    alert('Course has been added successfully!');
                    // Reset form
                    setCourseData({
                        category: '',
                        title: '',
                        description: '',
                        f_img: '',
                        techs: ''
                    });
                }
            });
        } catch (error) {
            console.log(error);
            alert('Error adding course');
        }
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <aside className="col-md-3">
                    <LecturerSidebar />
                </aside>
                <div className="col-9">
                    <div className="card">
                        <h5 className="card-header">Add Course</h5>
                        <div className="card-body">
                            <form onSubmit={formSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="category" className="form-label">Category</label>
                                    <select name="category" value={courseData.category} onChange={handleChange} className="form-control">
                                        <option value="">Select Category</option>
                                        {cats.map((category, index) => (
                                            <option key={index} value={category.id}>{category.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={courseData.title}
                                        onChange={handleChange} 
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea 
                                        name="description"
                                        value={courseData.description}
                                        onChange={handleChange} 
                                        className="form-control"
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="f_img" className="form-label">Featured Image</label>
                                    <input 
                                        type="file"
                                        name="f_img"
                                        onChange={handleFileChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="techs" className="form-label">Technologies</label>
                                    <textarea 
                                        name="techs"
                                        value={courseData.techs}
                                        onChange={handleChange}
                                        placeholder="Php,Python,js,HTML,CSS"
                                        className="form-control"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddCourses;