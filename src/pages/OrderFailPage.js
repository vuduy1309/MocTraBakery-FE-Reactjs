import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function OrderFailPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff0f0 0%, #ffe6e6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: 24 }}>
              <FaTimesCircle size={80} color="#e74c3c" className="mb-4" />
              <h2 className="fw-bold mb-3" style={{ color: '#e74c3c' }}>Thanh toán thất bại!</h2>
              <p className="lead mb-4" style={{ color: '#6B4423' }}>
                Rất tiếc, quá trình thanh toán của bạn chưa thành công.<br />
                Vui lòng kiểm tra lại thông tin hoặc thử lại sau.
              </p>
              <Button
                variant="danger"
                size="lg"
                className="px-5 py-2 fw-bold"
                style={{ borderRadius: 12, fontSize: '1.1rem' }}
                onClick={() => navigate('/cart')}
              >
                Quay lại giỏ hàng
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

export default OrderFailPage;
