import { useState, useEffect } from "react"
import "./edit-user-modal.css"

const API_URL = "http://localhost:8000"

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    prenom: "",
    email: "",
    role: "",
    password: "", // Champ vide par défaut
    branche: "", // Branche sélectionnée
  })

  const [branches, setBranches] = useState([]) // État pour stocker les branches
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Récupérer la liste des branches depuis l'API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_URL}/api/branches`)
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        const data = await response.json()
        
        setBranches(data) // Stocke la liste des branches dans l'état
      } catch (err) {
        console.error("Erreur lors de la récupération des branches:", err)
        setError("Impossible de récupérer la liste des branches.")
      }
    }

    fetchBranches()
  }, [])

  // Pré-remplir le formulaire lorsque l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        prenom: user.prenom || "",
        email: user.email || "",
        role: user.role || "",
        password: "", // Toujours vide pour des raisons de sécurité
        branche: user.branche || "", // Remplir le champ de branche
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
    e.preventDefault()

    // Vérification que l'utilisateur est valide
    if (!user || !user.id) {
      setError("Données utilisateur invalides")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Préparer les données à envoyer
      const dataToSend = {}

      // Ajouter uniquement les champs modifiés
      if (formData.username.trim() !== user.username) {
        dataToSend.username = formData.username
      }
      if (formData.name.trim() !== user.name) {
        dataToSend.name = formData.name
      }
      if (formData.prenom.trim() !== user.prenom) {
        dataToSend.prenom = formData.prenom
      }
      if (formData.email.trim() !== user.email) {
        dataToSend.email = formData.email
      }
      if (formData.role.trim() !== user.role && formData.role.trim() !== "") {
        dataToSend.role = formData.role
      }
      if (formData.password.trim() !== "") {
        dataToSend.password = formData.password
      }
      if (formData.branche.trim() !== user.branche) {
        dataToSend.branche = formData.branche
      }

      // Si aucune donnée n'a été modifiée, afficher un message
      if (Object.keys(dataToSend).length === 0) {
        setError("Aucune donnée n'a été modifiée.")
        return
      }

      // Effectuer la requête PUT pour mettre à jour l'utilisateur
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      // Retourner la réponse
      const updatedUser = await response.json()

      // Informer le composant parent que l'utilisateur a été mis à jour
      onUserUpdated(updatedUser)

      // Fermer le modal
      onClose()
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", err)
      setError("Erreur lors de la mise à jour de l'utilisateur. Veuillez réessayer.")
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
              <label htmlFor="name">Identifiant</label>
              <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Nom</label>
              <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
              />
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
              />
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
                <option value="Utilisateur">Utilisateur</option>
              </select>

              {user && JSON.parse(localStorage.getItem("user"))?.id === user.id && (
                  <small className="info-text" style={{ color: "orange", fontSize: "0.9em" }}>
                    Vous ne pouvez pas modifier votre propre rôle.
                  </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="branche">Branche</label>
              <select
                  id="branche"
                  name="branche"
                  value={formData.branche}
                  onChange={handleChange}
                  required
              >
                <option value="">Sélectionner une branche</option>
                {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                ))}
              </select>
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
