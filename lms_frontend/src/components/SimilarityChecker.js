import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Percent, Upload, Trash2, FileText } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      setError(null);
      const response = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();

      if (data.status === 'success') {
        setFiles((prev) => [...prev, { id: data.assignment_id, name: file.name }]);
      } else {
        throw new Error(data.error || 'File upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    }
  };

  const compareFiles = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 files to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/compare/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignment_ids: files.map((f) => f.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Comparison failed');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'Comparison failed');
      }
    } catch (error) {
      console.error('Comparison error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 py-8 flex justify-center items-center">
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-lg rounded-lg">
        <CardHeader className="border-b border-gray-200 p-6">
          <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
            Assignment Similarity Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium shadow-md transition-transform duration-300 transform hover:scale-105"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </label>
              </Button>
            </div>
            <Button
              onClick={compareFiles}
              disabled={files.length < 2 || loading}
              className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-md transition-transform duration-300 transform ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              <Percent className="w-4 h-4 mr-2" />
              {loading ? 'Comparing...' : 'Compare Files'}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-lg text-red-700 shadow-md">
              {error}
            </div>
          )}

          {/* File List */}
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="font-medium text-gray-700">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => setFiles(files.filter((f) => f.id !== file.id))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">
                    Comparison Result #{index + 1}
                  </h3>
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {result.similarity}% Match
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Files: {result.file1} & {result.file2}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
