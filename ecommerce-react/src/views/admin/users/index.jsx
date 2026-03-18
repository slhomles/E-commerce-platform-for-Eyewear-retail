import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import api from '@/services/api';
import UsersTable from './UsersTable';
import UsersNavbar from './UsersNavbar';
import UserForm from './UserForm';
import { displayActionMessage } from '@/helpers/utils';

const Users = () => {
  useDocumentTitle('User List | Salinaka Admin');
  useScrollTop();

  const [users, setUsers] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Modal & Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  const [filters, setFilters] = useState({
    searchText: '',
    role: 'ALL',
    status: 'ALL'
  });

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const data = await api.getAllUsers(page, pageSize);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setLoading(false);
    } catch (e) {
      setError(e.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const onEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const onCancelEdit = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const onSubmitUpdate = async (updatedData) => {
    setUpdating(true);
    try {
      await api.updateUser(selectedUser.id, updatedData);
      displayActionMessage('User updated successfully', 'success');
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers(currentPage); // Refresh current page
    } catch (e) {
      displayActionMessage(e.message || 'Failed to update user', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Local filtering (optional, usually done on backend with criteria)
  const filteredUsers = users.filter(u => {
    const matchesSearch = !filters.searchText || 
      u.fullName?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      u.email?.toLowerCase().includes(filters.searchText.toLowerCase());
    
    const matchesRole = filters.role === 'ALL' || u.role === filters.role;
    const matchesStatus = filters.status === 'ALL' || 
      (filters.status === 'ACTIVE' ? u.enabled : !u.enabled);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Boundary>
      <UsersNavbar 
        filters={filters}
        onRoleFilterChange={(role) => setFilters(prev => ({ ...prev, role }))}
        onSearchChange={(searchText) => setFilters(prev => ({ ...prev, searchText }))}
        onStatusFilterChange={(status) => setFilters(prev => ({ ...prev, status }))}
        usersCount={users.length}
      />
      <div className="product-admin-items">
        {error && <div className="loader">{error}</div>}
        <UsersTable 
            baseIndex={currentPage * pageSize}
            onEdit={onEditUser} 
            users={filteredUsers} 
        />
        
        {totalPages > 1 && (
            <div className="d-flex-center margin-top-l">
                <button
                    className="button button-small button-muted"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    type="button"
                >
                    Previous
                </button>
                <span className="margin-left-s margin-right-s">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <button
                    className="button button-small button-muted"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    type="button"
                >
                    Next
                </button>
            </div>
        )}
      </div>
      <UserForm 
        isLoading={isUpdating}
        isOpen={isModalOpen}
        onCancel={onCancelEdit}
        onSubmit={onSubmitUpdate}
        user={selectedUser}
      />
    </Boundary>
  );
};

export default withRouter(Users);
