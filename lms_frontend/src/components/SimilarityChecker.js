import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Percent, Upload, Trash2, FileText } from 'lucide-react';
import { ResultsList } from './ResultList';

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
        setFiles(prev => [...prev, { id: data.assignment_id, name: file.name }]);
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
          assignment_ids: files.map(f => f.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Comparison failed');
      }

      const data = await response.json();

      if (data.status === 'success') {
        setResults(
          data.results.map((result) => ({
            assignment1: result.assignment1_title,
            assignment2: result.assignment2_title,
            similarity_score: result.similarity_score,
          }))
        );
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-100">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Assignment Similarity Checker
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="flex flex-col gap-6">
              {/* Controls */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    asChild
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md transition-all duration-300"
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md transition-all duration-300"
                >
                  <Percent className="w-4 h-4 mr-2" />
                  {loading ? 'Comparing...' : 'Compare Files'}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 shadow-sm">
                  {error}
                </div>
              )}

              {/* File List */}
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-purple-500 mr-3" />
                      <span className="font-medium text-gray-700">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Results */}
              <ResultsList results={results} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
