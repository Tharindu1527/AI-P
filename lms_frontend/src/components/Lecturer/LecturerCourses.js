import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";
import { useState,useEffect } from "react";
import axios from "axios";


const baseUrl="http://127.0.0.1:8000/api"
function LecturerCourses() {
    const [courseData,setCourseData]=useState([]);

    const lecturerId = localStorage.getItem('lecturerId');
    console.log(lecturerId)
    //fetch course
    useEffect(() => {
        try {
            axios.get(baseUrl +'/lecturer-course/'+lecturerId )
                .then((res) => {
                    setCourseData(res.data);
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

   
    
    return (
        <div className="container mt-4">
            <div className="row">
                <aside className="col-md-3">
                    <LecturerSidebar />
                </aside>
                <section className="col-md-9">
                    <div className="card">
                        <h5 className="card-header">Lecturer Courses</h5>
                        <div className="card-body">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Iamge</th>
                                        <th>Total Enrolled</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseData.map((course,index)=> 
                                    <tr>
                                        <td>{course.title}</td>
                                        <td><img src={course.featured_img} width="8"  className="rounded"alt={course.title}></img></td>
                                        <td><Link to="/">12</Link></td>
                                        <td>
                                            <button className="btn btn-danger btn-sm">Delete</button>
                                            <Link  class="btn btn-success btn-sm  ms-2" to={"/add-chapters/"+course.id}>Add Chapters</Link>
                                            <Link className="btn btn-success btn-sm ms-2" to={`/add-assignment/${course.id}`}>
    Add Assignments
</Link>

                                        </td>
                                    </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default LecturerCourses;
