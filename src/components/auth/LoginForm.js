import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import './LoginForm.css';

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' hoặc 'danger'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Validate cơ bản phía client
  const validate = () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!form.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await api.post('/users/login', form);
      // Lưu JWT vào localStorage
      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        window.dispatchEvent(new Event('user-login'));
        setMessage('Đăng nhập thành công!');
        setMessageType('success');

        // Delay để hiển thị thông báo thành công trước khi chuyển trang
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      setMessageType('danger');
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
    setLoading(false);
  };

  // Hàm đăng nhập demo
  const handleDemoLogin = (email) => {
    setForm({ email, password: '123123' });
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <Container fluid className="login-form-bg p-0 m-0" style={{ height: '100%', minWidth: '100vw', display: 'block', paddingTop: 0, paddingBottom: 0 }}>
      <Row className="justify-content-center w-100 m-0" style={{ height: '100%' }}>
        <Col xs={12} sm={8} md={6} lg={4} xl={3} className="d-flex flex-column justify-content-center" style={{ height: '100%' }}>
          <Card className="shadow-lg border-0 login-card my-4">
            <Card.Header className="text-center py-4">
              <h3 className="mb-0">
                <i className="fas fa-sign-in-alt me-2"></i>
                Đăng nhập
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              {message && (
                <Alert
                  variant={messageType}
                  className="mb-4"
                  dismissible
                  onClose={() => setMessage('')}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}
                    ></i>
                    {message}
                  </div>
                </Alert>
              )}

              {/* Demo accounts */}
              <div className="mb-4">
                <div className="fw-semibold mb-2">Tài khoản demo:</div>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleDemoLogin('admin@gmail.com')}
                    disabled={loading}
                  >
                    admin@gmail.com
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleDemoLogin('quanly@gmail.com')}
                    disabled={loading}
                  >
                    quanly@gmail.com
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleDemoLogin('khachhang1@gmail.com')}
                    disabled={loading}
                  >
                    khachhang1@gmail.com
                  </Button>
                </div>
              </div>
              {/* End demo accounts */}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-envelope me-2"></i>
                    Email *
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ email của bạn"
                    isInvalid={!!errors.email}
                    size="lg"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-lock me-2"></i>
                    Mật khẩu *
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu của bạn"
                    isInvalid={!!errors.password}
                    size="lg"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="py-3"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Đăng nhập
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center py-3 bg-light">
              <span className="text-muted">Chưa có tài khoản? </span>
              <Link to="/register" className="text-decoration-none fw-semibold">
                Đăng ký ngay
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;
