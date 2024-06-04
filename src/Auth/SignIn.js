import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '../config';

function SignInForm() {
  const [error, setError] = useState('');

  const [state, setState] = React.useState({
    email: "",
    password: ""
  });

  const handleChange = evt => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value
    });
  };

  const handleOnSubmit = async evt => {
    evt.preventDefault();
  
    const { email, password } = state;
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        email: email,
        password: password,
      });
  
      if (response.status === 200) {
        const token = response.data.access_token;
        localStorage.setItem('authToken', token);
        console.log('Login successful');
        console.log('Token:', token); 
        window.location.href = '/Dashboard';
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    }
  };
  
  return (
    <div style={{ 
      padding: '20px',
      }} 
      className="form-container sign-in-container">
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h1>
      <form
      style ={{
        backgroundImage: 'url("https://i.pinimg.com/564x/d1/f0/b8/d1f0b8f919ced3799afd41ebc4a4bb5d.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        }} >
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
          style={{ backgroundColor: '#AFD8C0', borderRadius: '5px' }} // Changer la couleur d'arrière-plan et d'autres styles
          required={true} 
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
          style={{ backgroundColor: '#AFD8C0', borderRadius: '5px' }}
          required={true} 
        />
        <button type="submit" onClick={handleOnSubmit}>Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
