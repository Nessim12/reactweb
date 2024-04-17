import React, { useState } from 'react';
import axios from 'axios';
import "./user.css";
import Fetchuser from './Fetchuser';
import { API_BASE_URL } from '../config'
const CreateUser = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
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

    // Get the authentication token from local storage
    const authToken = localStorage.getItem('authToken');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/adduser`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}` // Include the token in the request headers
          }
        }
      );
      setSuccessMessage(response.data.message);
      // Clear form fields after successful submission
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
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
      {showForm ? ( // Render the form only if showForm is true
        <form class="form" onSubmit={handleSubmit}>
           <p class="title">Register </p>
          <input class="input" type="text" name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} required />
          <input class="input" type="text" name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} required />
          <input class="input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <select class="wrapper" name="genre" value={formData.genre} onChange={handleChange} required>
            <option class="option" value="">Select Genre</option>
            <option value="women">femme</option>
            <option value="men">homme</option>
            

          </select>
          <button class="submit" type="submit">Ajouter</button>
          <button class="buttonc" type="button" onClick={handleCloseForm}> <span class="X"></span>
  <span class="Y"></span>
  <div class="close">Close</div></button> {/* Button to close the form */}
        </form>
      ) : (
<button title="Add" class="cssbuttons-io-button"onClick={handleToggleForm}>
  <svg height="25" width="25" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="currentColor"></path></svg>
  <span>Ajouter employee</span>
</button>     )}

<Fetchuser />

    </div>
    
  );
};

export default CreateUser;
