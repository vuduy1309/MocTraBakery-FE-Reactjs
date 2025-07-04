import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { BsBoxSeam, BsCartCheck, BsPeople, BsCash } from 'react-icons/bs';

function ProductManagerStats({ stats }) {
  const cardStyle = {
    backgroundColor: '#F5F1EB', // Be nhạt
    border: '1px solid #D4A574', // Viền nâu vàng
    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
    transition: 'transform 0.2s ease'
  };

  const cardHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.15)'
  };

  const titleStyle = {
    color: '#8B4513', // Nâu chocolate
    fontWeight: 'bold',
    fontSize: '1.5rem'
  };

  const textStyle = {
    color: '#6B4423', // Nâu đậm
    fontWeight: '500'
  };

  const iconColors = {
    products: '#8B6914', // Nâu vàng đậm
    orders: '#B8860B', // Vàng nâu  
    customers: '#CD853F', // Peru
    revenue: '#A0522D' // Sienna
  };

  return (
    <Row className="mb-4">
      <Col md={3} xs={6} className="mb-3">
        <Card 
          style={cardStyle} 
          className="text-center"
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <Card.Body>
            <BsBoxSeam size={32} style={{ color: iconColors.products }} className="mb-2" />
            <Card.Title style={titleStyle}>{stats.totalProducts}</Card.Title>
            <Card.Text style={textStyle}>🧁 Sản phẩm</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} xs={6} className="mb-3">
        <Card 
          style={cardStyle} 
          className="text-center"
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <Card.Body>
            <BsCartCheck size={32} style={{ color: iconColors.orders }} className="mb-2" />
            <Card.Title style={titleStyle}>{stats.totalOrders}</Card.Title>
            <Card.Text style={textStyle}>🛒 Đơn hàng</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} xs={6} className="mb-3">
        <Card 
          style={cardStyle} 
          className="text-center"
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <Card.Body>
            <BsPeople size={32} style={{ color: iconColors.customers }} className="mb-2" />
            <Card.Title style={titleStyle}>{stats.totalCustomers}</Card.Title>
            <Card.Text style={textStyle}>👥 Khách hàng</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} xs={6} className="mb-3">
        <Card 
          style={cardStyle} 
          className="text-center"
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <Card.Body>
            <BsCash size={32} style={{ color: iconColors.revenue }} className="mb-2" />
            <Card.Title style={titleStyle}>
              {stats.totalRevenue.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </Card.Title>
            <Card.Text style={textStyle}>💰 Doanh thu</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default ProductManagerStats;