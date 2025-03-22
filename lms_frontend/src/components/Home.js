import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Users, FileText, Database, Search } from 'lucide-react';

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Hook to navigate between pages

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-[500px]">
        <img
          src="/assets/banner.webp"
          alt="Plagiarism Detector"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70">
          <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
            <div className="max-w-2xl text-white text-center">
              <h1 className="text-5xl font-bold mb-4">Plagiarism Detection System</h1>
              <p className="text-xl mb-6">Ensuring Academic Integrity and Originality</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-400 to-indigo-500 px-6 py-3 rounded text-white font-semibold hover:from-indigo-500 hover:to-blue-400 transition-all mb-4"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Why Choose Us?</h2>
          <p className="text-gray-700 mb-12">
            Our advanced plagiarism detection system ensures accuracy and integrity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comprehensive Reports</h3>
              <p className="text-gray-600">
                Detailed insights into originality scores and sources.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Extensive Databases</h3>
              <p className="text-gray-600">
                Access to millions of documents for better detection.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast & Accurate</h3>
              <p className="text-gray-600">Quick scans with precise results every time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">10,000+</h3>
            <p className="text-gray-600">Students Submitted</p>
          </div>
          <div className="text-center">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">3,000+</h3>
            <p className="text-gray-600">Reports Generated</p>
          </div>
          <div className="text-center">
            <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">50+</h3>
            <p className="text-gray-600">Research Databases</p>
          </div>
          <div className="text-center">
            <Search className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">100%</h3>
            <p className="text-gray-600">Accuracy on Detection</p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-96 text-center">
            <h3 className="text-2xl font-bold mb-6">Login Options</h3>
            <button
              onClick={() => navigate('/lecturer-register')} // Navigate to lecturer login page
              className="bg-blue-600 px-6 py-2 rounded text-white font-semibold hover:bg-blue-700 transition-all w-full mb-4"
            >
              Login as Lecturer
            </button>
            <button
              onClick={() => navigate('/user-register')} // Navigate to user registration instead of login
              className="bg-blue-600 px-6 py-2 rounded text-white font-semibold hover:bg-blue-700 transition-all w-full"
            >
              Login as Student
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;