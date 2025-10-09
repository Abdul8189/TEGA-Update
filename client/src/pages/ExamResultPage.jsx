import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  BarChart3,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';

const ExamResultPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamResult();
  }, [examId]);

  const fetchExamResult = async () => {
    try {
      console.log('🔍 Fetching exam result for examId:', examId);
      const response = await api(`/api/exams/${examId}/result`);
      
      console.log('🔍 Exam result response:', response);
      console.log('🔍 Response success:', response.success);
      console.log('🔍 Response data structure:', {
        hasResult: !!response.result,
        hasExam: !!response.exam,
        hasAttempts: !!response.attempts,
        attemptsCount: response.attempts ? response.attempts.length : 0,
        resultKeys: response.result ? Object.keys(response.result) : [],
        examKeys: response.exam ? Object.keys(response.exam) : [],
        attemptKeys: response.attempts && response.attempts[0] ? Object.keys(response.attempts[0]) : []
      });
      
      if (response.success) {
        setResult(response);
        console.log('✅ Exam result set successfully');
      } else {
        console.log('❌ Exam result failed:', response.message);
        toast.error(response.message || 'Failed to load exam result');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Error fetching exam result:', error);
      toast.error('Failed to load exam result');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep it up!';
    if (percentage >= 60) return 'Satisfactory. Room for improvement.';
    return 'Needs improvement. Keep practicing!';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam result...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    console.log('🔍 No result found, showing error page');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Result Not Found</h2>
          <p className="text-gray-600 mb-6">The exam result you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log('🔍 Rendering results page with data:', {
    hasResult: !!result.result,
    hasExam: !!result.exam,
    hasAttempts: !!result.attempts,
    attemptsCount: result.attempts ? result.attempts.length : 0,
    resultData: result.result,
    examData: result.exam,
    attemptsData: result.attempts
  });

  // Get the latest attempt (first in the sorted array)
  const latestAttempt = result.attempts && result.attempts.length > 0 ? result.attempts[0] : null;
  console.log('🔍 Latest attempt:', latestAttempt);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Download Result
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share Result
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {result.exam ? result.exam.title : 'Exam Result'}
            </h1>
            <p className="text-gray-600 mb-4">
              {result.exam ? result.exam.subject : 'Subject'} • {latestAttempt ? formatDate(latestAttempt.startTime) : 'Date'}
            </p>
            
            {/* Pass/Fail Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              latestAttempt && latestAttempt.isPassed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {latestAttempt && latestAttempt.isPassed ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Passed
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Failed
                </>
              )}
            </div>
          </div>
        </div>

        {/* Unpublished Results Notification */}
        {result.hasUnpublishedResults && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Results Under Review
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have {result.unpublishedCount} completed exam{result.unpublishedCount > 1 ? 's' : ''} that are currently under review. 
                  Results will be published once the administrator approves them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Score */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {latestAttempt ? `${latestAttempt.score || 0}/${latestAttempt.totalMarks || 0}` : '0/0'}
            </div>
            <div className={`text-2xl font-semibold mb-2 ${getPerformanceColor(latestAttempt?.percentage || 0)}`}>
              {(latestAttempt?.percentage || 0).toFixed(1)}%
            </div>
            <p className="text-gray-600">Total Score</p>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {latestAttempt?.correctAnswers || 0}
            </div>
            <p className="text-gray-600 mb-2">Correct Answers</p>
            <div className="text-sm text-gray-500">
              {latestAttempt ? 
                (((latestAttempt.correctAnswers || 0) / ((latestAttempt.correctAnswers || 0) + (latestAttempt.wrongAnswers || 0) + (latestAttempt.unattempted || 0))) * 100).toFixed(1) 
                : 0}% accuracy
            </div>
          </div>

          {/* Time Taken */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {latestAttempt ? formatDuration(latestAttempt.duration || 0) : '0m'}
            </div>
            <p className="text-gray-600">Time Taken</p>
            <div className="text-sm text-gray-500 mt-2">
              Started: {latestAttempt ? formatDate(latestAttempt.startTime) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Answer Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Answer Breakdown
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium">Correct Answers</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">{latestAttempt?.correctAnswers || 0}</div>
                  <div className="text-sm text-gray-500">
                    {latestAttempt ? 
                      (((latestAttempt.correctAnswers || 0) / ((latestAttempt.correctAnswers || 0) + (latestAttempt.wrongAnswers || 0) + (latestAttempt.unattempted || 0))) * 100).toFixed(1) 
                      : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-medium">Wrong Answers</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-red-600">{latestAttempt?.wrongAnswers || 0}</div>
                  <div className="text-sm text-gray-500">
                    {latestAttempt ? 
                      (((latestAttempt.wrongAnswers || 0) / ((latestAttempt.correctAnswers || 0) + (latestAttempt.wrongAnswers || 0) + (latestAttempt.unattempted || 0))) * 100).toFixed(1) 
                      : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="font-medium">Unattempted</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-600">{latestAttempt?.unattempted || 0}</div>
                  <div className="text-sm text-gray-500">
                    {latestAttempt ? 
                      (((latestAttempt.unattempted || 0) / ((latestAttempt.correctAnswers || 0) + (latestAttempt.wrongAnswers || 0) + (latestAttempt.unattempted || 0))) * 100).toFixed(1) 
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Performance Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Performance Level</h4>
                <p className={`text-lg font-semibold ${getPerformanceColor(latestAttempt?.percentage || 0)}`}>
                  {getPerformanceMessage(latestAttempt?.percentage || 0)}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Passing Criteria</h4>
                <p className="text-sm text-yellow-800">
                  Minimum {result.exam?.passingMarks || 40}% required to pass
                </p>
                <p className={`text-sm font-semibold ${latestAttempt?.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {latestAttempt?.isPassed ? '✅ Passed' : '❌ Failed'}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Exam Details</h4>
                <div className="text-sm text-purple-800 space-y-1">
                  <p><strong>Subject:</strong> {result.exam?.subject || 'N/A'}</p>
                  <p><strong>Duration:</strong> {latestAttempt ? formatDuration(latestAttempt.duration || 0) : 'N/A'}</p>
                  <p><strong>Total Marks:</strong> {latestAttempt?.totalMarks || 0}</p>
                  <p><strong>Completed:</strong> {latestAttempt ? formatDate(latestAttempt.endTime) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/course-dashboard')}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Continue Learning
            </button>
            <button
              onClick={() => navigate('/exams')}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              View All Exams
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResultPage;
