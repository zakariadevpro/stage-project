import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email requis";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Mot de passe requis";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/login", { email, password });

      // Stocker les informations d'authentification
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Mettre à jour le state Redux
      dispatch({
        type: "auth/login/fulfilled",
        payload: response.data,
      });

      // Afficher un message de succès
      alert("Connexion réussie");

      // Rediriger en fonction du rôle
      if (response.data.user.role === "admin") {
        navigate("/admin/usersManagement");
      } else {
        navigate("/responsable/dashboard");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert(error.response?.data?.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container"> 
      {/* Section gauche (image/logo) */}
      <div className="leftSection">
        <div className="logoContainer">
          <div className="logo">
            <span>M.automotiv</span>
          </div>
        </div>
        <h1>Gestion d'Inventaire PC</h1>
        <p>Centralisez et optimisez la gestion de votre parc informatique avec notre solution complète.</p>
       
      </div>

      {/* Section droite (formulaire) */}
      <div className="rightSection">
        <div className="formContainer">
          <div className="formHeader">
            <h2>Connexion</h2>
            <p>Entrez vos identifiants pour accéder à l'Inventaire</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="formGroup">
              <label htmlFor="email">Email</label>
              <div className="inputContainer">
                <span className="inputIcon">✉️</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className={errors.email ? "inputError" : ""}
                />
              </div>
              {errors.email && <div className="errorMessage">{errors.email}</div>}
            </div>

            <div className="formGroup">
              <label htmlFor="password">Mot de passe</label>
              <div className="inputContainer">
                <span className="inputIcon">🔒</span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={errors.password ? "inputError" : ""}
                />
              </div>
              {errors.password && <div className="errorMessage">{errors.password}</div>}
            </div>

          

            <button type="submit" className="loginButton" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <div className="divider">
              <span>Ou</span>
            </div>

            <div className="forgotPassword">
              <a href="forgot-password.html">Mot de passe oublié?</a>
            </div>
          </form>

          <div className="footer">
            <p>© {new Date().getFullYear()} M.automotive. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;