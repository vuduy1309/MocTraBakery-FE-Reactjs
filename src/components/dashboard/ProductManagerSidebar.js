import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { BsBarChart, BsBoxSeam, BsTag, BsCartCheck, BsPeople } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
}

function ProductManagerSidebar({ activeKey }) {
  const navigate = useNavigate();
  const role = getUserRole();

  const sidebarStyle = {
    position: 'sticky',
    top: '0',
    height: '100vh',
    backgroundColor: '#F5F1EB', // Màu be nhạt
    borderRight: '2px solid #D4A574', // Viền nâu vàng
    boxShadow: '2px 0 8px rgba(139, 69, 19, 0.1)',
    overflowY: 'auto'
  };

  const titleStyle = {
    color: '#8B4513', // Nâu chocolate
    fontWeight: 'bold',
    fontSize: '1.2rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #D4A574'
  };

  const listGroupStyle = {
    '--bs-list-group-bg': 'transparent',
    '--bs-list-group-border-color': 'transparent'
  };

  const itemStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6B4423', // Nâu đậm
    padding: '12px 16px',
    margin: '4px 8px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const activeItemStyle = {
    ...itemStyle,
    backgroundColor: '#D4A574', // Nâu vàng
    color: '#FFFFFF',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(139, 69, 19, 0.2)'
  };

  const hoverStyle = {
    backgroundColor: '#E8DDD4', // Be đậm hơn khi hover
    color: '#8B4513'
  };

  return (
    <div style={sidebarStyle} className="py-4 px-2">
      <h5 style={titleStyle}>🧁 Quản trị Bánh</h5>
      <ListGroup variant="flush" activeKey={activeKey} style={listGroupStyle}>
        <ListGroup.Item 
          action 
          active={activeKey === 'dashboard'} 
          onClick={() => navigate('/manager/dashboard')}
          style={activeKey === 'dashboard' ? activeItemStyle : itemStyle}
          onMouseEnter={(e) => {
            if (activeKey !== 'dashboard') {
              Object.assign(e.target.style, hoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (activeKey !== 'dashboard') {
              Object.assign(e.target.style, itemStyle);
            }
          }}
        >
          <BsBarChart className="me-2" /> Dashboard
        </ListGroup.Item>
        
        <ListGroup.Item 
          action 
          active={activeKey === 'products'} 
          onClick={() => navigate('/manager/products')}
          style={activeKey === 'products' ? activeItemStyle : itemStyle}
          onMouseEnter={(e) => {
            if (activeKey !== 'products') {
              Object.assign(e.target.style, hoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (activeKey !== 'products') {
              Object.assign(e.target.style, itemStyle);
            }
          }}
        >
          <BsBoxSeam className="me-2" /> Sản phẩm
        </ListGroup.Item>
        
        <ListGroup.Item 
          action 
          active={activeKey === 'discounts'} 
          onClick={() => navigate('/manager/discounts')}
          style={activeKey === 'discounts' ? activeItemStyle : itemStyle}
          onMouseEnter={(e) => {
            if (activeKey !== 'discounts') {
              Object.assign(e.target.style, hoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (activeKey !== 'discounts') {
              Object.assign(e.target.style, itemStyle);
            }
          }}
        >
          <BsTag className="me-2" /> Khuyến mãi
        </ListGroup.Item>
        
        <ListGroup.Item 
          action 
          active={activeKey === 'orders'} 
          onClick={() => navigate('/manager/orders')}
          style={activeKey === 'orders' ? activeItemStyle : itemStyle}
          onMouseEnter={(e) => {
            if (activeKey !== 'orders') {
              Object.assign(e.target.style, hoverStyle);
            }
          }}
          onMouseLeave={(e) => {
            if (activeKey !== 'orders') {
              Object.assign(e.target.style, itemStyle);
            }
          }}
        >
          <BsCartCheck className="me-2" /> Đơn hàng
        </ListGroup.Item>
        

        {/* Nếu là admin thì thêm các mục quản lý user, blog */}
        {role === 'Admin' && (
          <>
            <ListGroup.Item
              action
              active={activeKey === 'users'}
              onClick={() => navigate('/manager/users')}
              style={activeKey === 'users' ? activeItemStyle : itemStyle}
              onMouseEnter={(e) => {
                if (activeKey !== 'users') {
                  Object.assign(e.target.style, hoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (activeKey !== 'users') {
                  Object.assign(e.target.style, itemStyle);
                }
              }}
            >
              <BsPeople className="me-2" /> Quản lý người dùng
            </ListGroup.Item>
          </>
        )}
      </ListGroup>
    </div>
  );
}

export default ProductManagerSidebar;