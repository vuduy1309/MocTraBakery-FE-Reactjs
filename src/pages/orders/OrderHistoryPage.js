import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minTotal: '',
    maxTotal: '',
    fromDate: '',
    toDate: '',
    paymentMethod: '',
    status: '',
    search: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError('Không thể tải lịch sử đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Lọc orders theo filter
  const filteredOrders = orders.filter((order) => {
    // Giá
    if (filters.minTotal && order.total < Number(filters.minTotal)) return false;
    if (filters.maxTotal && order.total > Number(filters.maxTotal)) return false;
    // Ngày mua
    if (filters.fromDate && new Date(order.createdAt) < new Date(filters.fromDate)) return false;
    if (filters.toDate && new Date(order.createdAt) > new Date(filters.toDate)) return false;
    // Phương thức thanh toán
    if (filters.paymentMethod && order.paymentMethod !== filters.paymentMethod) return false;
    // Trạng thái
    if (filters.status && order.status !== filters.status) return false;
    // Search (mã đơn, phone, address, note)
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!(
        order._id.toLowerCase().includes(s) ||
        (order.phone && order.phone.toLowerCase().includes(s)) ||
        (order.address && order.address.toLowerCase().includes(s)) ||
        (order.note && order.note.toLowerCase().includes(s))
      )) return false;
    }
    return true;
  });

  return (
    <div className="order-history-container">
      <style>{`
        .order-history-container {
          width: 100vw;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #fbeee6 0%, #e7d7c1 100%);
        }
        .order-history-header {
          background: linear-gradient(135deg, #e7d7c1 0%, #bfae9e 100%);
          color: #5c4326;
          padding: 28px 24px 18px 24px;
          border-radius: 0 0 15px 15px;
          margin-bottom: 30px;
          box-shadow: 0 6px 24px rgba(191, 174, 158, 0.10);
        }
        .order-history-title {
          font-size: 2.1rem;
          margin: 0;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(191, 174, 158, 0.13);
        }
        .order-history-filter {
          background: #fffaf3;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(191, 174, 158, 0.08);
          padding: 18px 18px 6px 18px;
          margin-bottom: 24px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }
        .order-table-card {
          background: #fffaf3;
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(191, 174, 158, 0.10);
          overflow: hidden;
          width: 100vw;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }
        .order-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.97rem;
        }
        .order-table th {
          background: linear-gradient(135deg, #fbeee6 0%, #e7d7c1 100%);
          color: #5c4326;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.92rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
        }
        .order-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e7d7c1;
          vertical-align: middle;
        }
        .order-table tr:hover {
          background: linear-gradient(135deg, #fbeee6 0%, #f5e6d3 100%);
          transition: all 0.3s ease;
        }
        .order-id {
          font-family: 'Courier New', monospace;
          background: #fbeee6;
          padding: 7px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: bold;
          color: #5c4326;
          border: 1px solid #e7d7c1;
        }
        .order-status {
          padding: 7px 14px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #fffaf3;
          background: #bfae9e;
        }
        .order-status.paid { background: #4caf50; }
        .order-status.pending { background: #ff9800; }
        .order-status.cancelled { background: #bfae9e; color: #fff; }
        .order-currency {
          font-weight: 600;
          color: #7c5a36;
          font-size: 1rem;
        }
        .order-date {
          color: #a58b6f;
          font-size: 0.93rem;
        }
        .order-detail-btn {
          background: linear-gradient(135deg, #e7d7c1 0%, #bfae9e 100%);
          color: #5c4326;
          border: none;
          padding: 7px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.85rem;
        }
        .order-detail-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(191, 174, 158, 0.18);
        }
        @media (max-width: 768px) {
          .order-history-container {
            padding: 0;
          }
          .order-history-title {
            font-size: 1.5rem;
          }
          .order-table {
            font-size: 0.85rem;
          }
          .order-table th, .order-table td {
            padding: 8px 6px;
          }
        }
      `}</style>
      <div className="order-history-header">
        <h2 className="order-history-title mb-2">Lịch sử đơn hàng của bạn</h2>
      </div>
      {/* Bộ lọc */}
      <form className="row g-2 mb-3 order-history-filter" onSubmit={e => e.preventDefault()}>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Giá từ"
            value={filters.minTotal} onChange={e => setFilters(f => ({ ...f, minTotal: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Đến"
            value={filters.maxTotal} onChange={e => setFilters(f => ({ ...f, maxTotal: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" placeholder="Từ ngày"
            value={filters.fromDate} onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" placeholder="Đến ngày"
            value={filters.toDate} onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}>
            <option value="">Phương thức</option>
            <option value="cod">COD</option>
            <option value="vnpay">VNPAY</option>
            <option value="bank">Chuyển khoản</option>
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <div className="col-md-4 mt-2">
          <input type="text" className="form-control" placeholder="Tìm kiếm mã đơn, SĐT, địa chỉ, ghi chú..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        </div>
      </form>
      {loading && <div>Đang tải...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && filteredOrders.length === 0 && (
        <div>Bạn chưa có đơn hàng nào phù hợp.</div>
      )}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="order-table-card">
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td><div className="order-id">#{order._id.slice(-6).toUpperCase()}</div></td>
                    <td><span className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}</span></td>
                    <td><span className={`order-status ${order.status}`}>{order.status === 'pending' ? 'Chờ xử lý' : order.status === 'paid' ? 'Đã thanh toán' : order.status}</span></td>
                    <td><span className="order-currency">{order.total?.toLocaleString() || '0'}₫</span></td>
                    <td><span className="payment-method">{order.paymentMethod || 'Chưa chọn'}</span></td>
                    <td>
                      <button className="order-detail-btn" onClick={() => navigate(`/orders/${order._id}`)}>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
