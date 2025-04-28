import React, { useEffect, useState } from "react";
import "./contactRequests.css";

const ContactRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/admin/password-requests/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Erreur lors de la suppression de la demande");

        setRequests(requests.filter((req) => req.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer TOUS les messages ?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/admin/password-requests/delete-all`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Erreur lors de la suppression de toutes les demandes");

        // Vider la liste après suppression
        setRequests([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/admin/password-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Erreur lors du chargement des messages");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Chargement...</p>
    </div>
  );

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="contact-requests-container">
      <h2>Messages des utilisateurs</h2>
      {requests.length > 0 && (
        <button  className="delete-button" onClick={handleDeleteAll}>
          Supprimer tout
        </button>
      )}

      {requests.length === 0 ? (
        <p className="no-results">Aucun message pour le moment.</p>
      ) : (
        <div className="table-container">
          <table className="contact-requests-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.name}</td>
                  <td>{req.email}</td>
                  <td>{req.message}</td>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                  <td>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDelete(req.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactRequests;
