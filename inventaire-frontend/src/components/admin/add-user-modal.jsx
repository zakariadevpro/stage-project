"use client"

import { useEffect, useState } from "react"
import "./edit-user-modal.css"

const API_URL = "http://localhost:8000"

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    prenom: "",
    email: "",
    role: "",
    password: "",
    branche: "",
  })

  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${API_URL}/api/branches`)
        if (!res.ok) throw new Error("Erreur lors du chargement des branches")
        const data = await res.json()
        setBranches(data)
      } catch (err) {
        console.error("Erreur fetch branches:", err)
        setError("Impossible de charger les branches")
      }
    }
    fetchBranches()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFieldErrors((prev) => ({ ...prev, [name]: null }))
  }

  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      prenom: "",
      email: "",
      role: "",
      password: "",
      branche: "",
    })
    setError(null)
    setFieldErrors({})
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.username.trim()) errors.username = "Identifiant requis"
    if (!formData.name.trim()) errors.name = "Nom requis"
    if (!formData.prenom.trim()) errors.prenom = "Prénom requis"
    if (!formData.email.trim()) {
      errors.email = "Email requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email invalide"
    }
    if (!formData.role) errors.role = "Rôle requis"
    if (!formData.password.trim()) {
      errors.password = "Mot de passe requis"
    } else if (formData.password.length < 6) {
      errors.password = "Minimum 6 caractères"
    }
    if (!formData.branche) errors.branche = "Branche requise"
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) {
        if (data.error?.includes("email")) {
          setFieldErrors({ email: "Email déjà utilisé" })
        }
        setError(data.error || "Erreur lors de l’ajout.")
        return
      }

      onUserAdded()
      resetForm()
      onClose()
    } catch (err) {
      console.error("Erreur ajout:", err)
      setError("Erreur lors de l’ajout de l’utilisateur.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="edit-user-modal">
        <div className="modal-header">
          <h2>Ajouter un utilisateur</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className={`form-group ${fieldErrors.username ? "has-error" : ""}`}>
            <label htmlFor="username">Identifiant</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {fieldErrors.username && <div className="field-error-message">{fieldErrors.username}</div>}
          </div>

          <div className={`form-group ${fieldErrors.name ? "has-error" : ""}`}>
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {fieldErrors.name && <div className="field-error-message">{fieldErrors.name}</div>}
          </div>

          <div className={`form-group ${fieldErrors.prenom ? "has-error" : ""}`}>
            <label htmlFor="prenom">Prénom</label>
            <input
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
            {fieldErrors.prenom && <div className="field-error-message">{fieldErrors.prenom}</div>}
          </div>

          <div className={`form-group ${fieldErrors.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="Admin">Admin</option>
              <option value="Utilisateur">Utilisateur</option>
            </select>
            {fieldErrors.role && <div className="field-error-message">{fieldErrors.role}</div>}
          </div>

          <div className={`form-group ${fieldErrors.branche ? "has-error" : ""}`}>
            <label htmlFor="branche">Branche</label>
            <select
              id="branche"
              name="branche"
              value={formData.branche}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner une branche</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            {fieldErrors.branche && <div className="field-error-message">{fieldErrors.branche}</div>}
          </div>

          <div className={`form-group ${fieldErrors.password ? "has-error" : ""}`}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password && <div className="field-error-message">{fieldErrors.password}</div>}
          </div>
        </form>

        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="submit-button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Ajout en cours..." : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddUserModal
