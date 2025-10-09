import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Clock } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import StudentList from '../components/StudentList';

const PrincipalDashboard = () => {
  const [principalData, setPrincipalData] = useState(null);
  const [stats, setStats] = useState({
    totalCollegeUsers: 0,
    recentCollegeRegistrations: 0
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('PrincipalDashboard - Current user:', user);
    console.log('PrincipalDashboard - localStorage principalToken:', localStorage.getItem('principalToken'));
    console.log('PrincipalDashboard - localStorage principalUser:', localStorage.getItem('principalUser'));
  }, [user]);

  useEffect(() => {
    // Check if user is authenticated and is a principal
    if (!authLoading) {
      if (!user || user.role !== 'principal') {
        navigate('/auth');
        return;
      }
      
      setPrincipalData(user);
      Promise.all([
        fetchDashboardData(),
        fetchStudentsData()
      ]);
    }
  }, [user, authLoading, navigate]);



  const fetchDashboardData = async () => {
    try {
      const response = await api('/api/principal/dashboard', {
        method: 'GET'
      });

      if (response.success) {
        setStats(response.stats);
        setPrincipalData(response.principal);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsData = async () => {
    try {
      const response = await api('/api/principal/students', {
        method: 'GET'
      });

      if (response.success) {
        setStudents(response.students || []);
      }
    } catch (error) {
      toast.error('Failed to load students data');
    }
  };



  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <Sidebar role="principal" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col h-full w-full gap-6 p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {principalData?.principalName}!</h2>
          <p className="text-green-100">
            Manage your college students and track registrations for {principalData?.university}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total College Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCollegeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Registrations (7 days)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentCollegeRegistrations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <StudentList students={students} />
        </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrincipalDashboard;
