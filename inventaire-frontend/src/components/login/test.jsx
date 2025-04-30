import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import "./login.css";
import logoright from "./assets/logoright.svg"; 
import Serviceclient2025 from "./assets/Serviceclient2025.webp"; 
import logo from "./assets/Logo M-AUTOMOTIV INVENTORY.png"; 


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

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      dispatch({
        type: "auth/login/fulfilled",
        payload: response.data,
      });

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
        <img src={logoright} alt="M-AUTOMOTIV" className="header-logo" />
        <img src={Serviceclient2025} alt="Service Client 2025" className="service-logo" />
      </header>

      <main className="login-main">
        <div className="login-box">
          <div className="login-logo">
          <img src={logo} alt="" style={{ width: "200px", height: "auto", marginLeft: "70px" }} />
            
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={errors.email ? "input-error" : ""}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className={errors.password ? "input-error" : ""}
                />
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <div className="help-text">
              <a href="/contacter-admin">Besoin d'aide? Contactez l'administrateur</a>
            </div>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        <div className="social-links">
          <a href="https://web.facebook.com/M.Automotiv" target="_blank" rel="noopener noreferrer" className="social-link facebook"></a>
          <a href="https://www.linkedin.com/company/m-automotiv" target="_blank" rel="noopener noreferrer" className="social-link linkedin"></a>
          <a href="https://www.youtube.com/@mautomotiv" target="_blank" rel="noopener noreferrer" className="social-link youtube"></a>
          <a href="https://www.instagram.com/m.automotiv.maroc" target="_blank" rel="noopener noreferrer" className="social-link instagram"></a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} M.automotive. Tous droits réservés.</p>
        <img src="https://m-automotiv.ma/assets/img/packimg/logoleft.svg" alt="M-AUTOMOTIV" className="footer-logo" />
      </footer>
    </div>
  );
}

export default Login;