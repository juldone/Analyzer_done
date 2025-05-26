import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.tiff', '.bmp', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });
  
  const removeFile = () => {
    setSelectedFile(null);
  };
  
  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-accent-500 bg-accent-500 bg-opacity-10' 
              : 'border-dark-600 hover:border-primary-500 hover:bg-dark-700'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <Upload
              size={48}
              className={`${
                isDragActive ? 'text-accent-500' : 'text-gray-400'
              }`}
            />
            <div>
              <p className="text-lg font-medium mb-1">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
              </p>
              <p className="text-sm text-gray-400">
                or click to browse files (JPG, PNG, TIFF, etc.)
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-dark-600 rounded-lg overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between bg-dark-700 px-4 py-3">
            <div className="flex items-center space-x-2">
              <FileImage size={20} className="text-accent-500" />
              <span className="font-medium truncate max-w-xs">
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-4 py-3 text-sm text-gray-400">
            <p>
              Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            <p>
              Type: {selectedFile.type}
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-error-500 flex items-center space-x-1 animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;