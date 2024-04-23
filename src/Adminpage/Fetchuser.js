import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Button, Modal, Form } from 'react-bootstrap';
import './user.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cin: '',
    firstname: '',
    lastname: '',
    email: '',
    tel: '',
    adresse: '',
    genre: 'men'
  });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        setUsers(response.data.users);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filteredResults = users.filter(user =>
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filteredResults);
  }, [users, searchTerm]);

  const handleDeleteUser = async (id) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const result = await Swal.fire({
        title: 'Confirm Deletion',
        text: 'Are you sure you want to delete this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await axios.delete(`${API_BASE_URL}/api/admin/deleteuser/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);

        Swal.fire({
          icon: 'success',
          title: 'User Deleted',
          text: 'User has been deleted successfully!'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete user. Please try again.'
      });
    }
  };

  const handleAddUser = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_BASE_URL}/api/admin/adduser`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const { user } = response.data;
      setUsers([...users, user]);

      Swal.fire({
        icon: 'success',
        title: 'User Added',
        text: 'New user has been added successfully!'
      });

      setShowModal(false);
      setFormData({
        cin: '',
        firstname: '',
        lastname: '',
        email: '',
        tel: '',
        adresse: '',
        genre: 'men'
      });
    } catch (error) {
      console.error('Error adding user:', error.message);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add new user. Please try again.'
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(`${API_BASE_URL}/api/admin/updateuser/${editingUser.id}`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const updatedUser = response.data.user;
      const updatedUsers = users.map(user => (user.id === updatedUser.id ? updatedUser : user));
      setUsers(updatedUsers);

      Swal.fire({
        icon: 'success',
        title: 'User Updated',
        text: 'User information has been updated successfully!'
      });

      setShowModal(false);
      setFormData({
        cin: '',
        firstname: '',
        lastname: '',
        email: '',
        tel: '',
        adresse: '',
        genre: 'men'
      });
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error.message);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update user. Please try again.'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
    setFormData({
      cin: user.cin,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      tel: user.tel,
      adresse: user.adresse,
      genre: user.genre
    });
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({
      cin: '',
      firstname: '',
      lastname: '',
      email: '',
      tel: '',
      adresse: '',
      genre: 'men'
    });
    setEditingUser(null);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-container">
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button variant="primary" onClick={() => setShowModal(true)} style={{ marginBottom: '10px' }}>
        Add User
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="cin">
              <Form.Label>CIN</Form.Label>
              <Form.Control type="text" name="cin" value={formData.cin} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="lastname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="tel">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="text" name="tel" value={formData.tel} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="adresse">
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" name="adresse" value={formData.adresse} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="genre">
              <Form.Label>Gender</Form.Label>
              <Form.Control as="select" name="genre" value={formData.genre} onChange={handleInputChange}>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={editingUser ? handleUpdateUser : handleAddUser}>
            {editingUser ? 'Update User' : 'Add User'}
          </Button>
        </Modal.Footer>
      </Modal>

      <table className="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>CIN</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{indexOfFirstUser + index + 1}</td>
              <td>{user.cin}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.email}</td>
              <td>{user.tel}</td>
              <td>{user.adresse}</td>
              <td>{user.genre}</td>
              <td>
                <MdEdit className="edit-button" onClick={() => handleEditUser(user)} />
                <MdDelete className="delete-button" onClick={() => handleDeleteUser(user.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
          <button key={i + 1} onClick={() => paginate(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
