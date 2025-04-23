"use client"

import { useState } from "react"
import "./edit-user-modal.css" // Réutilisation du même CSS

const API_URL = "http://localhost:8000"

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  // Ajout d'un état pour les erreurs spécifiques à chaque champ
  const [fieldErrors, setFieldErrors] = useState({
    name: null,
    email: null,
    role: null,
    password: null,
  })

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))

    // Effacer l'erreur du champ lorsqu'il est modifié
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      password: "",
    })
    setError(null)
    setFieldErrors({
      name: null,
      email: null,
      role: null,
      password: null,
    })
  }

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation côté client
    let hasErrors = false
    const newFieldErrors = {
      name: null,
      email: null,
      role: null,
      password: null,
    }

    if (!formData.name.trim()) {
      newFieldErrors.name = "Le nom est requis"
      hasErrors = true
    }

    if (!formData.email.trim()) {
      newFieldErrors.email = "L'email est requis"
      hasErrors = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newFieldErrors.email = "Format d'email invalide"
      hasErrors = true
    }

    if (!formData.role) {
      newFieldErrors.role = "Le rôle est requis"
      hasErrors = true
    }

    if (!formData.password.trim()) {
      newFieldErrors.password = "Le mot de passe est requis"
      hasErrors = true
    } else if (formData.password.length < 6) {
      newFieldErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
      hasErrors = true
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setFieldErrors({
        name: null,
        email: null,
        role: null,
        password: null,
      })

      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      // Récupérer le corps de la réponse, même en cas d'erreur
      const responseData = await response.json()

      if (!response.ok) {
        // Analyser l'erreur renvoyée par l'API
        if (responseData.error) {
          // Erreur générale
          setError(responseData.error || responseData.message || "Erreur lors de l'ajout de l'utilisateur")

          // Erreurs spécifiques aux champs
          if (responseData.field) {
            const fieldName = responseData.field
            setFieldErrors((prev) => ({
              ...prev,
              [fieldName]: responseData.error,
            }))
          }

          // Cas spécifiques courants
          if (responseData.error.includes("email") || responseData.error.toLowerCase().includes("duplicate")) {
            setFieldErrors((prev) => ({
              ...prev,
              email: "Cet email est déjà utilisé par un autre utilisateur",
            }))
          }
        } else {
          setError("Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer.")
        }
        throw new Error(responseData.error || "Erreur lors de l'ajout de l'utilisateur")
      }

      // Informer le composant parent qu'un utilisateur a été ajouté
      onUserAdded()

      // Réinitialiser le formulaire
      resetForm()

      // Fermer le modal
      onClose()
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error)
      // L'erreur générale est déjà définie dans le bloc ci-dessus
    } finally {
      setIsLoading(false)
    }
  }

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
          <h2>Ajouter un utilisateur</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className={`form-group ${fieldErrors.name ? "has-error" : ""}`}>
            <label htmlFor="name">Nom</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={fieldErrors.name ? "input-error" : ""}
              required
            />
            {fieldErrors.name && <div className="field-error-message">{fieldErrors.name}</div>}
          </div>

          <div className={`form-group ${fieldErrors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={fieldErrors.email ? "input-error" : ""}
              required
            />
            {fieldErrors.email && <div className="field-error-message">{fieldErrors.email}</div>}
          </div>

          <div className={`form-group ${fieldErrors.role ? "has-error" : ""}`}>
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={fieldErrors.role ? "input-error" : ""}
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="Admin">Admin</option>
              <option value="Responsable">Responsable</option>
             
            </select>
            {fieldErrors.role && <div className="field-error-message">{fieldErrors.role}</div>}
          </div>

          <div className={`form-group ${fieldErrors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className={fieldErrors.password ? "input-error" : ""}
              required
            />
            {fieldErrors.password && <div className="field-error-message">{fieldErrors.password}</div>}
          </div>
        </form>

        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="submit-button" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? "Ajout en cours..." : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddUserModal
