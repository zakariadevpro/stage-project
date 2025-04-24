import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Login from './components/login/login';   
import Dashboard from './components/admin/dashboard'; 
import ContacterAdmin from './components/admin/ContacterAdmin';

// Composant pour les routes protégées (à utiliser plus tard)
const ProtectedRoute = ({ element, requiredRole }) => {
  let user = null;
  try {
    const userData = localStorage.getItem("user");
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error);
  }
  const isAuthenticated = !!localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return element;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/contacter-admin" element={<ContacterAdmin />} />

          {/* Placeholder pour les futures routes */}
          <Route 
            path="/admin/Dashboard" 
            element={
              <ProtectedRoute 
                element={<Dashboard/>} 
                requiredRole="admin" 
              />
            } 
          />
          <Route 
            path="/responsable/dashboard" 
            element={
              <ProtectedRoute 
                element={<div>Tableau de bord Responsable</div>} 
                requiredRole="responsable" 
              />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;