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
              <h1>Bonjour,Directeur!</h1>
              <p>Entrez vos coordonnées personnelles</p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AuthComponent;