import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';


function OrderDetailPage() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
      } catch (err) {
        setError('Không thể tải chi tiết đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    // Lấy role user từ localStorage (giả sử đã lưu khi login)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || '');
      } catch {
        setUserRole('');
      }
    } else {
      setUserRole('');
    }
  }, [orderId]);

  return (
    <div className="order-detail-container">
      <style>{`
        .order-detail-container {
          width: 100vw;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #fbeee6 0%, #e7d7c1 100%);
        }
        .order-detail-header {
          background: linear-gradient(135deg, #e7d7c1 0%, #bfae9e 100%);
          color: #5c4326;
          padding: 28px 24px 18px 24px;
          border-radius: 0 0 15px 15px;
          margin-bottom: 30px;
          box-shadow: 0 6px 24px rgba(191, 174, 158, 0.10);
        }
        .order-detail-title {
          font-size: 2.1rem;
          margin: 0;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(191, 174, 158, 0.13);
        }
        .order-detail-card {
          background: #fffaf3;
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(191, 174, 158, 0.10);
          max-width: 700px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .order-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .order-detail-label {
          color: #a58b6f;
          font-weight: 500;
          min-width: 120px;
        }
        .order-detail-value {
          color: #5c4326;
          font-weight: 600;
        }
        .order-detail-products {
          margin-top: 24px;
        }
        .order-detail-products th, .order-detail-products td {
          padding: 8px 10px;
        }
        .order-detail-products th {
          background: #fbeee6;
          color: #5c4326;
        }
        .order-detail-products td {
          background: #fffaf3;
        }
        .order-detail-back {
          margin-top: 32px;
          display: flex;
          justify-content: flex-end;
        }
        .order-detail-back-btn {
          background: linear-gradient(135deg, #e7d7c1 0%, #bfae9e 100%);
          color: #5c4326;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.95rem;
        }
        .order-detail-back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(191, 174, 158, 0.18);
        }
      `}</style>
      <div className="order-detail-header">
        <h2 className="order-detail-title mb-2">Chi tiết đơn hàng</h2>
      </div>
      {loading && <div>Đang tải...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && order && (
        <div className="order-detail-card">
          <div className="order-detail-row">
            <span className="order-detail-label">Mã đơn:</span>
            <span className="order-detail-value">#{order._id.slice(-6).toUpperCase()}</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">Ngày đặt:</span>
            <span className="order-detail-value">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">Trạng thái:</span>
            <span className={`order-status ${order.status}`}>{order.status === 'pending' ? 'Chờ xử lý' : order.status === 'paid' ? 'Đã thanh toán' : order.status}</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">Tổng tiền:</span>
            <span className="order-detail-value">{order.total?.toLocaleString() || '0'}₫</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">Phương thức:</span>
            <span className="order-detail-value">{order.paymentMethod || 'Chưa chọn'}</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">SĐT:</span>
            <span className="order-detail-value">{order.phone || '-'}</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">Địa chỉ:</span>
            <span className="order-detail-value">{order.address || '-'}</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">Ghi chú:</span>
            <span className="order-detail-value">{order.note || '-'}</span>
          </div>
          <div className="order-detail-row">
            <span className="order-detail-label">Thời gian nhận:</span>
            <span className="order-detail-value">{order.deliveryTime ? new Date(order.deliveryTime).toLocaleString('vi-VN') : '-'}</span>
          </div>
          <div className="order-detail-products">
            <h5 className="mb-2">Sản phẩm</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Size</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Giá sau giảm</th>
                  <th>Giảm (%)</th>
                  {order.status === 'paid' && userRole !== 'Admin' && userRole !== 'ProductManager' && <th>Feedback</th>}
                </tr>
              </thead>
              <tbody>
                {(order.products || order.items)?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.size || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price?.toLocaleString() || 0}₫</td>
                    <td>{item.priceAfterDiscount ? item.priceAfterDiscount.toLocaleString() + '₫' : '-'}</td>
                    <td>{item.discountPercent ? item.discountPercent + '%' : '-'}</td>
                    {order.status === 'paid' && userRole !== 'Admin' && userRole !== 'ProductManager' && (
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => {
                            setFeedbackProduct(item);
                            setFeedbackData({ rating: 5, comment: '' });
                            setFeedbackError('');
                            setFeedbackSuccess('');
                            setShowFeedback(true);
                          }}
                        >
                          Đánh giá
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="order-detail-back">
            <button className="order-detail-back-btn" onClick={() => navigate(-1)}>
              Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Modal feedback sản phẩm */}
      <Modal show={showFeedback} onHide={() => setShowFeedback(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đánh giá sản phẩm</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            setFeedbackLoading(true);
            setFeedbackError('');
            setFeedbackSuccess('');
            try {
              const token = localStorage.getItem('token');
              const res = await fetch('http://localhost:3000/comments', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({
                  productId: feedbackProduct?.productId || feedbackProduct?._id,
                  rating: feedbackData.rating,
                  content: feedbackData.comment,
                }),
              });
              if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
              }
              setFeedbackSuccess('Gửi đánh giá thành công!');
              setShowFeedback(false);
            } catch (err) {
              setFeedbackError('Gửi đánh giá thất bại: ' + (err.message || 'Lỗi không xác định'));
            }
            setFeedbackLoading(false);
          }}
        >
          <Modal.Body>
            <div className="mb-3">
              <strong>{feedbackProduct?.name}</strong>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Chấm điểm</Form.Label>
              <Form.Select
                value={feedbackData.rating}
                onChange={e => setFeedbackData({ ...feedbackData, rating: Number(e.target.value) })}
                required
              >
                {[5,4,3,2,1].map((v) => (
                  <option key={v} value={v}>{v} sao</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bình luận</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={feedbackData.comment}
                onChange={e => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                placeholder="Nhập nhận xét của bạn về sản phẩm..."
                required
              />
            </Form.Group>
            {feedbackError && <div className="text-danger mb-2">{feedbackError}</div>}
            {feedbackSuccess && <div className="text-success mb-2">{feedbackSuccess}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFeedback(false)} disabled={feedbackLoading}>Huỷ</Button>
            <Button variant="primary" type="submit" disabled={feedbackLoading}>Gửi đánh giá</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default OrderDetailPage;
