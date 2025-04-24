// src/components/ContacterAdmin.jsx
import React, { useState } from "react";
import "./contacterAdmin.css";

const ContacterAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/password-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      alert(result.message);
      window.location.href = "/login"; // Redirection après succès
    } catch (error) {
      alert("Une erreur est survenue. Veuillez réessayer.");
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="form-container">
      <h1>Contacter l'admin</h1>
      <p>Remplissez ce formulaire pour envoyer un message à l'administrateur.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nom</label>
        <input type="text" id="name" name="name" required onChange={handleChange} value={formData.name} />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required onChange={handleChange} value={formData.email} />

        <label htmlFor="message">Exprimer votre besoin</label>
        <textarea id="message" name="message" rows="4" required onChange={handleChange} value={formData.message}></textarea>

        <button className="envoyer" type="submit">Envoyer la demande</button>
        <a href="/login" className="back-link">← Retour à la connexion</a>
      </form>
    </div>
  );
};

export default ContacterAdmin;
