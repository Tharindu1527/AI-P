import { Link } from "react-router-dom";
import LecturerSidebar from "./LecturerSidebar";

function LecturerDashboard(){
    return(
        <div className="container mt-4">
            <div className="row">
                  <aside className="col-md-3">
                  <LecturerSidebar/>
            </aside>
            <section className="col-md-9">
           Dashboard
            </section>
        </div>
        </div>
    )
}
export default LecturerDashboard;