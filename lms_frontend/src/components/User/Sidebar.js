import { Link } from "react-router-dom";
function Sidebar(){
    return(
        <div className="card">
        <h5 className="card-header">Dashboard</h5>
       
        <div class="list-group">
       
        <Link to='/my-courses'button type="button" class="list-group-item list-group-item-action">My Courses</Link>
        <Link to='/favorite-courses'button type="button" class="list-group-item list-group-item-action">Favorite Courses</Link>
        <Link to='/recommended-course' button type="button" class="list-group-item list-group-item-action">Recomended Courses</Link>
        <Link to='/profile-settings'button type="button" class="list-group-item list-group-item-action" disabled>Profile Settings</Link>
        <Link to='/user-logout'button type="button" class="list-group-item list-group-item-action text-danger" disabled >Logout</Link>
        </div>
        </div>
       
    )
}
export default Sidebar;