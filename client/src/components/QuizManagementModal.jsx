import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  Clock, 
  Target, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const QuizManagementModal = ({ isOpen, onClose, courseId, courseName, modules, onQuizUpdated }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [quizForm, setQuizForm] = useState({
    timeLimit: 60,
    passingScore: 60,
    maxAttempts: 1,
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [moduleQuizzes, setModuleQuizzes] = useState({});

  useEffect(() => {
    if (isOpen && modules) {
      // Initialize quiz data for each module
      const quizData = {};
      modules.forEach((module, index) => {
        quizData[index] = {
          hasQuiz: module.quiz && module.quiz.isEnabled,
          quiz: module.quiz || null
        };
      });
      setModuleQuizzes(quizData);
    }
  }, [isOpen, modules]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }

      setQuizForm(prev => ({ ...prev, file }));
    }
  };

  const handleQuizUpload = async () => {
    if (!selectedModule && selectedModule !== 0) {
      toast.error('Please select a module');
      return;
    }

    if (!quizForm.file) {
      toast.error('Please select a quiz file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', quizForm.file);
      formData.append('timeLimit', quizForm.timeLimit);
      formData.append('passingScore', quizForm.passingScore);
      formData.append('maxAttempts', quizForm.maxAttempts);
      formData.append('moduleIndex', selectedModule);

      const response = await api(`/api/courses/${courseId}/upload-quiz`, {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        toast.success('Quiz uploaded successfully!');
        
        // Update local state
        setModuleQuizzes(prev => ({
          ...prev,
          [selectedModule]: {
            hasQuiz: true,
            quiz: response.quiz
          }
        }));

        // Reset form
        setQuizForm({
          timeLimit: 60,
          passingScore: 60,
          maxAttempts: 1,
          file: null
        });
        setSelectedModule(null);

        // Notify parent component
        if (onQuizUpdated) {
          onQuizUpdated();
        }
      }
    } catch (error) {
      console.error('Error uploading quiz:', error);
      toast.error('Failed to upload quiz');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveQuiz = async (moduleIndex) => {
    if (!window.confirm('Are you sure you want to remove this quiz?')) {
      return;
    }

    try {
      // Update the module to remove quiz
      const updatedModules = [...modules];
      updatedModules[moduleIndex].quiz = {
        isEnabled: false,
        questionPaperPath: null,
        originalFileName: null,
        totalQuestions: 0,
        timeLimit: 60,
        passingScore: 60,
        maxAttempts: 1,
        uploadedAt: null
      };

      // Update course with modified modules
      const response = await api(`/api/courses/${courseId}`, {
        method: 'PUT',
        body: {
          modules: updatedModules
        }
      });

      if (response.success) {
        toast.success('Quiz removed successfully');
        
        // Update local state
        setModuleQuizzes(prev => ({
          ...prev,
          [moduleIndex]: {
            hasQuiz: false,
            quiz: null
          }
        }));

        // Notify parent component
        if (onQuizUpdated) {
          onQuizUpdated();
        }
      }
    } catch (error) {
      console.error('Error removing quiz:', error);
      toast.error('Failed to remove quiz');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
              <p className="text-sm text-gray-600 mt-1">{courseName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Module Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Module</h3>
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedModule === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedModule(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Module {index + 1}: {module.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {module.videos?.length || 0} videos
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {moduleQuizzes[index]?.hasQuiz ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Quiz Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-xs">No Quiz</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Quiz Form or Quiz Details */}
              <div>
                {selectedModule !== null ? (
                  <div>
                    {moduleQuizzes[selectedModule]?.hasQuiz ? (
                      /* Show existing quiz details */
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Quiz Details - Module {selectedModule + 1}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">Quiz Active</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">File:</span>
                              <p className="font-medium">{moduleQuizzes[selectedModule].quiz.originalFileName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Questions:</span>
                              <p className="font-medium">{moduleQuizzes[selectedModule].quiz.totalQuestions}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Time Limit:</span>
                              <p className="font-medium">{moduleQuizzes[selectedModule].quiz.timeLimit} minutes</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Passing Score:</span>
                              <p className="font-medium">{moduleQuizzes[selectedModule].quiz.passingScore}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Max Attempts:</span>
                              <p className="font-medium">{moduleQuizzes[selectedModule].quiz.maxAttempts}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Uploaded:</span>
                              <p className="font-medium">
                                {new Date(moduleQuizzes[selectedModule].quiz.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveQuiz(selectedModule)}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Quiz
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Show quiz upload form */
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Upload Quiz - Module {selectedModule + 1}
                        </h3>
                        <div className="space-y-4">
                          {/* Quiz Settings */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Limit (minutes)
                              </label>
                              <input
                                type="number"
                                value={quizForm.timeLimit}
                                onChange={(e) => setQuizForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Passing Score (%)
                              </label>
                              <input
                                type="number"
                                value={quizForm.passingScore}
                                onChange={(e) => setQuizForm(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 60 }))}
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Attempts
                            </label>
                            <input
                              type="number"
                              value={quizForm.maxAttempts}
                              onChange={(e) => setQuizForm(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* File Upload */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quiz Question Paper (Excel file)
                            </label>
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleFileChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {quizForm.file && (
                              <p className="text-sm text-green-600 mt-1">
                                Selected: {quizForm.file.name}
                              </p>
                            )}
                          </div>

                          {/* Instructions */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Excel File Format:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>Column A: Question</li>
                                  <li>Column B: Option 1</li>
                                  <li>Column C: Option 2</li>
                                  <li>Column D: Option 3</li>
                                  <li>Column E: Option 4</li>
                                  <li>Column F: Correct Answer</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Upload Button */}
                          <button
                            onClick={handleQuizUpload}
                            disabled={!quizForm.file || uploading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {uploading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Upload Quiz
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Select a module to manage its quiz</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizManagementModal;
