import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./contacterAdmin.css"; // On réutilise le style de la page de login

import logoright from "./assets/logoright.svg";
import logoleft from "./assets/logoleft.svg";
import Serviceclient2025 from "./assets/Serviceclient2025.webp";
import logo from "./assets/logo11.png";

const ContacterAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "", message: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Nom requis";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email requis";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
      valid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message requis";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:8000/api/password-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      alert(result.message);
      navigate("/login");
    } catch (error) {
      alert("Une erreur est survenue. Veuillez réessayer.");
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" />
        <img src={logoright} alt="Service Client 2025" className="service-logo" />
      </header>

      <main className="login-main">
        <div className="login-box">
          <div className="login-logo">
            <img src={logo} alt="Logo M-AUTOMOTIV" style={{ width: "200px", height: "auto", marginLeft: "10px" }} />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="name"
                  placeholder="Nom"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "input-error" : ""}
                />
              </div>
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <div className="input-container">
                <textarea
                  name="message"
                  placeholder="Exprimer votre besoin"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? "input-error" : ""}
                ></textarea>
              </div>
              {errors.message && <div className="error-message">{errors.message}</div>}
            </div>

            <button type="submit" className="login-button">
              Envoyer la demande
            </button>

            <div className="help-text">
              <a href="/login">← Retour à la connexion</a>
            </div>
          </form>
        </div>
      </main>

      <footer className="login-footer">

        <p className="copyright"style={{color :'white'}}>© {new Date().getFullYear()} M.automotive. Tous droits réservés.</p>

      </footer>
    </div>
  );
};

export default ContacterAdmin;
