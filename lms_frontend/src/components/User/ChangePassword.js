import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ChangePassword() {
  const handlePasswordChange = () => {
    toast.success("Password updated successfully!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-center">
          <aside className="hidden md:block w-1/4">
            <Sidebar />
          </aside>
          <section className="md:w-3/4 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto">
              <ToastContainer />
              <div className="text-center mb-8">
                <img
                  src="/assets/key.png" // Add your image here
                  alt="Password Icon"
                  className="mx-auto h-20 w-20 mb-6"
                />
                <h2 className="text-3xl font-bold text-gray-800">Change Your Password</h2>
                <p className="text-gray-500 mt-2">Secure your account with a new password.</p>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="mb-6">
                  <label htmlFor="newPassword" className="block text-lg font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter your new password"
                    className="mt-2 p-4 w-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    className="mt-2 p-4 w-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  onClick={handlePasswordChange}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  Update Password
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/user-dashboard" className="text-blue-600 hover:underline">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
