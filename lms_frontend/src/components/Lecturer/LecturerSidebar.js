import { Link } from "react-router-dom";
function LecturerSidebar(){
    return(
        <div className="card">
        <div class="list-group">
        <h5 className="card-header">Dashboard</h5>
       
       <Link to='/lecturer-courses'button type="button" class="list-group-item list-group-item-action">My Courses</Link>
       <Link to='/add-courses' button type="button" class="list-group-item list-group-item-action">Add course</Link>
       <Link to='/user-list'button type="button" class="list-group-item list-group-item-action" disabled>My Users</Link>
       <Link to='/lecturer-profile-settings'button type="button" class="list-group-item list-group-item-action " disabled >Profile Setting</Link>
       <Link to='/lecturer-change-password'button type="button" class="list-group-item list-group-item-action" disabled>Change Password</Link>
       <Link to='/lecturer-logout'button type="button" class="list-group-item list-group-item-action text-danger" >Logout</Link>
       </div>
        </div>
    )
}
export default LecturerSidebar;