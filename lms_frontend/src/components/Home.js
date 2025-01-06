import { Link } from "react-router-dom";
import AllCourses from "./AllCourses";
 // Ensure this path is correct
 import { useEffect } from "react";


function Home() {
  useEffect(()=>{
    document.title='Home page';
})
    return (
      <div className="container mt-4"> 
       {/* Latest Courses */}
       <h3 className="pb-1 mb-4 mt-5">Latest Courses<Link to ='./all-courses' class="float-end">See All</Link></h3>
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
                </h5>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
                </h5>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
                </h5>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
                </h5>
              </div>
            </div>
          </div>
          {/* End Latest courses */}
      </div>
      {/* Popular Courses */}
      <h3 className="pb-1 mb-4 mt-5">Popular Courses<Link to ='./popular-courses' className="float-end">See All</Link></h3>
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
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
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
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
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
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
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Course thumbnail" />
              <div className="card-body">
                <h5 className="card-title">
                  <a href="https://example.com">Course title</a>
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
        </div>
  
        {/* Popular Lecturers */}
        <h3 className="pb-1 mb-4 mt-5">Popular Lecturers<Link to='/popular-lecturers' className="float-end">See All</Link></h3>
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Lecturer thumbnail" />
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
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Lecturer thumbnail" />
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
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Lecturer thumbnail" />
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
          <div className="col-md-3">
            <div className="card">
              <img src="logo512.png" className="card-img-top" alt="Lecturer thumbnail" />
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
        </div>
        {/* End popular lecturers */}
        {/*Student Testimonial*/}
        <h3 className="pb-1 mb-4 mt-5">Student Testimonial</h3>
        <div id="carouselExampleIndicators" className="carousel slide bg-dark text-white py-5">
     <div className="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
  </div>
  <div className="carousel-inner">
    <div className="carousel-item active">
    <figure className="text-center">
    <blockquote className="blockquote">
    <p>A well-known quote, contained in a blockquote element.</p>
    </blockquote>
    <figcaption className="blockquote-footer">
    Someone famous in <cite title="Source Title">Source Title</cite>
    </figcaption>
    </figure>
    </div>
    <div className="carousel-item">
       <figure className="text-center">
         <blockquote className="blockquote">
         <p>A well-known quote, contained in a blockquote element.</p>
         </blockquote>
        <figcaption className="blockquote-footer">
         Someone famous in <cite title="Source Title">Source Title</cite>
        </figcaption>
        </figure>
    </div>
    <div className="carousel-item">
    <figure className="text-center">
         <blockquote className="blockquote">
         <p>A well-known quote, contained in a blockquote element.</p>
         </blockquote>
        <figcaption className="blockquote-footer">
         Someone famous in <cite title="Source Title">Source Title</cite>
        </figcaption>
        </figure>
    </div>
  </div>
  <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Previous</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Next</span>
  </button>
  </div>
        {/* End popular lecturers */}
      </div>
      
     
    );
  }
  
  export default Home;
  