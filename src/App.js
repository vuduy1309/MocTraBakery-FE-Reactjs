import Profile from './pages/Profile';
import UserManagerPage from './pages/dashboard/UserManagerPage';
import React, { Suspense, lazy } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/products/ProductListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';

import ProductManagerDashboard from './pages/dashboard/ProductManagerDashboard';
import ProductManagerProducts from './pages/manager/ProductManagerProducts';
import ProductAddPage from './pages/manager/ProductAddPage';
import ProductManagerLayout from './layouts/ProductManagerLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProductUpdatePage from './pages/manager/ProductUpdatePage';
import DiscountManagerPage from './pages/manager/DiscountManagerPage';
import OrderHistoryPage from './pages/orders/OrderHistoryPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailPage from './pages/OrderFailPage';
const OrderManagerPage = lazy(() => import('./pages/manager/OrderManagerPage'));

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/cart/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-fail" element={<OrderFailPage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/manager/dashboard*"
          element={<ProductManagerDashboard />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<ProductManagerLayout />}>
          <Route path="dashboard" element={<ProductManagerDashboard />} />
          <Route path="products" element={<ProductManagerProducts />} />
          <Route path="orders" element={<Suspense fallback={<div>Đang tải...</div>}><OrderManagerPage /></Suspense>} />
          <Route path="/manager/add-product" element={<ProductAddPage />} />
          <Route path="/manager/update-product/:id" element={<ProductUpdatePage />} />
          <Route path="/manager/discounts" element={<DiscountManagerPage/>}/>
        <Route path="users" element={<UserManagerPage />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
