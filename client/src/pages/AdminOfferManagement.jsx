import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Building,
  BookOpen,
  DollarSign,
  Calendar,
  Users,
  TrendingDown,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';

const AdminOfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tegaExams, setTegaExams] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    expiredOffers: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstitute, setFilterInstitute] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    instituteName: '',
    courseOffers: [],
    tegaExamOffers: [],
    validUntil: '',
    description: '',
    maxStudents: ''
  });

  const [courseOfferForm, setCourseOfferForm] = useState({
    courseId: '',
    originalPrice: 0,
    offerPrice: 0,
    isActive: true
  });

  const [tegaExamOfferForm, setTegaExamOfferForm] = useState({
    examId: '',
    originalPrice: 0,
    offerPrice: 0,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching offer management data...');
      
      const [offersRes, coursesRes, tegaExamsRes, institutesRes, statsRes] = await Promise.all([
        api('/api/offers/admin'),
        api('/api/offers/admin/courses'),
        api('/api/offers/admin/tega-exams'),
        api('/api/offers/admin/institutes'),
        api('/api/offers/admin/stats')
      ]);

      console.log('📊 API Responses:');
      console.log('- Offers:', offersRes);
      console.log('- Courses:', coursesRes);
      console.log('- TEGA Exams:', tegaExamsRes);
      console.log('- Institutes:', institutesRes);
      console.log('- Stats:', statsRes);

      if (offersRes.success) {
        console.log('✅ Offers loaded:', offersRes.data);
        setOffers(offersRes.data);
      } else {
        console.log('❌ Failed to load offers:', offersRes);
      }
      
      if (coursesRes.success) {
        console.log('✅ Courses loaded:', coursesRes.data);
        setCourses(coursesRes.data);
      } else {
        console.log('❌ Failed to load courses:', coursesRes);
      }
      
      if (tegaExamsRes.success) {
        console.log('✅ TEGA exams loaded:', tegaExamsRes.data);
        setTegaExams(tegaExamsRes.data);
      } else {
        console.log('❌ Failed to load TEGA exams:', tegaExamsRes);
      }
      
      if (institutesRes.success) {
        console.log('✅ Institutes loaded:', institutesRes.data);
        setInstitutes(institutesRes.data);
      } else {
        console.log('❌ Failed to load institutes:', institutesRes);
      }
      
      if (statsRes.success) {
        console.log('✅ Stats loaded:', statsRes.data);
        setStats(statsRes.data);
      } else {
        console.log('❌ Failed to load stats:', statsRes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.instituteName) {
      toast.error('Please select an institute');
      return;
    }
    
    if (!formData.validUntil) {
      toast.error('Please set a valid until date');
      return;
    }
    
    // Check if at least one offer is configured
    const hasCourseOffers = formData.courseOffers.length > 0;
    const hasTegaExamOffers = formData.tegaExamOffers.length > 0;
    
    if (!hasCourseOffers && !hasTegaExamOffers) {
      toast.error('Please add at least one course offer or TEGA exam offer');
      return;
    }
    
    try {
      console.log('🎯 Creating offer with data:', formData);
      
      const response = await api('/api/offers/admin', {
        method: 'POST',
        body: formData
      });

      console.log('📊 Create offer response:', response);

      if (response.success) {
        toast.success('Offer created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        toast.error(response.message || 'Failed to create offer');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create offer');
    }
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await api(`/api/offers/admin/${selectedOffer._id}`, {
        method: 'PUT',
        body: formData
      });

      if (response.success) {
        toast.success('Offer updated successfully');
        setShowEditModal(false);
        setSelectedOffer(null);
        resetForm();
        fetchData();
      } else {
        toast.error(response.message || 'Failed to update offer');
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Failed to update offer');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const response = await api(`/api/offers/admin/${offerId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast.success('Offer deleted successfully');
        fetchData();
      } else {
        toast.error(response.message || 'Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const handleToggleStatus = async (offerId) => {
    try {
      const response = await api(`/api/offers/admin/${offerId}/toggle`, {
        method: 'PATCH'
      });

      if (response.success) {
        toast.success(response.message);
        fetchData();
      } else {
        toast.error(response.message || 'Failed to toggle offer status');
      }
    } catch (error) {
      console.error('Error toggling offer status:', error);
      toast.error('Failed to toggle offer status');
    }
  };

  const resetForm = () => {
    setFormData({
      instituteName: '',
      courseOffers: [],
      tegaExamOffers: [],
      validUntil: '',
      description: '',
      maxStudents: ''
    });
    setCourseOfferForm({
      courseId: '',
      originalPrice: 0,
      offerPrice: 0,
      isActive: true
    });
    setTegaExamOfferForm({
      examId: '',
      originalPrice: 0,
      offerPrice: 0,
      isActive: true
    });
  };

  const openEditModal = (offer) => {
    setSelectedOffer(offer);
    setFormData({
      instituteName: offer.instituteName || '',
      courseOffers: offer.courseOffers || [],
      tegaExamOffers: offer.tegaExamOffers || [],
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
      description: offer.description || '',
      maxStudents: offer.maxStudents || ''
    });
    setShowEditModal(true);
  };

  const addCourseOffer = () => {
    if (!courseOfferForm.courseId || courseOfferForm.originalPrice <= 0 || courseOfferForm.offerPrice <= 0) {
      toast.error('Please fill all required fields for course offer');
      return;
    }

    if (courseOfferForm.offerPrice > courseOfferForm.originalPrice) {
      toast.error('Offer price cannot be higher than original price');
      return;
    }

    const selectedCourse = courses.find(c => c._id === courseOfferForm.courseId);
    if (!selectedCourse) {
      toast.error('Selected course not found');
      return;
    }

    // Check if course is already added
    const existingCourseOffer = formData.courseOffers.find(co => co.courseId === courseOfferForm.courseId);
    if (existingCourseOffer) {
      toast.error('This course is already added to the offer');
      return;
    }

    const newCourseOffer = {
      courseId: courseOfferForm.courseId,
      courseName: selectedCourse.courseName || selectedCourse.name || '',
      originalPrice: courseOfferForm.originalPrice,
      offerPrice: courseOfferForm.offerPrice,
      isActive: courseOfferForm.isActive,
      discountPercentage: Math.round(((courseOfferForm.originalPrice - courseOfferForm.offerPrice) / courseOfferForm.originalPrice) * 100)
    };

    console.log('🎯 Adding course offer:', newCourseOffer);

    setFormData(prev => ({
      ...prev,
      courseOffers: [...prev.courseOffers, newCourseOffer]
    }));

    setCourseOfferForm({
      courseId: '',
      originalPrice: 0,
      offerPrice: 0,
      isActive: true
    });

    toast.success(`Course offer added: ${newCourseOffer.courseName}`);
  };

  const removeCourseOffer = (index) => {
    setFormData(prev => ({
      ...prev,
      courseOffers: prev.courseOffers.filter((_, i) => i !== index)
    }));
  };

  const updateCourseOfferPrice = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      courseOffers: prev.courseOffers.map((offer, i) => {
        if (i === index) {
          const updated = { ...offer, [field]: parseFloat(value) || 0 };
          if (field === 'originalPrice' || field === 'offerPrice') {
            updated.discountPercentage = Math.round(((updated.originalPrice - updated.offerPrice) / updated.originalPrice) * 100);
          }
          return updated;
        }
        return offer;
      })
    }));
  };

  const addTegaExamOffer = () => {
    if (!tegaExamOfferForm.examId || tegaExamOfferForm.originalPrice <= 0 || tegaExamOfferForm.offerPrice <= 0) {
      toast.error('Please fill all required fields for TEGA exam offer');
      return;
    }

    if (tegaExamOfferForm.offerPrice > tegaExamOfferForm.originalPrice) {
      toast.error('Offer price cannot be higher than original price');
      return;
    }

    const selectedExam = tegaExams.find(e => e._id === tegaExamOfferForm.examId);
    if (!selectedExam) {
      toast.error('Selected TEGA exam not found');
      return;
    }

    // Check if exam is already added
    const existingExamOffer = formData.tegaExamOffers.find(eo => eo.examId === tegaExamOfferForm.examId);
    if (existingExamOffer) {
      toast.error('This TEGA exam is already added to the offer');
      return;
    }

    const newTegaExamOffer = {
      examId: tegaExamOfferForm.examId,
      examTitle: selectedExam.title || '',
      originalPrice: tegaExamOfferForm.originalPrice,
      offerPrice: tegaExamOfferForm.offerPrice,
      isActive: tegaExamOfferForm.isActive,
      discountPercentage: Math.round(((tegaExamOfferForm.originalPrice - tegaExamOfferForm.offerPrice) / tegaExamOfferForm.originalPrice) * 100)
    };

    console.log('🎯 Adding TEGA exam offer:', newTegaExamOffer);

    setFormData(prev => ({
      ...prev,
      tegaExamOffers: [...prev.tegaExamOffers, newTegaExamOffer]
    }));

    setTegaExamOfferForm({
      examId: '',
      originalPrice: 0,
      offerPrice: 0,
      isActive: true
    });

    toast.success(`TEGA exam offer added: ${newTegaExamOffer.examTitle}`);
  };

  const removeTegaExamOffer = (index) => {
    setFormData(prev => ({
      ...prev,
      tegaExamOffers: prev.tegaExamOffers.filter((_, i) => i !== index)
    }));
  };

  const updateTegaExamOfferPrice = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tegaExamOffers: prev.tegaExamOffers.map((offer, i) => {
        if (i === index) {
          const updated = { ...offer, [field]: parseFloat(value) || 0 };
          if (field === 'originalPrice' || field === 'offerPrice') {
            updated.discountPercentage = Math.round(((updated.originalPrice - updated.offerPrice) / updated.originalPrice) * 100);
          }
          return updated;
        }
        return offer;
      })
    }));
  };

  const handleCourseSelection = (courseId) => {
    const selectedCourse = courses.find(c => c._id === courseId);
    if (selectedCourse) {
      setCourseOfferForm(prev => ({
        ...prev,
        courseId: courseId,
        originalPrice: selectedCourse.price || 0
      }));
      console.log('🎯 Course selected:', selectedCourse);
    }
  };

  const handleTegaExamSelection = (examId) => {
    const selectedExam = tegaExams.find(e => e._id === examId);
    if (selectedExam) {
      setTegaExamOfferForm(prev => ({
        ...prev,
        examId: examId,
        originalPrice: selectedExam.price || selectedExam.effectivePrice || 0
      }));
      console.log('🎯 TEGA exam selected:', selectedExam);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = (offer.instituteName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (offer.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstitute = !filterInstitute || (offer.instituteName || '') === filterInstitute;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && offer.isActive && offer.validUntil && new Date(offer.validUntil) > new Date()) ||
                      (activeTab === 'expired' && offer.validUntil && new Date(offer.validUntil) < new Date()) ||
                      (activeTab === 'inactive' && !offer.isActive);
    
    return matchesSearch && matchesInstitute && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
              <p className="text-gray-600 mt-2">Manage special pricing offers for institutes</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Offer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOffers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiredOffers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterInstitute}
              onChange={(e) => setFilterInstitute(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Institutes</option>
              {institutes.map(institute => (
                <option key={institute} value={institute}>{institute}</option>
              ))}
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {['all', 'active', 'expired', 'inactive'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institute
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Offers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TEGA Exams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer) => {
                  const isExpired = offer.validUntil ? new Date(offer.validUntil) < new Date() : false;
                  const isValid = offer.isActive && !isExpired;
                  
                  return (
                    <tr key={offer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {offer.instituteName || 'Unknown Institute'}
                            </div>
                            {offer.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {offer.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {offer.courseOffers?.length || 0} courses
                        </div>
                        {offer.courseOffers?.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Up to {Math.max(...offer.courseOffers.map(co => co.discountPercentage || 0))}% off
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {offer.tegaExamOffers?.length || 0} exams
                        </div>
                        {offer.tegaExamOffers?.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Up to {Math.max(...offer.tegaExamOffers.map(eo => eo.discountPercentage || 0))}% off
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'No date set'}
                        </div>
                        <div className={`text-sm ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleStatus(offer._id)}
                            className="flex items-center"
                          >
                            {offer.isActive ? (
                              <ToggleRight className="w-6 h-6 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                          <span className={`ml-2 text-sm font-medium ${
                            isValid ? 'text-green-600' : 
                            !offer.isActive ? 'text-gray-500' : 'text-red-600'
                          }`}>
                            {isValid ? 'Active' : !offer.isActive ? 'Inactive' : 'Expired'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(offer)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {(showCreateModal || showEditModal) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {showCreateModal ? 'Create New Offer' : 'Edit Offer'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        setSelectedOffer(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={showCreateModal ? handleCreateOffer : handleUpdateOffer} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institute Name *
                        </label>
                        <select
                          value={formData.instituteName}
                          onChange={(e) => setFormData(prev => ({ ...prev, instituteName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Institute</option>
                          {institutes.map(institute => (
                            <option key={institute} value={institute}>{institute}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valid Until *
                        </label>
                        <input
                          type="date"
                          value={formData.validUntil}
                          onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                          placeholder="Optional description for this offer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Students (Optional)
                        </label>
                        <input
                          type="number"
                          value={formData.maxStudents}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Leave empty for unlimited"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Course Offers */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Course Offers</h3>
                        <button
                          type="button"
                          onClick={addCourseOffer}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Add Course
                        </button>
                      </div>

                      {/* Add Course Offer Form */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course
                            </label>
                            <select
                              value={courseOfferForm.courseId}
                              onChange={(e) => handleCourseSelection(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Course</option>
                              {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                  {course.courseName || course.name} - ₹{course.price}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Original Price
                            </label>
                            <input
                              type="number"
                              value={courseOfferForm.originalPrice}
                              onChange={(e) => setCourseOfferForm(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Offer Price
                            </label>
                            <input
                              type="number"
                              value={courseOfferForm.offerPrice}
                              onChange={(e) => setCourseOfferForm(prev => ({ ...prev, offerPrice: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={addCourseOffer}
                              className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Course Offers List */}
                      <div className="space-y-2">
                        {formData.courseOffers.map((offer, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-4">
                              <BookOpen className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="font-medium text-gray-900">{offer.courseName}</div>
                                <div className="text-sm text-gray-600">
                                  ₹{offer.originalPrice} → ₹{offer.offerPrice} ({offer.discountPercentage}% off)
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCourseOffer(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TEGA Exam Offers */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">TEGA Exam Offers</h3>
                        <button
                          type="button"
                          onClick={addTegaExamOffer}
                          className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Add TEGA Exam
                        </button>
                      </div>

                      {/* Add TEGA Exam Offer Form */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              TEGA Exam
                            </label>
                            <select
                              value={tegaExamOfferForm.examId}
                              onChange={(e) => handleTegaExamSelection(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select TEGA Exam</option>
                              {tegaExams.map(exam => (
                                <option key={exam._id} value={exam._id}>
                                  {exam.title} - ₹{exam.price || exam.effectivePrice}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Original Price
                            </label>
                            <input
                              type="number"
                              value={tegaExamOfferForm.originalPrice}
                              onChange={(e) => setTegaExamOfferForm(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Offer Price
                            </label>
                            <input
                              type="number"
                              value={tegaExamOfferForm.offerPrice}
                              onChange={(e) => setTegaExamOfferForm(prev => ({ ...prev, offerPrice: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={addTegaExamOffer}
                              className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* TEGA Exam Offers List */}
                      <div className="space-y-2">
                        {formData.tegaExamOffers.map((offer, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-4">
                              <BookOpen className="w-5 h-5 text-purple-500" />
                              <div>
                                <div className="font-medium text-gray-900">{offer.examTitle}</div>
                                <div className="text-sm text-gray-600">
                                  ₹{offer.originalPrice} → ₹{offer.offerPrice} ({offer.discountPercentage}% off)
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTegaExamOffer(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowEditModal(false);
                          setSelectedOffer(null);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {showCreateModal ? 'Create Offer' : 'Update Offer'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminOfferManagement;
