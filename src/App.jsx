import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import RequireAuth from './components/RequireAuth';
import NavBar from './components/NavBar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import FreeRequest from './pages/FreeRequest';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

function Layout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/catalogue" element={<Catalog />} />
              <Route path="/produit/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/commande" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/confirmation" element={<RequireAuth><OrderSuccess /></RequireAuth>} />
              <Route path="/demande-libre" element={<RequireAuth><FreeRequest /></RequireAuth>} />
              <Route path="/commandes" element={<RequireAuth><Orders /></RequireAuth>} />
              <Route path="/commandes/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
