import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";
import { useEffect, useState } from "react";
import axios from "axios";
const baseUrl = "http://127.0.0.1:8000/api";


function AddChapters() {
    
    const [chapterData, setChapterData] = useState({
        
        title: '',
        description: '',
        video: '',
        
    });

    // Get lecturer ID from localStorage
    const lecturerId = localStorage.getItem('lecturerId');

    

    const handleChange = (event) => {
        setChapterData({
            ...chapterData,
            [event.target.name]: event.target.value
        });
    }

    const handleFileChange = (event) => {
        setChapterData({
            ...chapterData,
            [event.target.name]: event.target.files[0]
        });
    }

    const formSubmit = (e) => {
        e.preventDefault();
        
        const _formData = new FormData();
        _formData.append('chapter', chapterData.category); // Use dynamic lecturer ID instead of hardcoded value
        _formData.append('title', chapterData.title);
        _formData.append('description', chapterData.description);
        if (chapterData.video) {
            _formData.append('video', chapterData.video);
        }
        

        try {
            axios.post(baseUrl + '/chapter/', _formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then((res) => {
                if (res.status === 200 || res.status === 201) {
                    alert('Course has been added successfully!');
                    // Reset form
                    setChapterData({
                        category: '',
                        title: '',
                        description: '',
                        video: '',
                        
                    });
                    window.location.href='/add-chapter/'+2
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
                    <LecturerSidebar/>
                </aside>
                <div className="col-9">
                    <div className="card">
                        <h5 className="card-header">Add Chapter</h5>
                        <div className="card-body">
                            <form>
                                <div className="mb-3">
                                    <label for="title" className="form-label">Title</label>
                                    <input type="text" id="title" onChange={handleChange} className="form-control"/> 
                                </div>
                                <div className="mb-3">
                                    <label for="title" className="form-label">Description</label>
                                    <input type="text" id="description"onChange={handleChange} className="form-control"/> 
                                </div>
                                <div class="mb-3 row">
                                <label for="inputPassword" class="col-sm-2 col-form-label">Related vedio</label>
                                 <div class="col-sm-10">
                                 <input type="file" class="form-control"onChange={handleChange} id="vedio"/>
                                  </div></div>
                                {/*<div className="mb-3">
                                    <label for="title" className="form-label">Remarks</label>
                                    <input type="text" id="title" placeholder="THis is the introduction vedio" className="form-control"/> 
                                </div>*/}
                                
                                <button type="submit" onClick={formSubmit} class="btn btn-primary">Submit</button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}
export default AddChapters;
