import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';

export function FileUploader({ onFileUpload }) {
  return (
    <Button className="relative overflow-hidden">
      <input
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onFileUpload}
        accept=".txt,.doc,.docx,.pdf"
      />
      <Upload className="w-4 h-4 mr-2" />
      Upload Assignment
    </Button>
  );
}