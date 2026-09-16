import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { customerService } from '../services/api';
import PopuModal from '../modals/popuModal';
import '../pages/UserManagement.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [staff, setStaff] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    message: '',
    aadharPdf: null, // Aadhaar PDF file
  });
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState(null);
  const [deleteAadharTarget, setDeleteAadharTarget] = useState(null);

  const [selectedFileName, setSelectedFileName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Staff',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create new customer with Aadhaar PDF
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (!formData.name || !formData.phone || !formData.aadharPdf) {
        setFeedbackModal({
          isOpen: true,
          variant: 'error',
          title: 'Missing Details',
          message: 'Name, phone, and Aadhaar PDF are required to create a customer.',
        });
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('token');
      await customerService.createCustomer({
        name: formData.name,
        phone: formData.phone,
        aadharPdf: formData.aadharPdf,
      }, token);
      setSuccess(`Customer ${formData.name} created successfully!`);
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Customer Created',
        message: `Customer ${formData.name} created successfully.`,
      });
      setFormData({ name: '', phone: '', aadharPdf: null });
      setSelectedFileName('');
      setShowCreateForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create customer';
      setError(message);
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Unable to Create Customer',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all customers
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStaff(response.data.customers || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  // Delete customer
  const handleDeleteStaff = async (staffId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(`${API_BASE}/customers/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Customer Deleted',
        message: 'Customer deleted successfully.',
      });

      fetchStaff();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to delete customer';
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Delete Failed',
        message,
      });
    }
  };

  const handleDeleteAadhar = async () => {
    if (!deleteAadharTarget) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customers/${deleteAadharTarget._id}/aadhar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setFeedbackModal({
          isOpen: true,
          variant: 'success',
          title: 'Aadhaar Deleted',
          message: 'Aadhaar PDF deleted successfully.',
        });
        fetchStaff();
      } else {
        setFeedbackModal({
          isOpen: true,
          variant: 'error',
          title: 'Delete Failed',
          message: 'Could not delete Aadhaar PDF.',
        });
      }
    } catch (err) {
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Delete Failed',
        message: 'Could not delete Aadhaar PDF.',
      });
    } finally {
      setDeleteAadharTarget(null);
    }
  };

  // Edit customer
  const handleEditStaff = (staffId) => {
    const customer = staff.find(m => m._id === staffId);
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        role: 'Customer',
      });
      setEditingId(staffId);
      setShowEditForm(true);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (!formData.name || !formData.phone) {
        setFeedbackModal({
          isOpen: true,
          variant: 'error',
          title: 'Missing Details',
          message: 'Name and phone are required.',
        });
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`${API_BASE}/customers/${editingId}`, {
        name: formData.name,
        phone: formData.phone,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(`Customer ${formData.name} updated successfully!`);
      setFeedbackModal({
        isOpen: true,
        variant: 'success',
        title: 'Customer Updated',
        message: `Customer ${formData.name} updated successfully.`,
      });
      setFormData({ name: '', phone: '', role: 'Staff' });
      setEditingId(null);
      setShowEditForm(false);
      fetchStaff();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update customer';
      setError(message);
      setFeedbackModal({
        isOpen: true,
        variant: 'error',
        title: 'Unable to Update Customer',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStaff();
  }, []);

  // Get user role from Redux (assumes auth state has user.role)
  const userRole = useSelector(state => state.auth?.user?.role);
  return (
    <div className="user-management-container">
      <PopuModal
        isOpen={feedbackModal.isOpen}
        variant={feedbackModal.variant}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() =>
          setFeedbackModal((current) => ({
            ...current,
            isOpen: false,
          }))
        }
      />
      <PopuModal
        isOpen={!!deleteCustomerTarget}
        variant="confirm"
        title="Delete Customer?"
        message="This customer will be removed from the customer list."
        confirmLabel="Delete"
        onConfirm={() => {
          handleDeleteStaff(deleteCustomerTarget._id);
          setDeleteCustomerTarget(null);
        }}
        onClose={() => setDeleteCustomerTarget(null)}
      />
      <PopuModal
        isOpen={!!deleteAadharTarget}
        variant="confirm"
        title="Delete Aadhaar PDF?"
        message="This Aadhaar PDF will be removed from the customer record."
        confirmLabel="Delete PDF"
        onConfirm={handleDeleteAadhar}
        onClose={() => setDeleteAadharTarget(null)}
      />
      <h1>Customer Management</h1>
      <p className="subtitle">Add new customers here</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="management-controls">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Close' : '+ Create Customer'}
        </button>
      </div>

      {/* Create Customer Form */}
      {showCreateForm && (
        <div className="create-form-container">
          <h2>Create Customer</h2>
          <form onSubmit={handleCreateUser} className="user-form">
            <div className="form-group">
              <label htmlFor="name">Customer Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number (10 digits)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="aadharPdf">Aadhaar Card *</label>
              <input
                type="file"
                id="aadharPdf"
                name="aadharPdf"
                accept="application/pdf"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, aadharPdf: file }));
                    setSelectedFileName(file.name);
                  }
                }}
                required
                className="file-input-hidden"
              />
              <label htmlFor="aadharPdf" className="file-input-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                {selectedFileName ? selectedFileName : 'Choose PDF File'}
              </label>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </form>
        </div>
      )}

      {/* Edit Customer Form */}
      {showEditForm && (
        <div className="create-form-container">
          <h2>Edit Customer</h2>
          <form onSubmit={handleEditSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="name">Customer Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number (10 digits)"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Customer'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingId(null);
                  setFormData({ name: '', phone: '', role: 'Staff' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
 <div className="staff-table-container">
        <h2 className="form-title">All Customers</h2>
        <table className="staff-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.phone}</td>
                <td>{member.role}</td>
                <td>
                  <button
                    className="btn-edit-small me-2"
                    onClick={() => handleEditStaff(member._id)}
                  >
                    Edit
                  </button>
                    <button
                    className="btn-delete-small me-2"
                    onClick={() => setDeleteCustomerTarget(member)}
                  >
                    Delete
                  </button>
                  {/* Admin-only Aadhaar actions */}
                  {userRole === 'Admin' && member.aadharPdf && member.aadharPdf.filename && (
                    <>
                      <button
                        className="btn-view-small me-2"
                        onClick={() => {
                          // Download/View Aadhaar PDF - more reliable than blob URLs
                          const token = localStorage.getItem('token');
                          fetch(`${API_BASE}/customers/${member._id}/aadhar`, {
                            headers: { Authorization: `Bearer ${token}` },
                          })
                            .then(res => {
                              if (!res.ok) {
                                throw new Error(`HTTP ${res.status}`);
                              }
                              return res.blob();
                            })
                            .then(blob => {
                              // Create a blob URL and download it
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `aadhar-${member._id}.pdf`;
                              link.style.display = 'none';
                              document.body.appendChild(link);
                              link.click();
                              
                              // Cleanup
                              setTimeout(() => {
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                              }, 100);
                            })
                            .catch(err => {
                              console.error('Aadhaar fetch error:', err);
                              setFeedbackModal({
                                isOpen: true,
                                variant: 'error',
                                title: 'Aadhaar View Failed',
                                message: 'Could not fetch Aadhaar PDF. Please try again.',
                              });
                            });
                        }}
                      >
                        View Aadhaar
                      </button>
                      <button
                        className="btn-delete-small"
                        onClick={() => setDeleteAadharTarget(member)}
                      >
                        Delete Aadhaar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  </div>
  );
}
  
export default UserManagement;
