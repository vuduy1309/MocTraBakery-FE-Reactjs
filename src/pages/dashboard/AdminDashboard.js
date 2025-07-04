// AdminDashboard.js - Main Dashboard Component
import React from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ProductManagerSidebar from '../../components/dashboard/ProductManagerSidebar';
import ProductManagerStats from '../../components/dashboard/ProductManagerStats';
import ProductManagerBestSellers from '../../components/dashboard/ProductManagerBestSellers';
import ProductManagerRecentOrders from '../../components/dashboard/ProductManagerRecentOrders';
import AdminDashboardCharts from '../../components/dashboard/AdminDashboardCharts';
import api from '../../api';

import { useNavigate } from 'react-router-dom';

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

function AdminDashboard() {
  const [stats, setStats] = React.useState(null);
  const [recentOrders, setRecentOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    // Kiểm tra quyền admin
    const user = getUserFromToken();
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/products/dashboard-stats'),
          api.get('/orders/recent', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Loading component
  const LoadingComponent = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5 className="text-muted">Đang tải dữ liệu dashboard...</h5>
      </div>
    </div>
  );

  // Error component with retry functionality
  const ErrorComponent = ({ error, onRetry }) => (
    <Alert variant="danger" className="text-center">
      <Alert.Heading>
        <i className="fas fa-exclamation-triangle me-2"></i>
        Oops! Có lỗi xảy ra
      </Alert.Heading>
      <p>{error}</p>
      <hr />
      <div className="d-flex justify-content-center">
        <button 
          className="btn btn-outline-danger"
          onClick={onRetry}
        >
          <i className="fas fa-redo me-2"></i>
          Thử lại
        </button>
      </div>
    </Alert>
  );

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch by updating a dependency or calling the effect again
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <Container fluid className="bg-light min-vh-100">
      <Row className="g-0">
        {/* Enhanced Sidebar */}
        <Col lg={2} md={3} className="d-none d-md-block">
          <div className="bg-white shadow-sm border-end position-sticky top-0" style={{ height: '100vh', overflow: 'auto' }}>
            <ProductManagerSidebar activeKey="dashboard" />
          </div>
        </Col>

        {/* Enhanced Main Content */}
        <Col lg={10} md={9} xs={12}>
          <div className="p-4">
            {/* Header Section */}
            <div className="mb-4 bg-white rounded-3 shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h3 mb-1 text-dark fw-bold">
                    <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                    Dashboard Admin
                  </h2>
                  <p className="text-muted mb-0">Tổng quan hoạt động kinh doanh</p>
                </div>
                <div className="text-end">
                  <small className="text-muted">
                    <i className="fas fa-clock me-1"></i>
                    Cập nhật: {new Date().toLocaleString('vi-VN')}
                  </small>
                </div>
              </div>
            </div>

            {/* Content Section */}
            {loading ? (
              <LoadingComponent />
            ) : error ? (
              <ErrorComponent error={error} onRetry={handleRetry} />
            ) : stats ? (
              <div className="dashboard-content">
                {/* Charts Section */}
                <AdminDashboardCharts stats={stats} recentOrders={recentOrders} />
                
                {/* Stats Section */}
                <div className="mb-4">
                  <ProductManagerStats stats={stats} />
                </div>
                
                {/* Best Sellers and Recent Orders */}
                <Row>
                  <Col lg={6} className="mb-4">
                    <ProductManagerBestSellers bestSellers={stats.bestSellers} />
                  </Col>
                  <Col lg={6} className="mb-4">
                    <ProductManagerRecentOrders recentOrders={recentOrders} />
                  </Col>
                </Row>
              </div>
            ) : (
              <Alert variant="warning" className="text-center">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Không có dữ liệu để hiển thị
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* Custom Styles */}
      <style jsx>{`
        .dashboard-content {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </Container>
  );
}

export default AdminDashboard;
