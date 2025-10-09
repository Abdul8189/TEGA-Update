import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';

const AdminExamResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [publishing, setPublishing] = useState({});
  const [unpublishing, setUnpublishing] = useState({});
  const [groupedResults, setGroupedResults] = useState({});

  useEffect(() => {
    fetchResults();
  }, [selectedDate, selectedExam]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedExam) params.append('examId', selectedExam);
      
      const response = await api(`/admin/exam-results/results?${params}`, 'admin');
      const resultsData = response.results || [];
      setResults(resultsData);
      
      // Group results by date
      const grouped = {};
      resultsData.forEach(result => {
        const date = new Date(result.examDate).toISOString().split('T')[0];
        if (!grouped[date]) {
          grouped[date] = {
            date,
            exams: {},
            totalStudents: 0,
            publishedStudents: 0,
            unpublishedStudents: 0
          };
        }
        
        if (!grouped[date].exams[result.examId]) {
          grouped[date].exams[result.examId] = {
            examId: result.examId,
            examTitle: result.examTitle,
            students: [],
            publishedCount: 0,
            unpublishedCount: 0
          };
        }
        
        grouped[date].exams[result.examId].students.push(result);
        grouped[date].totalStudents++;
        
        if (result.published) {
          grouped[date].exams[result.examId].publishedCount++;
          grouped[date].publishedStudents++;
        } else {
          grouped[date].exams[result.examId].unpublishedCount++;
          grouped[date].unpublishedStudents++;
        }
      });
      
      setGroupedResults(grouped);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch exam results');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (examId, examDate) => {
    const key = `${examId}_${examDate}`;
    try {
      setPublishing(prev => ({ ...prev, [key]: true }));
      
      const response = await api('/admin/exam-results/publish', 'admin', {
        method: 'POST',
        body: JSON.stringify({ examId, examDate })
      });
      
      toast.success(response.message);
      fetchResults(); // Refresh results
    } catch (error) {
      console.error('Error publishing results:', error);
      toast.error('Failed to publish results');
    } finally {
      setPublishing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleUnpublish = async (examId, examDate) => {
    const key = `${examId}_${examDate}`;
    try {
      setUnpublishing(prev => ({ ...prev, [key]: true }));
      
      const response = await api('/admin/exam-results/unpublish', 'admin', {
        method: 'POST',
        body: JSON.stringify({ examId, examDate })
      });
      
      toast.success(response.message);
      fetchResults(); // Refresh results
    } catch (error) {
      console.error('Error unpublishing results:', error);
      toast.error('Failed to unpublish results');
    } finally {
      setUnpublishing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handlePublishAllForDate = async (date) => {
    const key = `date_${date}`;
    try {
      setPublishing(prev => ({ ...prev, [key]: true }));
      
      const response = await api('/admin/exam-results/publish-all-date', 'admin', {
        method: 'POST',
        body: JSON.stringify({ examDate: date })
      });
      
      if (response.success) {
        toast.success(`Published ${response.publishedCount} results for ${date}`);
        fetchResults();
      }
    } catch (error) {
      console.error('Error publishing all results for date:', error);
      toast.error('Failed to publish all results for this date');
    } finally {
      setPublishing(prev => ({ ...prev, [key]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'unpublished': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPassStatus = (isPassed, isQualified) => {
    if (isQualified) return { text: 'Qualified', color: 'text-green-600 bg-green-100' };
    if (isPassed) return { text: 'Passed', color: 'text-blue-600 bg-blue-100' };
    return { text: 'Failed', color: 'text-red-600 bg-red-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Results Management</h1>
              <p className="mt-2 text-gray-600">Manage and publish exam results for students</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Exam
              </label>
              <input
                type="text"
                placeholder="Search by exam title..."
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.reduce((sum, result) => sum + result.totalStudents, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.reduce((sum, result) => sum + result.publishedStudents, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <EyeOff className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unpublished</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.reduce((sum, result) => sum + result.unpublishedStudents, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">No exam results found for the selected criteria.</p>
            </div>
          ) : (
            results.map((result) => {
              const key = `${result.exam._id}_${result.examDate}`;
              const isPublishing = publishing[key];
              const isUnpublishing = unpublishing[key];
              
              return (
                <div key={key} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Exam Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {result.exam.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(result.examDate)}
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {result.exam.subject}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {result.totalStudents} students
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Publish/Unpublish Buttons */}
                        {result.unpublishedStudents > 0 && (
                          <button
                            onClick={() => handlePublish(result.exam._id, result.examDate)}
                            disabled={isPublishing}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                          >
                            {isPublishing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            Publish ({result.unpublishedStudents})
                          </button>
                        )}
                        
                        {result.publishedStudents > 0 && (
                          <button
                            onClick={() => handleUnpublish(result.exam._id, result.examDate)}
                            disabled={isUnpublishing}
                            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                          >
                            {isUnpublishing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <EyeOff className="w-4 h-4 mr-2" />
                            )}
                            Unpublish ({result.publishedStudents})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Published
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.results.map((studentResult) => {
                          const passStatus = getPassStatus(studentResult.isPassed, studentResult.isQualified);
                          
                          return (
                            <tr key={studentResult._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {studentResult.student.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {studentResult.student.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {studentResult.score}/{studentResult.totalMarks}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {studentResult.percentage.toFixed(1)}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${passStatus.color}`}>
                                  {passStatus.text}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(studentResult.published ? 'published' : 'unpublished')}`}>
                                  {studentResult.published ? 'Published' : 'Unpublished'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => navigate(`/admin/exam-results/${studentResult._id}`)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminExamResultsPage;
