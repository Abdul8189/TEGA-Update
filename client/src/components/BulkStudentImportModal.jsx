import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import MessageDisplay from './ui/MessageDisplay';
import { useMessage } from '../hooks/useMessage';
import { getMessage } from '../utils/messages';
import { api } from '../utils/api';

const BulkStudentImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      parseExcel(selectedFile);
    }
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawData.length < 2) {
          toast.error('Excel file must have at least a header row and one data row');
          return;
        }

        // Expected columns in order
        const expectedColumns = [
          'Username', 'Student Name', 'First Name', 'Last Name', 'Email', 
          'Phone', 'Password', 'Institute', 'Course', 'Major', 'Year of Study', 
          'Date of Birth', 'Gender', 'Address', 'Landmark', 'Zipcode', 'City', 'District'
        ];

        const headers = rawData[0];
        const dataRows = rawData.slice(1);

        // Map the data to the expected format
        const formattedStudents = dataRows.map((row, index) => {
          const student = {
            username: row[0] || '',
            studentName: row[1] || '',
            firstName: row[2] || '',
            lastName: row[3] || '',
            email: row[4] || '',
            phone: row[5] || '',
            password: row[6] || 'defaultPassword123', // Default password if not provided
            institute: row[7] || '',
            course: row[8] || '',
            major: row[9] || '',
            yearOfStudy: row[10] ? parseInt(row[10]) || 1 : 1,
            dob: row[11] ? parseDate(row[11]) : null,
            gender: row[12] ? normalizeGender(row[12]) : 'Other',
            address: row[13] || '',
            landmark: row[14] || '',
            zipcode: row[15] || '',
            city: row[16] || '',
            district: row[17] || '',
            acceptTerms: true // Required field
          };

          // Use firstName + lastName if studentName is empty
          if (!student.studentName && (student.firstName || student.lastName)) {
            student.studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
          }

          // Use studentName if firstName/lastName are empty
          if (!student.firstName && !student.lastName && student.studentName) {
            const nameParts = student.studentName.split(' ');
            student.firstName = nameParts[0] || '';
            student.lastName = nameParts.slice(1).join(' ') || '';
          }

          return student;
        });

        setPreviewData(formattedStudents);
        setShowPreview(true);
      } catch (error) {
        console.error('Excel parsing error:', error);
        const errorMessage = getMessage('file', 'upload', file.name, error.message);
        showError(errorMessage, 'File Processing Error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Handle different date formats
    if (typeof dateString === 'string') {
      // Try dd-mm-yyyy format
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
      
      // Try other common formats
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // If it's already a Date object
    if (dateString instanceof Date) {
      return dateString;
    }
    
    return null;
  };

  const normalizeGender = (gender) => {
    if (!gender) return 'Other';
    const normalized = gender.toString().toLowerCase().trim();
    if (['male', 'm'].includes(normalized)) return 'Male';
    if (['female', 'f'].includes(normalized)) return 'Female';
    return 'Other';
  };

  const handleImport = async () => {
    if (!previewData.length) {
      showError('No data to import. Please upload a file with student data first.', 'Import Error');
      return;
    }

    setIsProcessing(true);
    clearMessage();

    try {
      const response = await api('/api/admin/students/bulk-import', {
              method: 'POST',
        body: { students: previewData }
      });

      const successMessage = getMessage('user', 'bulkImport', null, { count: previewData.length });
      showSuccess(successMessage, 'Import Successful');
      
      onImportSuccess();
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        setPreviewData([]);
        setShowPreview(false);
        setFile(null);
      }, 1500);
      
        } catch (error) {
          const errorMessage = getMessage('user', 'bulkImport', error.message);
          showError(errorMessage, 'Import Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      ['Username', 'Student Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Password', 'Institute', 'Course', 'Major', 'Year of Study', 'Date of Birth', 'Gender', 'Address', 'Landmark', 'Zipcode', 'City', 'District'],
      ['john_doe', 'John Doe', 'John', 'Doe', 'john.doe@email.com', '+1234567890', 'password123', 'MIT', 'Computer Science', 'Software Engineering', '3', '15-06-2000', 'Male', '123 Main St', 'Near Park', '12345', 'Boston', 'Massachusetts'],
      ['jane_smith', 'Jane Smith', 'Jane', 'Smith', 'jane.smith@email.com', '+1234567891', 'password123', 'Stanford', 'Engineering', 'Mechanical', '2', '20-08-2001', 'Female', '456 Oak Ave', 'Downtown', '54321', 'Stanford', 'California']
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students Template');
    
    // Auto-size columns
    const colWidths = sampleData[0].map(col => ({ wch: Math.max(col.length, 15) }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, 'students_import_template.xlsx');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Bulk Import Students</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Professional Message Display */}
        <MessageDisplay
          show={message.show}
          type={message.type}
          title={message.title}
          message={message.message}
          onClose={clearMessage}
          className="mb-6"
        />

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Required Excel Format</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload an Excel file with columns in this exact order:
          </p>
          <div className="grid grid-cols-6 gap-2 text-xs">
            {[
              'Username', 'Student Name', 'First Name', 'Last Name', 'Email', 
              'Phone', 'Password', 'Institute', 'Course', 'Major', 'Year of Study', 
              'Date of Birth', 'Gender', 'Address', 'Landmark', 'Zipcode', 'City', 'District'
            ].map((col, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded text-center">
                {col}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={downloadSampleTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Download Sample Template
            </button>
            <div className="text-sm text-gray-600">
              <strong>Note:</strong> Password field is optional - will use 'defaultPassword123' if empty. Student IDs will be auto-generated.
            </div>
          </div>
        </div>

        <div className="mb-6">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {showPreview && previewData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Preview ({previewData.length} students)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Username</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Student ID</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Email</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Institute</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Course</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Password</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-xs">{student.username}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">{student.studentId}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">{student.studentName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">{student.email}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">{student.institute}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">{student.course}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">
                        <span className={`px-2 py-1 rounded text-xs ${student.password === 'defaultPassword123' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {student.password === 'defaultPassword123' ? 'Default' : 'Custom'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-xs">
                        <span className={`px-2 py-1 rounded text-xs ${
                          student.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                          student.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {previewData.length > 5 && (
                    <tr>
                      <td colSpan="8" className="border border-gray-300 px-3 py-2 text-center text-xs text-gray-500">
                        ... and {previewData.length - 5} more students
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            disabled={isProcessing} 
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport} 
            disabled={isProcessing || !previewData.length} 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Importing...' : `Import ${previewData.length} Students`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkStudentImportModal;
