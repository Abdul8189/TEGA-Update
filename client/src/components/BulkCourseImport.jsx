import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X,
  FileText,
  Database
} from 'lucide-react';

const BulkCourseImport = ({ onCoursesUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const validateFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('Please upload only Excel files (.xlsx or .xls)');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template that can be opened in Excel
    const templateData = [
      ['Course Title', 'Professor Name', 'Course Duration', 'Number of Modules', 'Video Links/URLs'],
      ['React Basics', 'John Doe', '4 weeks', '3', 'https://youtu.be/dQw4w9WgXcQ,https://youtu.be/abc123,https://youtu.be/def456'],
      ['Python Fundamentals', 'Jane Smith', '6 weeks', '2', 'https://youtu.be/xyz789,https://youtu.be/uvw012'],
      ['JavaScript Advanced', 'Mike Johnson', '8 weeks', '4', 'https://youtu.be/rst345,https://youtu.be/mno678,https://youtu.be/pqr901,https://youtu.be/stu234']
    ];
    
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bulk_course_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template downloaded successfully!');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api('/api/courses/bulk-upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success(`${response.courses.length} courses uploaded successfully!`);
        
        if (onCoursesUploaded) {
          onCoursesUploaded(response.courses);
        }
        
        // Reset form
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      
      if (error.message.includes('token') || error.message.includes('unauthorized')) {
        toast.error('Access denied. No token provided.');
      } else if (error.message.includes('No courses')) {
        toast.error('No courses are available at the moment.');
      } else {
        toast.error(error.message || 'Failed to upload courses');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <FileSpreadsheet className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bulk Course Import</h2>
          <p className="text-gray-600">Upload multiple courses from Excel file</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-green-400 bg-green-50' 
            : selectedFile 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your Excel file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports .xlsx and .xls files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading courses...</span>
            <span className="text-gray-900">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Courses
            </>
          )}
        </button>
        
        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* File Format Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">Required File Format</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Excel/CSV columns (in order):</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Course Title</strong> (required) - Name of the course</li>
                <li><strong>Professor Name</strong> (required) - Instructor's name</li>
                <li><strong>Course Duration</strong> (required) - e.g., "4 weeks", "6 months"</li>
                <li><strong>Number of Modules</strong> (required) - Number of modules in the course</li>
                <li><strong>Video Links/URLs</strong> (required) - Comma-separated video URLs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-medium text-yellow-900">Important Notes</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Video URLs should be valid YouTube, Vimeo, or direct video file links</p>
              <p>• Separate multiple video URLs with commas</p>
              <p>• Each row represents one course with its modules and videos</p>
              <p>• The system will automatically create modules based on the number specified</p>
              <p>• Videos will be distributed evenly across modules</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCourseImport;