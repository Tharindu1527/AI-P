//import { Link } from "react-router-dom";
import { useEffect,useState } from "react";
import axios from "axios";

const baseUrl="http://127.0.0.1:8000/api/lecturer/";

function LecturerRegister(){
    
    const [lecturerData,setlecturerData] = useState({
        "full_name": "",
        "email": "",
        "password": "",
        "qualification": "",
        "department": "",
        "mobile_no": "",
        "address": "",
        "status": ""
    });

    //change Element value
    const handleChange=(event)=>{
        setlecturerData({
            ...lecturerData,
            [event.target.name] : event.target.value
        });
    }
    //End

    // Submit Form
    const submitForm=()=>{
        const lectureFormrData = new FormData();
        lectureFormrData.append("full_name", lecturerData.full_name)
        lectureFormrData.append("email", lecturerData.email)
        lectureFormrData.append("password", lecturerData.password)
        lectureFormrData.append("qualification", lecturerData.qualification)
        lectureFormrData.append("department", lecturerData.department)
        lectureFormrData.append("mobile_no", lecturerData.mobile_no)
        lectureFormrData.append("address", lecturerData.address)

        try{
            axios.post(baseUrl,lectureFormrData).then((response)=>{
                setlecturerData({
        "full_name": "",
        "email": "",
        "password": "",
        "qualification": "",
        "department": "",
        "mobile_no": "",
        "address": "",
        "status": "success",
    });
            });
        } 
        catch(error){
            console.log(error);
            setlecturerData({'status':"error"})
        }
    };
    //End
    useEffect(()=>{
        document.title='Lecturer Register'
    });

    const lecturerLoginStatus = localStorage.getItem('lecturerLoginStatus')
     if(lecturerLoginStatus === 'true'){
        window.location.href='/lecturer-dashboard';
     }
    return(
     <div className="container mt-4">
         <div className="row">
             <div className="col-6 offset-3">
             {lecturerData.status == "success" &&<p className="text-success">Thanks for Registration</p>}
             {lecturerData.status =="error" &&<p className="text-danger">Something went wrong</p>}
                 <div className="card">
                     <h5 className="card-header">Lecturer Register</h5>
                     <div className="card-body">
                     <form>
                         <div className="mb-3">
                            <label for="exampleInputEmail1" className="form-label">Full Name</label>
                                <input value={lecturerData.full_name} onChange={handleChange} name="full_name" type="text" className="form-control"/>
                         </div>
                         <div className="mb-3">
                            <label for="exampleInputEmail1" className="form-label">Email</label>
                                <input value={lecturerData.email}  onChange={handleChange} name="email" type="email" className="form-control"/>
                         </div>
                         <div className="mb-3">
                                <label for="exampleInputPassword1" className="form-label">Password</label>
                                <input value={lecturerData.password} onChange={handleChange} name="password" type="password" className="form-control" id="exampleInputPassword1"/>
                         </div>
                         <div className="mb-3">
                            <label for="exampleInputEmail1" className="form-label">Qualification</label>
                                <input value={lecturerData.qualification}   onChange={handleChange} name="qualification" type="text" className="form-control"/>
                         </div>
                         <div className="mb-3">
                            <label for="exampleInputEmail1" className="form-label">Department</label>
                                <input value={lecturerData.department} onChange={handleChange} name="department" type="text" className="form-control"/>
                         </div>
                         <div className="mb-3">
                            <label for="exampleInputEmail1" className="form-label">Mobile Number</label>
                                <input value={lecturerData.mobile_no} onChange={handleChange} name="mobile_no" type="number" className="form-control"/>
                         </div>
                         <div className="mb-3">
                            <label for="exampleInputEmail1" className="form-label">Address</label>
                            <textarea value={lecturerData.address} onChange={handleChange} name="address" className="form-control"></textarea>
                         </div>
                         <button onClick={submitForm} type="submit" class="btn btn-primary">Register</button>
                             </form>
                     </div>
                 </div>
             </div>
         </div>
     </div>
    )
 
 }
 export default LecturerRegister;
 