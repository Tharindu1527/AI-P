import { Link } from 'react-router-dom';
import { useEffect,useState } from 'react';
import axios from 'axios';

{/* Fetch the data from backend to front end */}
const baseUrl = 'http://127.0.0.1:8000/api';
function PopularLecturers() {
  const [lecturer,setLecturer] = useState(null);
  useEffect(() =>{
      axios.get(baseUrl+ '/lecturer/').then((response) =>{
        setLecturer(response.data);
      });
    },[]);
    console.log(lecturer);
  return (
    <div className="container mt-3">
     {/* Popular Courses */}
    <h3 className="pb-1 mb-4 mt-5"> Popular Lecturers</h3>
    <div className="row">
      <div className="col-md-3 mb-4">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <Link to="/lecturer-detail/1">Lecturer Name</Link>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <a href="https://example.com">Lecturer Name</a>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4 ">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <a href="https://example.com">Lecturer Name</a>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <a href="https://example.com">Lecturer Name</a>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <a href="https://example.com">Lecturer Name</a>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <a href="https://example.com">Lecturer Name</a>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <a href="https://example.com">Lecturer Name</a>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-4">
        <div className="card">
          <img src="lecturer.jpeg" className="card-img-top" alt="Course thumbnail" />
          <div className="card-body">
            <h5 className="card-title">
              <a href="https://example.com">Lecturer Name</a>
            </h5>
          </div>
          <div className='card-footer'>
            <div className='title'>
              <span>Rating 4.5/5</span>
              <span className='float-end'>Views :78945</span>
            </div>
          </div>
        </div>
      </div>
      {/* End popular courses */} 
      {/* pagination*/}
   <nav aria-label="Page navigation example">
<ul className="pagination">
  <li className="page-item"><a className="page-link" href="https://example.com">Previous</a></li>
  <li className="page-item"><a className="page-link" href="https://example.com">1</a></li>
  <li className="page-item"><a className="page-link" href="https://example.com">2</a></li>
  <li className="page-item"><a className="page-link" href="https://example.com">3</a></li>
  <li className="page-item"><a className="page-link" href="https://example.com">Next</a></li>
</ul>
</nav>
    {/* end pagination*/}
    </div>
     
  </div>  
  );
}
export default PopularLecturers;