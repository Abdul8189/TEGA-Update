import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { api } from '../utils/api';

const BulkImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [principals, setPrincipals] = useState([]);
  const [loading, setLoading] = useState(false);

  const downloadSampleTemplate = () => {
    // Sample data for the template
    const sampleData = [
      ['Principal Name', 'Email', 'University', 'Password', 'Gender'],
      ['Dr. Rajesh Kumar', 'rajesh.kumar@univ.com', 'Delhi University', 'principal123', 'male'],
      ['Dr. Neha Sharma', 'neha.sharma@univ.com', 'Mumbai University', '', 'female'],
      ['Prof. Arvind Rao', 'arvind.rao@univ.com', 'IIT Bombay', 'custompass456', 'male'],
      ['Dr. Sunita Mehta', 'sunita.mehta@univ.com', 'IIT Delhi', '', 'female'],
      ['Dr. Manish Verma', 'manish.verma@univ.com', 'Anna University', 'principal123', 'male']
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Principals Template');

    // Auto-size columns
    const colWidths = [20, 25, 20, 15, 12];
    ws['!cols'] = colWidths.map(width => ({ width }));

    // Download the file
    XLSX.writeFile(wb, 'principals_import_template.xlsx');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Raw Excel data:', jsonData);
        
        if (jsonData.length === 0) {
          toast.error('No data found in the Excel file. Please check the file format.');
          return;
        }
        
        // Get the first row to see what columns are available
        const firstRow = jsonData[0];
        console.log('First row columns:', Object.keys(firstRow));
        
        // More flexible column mapping
        const formattedData = jsonData.map((row, index) => {
          // Try different possible column names
          const principalName = row['Principal Name'] || row['PrincipalName'] || row['Name'] || row['Full Name'] || row['FullName'] || '';
          const email = row['Email'] || row['email'] || row['Email Address'] || row['EmailAddress'] || '';
          const university = row['University'] || row['university'] || row['Institution'] || row['College'] || row['School'] || '';
          const password = row['Password'] || row['password'] || row['Pass'] || row['pass'] || 'defaultPassword123';
          const gender = row['Gender'] || row['gender'] || row['Sex'] || row['sex'] || 'other';
          
          // Validate required fields
          if (!principalName || !email || !university) {
            console.warn(`Row ${index + 1} missing required fields:`, { principalName, email, university });
            return null; // Skip invalid rows
          }
          
          return {
            principalName,
            email,
            university,
            password,
            gender
          };
        }).filter(Boolean); // Remove null entries
        
        console.log('Formatted data:', formattedData);
        
        if (formattedData.length === 0) {
          toast.error('No valid data found. Please check your Excel file format.');
          return;
        }
        
        setPrincipals(formattedData);
        toast.success(`Successfully parsed ${formattedData.length} principals from Excel file.`);
        
      } catch (error) {
        console.error('Excel parsing error:', error);
        toast.error('Failed to parse Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (principals.length === 0) {
      toast.error('No principals to import.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api('/api/admin/principals/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ principals })
      });

      if (response.success) {
        toast.success(`${response.createdCount} principals imported successfully.`);
        onImportSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to import principals.');
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error(error.message || 'An error occurred during bulk import.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Bulk Import Principals</h2>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Upload Excel File</label>
            <button
              type="button"
              onClick={() => downloadSampleTemplate()}
              className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              📥 Download Sample Template
            </button>
          </div>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 font-medium mb-2">📋 Excel File Format Requirements:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Column 1:</strong> Principal Name (required)</p>
              <p><strong>Column 2:</strong> Email (required, must be unique)</p>
              <p><strong>Column 3:</strong> University (required)</p>
              <p><strong>Column 4:</strong> Password (optional - will use "principal123" if empty)</p>
              <p><strong>Column 5:</strong> Gender (optional - male/female/other)</p>
            </div>
            <p className="text-xs text-blue-600 mt-2 italic">💡 Tip: Make sure your Excel file has headers in the first row</p>
            <p className="text-xs text-green-600 mt-1 font-medium">🔑 Default Password: "principal123" (used when password field is empty)</p>
          </div>
        </div>

        {principals.length > 0 && (
          <div className="max-h-60 overflow-y-auto border rounded-lg mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">University</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {principals.map((p, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{p.principalName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600">{p.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{p.university}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.gender === 'other' 
                          ? 'bg-gray-100 text-gray-600' 
                          : p.gender === 'male' 
                            ? 'bg-blue-100 text-blue-700'
                            : p.gender === 'female'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-purple-100 text-purple-700'
                      }`}>
                        {p.gender.charAt(0).toUpperCase() + p.gender.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.password === 'defaultPassword123' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {p.password === 'defaultPassword123' ? 'Default' : 'Custom'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || principals.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? 'Importing...' : `Import ${principals.length} Principals`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
