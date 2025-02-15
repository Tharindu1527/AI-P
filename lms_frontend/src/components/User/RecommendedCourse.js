import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

function RecommendedCourses() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <div className="container mx-auto mt-4">
                <div className="grid grid-cols-12 gap-6">
                    <aside className="col-span-3">
                        <Sidebar />
                    </aside>
                    <section className="col-span-9">
                        <div className="bg-white rounded-lg shadow-lg">
                            <h5 className="bg-gray-800 text-white p-4 rounded-t-lg text-xl font-semibold">Recommended Courses</h5>
                            <div className="p-6">
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700">
                                            <th>Name</th>
                                            <th>Created By</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>PHP Development</td>
                                            <td><Link to="/">Person1</Link></td>
                                            <td>
                                                <button className="btn btn-danger btn-sm">Delete</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Python Programming</td>
                                            <td><Link to="/">Person2</Link></td>
                                            <td>
                                                <button className="btn btn-danger btn-sm">Delete</button>
                                            </td>
                                        </tr>
                                        {/* Additional rows can be added here */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default RecommendedCourses;

