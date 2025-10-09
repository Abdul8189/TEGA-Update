import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MessageDisplay from '../components/ui/MessageDisplay';
import { useMessage } from '../hooks/useMessage';
import { getMessage } from '../utils/messages';
import DeleteConfirmationDialog from '../components/ui/DeleteConfirmationDialog';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import BulkImportModal from '../components/BulkImportModal';
import CreatePrincipalModal from '../components/CreatePrincipalModal';

const Principals = () => {
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const [principals, setPrincipals] = useState([]);
  const [filteredPrincipals, setFilteredPrincipals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [principalToDelete, setPrincipalToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPrincipals();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = principals.filter(principal =>
      principal.university?.toLowerCase().includes(lowercasedFilter) ||
      principal.principalName?.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredPrincipals(filteredData);
  }, [searchTerm, principals]);

  const fetchPrincipals = async () => {
    try {
      const response = await api('/api/admin/principals');
      if (response.success) {
        setPrincipals(response.principals || []);
        setFilteredPrincipals(response.principals || []);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load principals data');
    } finally {
      setLoading(false);
    }
  };

  const handleImportSuccess = () => {
    fetchPrincipals();
  };

  const handlePrincipalCreated = (newPrincipal) => {
    setPrincipals([newPrincipal, ...principals]);
    setFilteredPrincipals([newPrincipal, ...principals]);
  };

  const handleDeleteClick = (principal) => {
    setPrincipalToDelete(principal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!principalToDelete) return;
    
    setIsDeleting(true);
    try {
      await api(`/api/admin/principals/${principalToDelete._id}`, {
        method: 'DELETE',
      });
      showSuccess(`Principal account "${principalToDelete.principalName}" deleted successfully.`, 'Principal Deleted');
      fetchPrincipals();
    } catch (error) {
      const errorMessage = getMessage('user', 'delete', error.message, { userType: 'Principal' });
      showError(errorMessage, 'Deletion Failed');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPrincipalToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPrincipalToDelete(null);
  };

  return (
    <>
      <CreatePrincipalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPrincipalCreated={handlePrincipalCreated}
      />
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        type="principal"
      />
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        studentData={principalToDelete}
        isLoading={isDeleting}
      />
      <div className="flex flex-col h-full w-full gap-6 p-6">
        {/* Professional Message Display */}
        <MessageDisplay
          show={message.show}
          type={message.type}
          title={message.title}
          message={message.message}
          onClose={clearMessage}
          className="mb-4"
        />
        
        <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Registered Principals</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by university or principal name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Bulk Import Principals
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Principal
              </button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                ) : filteredPrincipals.length > 0 ? (
                  filteredPrincipals.map((principal, index) => (
                    <tr key={principal._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{principal.principalName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{principal.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{principal.university}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/admin/edit-user/${principal._id}`} 
                          state={{ from: '/admin/principals' }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(principal)} 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete principal account"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4 text-gray-500">No principals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Principals;

