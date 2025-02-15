import React from 'react';
import { FileText } from 'lucide-react';

export function FileList({ files }) {
  if (!files.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Uploaded Files:</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-4 h-4 text-gray-500" />
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}