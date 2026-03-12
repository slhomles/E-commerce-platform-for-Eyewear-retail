import PropType from 'prop-types';
import React from 'react';
import UserItem from './UserItem';

const UsersTable = ({ users, onEdit, baseIndex }) => (
  <div>
    {users.length > 0 && (
      <div className="grid grid-product grid-count-7">
        <div className="grid-col">
          <h5>#</h5>
        </div>
        <div className="grid-col">
          <h5>Full Name</h5>
        </div>
        <div className="grid-col">
          <h5>Email</h5>
        </div>
        <div className="grid-col">
          <h5>Role</h5>
        </div>
        <div className="grid-col">
          <h5>Joined Date</h5>
        </div>
        <div className="grid-col">
          <h5>Status</h5>
        </div>
        <div className="grid-col" />
      </div>
    )}
    {users.length === 0 ? new Array(10).fill({}).map((user, index) => (
      <UserItem
        key={`user-skeleton ${index}`}
        onEdit={() => {}}
        user={user}
      />
    )) : users.map((user, index) => (
      <UserItem
        index={baseIndex + index + 1}
        key={user.id}
        onEdit={onEdit}
        user={user}
      />
    ))}
  </div>
);

UsersTable.propTypes = {
  baseIndex: PropType.number.isRequired,
  onEdit: PropType.func.isRequired,
  users: PropType.array.isRequired
};

export default UsersTable;
