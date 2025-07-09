import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import api from '../../api';


function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Nếu là mua ngay thì cart.items sẽ chỉ có 1 sản phẩm, và có cờ buyNow
  const cart = location.state?.cart;
  // Đặt mặc định là vnpay
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  if (!cart) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Alert variant="danger" className="fs-5 p-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Không tìm thấy giỏ hàng!
        </Alert>
      </div>
    );
  }

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    // Validate các trường bắt buộc
    if (!address.trim() || !phone.trim() || !deliveryTime) {
      setError('Vui lòng nhập đầy đủ địa chỉ, số điện thoại và thời gian nhận hàng!');
      setLoading(false);
      return;
    }
    // Validate số điện thoại (10-11 số, chỉ số, bắt đầu bằng 0)
    const phonePattern = /^0\d{9,10}$/;
    if (!phonePattern.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ!');
      setLoading(false);
      return;
    }
    // Thời gian nhận hàng phải sau thời điểm hiện tại
    const now = new Date();
    const selected = new Date(deliveryTime);
    if (selected <= now) {
      setError('Thời gian nhận hàng phải sau thời điểm hiện tại!');
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Nếu là mua ngay thì item.productId là id, còn cart thường thì là object
      const orderPayload = {
        items: cart.items.map(item => ({
          productId: item.productId._id || item.productId,
          quantity: item.quantity,
          size: item.size,
          name: item.name || item.productId.name,
          price: item.price,
          discountPercent: item.discountPercent || item.productId?.discount?.percent || 0,
          priceAfterDiscount: item.priceAfterDiscount !== undefined
            ? item.priceAfterDiscount
            : (item.discountPercent || item.productId?.discount?.percent
                ? Math.round(item.price * (1 - (item.discountPercent || item.productId?.discount?.percent) / 100))
                : item.price),
        })),
        total: cart.total,
        paymentMethod,
        address,
        phone,
        note,
        deliveryTime,
      };
      // Luôn tạo order trước
      const orderRes = await api.post('/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = orderRes.data;
      if (paymentMethod === 'vnpay') {
        // Sau khi tạo order, lấy link VNPAY
        const vnpayRes = await api.post('/orders/vnpay-url', { orderId: order._id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Chấp nhận cả url hoặc paymentUrl (tùy backend trả về)
        const redirectUrl = vnpayRes.data?.url || vnpayRes.data?.paymentUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        } else {
          setError('Không lấy được link thanh toán VNPAY!');
        }
      } else {

        setMsg('Đặt hàng thành công!');
        setTimeout(() => navigate('/orders'), 1500);
      }
    } catch (err) {
      setError('Không thể tạo đơn hàng!');
    }
    setLoading(false);
  };

  return (
    <div 
      className="checkout-page-bg" 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        paddingTop: 100,
        paddingBottom: 50
      }}
    >
      <div className="container">
        <Row className="justify-content-center">
          <Col lg={8} xl={7}>
            <Card 
              className="checkout-card shadow-lg border-0" 
              style={{ 
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div 
                className="text-center py-4 text-white"
                style={{
                  background: 'linear-gradient(135deg, #6B4F27 0%, #8B6914 100%)',
                }}
              >
                <h2 className="mb-0 fw-bold fs-1">
                  Thanh toán đơn hàng
                </h2>
              </div>

              <div className="p-5">
                {msg && (
                  <Alert variant="success" className="fs-5 p-4 mb-4 border-0 shadow-sm">
                    <i className="fas fa-check-circle me-2"></i>
                    {msg}
                  </Alert>
                )}
                {error && (
                  <Alert variant="danger" className="fs-5 p-4 mb-4 border-0 shadow-sm">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}

                {/* Danh sách sản phẩm */}
                <div className="mb-5">
                  <h4 
                    className="mb-4 fw-bold d-flex align-items-center" 
                    style={{ color: '#6B4F27', fontSize: '1.5rem' }}
                  >
                    <i className="fas fa-list me-3" style={{ color: '#8B6914' }}></i>
                    Sản phẩm trong đơn
                  </h4>
                  
                  <div 
                    className="p-4 rounded-4 border-0"
                    style={{ backgroundColor: '#f8f9fa' }}
                  >
                    {cart.items.map((item, idx) => {
                      const discountPercent = item.discountPercent || item.productId?.discount?.percent || 0;
                      const priceAfterDiscount = item.priceAfterDiscount !== undefined
                        ? item.priceAfterDiscount
                        : (discountPercent ? Math.round(item.price * (1 - discountPercent / 100)) : item.price);
                      
                      return (
                        <div 
                          key={idx} 
                          className="d-flex justify-content-between align-items-center p-3 mb-3 bg-white rounded-3 shadow-sm"
                          style={{ border: '1px solid #e9ecef' }}
                        >
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold text-dark fs-5">
                              {item.productId?.name || 'Sản phẩm đã xóa'}
                            </h6>
                            <div className="d-flex align-items-center">
                              {item.size && (
                                <span 
                                  className="badge me-2 px-3 py-2 fs-6"
                                  style={{ backgroundColor: '#6B4F27', color: 'white' }}
                                >
                                  Size: {item.size}
                                </span>
                              )}
                              <span 
                                className="badge px-3 py-2 fs-6"
                                style={{ backgroundColor: '#17a2b8', color: 'white' }}
                              >
                                Số lượng: {item.quantity}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-end">
                            {discountPercent > 0 ? (
                              <div>
                                <div 
                                  className="text-decoration-line-through fs-6 mb-1"
                                  style={{ color: '#A4907C' }}
                                >
                                  {item.price?.toLocaleString()} đ
                                </div>
                                <div className="fw-bold fs-5" style={{ color: '#4E944F' }}>
                                  {priceAfterDiscount?.toLocaleString()} đ
                                </div>
                                <span 
                                  className="badge px-2 py-1"
                                  style={{ backgroundColor: '#E67E22', color: 'white' }}
                                >
                                  -{discountPercent}%
                                </span>
                              </div>
                            ) : (
                              <div className="fw-bold fs-5" style={{ color: '#4E944F' }}>
                                {item.price?.toLocaleString()} đ
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form thanh toán */}
                <Form onSubmit={handleOrder}>
                  {/* Link lấy tài khoản thử nghiệm VNPAY */}
                  <div className="mb-4">
                    <a
                      href="https://sandbox.vnpayment.vn/apis/vnpay-demo/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fw-bold text-primary text-decoration-underline"
                      style={{ fontSize: '1rem' }}
                    >
                      Lấy tài khoản thử nghiệm VNPAY tại đây
                      <i className="fas fa-external-link-alt ms-2"></i>
                    </a>
                  </div>
                  <div className="mb-4">
                    <Form.Label className="fw-bold fs-5 mb-3" style={{ color: '#6B4F27' }}>
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Địa chỉ nhận hàng <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ nhận hàng"
                      className="form-control-lg border-2 rounded-3"
                      style={{ borderColor: '#6B4F27', fontSize: '1.1rem', padding: '12px 16px' }}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Form.Label className="fw-bold fs-5 mb-3" style={{ color: '#6B4F27' }}>
                      <i className="fas fa-phone-alt me-2"></i>
                      Số điện thoại <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="form-control-lg border-2 rounded-3"
                      style={{ borderColor: '#6B4F27', fontSize: '1.1rem', padding: '12px 16px' }}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Form.Label className="fw-bold fs-5 mb-3" style={{ color: '#6B4F27' }}>
                      <i className="fas fa-calendar-alt me-2"></i>
                      Thời gian nhận hàng <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={deliveryTime}
                      onChange={e => setDeliveryTime(e.target.value)}
                      className="form-control-lg border-2 rounded-3"
                      style={{ borderColor: '#6B4F27', fontSize: '1.1rem', padding: '12px 16px' }}
                      required
                      min={new Date().toISOString().slice(0,16)}
                    />
                  </div>
                  <div className="mb-4">
                    <Form.Label className="fw-bold fs-5 mb-3" style={{ color: '#6B4F27' }}>
                      <i className="fas fa-sticky-note me-2"></i>
                      Ghi chú (tuỳ chọn)
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Ghi chú cho đơn hàng (nếu có)"
                      className="form-control-lg border-2 rounded-3"
                      style={{ borderColor: '#6B4F27', fontSize: '1.1rem', padding: '12px 16px' }}
                    />
                  </div>
                  <div className="mb-4">
                    <Form.Label className="fw-bold fs-5 mb-3" style={{ color: '#6B4F27' }}>
                      <i className="fas fa-credit-card me-2"></i>
                      Phương thức thanh toán
                    </Form.Label>
                    <Form.Select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="form-select-lg border-2 rounded-3"
                      style={{ 
                        borderColor: '#6B4F27',
                        fontSize: '1.1rem',
                        padding: '12px 16px'
                      }}
                    >
                      <option value="cod">💵 Thanh toán khi nhận hàng (COD)</option>
                      <option value="vnpay">💳 VnPay</option>
                      <option value="bank">🏦 Chuyển khoản ngân hàng</option>
                    </Form.Select>
                  </div>

                  {/* Tổng tiền */}
                  <div 
                    className="p-4 mb-4 text-center rounded-4 border-3"
                    style={{ 
                      backgroundColor: '#fff3cd',
                      borderColor: '#ffc107',
                      borderStyle: 'dashed'
                    }}
                  >
                    <div className="fs-6 mb-2" style={{ color: '#6B4F27' }}>
                      Tổng tiền thanh toán
                    </div>
                    <div className="fw-bold display-6" style={{ color: '#dc3545' }}>
                      {cart.total?.toLocaleString()} đ
                    </div>
                  </div>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={loading}
                      className="py-3 fw-bold fs-4 border-0 shadow-lg"
                      style={{
                        background: loading 
                          ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'
                          : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        borderRadius: '15px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-2"></i>
                          Xác nhận đặt hàng
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Back button */}
                <div className="text-center mt-4">
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 fw-bold border-2"
                    style={{ borderRadius: '12px' }}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Quay lại
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CheckoutPage;