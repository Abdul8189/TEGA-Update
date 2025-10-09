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
  Share2,
  Target,
  BookOpen,
  Users,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';
import ResultProgressBar from '../components/ResultProgressBar';
import UserDashboardLayout from '../components/UserDashboardLayout';
// Using browser-native PDF generation approach

const UserResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [overallStats, setOverallStats] = useState({
    totalExams: 0,
    totalAttempts: 0,
    passedExams: 0,
    qualifiedExams: 0,
    underReviewExams: 0
  });

  useEffect(() => {
    fetchAllResults();
  }, []);

  const fetchAllResults = async () => {
    try {
      setLoading(true);
      // Use the new API endpoint to get all user results
      const response = await api('/api/exams/my-results');
      
      if (response.success) {
        setResults(response.results || []);
        
        // Calculate overall statistics
        const totalExams = response.totalExams || 0;
        const totalAttempts = response.totalAttempts || 0;
        const passedExams = response.results.filter(result => 
          result.attempts.some(attempt => attempt.isPassed)
        ).length;
        const qualifiedExams = response.results.filter(result => 
          result.attempts.some(attempt => attempt.isQualified)
        ).length;
        const underReviewExams = response.results.filter(result => 
          result.hasUnpublishedResults
        ).length;
        
        setOverallStats({
          totalExams,
          totalAttempts,
          passedExams,
          qualifiedExams,
          underReviewExams
        });
      } else {
        console.error('Failed to fetch results:', response.message);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch exam results');
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    if (!results || results.length === 0) {
      return {
        totalExams: 0,
        totalPassed: 0,
        totalQualified: 0,
        totalUnderReview: 0,
        totalScore: 0,
        totalMarks: 0,
        averagePercentage: 0
      };
    }

    let totalExams = 0;
    let totalPassed = 0;
    let totalQualified = 0;
    let totalUnderReview = 0;
    let totalScore = 0;
    let totalMarks = 0;

    results.forEach(result => {
      if (result.attempts && result.attempts.length > 0) {
        result.attempts.forEach(attempt => {
          totalExams++;
          totalScore += attempt.score || 0;
          totalMarks += attempt.totalMarks || 0;
          
          if (attempt.isPassed) {
            totalPassed++;
          }
          
          if (attempt.percentage >= 80) {
            totalQualified++;
          }
          
          if (!attempt.published) {
            totalUnderReview++;
          }
        });
      }
    });

    const averagePercentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    return {
      totalExams,
      totalPassed,
      totalQualified,
      totalUnderReview,
      totalScore,
      totalMarks,
      averagePercentage: Math.round(averagePercentage)
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const handleViewDetails = async (exam, attempt) => {
    try {
      setSelectedExam(exam);
      setSelectedAttempt(attempt);
      setShowDetails(true);
      setCurrentQuestionIndex(0);
      
      // Fetch questions for this exam
      const response = await api(`/api/exams/${exam._id}/questions`);
      if (response.success) {
        setQuestions(response.questions || []);
      } else {
        toast.error('Failed to fetch questions');
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
      setQuestions([]);
    }
  };

  const handleDownloadPDF = async (exam, attempt) => {
    try {
      toast.loading('Generating PDF exam report...', { id: 'pdf-generation' });
      
      // Fetch questions for this exam
      const response = await api(`/api/exams/${exam._id}/questions`);
      if (!response.success) {
        toast.error('Failed to fetch exam questions', { id: 'pdf-generation' });
        return;
      }
      
      const examQuestions = response.questions || [];
      
      // Generate PDF using jsPDF
      await generatePDFDocument(exam, attempt, examQuestions);
      
      toast.success('PDF exam report downloaded successfully!', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report', { id: 'pdf-generation' });
    }
  };

  const generatePDFDocument = async (exam, attempt, examQuestions) => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    // Calculate statistics
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    
    examQuestions.forEach((question) => {
      const studentAnswer = attempt.answers.get ? 
        attempt.answers.get(question._id) : 
        attempt.answers[question._id];
      
      if (!studentAnswer) {
        unattemptedCount++;
      } else if (studentAnswer === question.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exam Result Report - ${exam.title}</title>
        <style>
          @page { size: A4; margin: 1in; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; margin-bottom: 30px; border-radius: 8px; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: normal; }
          .info-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
          .info-box h3 { margin: 0 0 15px 0; color: #1e293b; font-size: 16px; font-weight: bold; }
          .info-box p { margin: 5px 0; font-size: 14px; }
          .performance-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .performance-box h3 { margin: 0 0 15px 0; color: #166534; font-size: 16px; font-weight: bold; }
          .questions-section { margin-top: 40px; }
          .questions-section h2 { text-align: center; color: #1e293b; font-size: 24px; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          .question { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px; page-break-inside: avoid; }
          .question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .question-number { font-size: 18px; font-weight: bold; color: #1e293b; }
          .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; }
          .status-correct { background: #16a34a; }
          .status-incorrect { background: #dc2626; }
          .status-unattempted { background: #6b7280; }
          .question-text { font-size: 16px; margin-bottom: 15px; color: #374151; line-height: 1.5; }
          .options { margin-left: 20px; }
          .option { margin: 8px 0; font-size: 14px; color: #374151; }
          .option-correct { color: #16a34a; font-weight: bold; }
          .option-user { color: #dc2626; font-weight: bold; }
          .answer-analysis { background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin-top: 15px; }
          .answer-analysis h4 { margin: 0 0 10px 0; color: #1e40af; font-size: 14px; }
          .answer-analysis p { margin: 3px 0; font-size: 13px; color: #374151; }
          .summary-section { margin-top: 40px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 25px; }
          .summary-section h2 { text-align: center; color: #1e293b; font-size: 22px; margin-bottom: 20px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .stat-item { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
          .stat-item h4 { margin: 0 0 8px 0; color: #1e293b; font-size: 14px; }
          .stat-item p { margin: 0; font-size: 16px; font-weight: bold; color: #3b82f6; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          @media print { body { -webkit-print-color-adjust: exact; } .question { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EXAM RESULT REPORT</h1>
          <h2>${exam.title}</h2>
          <h2>Attempt ${attempt.attemptNumber}</h2>
        </div>
        
        <div class="info-box">
          <h3>📋 EXAM DETAILS</h3>
          <p><strong>Subject:</strong> ${exam.subject}</p>
          <p><strong>Date:</strong> ${formatDate(exam.examDate)}</p>
          <p><strong>Total Marks:</strong> ${exam.totalMarks}</p>
          <p><strong>Passing Marks:</strong> ${exam.passingMarks}</p>
        </div>
        
        <div class="performance-box">
          <h3>📊 PERFORMANCE SUMMARY</h3>
          <p><strong>Score:</strong> ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)</p>
          <p><strong>Status:</strong> ${attempt.isPassed ? '✅ PASSED' : '❌ FAILED'}</p>
          <p><strong>Time Taken:</strong> ${formatTime(attempt.timeTaken || 0)}</p>
        </div>
        
        <div class="questions-section">
          <h2>📝 QUESTION-BY-QUESTION REVIEW</h2>
          
          ${examQuestions.map((question, index) => {
            const studentAnswer = attempt.answers.get ? 
              attempt.answers.get(question._id) : 
              attempt.answers[question._id];
            
            const isCorrect = studentAnswer === question.correctAnswer;
            const isAnswered = !!studentAnswer;
            
            let statusClass = 'status-unattempted';
            let statusText = 'NOT ATTEMPTED';
            let statusIcon = '○';
            
            if (isAnswered) {
              if (isCorrect) {
                statusClass = 'status-correct';
                statusText = 'CORRECT';
                statusIcon = '✓';
              } else {
                statusClass = 'status-incorrect';
                statusText = 'INCORRECT';
                statusIcon = '✗';
              }
            }
            
            return `
              <div class="question">
                <div class="question-header">
                  <div class="question-number">Question ${index + 1} ${statusIcon}</div>
                  <div class="status-badge ${statusClass}">${statusText}</div>
                </div>
                
                <div class="question-text">${question.question}</div>
                
                <div class="options">
                  ${question.options.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex);
                    let optionClass = '';
                    let indicators = '';
                    
                    if (option === question.correctAnswer) {
                      optionClass = 'option-correct';
                      indicators += ' ✓';
                    }
                    if (studentAnswer === option) {
                      optionClass = 'option-user';
                      indicators += ' ←';
                    }
                    
                    return `<div class="option ${optionClass}">${optionLetter}. ${option}${indicators}</div>`;
                  }).join('')}
                </div>
                
                <div class="answer-analysis">
                  <h4>📋 ANSWER ANALYSIS</h4>
                  <p><strong>Your Answer:</strong> ${studentAnswer || 'Not attempted'}</p>
                  <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
                  <p><strong>Result:</strong> ${statusText}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="summary-section">
          <h2>📈 FINAL SUMMARY</h2>
          
          <div class="stats-grid">
            <div class="stat-item">
              <h4>Total Questions</h4>
              <p>${examQuestions.length}</p>
            </div>
            <div class="stat-item">
              <h4>Correct Answers</h4>
              <p>${correctCount}</p>
            </div>
            <div class="stat-item">
              <h4>Incorrect Answers</h4>
              <p>${incorrectCount}</p>
            </div>
            <div class="stat-item">
              <h4>Unattempted Questions</h4>
              <p>${unattemptedCount}</p>
            </div>
            <div class="stat-item">
              <h4>Accuracy Rate</h4>
              <p>${examQuestions.length > 0 ? Math.round((correctCount / examQuestions.length) * 100) : 0}%</p>
            </div>
            <div class="stat-item">
              <h4>Completion Rate</h4>
              <p>${examQuestions.length > 0 ? Math.round(((correctCount + incorrectCount) / examQuestions.length) * 100) : 0}%</p>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <h4 style="margin: 0 0 15px 0; color: #1e293b;">🎯 PERFORMANCE ASSESSMENT</h4>
            <p><strong>Overall Performance:</strong> ${getStatusText(attempt.percentage)}</p>
            <p><strong>Final Score:</strong> ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)</p>
            <p><strong>Exam Status:</strong> ${attempt.isPassed ? '✅ PASSED' : '❌ FAILED'}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>This comprehensive report includes all ${examQuestions.length} questions with detailed answer analysis.</p>
          <p>Use this report to review your performance and identify areas for improvement.</p>
        </div>
      </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const generatePDFContent = (exam, attempt, examQuestions) => {
    let content = `
EXAM RESULT REPORT
==================

Exam Details:
- Title: ${exam.title}
- Subject: ${exam.subject}
- Date: ${formatDate(exam.examDate)}
- Total Marks: ${exam.totalMarks}
- Passing Marks: ${exam.passingMarks}

Attempt Details:
- Attempt Number: ${attempt.attemptNumber}
- Score: ${attempt.score}/${attempt.totalMarks}
- Percentage: ${attempt.percentage}%
- Status: ${attempt.isPassed ? 'PASSED' : 'FAILED'}
- Time Taken: ${formatTime(attempt.timeTaken || 0)}
- Date: ${formatDateTime(attempt.submittedAt)}

Performance Summary:
- Correct Answers: ${attempt.correctAnswers || 0}
- Wrong Answers: ${attempt.wrongAnswers || 0}
- Unattempted: ${attempt.unattempted || 0}
- Questions Answered: ${attempt.questionsAnswered || 0}

Performance Level: ${getStatusText(attempt.percentage)}

${'='.repeat(80)}
QUESTION-BY-QUESTION REVIEW
${'='.repeat(80)}

`;

    // Add all questions with answers
    examQuestions.forEach((question, index) => {
      const studentAnswer = attempt.answers.get ? 
        attempt.answers.get(question._id) : 
        attempt.answers[question._id];
      
      const isCorrect = studentAnswer === question.correctAnswer;
      const isAnswered = !!studentAnswer;
      
      let statusIcon = '';
      let statusText = '';
      
      if (isAnswered) {
        if (isCorrect) {
          statusIcon = '✓';
          statusText = 'CORRECT';
        } else {
          statusIcon = '✗';
          statusText = 'INCORRECT';
        }
      } else {
        statusIcon = '○';
        statusText = 'NOT ATTEMPTED';
      }

      content += `
Question ${index + 1} ${statusIcon} [${statusText}]
${'-'.repeat(60)}
${question.question}

Options:
`;

      // Add all options with indicators
      question.options.forEach((option, optionIndex) => {
        const optionLetter = String.fromCharCode(65 + optionIndex);
        let optionStatus = '';
        let optionMarker = '';
        
        if (option === question.correctAnswer) {
          optionStatus = 'CORRECT ANSWER';
          optionMarker = ' ✓';
        }
        if (studentAnswer === option) {
          optionStatus += (optionStatus ? ' | ' : '') + 'YOUR ANSWER';
          optionMarker = ' ←';
        }
        
        content += `${optionLetter}. ${option}${optionMarker}\n`;
        if (optionStatus) {
          content += `   [${optionStatus}]\n`;
        }
        content += `\n`;
      });

      content += `ANSWER ANALYSIS:
Your Answer: ${studentAnswer || 'Not attempted'}
Correct Answer: ${question.correctAnswer}
Result: ${statusText}
${isAnswered ? (isCorrect ? 'Well done!' : 'Better luck next time!') : 'This question was not attempted.'}

${'='.repeat(80)}

`;
    });

    // Add summary statistics
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    
    examQuestions.forEach((question) => {
      const studentAnswer = attempt.answers.get ? 
        attempt.answers.get(question._id) : 
        attempt.answers[question._id];
      
      if (!studentAnswer) {
        unattemptedCount++;
      } else if (studentAnswer === question.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    content += `
${'='.repeat(80)}
FINAL SUMMARY
${'='.repeat(80)}

Total Questions: ${examQuestions.length}
Correct Answers: ${correctCount}
Incorrect Answers: ${incorrectCount}
Unattempted Questions: ${unattemptedCount}

Accuracy Rate: ${examQuestions.length > 0 ? Math.round((correctCount / examQuestions.length) * 100) : 0}%
Completion Rate: ${examQuestions.length > 0 ? Math.round(((correctCount + incorrectCount) / examQuestions.length) * 100) : 0}%

Overall Performance: ${getStatusText(attempt.percentage)}
Final Score: ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)
Exam Status: ${attempt.isPassed ? 'PASSED' : 'FAILED'}

${'='.repeat(80)}

Generated on: ${new Date().toLocaleString()}
This comprehensive report includes all ${examQuestions.length} questions with detailed answer analysis.
Use this report to review your performance and identify areas for improvement.

Good luck with your future exams!
    `;
    
    return content;
  };

  const closeDetailsModal = () => {
    setShowDetails(false);
    setSelectedExam(null);
    setSelectedAttempt(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getQuestionStatus = (questionId) => {
    if (!selectedAttempt || !selectedAttempt.answers) return 'unattempted';
    
    const studentAnswer = selectedAttempt.answers.get ? 
      selectedAttempt.answers.get(questionId) : 
      selectedAttempt.answers[questionId];
    
    if (!studentAnswer) return 'unattempted';
    
    const question = questions.find(q => q._id === questionId);
    if (!question) return 'unattempted';
    
    return studentAnswer === question.correctAnswer ? 'correct' : 'incorrect';
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your results...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  const stats = getOverallStats();

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">My Exam Results</h1>
              <p className="text-gray-600 mt-1">Track your academic progress and performance</p>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPassed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Qualified (80%+)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQualified}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUnderReview}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Performance</h2>
            <div className="flex items-center justify-center space-x-12">
              <div className="text-center">
                <ResultProgressBar percentage={stats.averagePercentage} size="large" />
                <p className="text-sm text-gray-600 mt-2">Average Score</p>
              </div>
              <div className="text-left">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Pass Rate: {stats.totalExams > 0 ? Math.round((stats.totalPassed / stats.totalExams) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Qualification Rate: {stats.totalExams > 0 ? Math.round((stats.totalQualified / stats.totalExams) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Total Score: {stats.totalScore}/{stats.totalMarks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Results */}
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">You haven't completed any exams yet.</p>
            </div>
          ) : (
            results.map((result) => (
              <div key={result.exam._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Exam Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{result.exam.title}</h3>
                      <div className="flex items-center space-x-4 text-indigo-100">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {result.exam.subject}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(result.exam.examDate)}
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {result.exam.totalMarks} marks
                        </div>
                      </div>
                    </div>
                    {result.hasUnpublishedResults && (
                      <div className="text-right">
                        <div className="flex items-center text-yellow-200">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">{result.unpublishedCount} under review</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attempts */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.attempts.map((attempt, index) => (
                      <div key={attempt._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Attempt {index + 1}
                          </h4>
                          <ResultProgressBar percentage={attempt.percentage} size="medium" />
                          <p className={`text-sm font-medium mt-2 px-3 py-1 rounded-full inline-block ${getStatusColor(attempt.percentage)}`}>
                            {getStatusText(attempt.percentage)}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className="font-semibold text-gray-900">{attempt.score}/{attempt.totalMarks}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Percentage:</span>
                            <span className="font-semibold text-gray-900">{attempt.percentage}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`font-semibold ${attempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {attempt.isPassed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Time Taken:</span>
                            <span className="font-semibold text-gray-900">{formatTime(attempt.timeTaken || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Date:</span>
                            <span className="font-semibold text-gray-900">{formatDateTime(attempt.submittedAt)}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-xs text-gray-500">Answered</p>
                              <p className="font-semibold text-gray-900">{attempt.questionsAnswered || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Correct</p>
                              <p className="font-semibold text-green-600">{attempt.correctAnswers || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Incorrect</p>
                              <p className="font-semibold text-red-600">{(attempt.questionsAnswered || 0) - (attempt.correctAnswers || 0)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(result.exam, attempt)}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(result.exam, attempt)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </div>

      {/* Question Details Modal */}
      {showDetails && selectedExam && selectedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedExam.title}</h2>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <span className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        Attempt {selectedAttempt.attemptNumber}
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {selectedAttempt.percentage}% Score
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {questions.length > 0 && (
                <div className="space-y-6">
                  {/* Question Navigation */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </button>
                      
                      <div className="text-sm text-gray-600">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </div>
                      
                      <button
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 shadow-sm"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      {questions.map((_, index) => {
                        const status = getQuestionStatus(questions[index]._id);
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                              index === currentQuestionIndex
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110'
                                : status === 'correct'
                                ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                                : status === 'incorrect'
                                ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Question */}
                  {questions[currentQuestionIndex] && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                            {currentQuestionIndex + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Question {currentQuestionIndex + 1}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getQuestionStatus(questions[currentQuestionIndex]._id) === 'correct' && (
                            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              <CheckCircle className="w-4 h-4" />
                              <span>Correct</span>
                            </div>
                          )}
                          {getQuestionStatus(questions[currentQuestionIndex]._id) === 'incorrect' && (
                            <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              <XCircle className="w-4 h-4" />
                              <span>Incorrect</span>
                            </div>
                          )}
                          {getQuestionStatus(questions[currentQuestionIndex]._id) === 'unattempted' && (
                            <div className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                              <Clock className="w-4 h-4" />
                              <span>Not Attempted</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-gray-800 text-base leading-relaxed">{questions[currentQuestionIndex].question}</p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        {questions[currentQuestionIndex].options.map((option, optionIndex) => {
                          const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
                          const isSelected = selectedAttempt.answers.get ? 
                            selectedAttempt.answers.get(questions[currentQuestionIndex]._id) === option :
                            selectedAttempt.answers[questions[currentQuestionIndex]._id] === option;
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                isCorrect
                                  ? 'border-green-500 bg-green-50 shadow-sm'
                                  : isSelected
                                  ? 'border-red-500 bg-red-50 shadow-sm'
                                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
                                  isCorrect
                                    ? 'bg-green-500 text-white'
                                    : isSelected
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span className="text-gray-800 flex-1">{option}</span>
                                {isCorrect && (
                                  <CheckCircle className="w-5 h-5 text-green-600 ml-3" />
                                )}
                                {isSelected && !isCorrect && (
                                  <XCircle className="w-5 h-5 text-red-600 ml-3" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Answer Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-3 border border-green-200">
                            <p className="text-xs font-medium text-green-700 mb-1">Correct Answer</p>
                            <p className="text-sm text-green-800 font-semibold">{questions[currentQuestionIndex].correctAnswer}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-1">Your Answer</p>
                            <p className="text-sm text-gray-800 font-semibold">
                              {selectedAttempt.answers.get ? 
                                selectedAttempt.answers.get(questions[currentQuestionIndex]._id) :
                                selectedAttempt.answers[questions[currentQuestionIndex]._id] || 'Not attempted'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Score: {selectedAttempt.score}/{selectedAttempt.totalMarks} ({selectedAttempt.percentage}%)
              </div>
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
};

export default UserResultsPage;
