import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

function ProductManagerRecentOrders({ recentOrders }) {
  const cardStyle = {
    backgroundColor: '#F5F1EB', // Be nhạt
    border: '1px solid #D4A574', // Viền nâu vàng
    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)'
  };

  const headerStyle = {
    backgroundColor: '#D4A574', // Nâu vàng
    color: '#FFFFFF',
    fontWeight: '600',
    borderBottom: '1px solid #C49B6B'
  };

  const itemStyle = {
    backgroundColor: 'transparent',
    color: '#6B4423', // Nâu đậm
    borderColor: '#E8DDD4'
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return { backgroundColor: '#8B6914', border: 'none' }; // Nâu vàng đậm
      case 'Đang xử lý':
        return { backgroundColor: '#B8860B', border: 'none' }; // Vàng nâu
      default:
        return { backgroundColor: '#A0522D', border: 'none' }; // Nâu đỏ
    }
  };

  return (
    <Card style={cardStyle}>
      <Card.Header style={headerStyle}>
        📋 Đơn hàng gần đây
      </Card.Header>
      <ListGroup variant="flush">
        {recentOrders && recentOrders.length > 0 ? (
          recentOrders.slice(0, 5).map((order, idx) => (
            <ListGroup.Item key={order.code || idx} style={itemStyle}>
              <strong>{order.code}</strong>{' '}
              <Badge style={getBadgeStyle(order.status)}>
                {order.status}
              </Badge>{' '}
              - <span style={{ color: '#8B4513', fontWeight: '600' }}>
              {order.amount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
              </span>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item style={itemStyle}>Không có dữ liệu</ListGroup.Item>
        )}
      </ListGroup>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
        <a
          href="/manager/orders"
          style={{
            background: '#D4A574',
            color: '#fff',
            padding: '8px 24px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(139, 69, 19, 0.08)',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#b8860b')}
          onMouseOut={e => (e.currentTarget.style.background = '#D4A574')}
        >
          Xem thêm
        </a>
      </div>
    </Card>
  );
}

export default ProductManagerRecentOrders;