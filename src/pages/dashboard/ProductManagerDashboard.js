import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import ProductManagerSidebar from '../../components/dashboard/ProductManagerSidebar';
import ProductManagerStats from '../../components/dashboard/ProductManagerStats';
import ProductManagerBestSellers from '../../components/dashboard/ProductManagerBestSellers';
import ProductManagerRecentOrders from '../../components/dashboard/ProductManagerRecentOrders';

import api from '../../api';

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.fullName || payload.email || 'User',
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function ProductManagerDashboard() {
  const [stats, setStats] = React.useState(null);
  const [recentOrders, setRecentOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = getUserFromToken();
    if (!user || (user.role !== 'ProductManager' && user.role !== 'Admin')) {
      navigate('/login');
      return;
    }
    setLoading(true);
    Promise.all([
      api.get('/products/dashboard-stats'),
      api.get('/orders/recent', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }),
    ])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Không thể tải dữ liệu dashboard');
        setLoading(false);
      });
  }, [navigate]);

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Sidebar */}
        <Col md={2} className="d-none d-md-block bg-light border-end min-vh-100 p-0">
          <ProductManagerSidebar activeKey="dashboard" />
        </Col>

        {/* Main content */}
        <Col md={10} xs={12}>
          <h3 className="mb-4">Dashboard Product Manager</h3>
          {loading ? (
            <div className="text-center py-5">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-danger py-5">{error}</div>
          ) : (
            stats && (
              <>
                <ProductManagerStats stats={stats} />
                <ProductManagerBestSellers bestSellers={stats.bestSellers} />
                <ProductManagerRecentOrders recentOrders={recentOrders} />
              </>
            )
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ProductManagerDashboard;
