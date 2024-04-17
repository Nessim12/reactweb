import React, { useState } from "react";

import "./styles.css";
import SignInForm from "./SignIn";

const AuthComponent = () => {
  const [type, setType] = useState("signIn");

  const handleOnClick = (text) => {
    if (text !== type) {
      setType(text);
    }
  };

  const containerClass = "container " + (type === "signUp" ? "right-panel-active" : "");

  return (
    <div className="Auth">
      <h2>Sign in </h2>
      <div className={containerClass} id="container">
        <SignInForm />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" id="signIn" onClick={() => handleOnClick("signIn")}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Admin!</h1>
              <p>Enter your personal details and start journey with us</p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AuthComponent;