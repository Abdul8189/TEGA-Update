import React, { useState, useEffect } from 'react';
import { Users, Mail, GraduationCap, Calendar, BookOpen, CheckSquare, Square } from 'lucide-react';

const StudentList = ({ students, collegeName, onSelectionChange, selectedStudents = [], showSelection = false }) => {
  const [localSelectedStudents, setLocalSelectedStudents] = useState(selectedStudents);
  
  console.log('🎯 StudentList: Received students:', students);
  console.log('🎯 StudentList: Students count:', students?.length);
  console.log('🎯 StudentList: College name:', collegeName);
  console.log('🎯 StudentList: Show selection:', showSelection);
  console.log('🎯 StudentList: Selected students:', localSelectedStudents);
  console.log('🎯 StudentList: Props received:', { students: students?.length, collegeName, showSelection, selectedStudents: selectedStudents?.length });

  // Update local state when selectedStudents prop changes
  useEffect(() => {
    setLocalSelectedStudents(selectedStudents);
  }, [selectedStudents]);

  const handleStudentSelect = (studentId, isSelected) => {
    let newSelection;
    if (isSelected) {
      newSelection = [...localSelectedStudents, studentId];
    } else {
      newSelection = localSelectedStudents.filter(id => id !== studentId);
    }
    setLocalSelectedStudents(newSelection);
    
    // Notify parent component
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const handleSelectAll = (isSelected) => {
    let newSelection;
    if (isSelected) {
      newSelection = students.map(student => student._id);
    } else {
      newSelection = [];
    }
    setLocalSelectedStudents(newSelection);
    
    // Notify parent component
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const isAllSelected = students.length > 0 && localSelectedStudents.length === students.length;
  const isPartiallySelected = localSelectedStudents.length > 0 && localSelectedStudents.length < students.length;

  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
        <p className="text-gray-500">
          {collegeName ? `No students are currently registered for ${collegeName}.` : 'No students found for this college.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Students</h2>
              <p className="text-sm text-gray-500">
                {students.length} student{students.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          {showSelection && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <CheckSquare className="w-4 h-4" />
              <span>Select students to assign individual features</span>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showSelection && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSelectAll(!isAllSelected)}
                        className="flex items-center space-x-1 hover:bg-gray-100 p-1 rounded"
                        title={isAllSelected ? 'Deselect All' : 'Select All'}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : isPartiallySelected ? (
                          <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 rounded"></div>
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs">Select</span>
                      </button>
                    </div>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year of Study</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => {
                const isSelected = localSelectedStudents.includes(student._id);
                return (
                  <tr key={student._id || index} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                    {showSelection && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleStudentSelect(student._id, !isSelected)}
                            className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-medium">
                          {(student.studentName || student.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.studentName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.username || 'Unknown Name'}
                        </div>
                        {student.gender && (
                          <div className="text-xs text-gray-500 capitalize">{student.gender}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{student.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.studentId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-gray-400" />
                      <span>{student.course || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{student.yearOfStudy || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.major || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
