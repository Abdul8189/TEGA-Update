import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  BookOpen,
  Trophy,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import UserDashboardLayout from '../components/UserDashboardLayout';

const QuizPage = () => {
  const { courseId, moduleIndex } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isQuizPaused, setIsQuizPaused] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load quiz data
  useEffect(() => {
    loadQuizData();
  }, [courseId, moduleIndex]);

  // Timer effect
  useEffect(() => {
    if (isQuizStarted && !isQuizPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isQuizStarted, isQuizPaused, timeRemaining]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      
      // Get course and module data
      const courseResponse = await api(`/api/courses/${courseId}`);
      if (!courseResponse.success) {
        throw new Error('Course not found');
      }

      const course = courseResponse.course;
      const moduleIdx = parseInt(moduleIndex);
      
      if (moduleIdx < 0 || moduleIdx >= course.modules.length) {
        throw new Error('Invalid module');
      }

      const module = course.modules[moduleIdx];
      
      if (!module.quiz || !module.quiz.isEnabled) {
        throw new Error('Quiz not available for this module');
      }

      setQuiz({
        ...module.quiz,
        courseTitle: course.courseName,
        moduleTitle: module.title
      });

      // Check if user can attempt quiz
      const attemptResponse = await api(`/api/quiz/check-attempt/${courseId}/${moduleIdx}`);
      if (!attemptResponse.success) {
        throw new Error(attemptResponse.message);
      }

      if (attemptResponse.hasAttempted) {
        setError('You have already attempted this quiz. Only one attempt is allowed.');
        return;
      }

      // Load questions from quiz file
      const questionsResponse = await api(`/api/quiz/questions/${courseId}/${moduleIdx}`);
      if (!questionsResponse.success) {
        throw new Error('Failed to load quiz questions');
      }

      setQuestions(questionsResponse.questions);
      setTimeRemaining(module.quiz.timeLimit * 60); // Convert minutes to seconds
      
      // Initialize quiz attempt
      const attemptData = {
        courseId,
        moduleIndex: moduleIdx,
        moduleTitle: module.title,
        totalQuestions: questionsResponse.questions.length,
        timeLimit: module.quiz.timeLimit,
        passingScore: module.quiz.passingScore
      };

      const createAttemptResponse = await api('/api/quiz/start-attempt', {
        method: 'POST',
        body: attemptData
      });

      if (createAttemptResponse.success) {
        setQuizAttempt(createAttemptResponse.attempt);
      }

    } catch (error) {
      console.error('Error loading quiz:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setIsQuizStarted(true);
    startTimeRef.current = new Date();
    setVisitedQuestions(prev => new Set([...prev, currentQuestionIndex]));
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Mark question as visited
    setVisitedQuestions(prev => new Set([...prev, currentQuestionIndex]));
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
    setVisitedQuestions(prev => new Set([...prev, index]));
  };

  const toggleFlag = (questionIndex) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const togglePause = () => {
    setIsQuizPaused(prev => !prev);
  };

  const handleQuizSubmit = async () => {
    try {
      if (!isQuizStarted) return;

      const endTime = new Date();
      const timeSpent = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 1000 / 60);

      // Calculate score
      let correctAnswers = 0;
      const answerDetails = [];

      questions.forEach((question, index) => {
        const userAnswer = answers[question.id] || '';
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correctAnswers++;

        answerDetails.push({
          questionId: question.id,
          questionText: question.question,
          selectedAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timeSpent: 0 // Could be calculated per question if needed
        });
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      const isPassed = score >= quiz.passingScore;

      // Submit quiz attempt
      const submitData = {
        attemptId: quizAttempt._id,
        answers: answerDetails,
        score,
        isPassed,
        timeSpent,
        endTime
      };

      const submitResponse = await api('/api/quiz/submit-attempt', {
        method: 'POST',
        body: submitData
      });

      if (submitResponse.success) {
        setIsQuizCompleted(true);
        toast.success(`Quiz completed! Score: ${score}%`);
      } else {
        throw new Error(submitResponse.message);
      }

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    if (answers[questions[index]?.id]) return 'answered';
    if (flaggedQuestions.has(index)) return 'flagged';
    if (visitedQuestions.has(index)) return 'visited';
    return 'unvisited';
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (error) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Available</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (isQuizCompleted) {
    const score = Math.round((Object.values(answers).filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length / questions.length) * 100);
    const isPassed = score >= quiz.passingScore;

    return (
      <UserDashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isPassed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isPassed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>

            <h1 className={`text-3xl font-bold mb-4 ${
              isPassed ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPassed ? 'Congratulations!' : 'Quiz Completed'}
            </h1>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{score}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(answers).filter((answer, index) => 
                      answer === questions[index]?.correctAnswer
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {questions.length - Object.values(answers).filter((answer, index) => 
                      answer === questions[index]?.correctAnswer
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(quiz.timeLimit * 60 - timeRemaining)}
                  </div>
                  <div className="text-sm text-gray-600">Time Used</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/course-dashboard')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                All Courses
              </button>
            </div>
          </motion.div>
        </div>
      </UserDashboardLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{quiz.courseTitle}</h1>
                  <p className="text-sm text-gray-600">{quiz.moduleTitle} - Quiz</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timer */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-semibold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>

                {/* Pause/Resume Button */}
                {isQuizStarted && (
                  <button
                    onClick={togglePause}
                    className={`p-2 rounded-lg ${
                      isQuizPaused 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {isQuizPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                )}

                {/* Submit Button */}
                {isQuizStarted && (
                  <button
                    onClick={handleQuizSubmit}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : getQuestionStatus(index) === 'answered'
                          ? 'bg-green-100 text-green-700'
                          : getQuestionStatus(index) === 'flagged'
                          ? 'bg-yellow-100 text-yellow-700'
                          : getQuestionStatus(index) === 'visited'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-50 rounded"></div>
                    <span>Not Visited</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Quiz Content */}
            <div className="lg:col-span-3">
              {!isQuizStarted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-8 text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Instructions</h1>
                  
                  <div className="text-left max-w-2xl mx-auto space-y-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Quiz Details:</h3>
                      <ul className="text-blue-800 space-y-1">
                        <li>• Total Questions: {questions.length}</li>
                        <li>• Time Limit: {quiz.timeLimit} minutes</li>
                        <li>• Passing Score: {quiz.passingScore}%</li>
                        <li>• Attempts Allowed: {quiz.maxAttempts}</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
                      <ul className="text-yellow-800 space-y-1">
                        <li>• You can navigate between questions using the sidebar</li>
                        <li>• Flag questions you want to review later</li>
                        <li>• You can pause and resume the quiz</li>
                        <li>• Quiz will auto-submit when time runs out</li>
                        <li>• Only one attempt is allowed per quiz</li>
                      </ul>
                    </div>
                  </div>
                  
                  <button
                    onClick={startQuiz}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                  >
                    <Play className="w-5 h-5" />
                    Start Quiz
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </h2>
                      <button
                        onClick={() => toggleFlag(currentQuestionIndex)}
                        className={`p-2 rounded-lg ${
                          flaggedQuestions.has(currentQuestionIndex)
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
                        }`}
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-900 text-lg leading-relaxed">
                      {currentQuestion?.question}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion?.options?.map((option, index) => (
                      <label
                        key={index}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            answers[currentQuestion.id] === option
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {answers[currentQuestion.id] === option && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <span className="text-gray-900">{option}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default QuizPage;

