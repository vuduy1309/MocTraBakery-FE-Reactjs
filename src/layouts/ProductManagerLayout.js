import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProductManagerSidebar from '../components/dashboard/ProductManagerSidebar';
import { Outlet, useLocation } from 'react-router-dom';

function getActiveKey(pathname) {
  if (pathname.includes('/manager/products')) return 'products';
  if (pathname.includes('/manager/discounts')) return 'discounts';
  if (pathname.includes('/manager/orders')) return 'orders';
  if (pathname.includes('/manager/customers')) return 'customers';
  return 'dashboard';
}

function ProductManagerLayout() {
  const location = useLocation();
  const activeKey = getActiveKey(location.pathname);
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={2} className="d-none d-md-block bg-light border-end min-vh-100 p-0">
          <ProductManagerSidebar activeKey={activeKey} />
        </Col>
        <Col md={10} xs={12}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
}

export default ProductManagerLayout;
