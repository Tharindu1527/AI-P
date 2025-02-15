import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
function LecturerDetail(){
    let { course_id } = useParams();
  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-4">
          <img src="/logo512.png" className="img-thumbnail" alt="Lecturer Image" />
        </div>
        <div className="col-8">
          <h3>John Doe </h3> {/* Display course_id here */}
          <p>
            Using a combination of grid and utility classes, cards can be made horizontal in a 
            mobile-friendly and responsive way. In the example below, we remove the grid gutters
            with .g-0 and use .col-md-* classes to make the card horizontal at the md breakpoint. 
            Further adjustments may be needed depending on your card content.
          </p>
          <p className="fw-bold">Skills: <Link to="/category/php">PHP</Link>,
          <Link to="/category/php">Javascript</Link></p>
          <p className="fw-bold">Recent Course:<Link to="/category/php">Reactjs Course</Link></p> 
         
          <p className="fw-bold">Rating: 4/5</p>
        </div>
      </div>
      {/* Course videos */}
      <div className="card mt-4"> 
        <h5 className="card-header">
          Course Lists
        </h5>
        <div className="list-group list-group-flush">
            <Link to="./detail/1" class="list-group-item list-group-item-action">PHP Course 1</Link>
            <Link to="./detail/1" class="list-group-item list-group-item-action">PHP Course 2</Link>
            <Link to="./detail/1" class="list-group-item list-group-item-action">Python Course 1</Link>
            <Link to="./detail/1" class="list-group-item list-group-item-action">Python Course 2</Link>
            <Link to="./detail/1" class="list-group-item list-group-item-action">Javascript Course 1</Link>
            <Link to="./detail/1" class="list-group-item list-group-item-action">Javascript Course 2</Link>
        </div>
       
   
  
    </div>
    </div>
  );
}



    
   

export default LecturerDetail;