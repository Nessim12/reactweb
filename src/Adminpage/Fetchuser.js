import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import "./user.css";
import { MdDelete } from "react-icons/md";
import Swal from 'sweetalert2';
import { Button } from 'react-bootstrap';


const Fetchuser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('Authentication token not found');
        }

        // Fetch users
        const usersResponse = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const usersData = usersResponse.data.users;

        // Fetch user status for today
        const statusResponse = await axios.get(`${API_BASE_URL}/api/admin/alluseretat`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const userStatuses = statusResponse.data.user_statuses;

        // Merge user status with user data
        const updatedUsers = usersData.map(user => {
          const status = userStatuses.find(status => status.user_id === user.id);
          return {
            ...user,
            status: status ? status.status : 'absent'
          };
        });

        setUsers(updatedUsers);

        // Simulate loading for 3 seconds before showing the data
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${API_BASE_URL}/api/admin/deleteuser/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      // Filter out the deleted user from the users array
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }

    // Close the modal after deleting the user
    setShowModal(false);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  
    // Show SweetAlert modal with user details including status
    Swal.fire({
      title: 'User Details',
      html: `
        <div style="text-align: left;">
          <p><strong>First Name:</strong> ${user.firstname}</p>
          <p><strong>Last Name:</strong> ${user.lastname}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Genre:</strong> ${user.genre}</p>
          <p><strong>Status:</strong> ${user.status}</p>
        </div>
      `,
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Close',
      customClass: {
        container: 'sweetalert-container',
        title: 'sweetalert-title',
        htmlContainer: 'sweetalert-html-container'
      }
    });
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
  <table className="user-table" style={{ borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>First Name</th>
        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Last Name</th>
        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Email</th>
        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Genre</th>
        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Status</th>
        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Delete</th>
        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>View</th> {/* New column header */}
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id} style={{ backgroundColor: 'white' }} onMouseOver={(e) => { e.target.parentNode.style.backgroundColor = '#f2f2f2'; }} onMouseOut={(e) => { e.target.parentNode.style.backgroundColor = 'white'; }}>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.firstname}</td>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.lastname}</td>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
          <td style={{ border: '1px solid #ddd', padding: '8px', color: user.genre === 'women' ? 'pink' : 'blue' }}>{user.genre}</td>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.status}</td>
          <td style={{ border: '1px solid #ddd', padding: 0 }}>
  <MdDelete
    className="delete-button"
    onClick={() => {
      Swal.fire({
        title: 'Confirm Deletion',
        text: 'Are you sure you want to delete this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeleteUser(user.id);
        }
      });
    }}
  />
</td>

          <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  <Button variant="primary" onClick={() => handleViewDetails(user)}>View</Button>
                </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      )}
    </div>
  );
};

export default Fetchuser;
