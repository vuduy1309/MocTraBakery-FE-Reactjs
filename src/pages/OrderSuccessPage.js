import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function OrderSuccessPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f1eb 0%, #ede4d3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: 24 }}>
              <FaCheckCircle size={80} color="#27ae60" className="mb-4" />
              <h2 className="fw-bold mb-3" style={{ color: '#27ae60' }}>Đặt hàng thành công!</h2>
              <p className="lead mb-4" style={{ color: '#6B4423' }}>
                Cảm ơn bạn đã tin tưởng và lựa chọn Mộc Trà Bakery.<br />
                Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất.
              </p>
              <Button
                variant="success"
                size="lg"
                className="px-5 py-2 fw-bold"
                style={{ borderRadius: 12, fontSize: '1.1rem' }}
                onClick={() => navigate('/orders')}
              >
                Xem đơn hàng của tôi
              </Button>
              <div className="mt-3">
                <Button
                  variant="outline-secondary"
                  size="md"
                  className="px-4 mt-2"
                  style={{ borderRadius: 10 }}
                  onClick={() => navigate('/')}
                >
                  Về trang chủ
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default OrderSuccessPage;
