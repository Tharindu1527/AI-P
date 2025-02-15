import React from 'react';

export function ResultsList({ results }) {
  if (!results.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Similarity Results:</h3>
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-2">
              {result.assignment1} vs {result.assignment2}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${result.similarity_score}%` }}
                />
              </div>
              <span className="text-sm font-medium w-16">
                {result.similarity_score}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}