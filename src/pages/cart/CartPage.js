import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Container, Table, Button, Form, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Cart API data:', res.data);
      setCart(res.data);
    } catch (err) {
      setError('Không thể tải giỏ hàng. Vui lòng đăng nhập!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId, size) => {
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/cart/remove', { productId, size }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg('Đã xóa sản phẩm khỏi giỏ hàng!');
      fetchCart();
    } catch {
      setMsg('Xóa thất bại!');
    }
  };

  // Thay đổi số lượng sản phẩm trong cart
  const handleUpdateQuantity = async (productId, size, newQuantity) => {
    if (newQuantity < 1) return;
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/cart/update', { productId, size, quantity: newQuantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg('Đã cập nhật số lượng!');
      fetchCart();
    } catch {
      setMsg('Cập nhật số lượng thất bại!');
    }
  };

  // Xử lý nút checkout
  const handleCheckout = () => {
    navigate('/cart/checkout', { state: { cart } });
  };

  // Lấy stock tối đa cho từng item trong cart
  const getMaxStock = (item) => {
    const prod = item.productId;
    if (prod && prod.sizes && prod.sizes.length > 0 && item.size) {
      const size = prod.sizes.find((s) => s.name === item.size);
      return size ? size.stock : 1;
    }
    return prod && prod.stock ? prod.stock : 1;
  };

  if (loading) return (
    <div className="cart-page-bg p-0 m-0" style={{ minHeight: '100vh', width: '100vw' }}>
      <div style={{ height: 80 }}></div>
      <Card className="cart-card mx-auto my-5 p-4" style={{ width: '75vw', maxWidth: 1400, minWidth: 340 }}>
        <div>Đang tải giỏ hàng...</div>
      </Card>
    </div>
  );
  if (error) return (
    <div className="cart-page-bg p-0 m-0" style={{ minHeight: '100vh', width: '100vw' }}>
      <div style={{ height: 80 }}></div>
      <Card className="cart-card mx-auto my-5 p-4" style={{ width: '75vw', maxWidth: 1400, minWidth: 340 }}>
        <Alert className="cart-error-alert" variant="danger">{error}</Alert>
      </Card>
    </div>
  );
  if (!cart || !cart.items || cart.items.length === 0) return (
    <div className="cart-page-bg p-0 m-0" style={{ minHeight: '100vh', width: '100vw' }}>
      <div style={{ height: 80 }}></div>
      <Card className="cart-card mx-auto my-5 p-4 text-center" style={{ width: '75vw', maxWidth: 1400, minWidth: 340 }}>
        <Alert className="cart-empty-alert" variant="info">
          <div style={{ fontSize: 22, fontWeight: 600, color: '#6B4F27' }}>Giỏ hàng của bạn đang trống!</div>
          <div style={{ fontSize: 16, color: '#A4907C', margin: '12px 0 20px 0' }}>
            Hãy khám phá các sản phẩm hấp dẫn của Mộc Trà Bakery ngay nhé.
          </div>
          <Button
            variant="success"
            size="lg"
            href="/products"
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              padding: '12px 32px',
              marginTop: 8
            }}
          >
            <i className="fas fa-shopping-bag me-2"></i>
            Mua hàng ngay
          </Button>
        </Alert>
      </Card>
    </div>
  );

  return (
    <div className="cart-page-bg p-0 m-0" style={{ minHeight: '100vh', width: '100vw' }}>
      <div style={{ height: 80 }}></div>
      <Card className="cart-card mx-auto my-5 p-4" style={{ width: '75vw', maxWidth: 1400, minWidth: 340 }}>
        <h2 style={{ color: '#6B4F27', fontWeight: 700, marginBottom: 24 }}>Giỏ hàng của bạn</h2>
        {msg && <Alert className="cart-info-alert" variant="info">{msg}</Alert>}
        <div className="cart-list-view">
          {cart.items.map((item, idx) => {
            const prod = item.productId;
            let imgSrc = prod?.images?.[0] || prod?.image || 'https://via.placeholder.com/60x60?text=No+Image';
            if (imgSrc && imgSrc.startsWith('/uploads/')) {
              imgSrc = `http://localhost:3000${imgSrc}`;
            }
            // Lấy discount và priceAfterDiscount từ backend trả về
            const discountPercent = item.discountPercent || prod?.discount?.percent || 0;
            const discountText = discountPercent ? `-${discountPercent}%` : '';
            const priceAfterDiscount = item.priceAfterDiscount !== undefined ? item.priceAfterDiscount : (discountPercent ? Math.round(item.price * (1 - discountPercent / 100)) : item.price);
            return (
              <div key={idx} className="cart-list-item" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E5D9C5', padding: '18px 0' }}>
                <div style={{ width: 90, textAlign: 'center', marginRight: 22 }}>
                  {prod ? (
                    <img src={imgSrc} alt={prod.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #A4907C', background: '#fff' }} />
                  ) : (
                    <span style={{ color: '#A4907C' }}>—</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#6B4F27' }}>{prod?.name || <span style={{ color: '#A4907C' }}>Sản phẩm đã xóa</span>}</div>
                  <div style={{ color: '#A4907C', fontSize: 15, margin: '2px 0 6px 0' }}>{prod?.description || '—'}</div>
                  {/* Discount info */}
                  {discountPercent > 0 && (
                    <div style={{ color: '#E67E22', fontWeight: 500, fontSize: 15, margin: '2px 0 6px 0' }}>
                      Giảm giá: <span style={{ fontWeight: 700 }}>{discountText}</span> (Tiết kiệm {(item.price * discountPercent / 100).toLocaleString()} đ mỗi sản phẩm)
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: '#6B4F27' }}>
                    <span style={{ marginRight: 16 }}>Calo: {prod?.calories !== undefined && prod?.calories !== null ? `${prod.calories} kcal` : '—'}</span>
                    <span style={{ marginRight: 16 }}>Nguồn gốc: {prod?.origin || '—'}</span>
                    <span style={{ marginRight: 16 }}>Chay: {prod?.isVegetarian === true ? 'Chay' : prod?.isVegetarian === false ? 'Không chay' : '—'}</span>
                    <span style={{ marginRight: 16 }}>Bảo quản lạnh: {prod?.isRefrigerated === true ? 'Có' : prod?.isRefrigerated === false ? 'Không' : '—'}</span>
                    <span style={{ marginRight: 16 }}>Size: {item.size || '—'}</span>
                  </div>
                </div>
                <div style={{ minWidth: 120, marginRight: 18, display: 'flex', alignItems: 'center' }}>
                  <span style={{marginRight: 6, color: '#6B4F27', fontWeight: 500}}>Số lượng:</span>
                  <Form.Control
                    type="number"
                    min={1}
                    max={getMaxStock(item)}
                    defaultValue={item.quantity}
                    style={{ width: 70, display: 'inline-block', background: '#fff', border: '1.5px solid #A4907C', color: '#6B4F27' }}
                    onBlur={e => {
                      let val = Number(e.target.value);
                      const max = getMaxStock(item);
                      if (val > max) val = max;
                      if (val < 1) val = 1;
                      if (val !== item.quantity) handleUpdateQuantity(prod?._id, item.size, val);
                      else e.target.value = item.quantity; 
                    }}
                    disabled={!prod}
                  />
                  <span style={{ marginLeft: 8, color: '#A4907C', fontSize: 13 }}>
                    (Tồn kho: {getMaxStock(item)})
                  </span>
                </div>
                <div style={{ minWidth: 120, color: '#8B6F3A', fontWeight: 600, marginRight: 18 }}>
                  {discountPercent > 0 ? (
                    <>
                      <span style={{marginRight: 4}}>Đơn giá:</span>
                      <span style={{ textDecoration: 'line-through', color: '#A4907C', marginRight: 6 }}>{item.price?.toLocaleString()} đ</span>
                      <span style={{ color: '#4E944F', fontWeight: 700 }}>{priceAfterDiscount?.toLocaleString()} đ</span>
                    </>
                  ) : (
                    <>
                      <span style={{marginRight: 4}}>Đơn giá:</span>{item.price?.toLocaleString()} đ
                    </>
                  )}
                </div>
                <div style={{ minWidth: 120, color: '#4E944F', fontWeight: 700, marginRight: 18 }}>
                  <span style={{marginRight: 4}}>Thành tiền:</span>{priceAfterDiscount * item.quantity > 0 ? (priceAfterDiscount * item.quantity).toLocaleString() : (item.price * item.quantity).toLocaleString()} đ
                </div>
                <div>
                  <Button className="cart-remove-btn" size="sm" onClick={() => handleRemove(prod?._id, item.size)}>
                    Xóa
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="cart-total" style={{ textAlign: 'right', marginTop: 24, fontSize: 20, fontWeight: 600 }}>
          Tổng tiền: {cart.total?.toLocaleString()} đ
        </div>
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button className="cart-checkout-btn" size="lg" onClick={handleCheckout} disabled={cart.items.length === 0}>
            Thanh toán
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default CartPage;
