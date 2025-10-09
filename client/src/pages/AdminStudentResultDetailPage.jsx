import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';

const AdminStudentResultDetailPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId) {
      fetchResultDetails();
    }
  }, [attemptId]);

  const fetchResultDetails = async () => {
    try {
      setLoading(true);
      const response = await api(`/admin/exam-results/result/${attemptId}`, 'admin');
      setResult(response.result);
    } catch (error) {
      console.error('Error fetching result details:', error);
      toast.error('Failed to fetch result details');
    } finally {
      setLoading(false);
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

  const getDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'abandoned': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPassStatus = (isPassed, isQualified) => {
    if (isQualified) return { text: 'Qualified', color: 'text-green-600 bg-green-100', icon: Award };
    if (isPassed) return { text: 'Passed', color: 'text-blue-600 bg-blue-100', icon: CheckCircle };
    return { text: 'Failed', color: 'text-red-600 bg-red-100', icon: XCircle };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading result details...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Result Not Found</h3>
          <p className="text-gray-600 mb-4">The requested result could not be found.</p>
          <button
            onClick={() => navigate('/admin/exam-results')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const passStatus = getPassStatus(result.isPassed, result.isQualified);
  const PassIcon = passStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/exam-results')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Result Details</h1>
              <p className="mt-2 text-gray-600">Detailed view of student's exam performance</p>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{result.studentId.name}</h2>
              <p className="text-gray-600">{result.studentId.email}</p>
              {result.studentId.rollNumber && (
                <p className="text-sm text-gray-500">Roll: {result.studentId.rollNumber}</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <PassIcon className="w-5 h-5" />
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${passStatus.color}`}>
                  {passStatus.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{result.examId.title}</h4>
              <p className="text-gray-600 mb-2">{result.examId.subject}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(result.examId.examDate)}
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Duration: {result.examId.duration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  Total Marks: {result.examId.totalMarks}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Passing Marks: {result.examId.passingMarks}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.score}/{result.totalMarks}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Percentage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Taken</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getDuration(result.startTime, result.endTime)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attempt</p>
                <p className="text-2xl font-bold text-gray-900">
                  #{result.attemptNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{result.correctAnswers}</div>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{result.wrongAnswers}</div>
              <p className="text-sm text-gray-600">Wrong Answers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 mb-2">{result.unattempted}</div>
              <p className="text-sm text-gray-600">Unattempted</p>
            </div>
          </div>
        </div>

        {/* Exam Session Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Session Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Start Time: {formatTime(result.startTime)}</div>
                <div>End Time: {result.endTime ? formatTime(result.endTime) : 'N/A'}</div>
                <div>Status: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>{result.status}</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Publishing Status</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Published: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.published ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>{result.published ? 'Yes' : 'No'}</span></div>
                {result.publishedAt && <div>Published At: {formatTime(result.publishedAt)}</div>}
                {result.publishedBy && <div>Published By: {result.publishedBy.name}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Course Information */}
        {result.courseId && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{result.courseId.courseName}</h4>
                <p className="text-sm text-gray-600">Course ID: {result.courseId._id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentResultDetailPage;
