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
  InputGroup,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api';
import './RegisterForm.css';

function RegisterForm() {
  // State lưu trữ dữ liệu form
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    avatarUrl: '',
  });

  // State lưu lỗi và thông báo
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' hoặc 'danger'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hàm xử lý thay đổi input
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

    if (!form.fullName) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (form.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!form.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!form.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }

    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
    }

    if (form.address && form.address.length > 200) {
      newErrors.address = 'Địa chỉ tối đa 200 ký tự';
    }

    if (
      form.avatarUrl &&
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(form.avatarUrl)
    ) {
      newErrors.avatarUrl = 'URL avatar phải là đường dẫn hình ảnh hợp lệ';
    }

    return newErrors;
  };

  // Hàm submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // Gọi API bằng axios
      const res = await api.post('/users/register', form);
      setMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setMessageType('success');
      setForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        avatarUrl: '',
      });
    } catch (err) {
      setMessageType('danger');
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Đăng ký thất bại. Vui lòng thử lại.');
      }
    }
    setLoading(false);
  };

  return (
    <Container fluid className="register-form-bg p-0 m-0">
      <Row className="justify-content-center w-100 m-0">
        <Col
          xs={12}
          sm={10}
          md={8}
          lg={6}
          xl={5}
          className="d-flex flex-column justify-content-center"
        >
          <Card className="shadow-lg border-0 register-card my-4">
            <Card.Header className="register-card-header text-white text-center py-4">
              <h3 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Đăng ký tài khoản
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

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-user me-2"></i>
                        Họ tên *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên của bạn"
                        isInvalid={!!errors.fullName}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
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
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-lock me-2"></i>
                        Mật khẩu *
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Nhập mật khẩu của bạn"
                          isInvalid={!!errors.password}
                          size="lg"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          size="lg"
                        >
                          <i
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                          ></i>
                        </Button>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.password}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ
                        thường và số
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-phone me-2"></i>
                        Số điện thoại
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại (không bắt buộc)"
                        isInvalid={!!errors.phone}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        Địa chỉ
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ của bạn (không bắt buộc)"
                        isInvalid={!!errors.address}
                        maxLength={200}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.address}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        {form.address.length}/200 ký tự
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <i className="fas fa-image me-2"></i>
                        Avatar URL
                      </Form.Label>
                      <Form.Control
                        type="url"
                        name="avatarUrl"
                        value={form.avatarUrl}
                        onChange={handleChange}
                        placeholder="Nhập đường dẫn hình ảnh avatar (không bắt buộc)"
                        isInvalid={!!errors.avatarUrl}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.avatarUrl}
                      </Form.Control.Feedback>
                      {form.avatarUrl && !errors.avatarUrl && (
                        <div className="mt-2">
                          <img
                            src={form.avatarUrl}
                            alt="Preview"
                            className="rounded-circle"
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid">
                  <Button
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
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Đăng ký
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>

            <Card.Footer className="text-center py-3 bg-light">
              <span className="text-muted">Đã có tài khoản? </span>
              <Link to="/login" className="text-decoration-none fw-semibold">
                Đăng nhập ngay
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterForm;
