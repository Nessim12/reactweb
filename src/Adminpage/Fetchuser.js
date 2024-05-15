import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';
import {  MdDeleteForever  } from 'react-icons/md';
import { Button, Modal, Form } from 'react-bootstrap';
import { FaUserEdit } from "react-icons/fa";
import './user.css';
import { IoManSharp, IoWomanOutline  } from "react-icons/io5";
import { MdPlace } from "react-icons/md";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '200px' }}
        />
                <Button  onClick={() => setShowModal(true)} style={{ marginRight: '220px',borderRadius:'30px', backgroundColor:'#025E73' }}>
          Ajouter Employée
        </Button>
      </div>


      <Modal show={showModal} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ backgroundColor: '#90AFC5', color: 'white', borderBottom: 'none' }}>
    <Modal.Title>{editingUser ? 'Update Employée' : 'Ajouter Employée'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Form.Group controlId="cin">
            <Form.Label>CIN</Form.Label>
            <Form.Control type="text" name="cin" placeholder="Enter CIN" value={formData.cin} onChange={handleInputChange} />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleInputChange} />
          </Form.Group>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Form.Group controlId="lastname">
            <Form.Label>Prenom</Form.Label>
            <Form.Control type="text" name="lastname" placeholder="Enter Prenom" value={formData.lastname} onChange={handleInputChange} />
          </Form.Group>
          <Form.Group controlId="firstname">
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" name="firstname" placeholder="Enter Nom" value={formData.firstname} onChange={handleInputChange} />
          </Form.Group>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Form.Group controlId="tel">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control type="text" name="tel" placeholder="Enter Phone Number" value={formData.tel} onChange={handleInputChange} />
          </Form.Group>
          <Form.Group controlId="adresse">
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" name="adresse" placeholder="Enter Address" value={formData.adresse} onChange={handleInputChange} />
          </Form.Group>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Form.Group controlId="genre">
            <Form.Label>Gender</Form.Label>
            <Form.Control as="select" name="genre" value={formData.genre} onChange={handleInputChange}>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </Form.Control>
          </Form.Group>
        </div>
      </div>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>Close</Button>
    <Button variant="primary" onClick={editingUser ? handleUpdateUser : handleAddUser}>
      {editingUser ? 'Update User' : 'Ajouter'}
    </Button>
  </Modal.Footer>
</Modal>



<div style={{ marginTop: '20px', overflowY: 'auto', maxHeight: '400px' }}>
<table className="usetab" style={{ borderCollapse: 'collapse', width: '100%' }}>
  <thead>
    <tr>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>#</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Cin</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Prénom</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Nom de famille</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black', width: '300px' }}>email</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Téléphone</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Address</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Gender</th>
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {currentUsers.map((user, index) => (
      <tr key={user.user_id} style={{ backgroundColor: (index + 1) % 4 === 2 || (index + 1) % 4 === 0 ? '#f2f2f2' : 'white' }} >
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{indexOfFirstUser + index + 1}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.cin}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.firstname}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.lastname}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.tel}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: (index + 1) % 4 === 2 || (index + 1) % 4 === 0 ? '#f2f2f2' : 'white' }}>
        <MdPlace />
  <span style={{ marginRight: '5px', flex: '1',fontSize:'16px' }}>{user.adresse}</span>

</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
  <button style={{ 
    backgroundColor: '#3498db', // Blue for men
    color: 'white', 
    padding: '8px 15px', 
    borderRadius: '20px', 
    border: 'none', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    fontSize: '15px'
  }}>
    {user.genre === 'men' ? <IoManSharp style={{ color: 'white',padding:'1px' }} /> : <IoWomanOutline  style={{ color: 'white' }} />}
    {user.genre === 'men' ? 'Men   ' : 'Women'}
  </button>
</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
          <FaUserEdit className="edit-button" onClick={() => handleEditUser(user)} style={{ margin:'3px' }} />
          <MdDeleteForever  className="delete-button" onClick={() => handleDeleteUser(user.id)} style={{ margin:'3px' }}/>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      <div className="pagination">
          {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => paginate(i + 1)} style={{ backgroundColor: currentPage === i + 1 ? 'lightblue' : 'white' }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


export default UserManagement;

