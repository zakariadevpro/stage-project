import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Login from './components/login/login';   
import Dashboard from './components/admin/dashboard'; 
import ContacterAdmin from './components/admin/ContacterAdmin';
import DashboardUser from "./components/responsable/DashboardUser";
import ImprimenteInventory from './components/admin/inventaire-imprimente';
import BranchInventory  from "./components/responsable/BranchInventory";
import AdminBranchInventory  from "./components/admin/BranchInventory";
import PcCommandes from "./components/admin/pcCommendes";
import NouveauPcDispo from "./components/admin/nouveauPcDispo";
import BranchInventoryPrinterUser from './components/responsable/BranchInventoryPrinterUser';
import InventaireConsommable from "./components/admin/InventaireConsomable";
import InventaireConsommableUser from './components/responsable/InventaireConsommableUser';
import ConsommablesEnCommande from "./components/admin/ConsommablesEnCommande";










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
            <Route path="/admin/consommables/:branchName" element={<InventaireConsommable />} />

          {/* Placeholder pour les futures routes */}
          <Route path="/responsable/branch/:branchName/printers" element={<BranchInventoryPrinterUser />} />
          <Route 
            path="/admin/Dashboard" 
            element={
              <ProtectedRoute 
                element={<Dashboard/>} 
                requiredRole="admin" 
              />
            } 
          />
          <Route path="/admin/branch/:name" element={<AdminBranchInventory />} />
            <Route path="/admin/consommables-en-commande" element={<ConsommablesEnCommande />} />
         
          <Route path="/admin/nouveaux-pc-commande" element={<PcCommandes/>} />
          <Route 
  path="/admin/nouveaux-pc-dispo" 
  element={
    <ProtectedRoute element={<NouveauPcDispo />} requiredRole="admin" />
  }
/>
          
          
          <Route 
            path="/responsable/dashboard" 
            element={
              <ProtectedRoute 
                element={<DashboardUser/>} 
                
                requiredRole="utilisateur" 
              />
            } 
            
          />
          <Route 
  path="/user/branch/:branchName/consommables" 
  element={<InventaireConsommableUser />} 
/>
          <Route 
           path="/responsable/branch/:name" 
            element={
             <ProtectedRoute 
               element={<BranchInventory />} 
               requiredRole="utilisateur" 
    />
  }
  
/>
<Route
  path="/admin/printer-branch/:name"
  element={
    <ProtectedRoute
      element={<ImprimenteInventory />}
      requiredRole="admin"
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