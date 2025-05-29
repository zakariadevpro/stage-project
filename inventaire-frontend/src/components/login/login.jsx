import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import "./login.css";
import logoright from "./assets/logoright.svg"; 
import logoleft from "./assets/logoleft.svg"; 
import logo from "./assets/Logo M-AUTOMOTIV INVENTORY.png"; 

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: "", password: "" };

    if (!username) {
      newErrors.username = "Nom d'utilisateur requis";
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
      const response = await axios.post("http://localhost:8000/api/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      dispatch({
        type: "auth/login/fulfilled",
        payload: response.data,
      });

      // 🔍 Vérifie le rôle et redirige
      if (response.data.user.role === "admin") {
        navigate("/admin/Dashboard");
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
    <div className="login-container">
      <header className="login-header">
        <img src={logoleft} alt="M-AUTOMOTIV" className="header-logo" />
        <img src={logoright} alt="Service Client 2025" className="service-logo" />
      </header>

      <main className="login-main">
        <div className="login-box">
          <div className="login-logo">
            <img src={logo} alt="logo" style={{ width: "200px", height: "auto", marginLeft: "10px" }} />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Identifiant"
                  className={errors.username ? "input-error" : ""}
                  autoComplete="username"
                />
              </div>
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>

            <div className="form-group">
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className={errors.password ? "input-error" : ""}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <div className="help-text">
              <a href="/contacter-admin">Besoin d'aide ? Contactez l'administrateur</a>
            </div>
          </form>
        </div>
      </main>

      <footer className="login-footer">

        <p className="copyright">© {new Date().getFullYear()} M.automotive. Tous droits réservés.</p>

      </footer>
    </div>
  );
}

export default Login;
