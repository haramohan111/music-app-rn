import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import '../../styles/ManageUsers.css';

const ManageUsers = () => {
  // Dummy user data
  const dummyUsers = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    firstName: `User${i + 1}`,
    lastName: `Last${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 2 === 0 ? 'Editor' : 'User',
    status: i % 4 === 0 ? 'Inactive' : 'Active',
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort users based on sortConfig
  const sortedUsers = useMemo(() => {
    let sortableUsers = [...dummyUsers];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        // Special handling for lastLogin which is a date string
        if (sortConfig.key === 'lastLogin') {
          const dateA = new Date(a.lastLogin);
          const dateB = new Date(b.lastLogin);
          return sortConfig.direction === 'ascending' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        // Special handling for name which combines first and last
        if (sortConfig.key === 'name') {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          if (nameA < nameB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (nameA > nameB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }

        // Default sorting for other fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [dummyUsers, sortConfig]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        user.status.toLowerCase().includes(searchLower) ||
        user.id.toString().includes(searchTerm)
      );
    });
  }, [sortedUsers, searchTerm]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 10;

  // Calculate current users to display
  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);
  const offset = currentPage * usersPerPage;
  const currentUsers = filteredUsers.slice(offset, offset + usersPerPage);

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    setSelectAll(false); // Reset select all when changing pages
  };

  // Handle user deletion
  const handleDelete = (userId) => {
    console.log(`User ${userId} would be deleted`);
    alert(`User ${userId} would be deleted in a real application`);
  };

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to delete');
      return;
    }
    console.log(`Users ${selectedUsers.join(', ')} would be deleted`);
    alert(`Users ${selectedUsers.join(', ')} would be deleted in a real application`);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Toggle selection for a single user
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle select all users on current page
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Get sort direction indicator for a column
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return null;
  };

  return (
    <div className="manage-users-container">
      <div className="header">
        <h2>Manage Users</h2>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <Link to="/admin/add-user" className="add-user-btn">
            Add New User
          </Link>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedUsers.length} user(s) selected</span>
          <button 
            onClick={handleBulkDelete}
            className="bulk-delete-btn"
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-results">
            No users found matching your search criteria.
          </div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th onClick={() => requestSort('id')}>
                    ID{getSortIndicator('id')}
                  </th>
                  <th onClick={() => requestSort('name')}>
                    Name{getSortIndicator('name')}
                  </th>
                  <th onClick={() => requestSort('email')}>
                    Email{getSortIndicator('email')}
                  </th>
                  <th onClick={() => requestSort('role')}>
                    Role{getSortIndicator('role')}
                  </th>
                  <th onClick={() => requestSort('status')}>
                    Status{getSortIndicator('status')}
                  </th>
                  <th onClick={() => requestSort('lastLogin')}>
                    Last Login{getSortIndicator('lastLogin')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td>{user.id}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td className="actions">
                      <Link to={`/admin/edit-user/${user.id}`} className="edit-btn">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <ReactPaginate
              previousLabel={'← Previous'}
              nextLabel={'Next →'}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              forcePage={currentPage}
              containerClassName={'pagination'}
              previousLinkClassName={'pagination__link'}
              nextLinkClassName={'pagination__link'}
              disabledClassName={'pagination__link--disabled'}
              activeClassName={'pagination__link--active'}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;