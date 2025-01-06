//import { Link } from "react-router-dom";
import { useEffect,useState } from "react";
import axios from "axios";

const baseUrl= "http://127.0.0.1:8000/api"

function Login(){
    const [studentLoginData,setstudentLoginData]=useState({
        username:'',
        password:'',
    });

    const handleChange = (event)=>{
        setstudentLoginData({...studentLoginData,
            [event.target.name]:event.target.value})
    }

    const submitForm=()=>{
        const studentFormData = new FormData;
        studentFormData.append('username',studentLoginData.username);
        studentFormData.append('password',studentLoginData.password);
        try{
            axios.post(baseUrl+"/user-login",studentFormData)
            .then((res)=>{
                console.log(res.data);
                if(res.data.bool===true){
                    localStorage.setItem('studentLoginStatus','true');
                    localStorage.setItem('studentId',res.data.student_id);
                    window.location.href="/user-dashboard";
                }else {
                    alert("Invalid username or password.");
                }
            });  // Added missing semicolon
        }catch(error){
            console.log(error)
        }
    }

    const studentLoginStatus = localStorage.getItem('studentLoginStatus')
    if(studentLoginStatus === 'true'){
        window.location.href="/user-dashboard";
    }

    useEffect(()=>{
        document.title = 'User Login'
    });

   return(
    <div className="container mt-4">
        <div className="row">
            <div className="col-6 offset-3">
                <div className="card">
                    <h5 className="card-header">User Login</h5>
                    <div className="card-body">
                    <form>
                        <div className="mb-3">
                           <label htmlFor="exampleInputEmail1" className="form-label">User Name</label>
                               <input onChange={handleChange} value={studentLoginData.username} name="username" type="text" className="form-control"/>
                        </div>
                        <div className="mb-3">
                               <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                               <input onChange={handleChange} value={studentLoginData.password} name="password" type="password" className="form-control" id="exampleInputPassword1"/>
                        </div>
                        <div className="mb-3 form-check">
                              <input type="checkbox" className="form-check-input" id="exampleCheck1"/>
                              <label className="form-check-label" htmlFor="exampleCheck1">Remember  me </label>
                        </div>
                              <button type="submit" onClick={submitForm} className="btn btn-primary">Login</button>
                            </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
   )
}

export default Login;