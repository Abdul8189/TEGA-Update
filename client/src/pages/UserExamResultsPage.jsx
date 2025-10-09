import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  BarChart3,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';

const UserExamResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAllResults();
  }, []);

  const fetchAllResults = async () => {
    try {
      setLoading(true);
      // Get all exams first
      const examsResponse = await api('/api/exams/available');
      const exams = examsResponse.exams || [];
      
      // Fetch results for each exam
      const allResults = [];
      for (const exam of exams) {
        try {
          const resultResponse = await api(`/api/exams/${exam._id}/result`);
          if (resultResponse.success && resultResponse.attempts && resultResponse.attempts.length > 0) {
            allResults.push({
              exam: resultResponse.exam,
              attempts: resultResponse.attempts,
              hasUnpublishedResults: resultResponse.hasUnpublishedResults,
              unpublishedCount: resultResponse.unpublishedCount
            });
          }
        } catch (error) {
          console.log(`No results found for exam ${exam._id}`);
        }
      }
      
      setResults(allResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch exam results');
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

  const getPassStatus = (isPassed, isQualified) => {
    if (isQualified) return { text: 'Qualified', color: 'text-green-600 bg-green-100', icon: Award };
    if (isPassed) return { text: 'Passed', color: 'text-blue-600 bg-blue-100', icon: CheckCircle };
    return { text: 'Failed', color: 'text-red-600 bg-red-100', icon: XCircle };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'abandoned': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Exam Results</h1>
              <p className="mt-2 text-gray-600">View all your exam results and performance</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={fetchAllResults}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Refresh Results
              </button>
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
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.reduce((sum, result) => 
                    sum + result.attempts.filter(attempt => attempt.isPassed).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.reduce((sum, result) => 
                    sum + result.attempts.filter(attempt => attempt.isQualified).length, 0
                  )}
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
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {results.reduce((sum, result) => sum + (result.unpublishedCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Unpublished Results Notification */}
        {results.some(result => result.hasUnpublishedResults) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <EyeOff className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Results Under Review
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have completed exams that are currently under review. Results will be published once the administrator approves them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">You haven't completed any exams yet.</p>
              <button
                onClick={() => navigate('/exams')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Browse Available Exams
              </button>
            </div>
          ) : (
            results.map((result) => (
              <div key={result.exam._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Exam Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {result.exam.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {result.exam.subject}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(result.exam.examDate)}
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          {result.attempts.length} attempt{result.attempts.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedExam(result);
                          setShowDetails(!showDetails);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        {showDetails ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attempts List */}
                {showDetails && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {result.attempts.map((attempt, index) => {
                        const passStatus = getPassStatus(attempt.isPassed, attempt.isQualified);
                        const PassIcon = passStatus.icon;
                        
                        return (
                          <div key={attempt._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <PassIcon className="w-5 h-5" />
                                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${passStatus.color}`}>
                                    {passStatus.text}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  Attempt #{attempt.attemptNumber}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    {attempt.score}/{attempt.totalMarks}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {attempt.percentage.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Date:</span>
                                <span className="ml-2 font-medium">{formatDate(attempt.startTime)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Time:</span>
                                <span className="ml-2 font-medium">{formatTime(attempt.startTime)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attempt.status)}`}>
                                  {attempt.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserExamResultsPage;
