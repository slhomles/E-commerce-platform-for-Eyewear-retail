import { SearchOutlined } from '@ant-design/icons';
import PropType from 'prop-types';
import React from 'react';

const UsersNavbar = ({ 
    usersCount, 
    onSearchChange, 
    onRoleFilterChange,
    onStatusFilterChange,
    filters 
}) => {
  return (
    <div className="product-admin-header">
      <h3 className="product-admin-header-title">
        Users ({usersCount})
      </h3>
      <div className="searchbar">
        <SearchOutlined className="searchbar-icon" />
        <input
          className="search-input searchbar-input"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Users (Name/Email)..."
          type="text"
          value={filters.searchText}
        />
      </div>
      &nbsp;
      <div className="filters">
        <select 
            className="filter-select"
            onChange={(e) => onRoleFilterChange(e.target.value)}
            value={filters.role}
        >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
        </select>
        &nbsp;
        <select 
            className="filter-select"
            onChange={(e) => onStatusFilterChange(e.target.value)}
            value={filters.status}
        >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
        </select>
      </div>
    </div>
  );
};

UsersNavbar.propTypes = {
  usersCount: PropType.number.isRequired,
  onSearchChange: PropType.func.isRequired,
  onRoleFilterChange: PropType.func.isRequired,
  onStatusFilterChange: PropType.func.isRequired,
  filters: PropType.shape({
    searchText: PropType.string,
    role: PropType.string,
    status: PropType.string
  }).isRequired
};

export default UsersNavbar;
