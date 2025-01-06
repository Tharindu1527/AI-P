import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";

function LecturerProfileSettings(){
    return(
        <div className="container mt-4">
            <div className="row">
                  <aside className="col-md-3">
                  <LecturerSidebar/>
            </aside>
            <section className="col-md-9">
                <div className="card">
                    <h5 className="card-header">Lecturer Profile Settings</h5>
                    <div className="card-body">
                    <div class="mb-3 row">
                           <label for="inputPassword" class="col-sm-2 col-form-label">Full Name</label>
            <div class="col-sm-10">
                <input type="password" class="form-control" id="inputPassword"/>
            </div>
            </div>
            <div class="mb-3 row">
                <label for="inputPassword" class="col-sm-2 col-form-label">Email</label>
            <div class="col-sm-10">
                <input type="password" class="form-control" id="inputPassword"/>
            </div>
            </div>
            <div class="mb-3 row">
                <label for="inputPassword" class="col-sm-2 col-form-label">Profile Photo</label>
            <div class="col-sm-10">
                <input type="file" class="form-control" id="inputPassword"/>
            </div>
            </div>
                <div class="mb-3 row">
                           <label for="inputPassword" class="col-sm-2 col-form-label">Password</label>
            <div class="col-sm-10">
                             <input type="password" class="form-control" id="inputPassword"/>
            </div>
            </div>
            <button className="btn btn-primary">Update</button>
                    </div>
                </div>
            
            </section>
        </div>
        </div>
    )
}
export default LecturerProfileSettings;