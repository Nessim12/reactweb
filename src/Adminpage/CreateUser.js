import React, { useState } from 'react';
import axios from 'axios';
import "./user.css";
import Fetchuser from './Fetchuser';
import { API_BASE_URL } from '../config'

const CreateUser = () => {
  const [formData, setFormData] = useState({
    cin: '',
    firstname: '',
    lastname: '',
    email: '',
    tel: '',
    adresse: '',
    genre: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false); // State variable to track form visibility

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const authToken = localStorage.getItem('authToken');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/adduser`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      setSuccessMessage(response.data.message);
      // Clear form fields after successful submission
      setFormData({
        cin: '',
        firstname: '',
        lastname: '',
        email: '',
        tel: '',
        adresse: '',
        genre: ''
      });
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      window.location.reload();

    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleToggleForm = () => {
    setShowForm(prevState => !prevState); // Toggle the showForm state
  };

  const handleCloseForm = () => {
    setShowForm(false); // Set showForm to false to hide the form
  };

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {successMessage && <p>{successMessage}</p>}

      {showForm ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="cin"
            placeholder="CIN"
            value={formData.cin}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="tel"
            placeholder="Telephone"
            value={formData.tel}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="adresse"
            placeholder="Address"
            value={formData.adresse}
            onChange={handleChange}
            required
          />
          <select
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
          >
            <option value="">Select Genre</option>
            <option value="women">Femme</option>
            <option value="men">Homme</option>
          </select>

          <button type="submit">Add User</button>
        </form>
      ) : (
        <button className="cssbuttons-io-button" onClick={handleToggleForm}>
          <svg height="25" width="25" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="currentColor"></path>
          </svg>
          <span>Ajouter employee</span>
        </button>
      )}

      {/* Display Fetchuser component after the form */}
      <Fetchuser />
    </div>
  );
};

export default CreateUser;
