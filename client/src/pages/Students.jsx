import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MessageDisplay from '../components/ui/MessageDisplay';
import { useMessage } from '../hooks/useMessage';
import { getMessage } from '../utils/messages';
import DeleteConfirmationDialog from '../components/ui/DeleteConfirmationDialog';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import BulkStudentImportModal from '../components/BulkStudentImportModal';
import CreateStudentModal from '../components/CreateStudentModal';

const Students = () => {
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = students.filter(student =>
      student.institute?.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredStudents(filteredData);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const response = await api('/api/admin/students');
      if (response.success) {
        setStudents(response.students || []);
        setFilteredStudents(response.students || []);
      }
    } catch (error) {
      const errorMessage = getMessage('system', 'load', error.message);
      showError(errorMessage, 'Loading Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImportSuccess = () => {
    fetchStudents();
  };

  const handleStudentCreated = (newStudent) => {
    setStudents([newStudent, ...students]);
    setFilteredStudents([newStudent, ...students]);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    setIsDeleting(true);
    try {
      await api(`/api/admin/users/${studentToDelete._id}`, {
        method: 'DELETE',
      });
      showSuccess(`Student account "${studentToDelete.studentName || studentToDelete.username}" deleted successfully.`, 'Student Deleted');
      fetchStudents();
    } catch (error) {
      const errorMessage = getMessage('user', 'delete', error.message, { userType: 'Student' });
      showError(errorMessage, 'Deletion Failed');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  return (
    <>
      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStudentCreated={handleStudentCreated}
      />
      <BulkStudentImportModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        studentData={studentToDelete}
        isLoading={isDeleting}
      />
      <div className="flex flex-col h-full w-full gap-6 p-6">
        {/* Professional Message Display */}
        <MessageDisplay
          show={message.show}
          type={message.type}
          title={message.title}
          message={message.message}
          onClose={clearMessage}
          className="mb-4"
        />
        
        <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Registered Students</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Bulk Import Students
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Student
              </button>
            </div>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">S.No</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Student Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Email</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Institute</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Student ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student._id}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`${student.firstName} ${student.lastName}`}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{student.institute}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentId}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/admin/edit-user/${student._id}`} 
                          state={{ from: '/admin/students' }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(student)} 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete student account"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-4 text-gray-500">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Students;
