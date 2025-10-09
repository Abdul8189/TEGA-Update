import React from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import { AlertTriangle, User } from 'lucide-react';

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  studentData,
  isLoading = false
}) => {
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const getStudentDisplayName = () => {
    if (!studentData) return 'this student';
    return studentData.studentName || studentData.username || `${studentData.firstName} ${studentData.lastName}`.trim() || 'this student';
  };

  const getStudentEmail = () => {
    if (!studentData) return '';
    return studentData.email || '';
  };

  const getStudentInstitute = () => {
    if (!studentData) return '';
    return studentData.institute || '';
  };

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Delete Student Account"
      confirmText="Delete Account"
      cancelText="Cancel"
      type="danger"
      isLoading={isLoading}
      disabled={false}
    >
      <div className="space-y-4">
        {/* Warning Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">This action cannot be undone!</h4>
              <p className="text-sm text-red-700">
                Deleting a student account will permanently remove all associated data including:
              </p>
              <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                <li>Student profile and personal information</li>
                <li>Exam results and progress</li>
                <li>Course enrollments and certificates</li>
                <li>Payment history</li>
                <li>All other associated records</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Student Information */}
        {studentData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Student to be deleted:</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{getStudentDisplayName()}</span></div>
              {getStudentEmail() && (
                <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{getStudentEmail()}</span></div>
              )}
              {getStudentInstitute() && (
                <div><span className="font-medium text-gray-700">Institute:</span> <span className="text-gray-900">{getStudentInstitute()}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Simple Confirmation Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-500 mr-3" />
            <p className="text-sm text-blue-800">
              <strong>Are you sure?</strong> Click "Delete Account" to permanently remove this student and all their data.
            </p>
          </div>
        </div>

        {/* Final Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Last chance!</strong> Once you click "Delete Account", all data for {getStudentDisplayName()} will be permanently removed and cannot be recovered.
          </p>
        </div>
      </div>
    </ConfirmationDialog>
  );
};

export default DeleteConfirmationDialog;
