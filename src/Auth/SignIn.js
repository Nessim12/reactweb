import React, { useState } from "react";
import axios from "axios";
import "./styles.css";
import { API_BASE_URL } from '../config'
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
  
      // Check if the response status is 200 (OK)
      if (response.status === 200) {
        const token = response.data.access_token;
        localStorage.setItem('authToken', token);
        // Successful login
        console.log('Login successful');
        console.log('Token:', token); 
        window.location.href = '/Dashboard';
      } else {
        // Login failed, handle the error
        setError('Invalid email or password');
      }
    } catch (error) {
      // Handle other errors, such as network issues
      setError('An error occurred. Please try again later.');
    }
  };
  

  return (
    <div className="form-container sign-in-container">
      <form >
        <h1>Sign in</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="social-container">
          <button className="social">
            <i className="fab fa-facebook-f" />
          </button>
          <button className="social">
            <i className="fab fa-google-plus-g" />
          </button>
          <button className="social">
            <i className="fab fa-linkedin-in" />
          </button>
        </div>
        <span>or use your account</span>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
          required={true} 
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
          required={true} 
        />
        <button type="submit" onClick={handleOnSubmit}>Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
