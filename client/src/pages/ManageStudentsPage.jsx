import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api('/admin/students');
        if (response.success) {
          setStudents(response.students);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to fetch students.');
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const handleEnrollmentChange = async (studentId, isCourseEnrolled) => {
    try {
      const response = await api(`/admin/students/${studentId}/enrollment`, {
        method: 'PATCH',
        body: {
          isCourseEnrolled,
        }
      });

      if (response.success) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === studentId
              ? { ...student, isCourseEnrolled: response.student.isCourseEnrolled }
              : student
          )
        );
        toast.success('Enrollment status updated!');
      } else {
        toast.error(response.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Failed to update enrollment:', error);
      toast.error('Failed to update enrollment status.');
    }
  };

  if (loading) {
    return <div>Loading students...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Student Course Enrollment</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Enrolled in Course</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="py-2 px-4 border-b">{`${student.firstName} ${student.lastName}`}</td>
                <td className="py-2 px-4 border-b">{student.email}</td>
                <td className="py-2 px-4 border-b text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={student.isCourseEnrolled}
                      onChange={(e) => handleEnrollmentChange(student._id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudentsPage;
