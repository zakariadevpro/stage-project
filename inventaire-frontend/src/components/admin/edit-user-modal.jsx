"use client"

import { useState, useEffect } from "react"
import "./edit-user-modal.css"

const API_URL = "http://localhost:8000"

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "", // Champ vide par défaut
  })
  const currentUser = JSON.parse(localStorage.getItem("user")) // ou via ton context d’auth s’il existe
  const isEditingSelf = currentUser?.id === user?.id

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pré-remplir le formulaire quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        password: "", // Toujours vide pour des raisons de sécurité
      })
    }
  }, [user])

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Vérification que l'utilisateur est valide
    if (!user || !user.id) {
      setError("Données utilisateur invalides");
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
  
      // Préparer les données à envoyer
      const dataToSend = {};
  
      // On ajoute uniquement les champs modifiés
      if (formData.name.trim() !== user.name) {
        dataToSend.name = formData.name;
      }
      if (formData.email.trim() !== user.email) {
        dataToSend.email = formData.email;
      }
      if (formData.role.trim() !== user.role && formData.role.trim() !== "") {
        dataToSend.role = formData.role;
      }
      if (formData.password.trim() !== "") {
        dataToSend.password = formData.password;
      }
  
      // Si aucune donnée à envoyer, afficher un message
      if (Object.keys(dataToSend).length === 0) {
        setError("Aucune donnée n'a été modifiée.");
        return;
      }
  
      // Effectuer la requête PUT pour mettre à jour l'utilisateur
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      // Retourner la réponse
      const updatedUser = await response.json();
  
      // Informer le composant parent que l'utilisateur a été mis à jour
      onUserUpdated(updatedUser);
  
      // Fermer le modal
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      setError("Erreur lors de la mise à jour de l'utilisateur. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  

  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        // Fermer le modal si on clique sur l'overlay (en dehors du modal)
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="edit-user-modal">
        <div className="modal-header">
          <h2>Modifier l'utilisateur</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className="form-group">
            <label htmlFor="name">Nom</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

        <div className="form-group">
  <label htmlFor="role">Rôle</label>
  <select
    id="role"
    name="role"
    value={formData.role}
    onChange={handleChange}
    required
    disabled={user && JSON.parse(localStorage.getItem("user"))?.id === user.id}
  >
    <option value="">Sélectionner un rôle</option>
    <option value="Admin">Admin</option>
    <option value="Responsable">Responsable</option>
  </select>
  
  {user && JSON.parse(localStorage.getItem("user"))?.id === user.id && (
    <small className="info-text" style={{ color: "orange", fontSize: "0.9em" }}>
      Vous ne pouvez pas modifier votre propre rôle.
    </small>
  )}
</div>


          <div className="form-group">
            <label htmlFor="password">
              Nouveau mot de passe
              <span className="password-hint">(Laisser vide pour conserver l'ancien)</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nouveau mot de passe"
            />
          </div>
        </form>

        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="submit-button" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? "Modification en cours..." : "Modifier"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditUserModal