import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Consistent brown/beige color palette for bakery theme
const BAKERY_COLORS = ['#D4A574', '#8B6914', '#A0522D', '#CD853F', '#B8860B'];

// Enhanced AdminDashboardCharts component with consistent theming
function AdminDashboardCharts({ stats, recentOrders }) {
  // State để lưu dữ liệu thật
  const [actualStats, setActualStats] = useState(stats || null);
  const [loading, setLoading] = useState(!stats);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stats) {
      setLoading(true);
      fetch('/api/admin/stats')
        .then((res) => {
          if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu thống kê');
          return res.json();
        })
        .then((data) => {
          setActualStats(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [stats]);

  // Pie chart data for product/order/customer
  const summaryData = actualStats ? [
    { name: 'Sản phẩm', value: actualStats.totalProducts },
    { name: 'Đơn hàng', value: actualStats.totalOrders },
    { name: 'Khách hàng', value: actualStats.totalCustomers },
  ] : [];

  // Bar chart for best sellers
  const bestSellersData = actualStats && actualStats.bestSellers ? (actualStats.bestSellers || []).map((item) => ({
    name: item.name,
    stock: item.stock,
  })) : [];

  // Revenue data (simulated for 7 recent days)
  // Nếu backend trả về revenueByDay thì dùng, không thì fallback như cũ
  const revenueData = actualStats && actualStats.revenueByDay
    ? actualStats.revenueByDay // [{ date: 'T2', revenue: ... }, ...]
    : actualStats
      ? [
          { date: 'T2', revenue: actualStats.totalRevenue * 0.12 },
          { date: 'T3', revenue: actualStats.totalRevenue * 0.15 },
          { date: 'T4', revenue: actualStats.totalRevenue * 0.18 },
          { date: 'T5', revenue: actualStats.totalRevenue * 0.13 },
          { date: 'T6', revenue: actualStats.totalRevenue * 0.16 },
          { date: 'T7', revenue: actualStats.totalRevenue * 0.11 },
          { date: 'CN', revenue: actualStats.totalRevenue * 0.15 },
        ]
      : [];

  // Consistent card styling
  const cardStyle = {
    backgroundColor: '#F5F1EB',
    border: '1px solid #D4A574',
    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const cardHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.15)'
  };

  const headerStyle = {
    backgroundColor: '#D4A574',
    color: '#FFFFFF',
    fontWeight: '600',
    borderBottom: '1px solid #C49B6B'
  };

  // Custom tooltip for better formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#F5F1EB',
          padding: '12px',
          border: '1px solid #D4A574',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
          color: '#6B4423'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#8B4513' }}>{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              color: entry.color, 
              fontSize: '14px',
              margin: '2px 0'
            }}>
              {`${entry.dataKey === 'revenue' ? 'Doanh thu' : entry.dataKey === 'stock' ? 'Tồn kho' : entry.name}: ${
                entry.dataKey === 'revenue' 
                  ? entry.value.toLocaleString('vi-VN') + '₫'
                  : entry.value.toLocaleString('vi-VN')
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
        <Spinner animation="border" variant="warning" />
        <span className="ms-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">{error}</Alert>
    );
  }

  return (
    <Row className="mb-4">
      <Col lg={4} md={6} className="mb-4">
        <Card 
          style={cardStyle}
          className="h-100"
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { ...cardStyle, ...cardHoverStyle })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <Card.Header style={headerStyle}>
            <h5 className="mb-0 d-flex align-items-center">
              🥧 Phân bổ tổng quan
            </h5>
          </Card.Header>
          <Card.Body style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 0.375rem 0.375rem' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={summaryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={12}
                >
                  {summaryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={BAKERY_COLORS[idx % BAKERY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4} md={6} className="mb-4">
        <Card 
          style={cardStyle}
          className="h-100"
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { ...cardStyle, ...cardHoverStyle })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <Card.Header style={headerStyle}>
            <h5 className="mb-0 d-flex align-items-center">
              📦 Sản phẩm tồn kho
            </h5>
          </Card.Header>
          <Card.Body style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 0.375rem 0.375rem' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bestSellersData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                  fill="#6B4423"
                />
                <YAxis fontSize={11} fill="#6B4423" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="stock" 
                  fill="#D4A574" 
                  radius={[4, 4, 0, 0]}
                  name="Tồn kho"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4} md={12} className="mb-4">
        <Card 
          style={cardStyle}
          className="h-100"
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { ...cardStyle, ...cardHoverStyle })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <Card.Header style={headerStyle}>
            <h5 className="mb-0 d-flex align-items-center">
              📈 Doanh thu tuần này
            </h5>
          </Card.Header>
          <Card.Body style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 0.375rem 0.375rem' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" />
                <XAxis dataKey="date" fontSize={11} fill="#6B4423" />
                <YAxis fontSize={11} fill="#6B4423" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="#8B6914" 
                  radius={[4, 4, 0, 0]}
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default AdminDashboardCharts;