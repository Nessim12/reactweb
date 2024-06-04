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
import { Doughnut} from 'react-chartjs-2';
import { FaEye } from 'react-icons/fa';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
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
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedUser, setSelectedUser] = useState(null);
  const [monthlyWorkTimes, setMonthlyWorkTimes] = useState(null);
  const [chartData, setChartData] = useState({
    labels: ['Men', 'Women'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#3498db', '#e74c3c']
      }
    ]
  });

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
    const menCount = users.filter(user => user.genre === 'men').length;
    const womenCount = users.filter(user => user.genre === 'women').length;

    setChartData({
      labels: ['Men', 'Women'],
      datasets: [
        {
          data: [menCount, womenCount],
          backgroundColor: ['#3498db', '#e74c3c']
        }
      ]
    });
  }, [users, searchTerm]);

  const fetchMonthlyWorkTimes = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(`${API_BASE_URL}/api/admin/getUserDailyWorkTime/${selectedUser.id}`, {
        month,
        year
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setMonthlyWorkTimes(response.data);
    } catch (error) {
      console.error('Error fetching monthly work times:', error.message);
    }
  };


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
          text: "L'utilisateur a été supprimé avec succès !"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Échec de la suppression de l'utilisateur. Veuillez réessayer."
      });
    }
  };
  const validationSchema = Yup.object().shape({
    cin: Yup.string()
      .length(8, 'Le CIN doit comporter exactement 8 caractères')
      .required('Le CIN est obligatoire'),
    firstname: Yup.string().required('Le prénom est obligatoire'),
    lastname: Yup.string().required('Le nom est obligatoire'),
    email: Yup.string().email('Adresse email invalide').required('L\'email est obligatoire'),
    tel: Yup.string()
      .matches(/^[0-9]+$/, 'Le numéro de téléphone doit contenir uniquement des chiffres')
      .required('Le numéro de téléphone est obligatoire'),
    adresse: Yup.string().required('L\'adresse est obligatoire'),
    genre: Yup.string().required('Le genre est obligatoire')
  });
  
  

  const handleAddUser = async (values) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
  
      const response = await axios.post(`${API_BASE_URL}/api/admin/adduser`, values, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      const { user } = response.data;
      setUsers([...users, user]);
  
      Swal.fire({
        icon: 'success',
        title: 'User Added',
        text: "Le nouvel utilisateur a été ajouté avec succès !"
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
        text: "Échec de l'ajout du nouvel utilisateur. Veuillez réessayer."
      });
    }
  };
  
  const handleUpdateUser = async (values) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
  
      const response = await axios.put(`${API_BASE_URL}/api/admin/updateuser/${editingUser.id}`, values, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
  
      const updatedUser = response.data.user;
      const updatedUsers = users.map(user => (user.id === updatedUser.id ? updatedUser : user));
      setUsers(updatedUsers);
  
      Swal.fire({
        icon: 'success',
        title: 'User Modifier',
        text: "Les informations de l'utilisateur ont été mises à jour avec succès !"
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
        text: 'Failed to Modifier user. Please try again.'
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
  const handleShowDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setMonthlyWorkTimes(null); // Reset monthly work times when modal opens
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
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
       <div className="statique">
        <div className="chartContainer">

          <Doughnut data={chartData}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  fontSize: 10,
                  usePointStyle: true,}}}}}
          />

          </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px',marginTop:'200px' }}>
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
    <Modal.Title>{editingUser ? 'Modifier Employée' : 'Ajouter Employée'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        editingUser ? handleUpdateUser(values) : handleAddUser(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <FormikForm>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Group controlId="cin">
                <Form.Label>CIN</Form.Label>
                <Field type="text" name="cin" className="form-control" placeholder="Enter CIN" />
                <ErrorMessage name="cin" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Field type="email" name="email" className="form-control" placeholder="Enter Email" />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </Form.Group>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Group controlId="lastname">
                <Form.Label>Prenom</Form.Label>
                <Field type="text" name="lastname" className="form-control" placeholder="Enter Prenom" />
                <ErrorMessage name="lastname" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="firstname">
                <Form.Label>Nom</Form.Label>
                <Field type="text" name="firstname" className="form-control" placeholder="Enter Nom" />
                <ErrorMessage name="firstname" component="div" className="text-danger" />
              </Form.Group>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Group controlId="tel">
                <Form.Label>Phone Number</Form.Label>
                <Field type="text" name="tel" className="form-control" placeholder="Enter Phone Number" />
                <ErrorMessage name="tel" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="adresse">
                <Form.Label>Address</Form.Label>
                <Field type="text" name="adresse" className="form-control" placeholder="Enter Address" />
                <ErrorMessage name="adresse" component="div" className="text-danger" />
              </Form.Group>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Group controlId="genre">
                <Form.Label>Genre</Form.Label>
                <Field as="select" name="genre" className="form-control">
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </Field>
                <ErrorMessage name="genre" component="div" className="text-danger" />
              </Form.Group>
            </div>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>Close</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {editingUser ? 'Modifier User' : 'Ajouter'}
              </Button>
            </Modal.Footer>
          </div>
        </FormikForm>
      )}
    </Formik>
  </Modal.Body>
</Modal>


<Modal show={showDetailsModal} onHide={handleDetailsModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Détails du Travail</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div className="form-row">
            <Form.Group controlId="formMonth" className="form-group-inline">
              <Form.Label>Mois</Form.Label>
              <Form.Control
                as="select"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="styled-select"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formYear" className="form-group-inline">
              <Form.Label>Année</Form.Label>
              <Form.Control
                as="select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="styled-select"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={2020 + i}>
                    {2020 + i}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
          <Button variant="primary" onClick={fetchMonthlyWorkTimes} className="styled-button">
            Afficher les Détails
          </Button>
        </Form>
        {monthlyWorkTimes ? (
          <div className="result-container">
            <p className="present-days">Jours Présents: {monthlyWorkTimes.monthly_work_times[0].present_days}</p>
            <p className="absent-days">Jours Absents: {monthlyWorkTimes.monthly_work_times[0].absent_days}</p>
            <p>Temps de Travail: {monthlyWorkTimes.monthly_work_times[0].total_work_time}</p>
          </div>
        ) : (
          <p className="placeholder-text">Sélectionnez un mois et une année pour voir les détails.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleDetailsModalClose}>
          Fermer
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
      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', color: 'black' }}>Genre</th>
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
        <FaEye onClick={() => handleShowDetailsModal(user)} style={{ cursor: 'pointer', marginRight: '10px' }} />
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

