import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProfileSettings() {
    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Profile updated successfully!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ToastContainer />
            <div className="container mx-auto mt-4">
                <div className="row">
                    <aside className="col-md-3">
                        <Sidebar />
                    </aside>
                    <section className="col-md-9">
                        <div className="bg-white rounded-lg shadow-lg">
                            <h5 className="bg-gray-800 text-white p-4 rounded-t-lg text-xl font-semibold">Profile Settings</h5>
                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4 row">
                                        <label htmlFor="fullName" className="col-sm-2 col-form-label">Full Name</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="fullName"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 row">
                                        <label htmlFor="email" className="col-sm-2 col-form-label">Email</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 row">
                                        <label htmlFor="profilePhoto" className="col-sm-2 col-form-label">Profile Photo</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="profilePhoto"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 row">
                                        <label htmlFor="password" className="col-sm-2 col-form-label">Password</label>
                                        <div className="col-sm-10">
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                placeholder="Enter your new password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button 
    type="submit" 
    className="btn btn-primary py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
>
    Update Profile
</button>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default ProfileSettings;
