import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";
import { useEffect,useState } from "react";
import axios from "axios";

const baseUrl="http://127.0.0.1:8000/api/lecturer/";


function UserList() {
    const [StudentData,setStudentData]=useState([]);

    const lecturerId =localStorage.getItem('lecturerId');
    //fetch student when page load
    useEffect(()=>{
        try{
            axios.get(baseUrl+'/fetch -all-enroled-students/'+lecturerId)
            .then((res)=>{
                setStudentData(res.data);
            });
        }catch(error){
            console.log(error);
        }
    },[]);
    return (
        <div className="container mt-4">
            <div className="row">
                <aside className="col-md-3">
                    <LecturerSidebar />
                </aside>
                <section className="col-md-9">
                    <div className="card">
                        <h5 className="card-header">All Student List</h5>
                        <div className="card-body">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Username</th>
                                        <th>Interested Categories</th>
                                        <th>Assignment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {StudentData.map((row,index)=>
                                    <tr>
                                        <td>{row.student.full_name}</td>
                                        <td>{row.student.email}</td>
                                        <td>{row.student.username}</td>
                                        <td>
                                           {row.student.interested_categories}
                                        </td>
                                        <td>
                                            <Link to="#">Assignment</Link>
                                            <Link to="#">Add Assignment</Link>
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

export default UserList;