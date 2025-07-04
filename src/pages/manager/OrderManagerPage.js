import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload.fullName || payload.email || 'User',
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function OrderManagerPage() {
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
    // Chỉ cho Admin và ProductManager truy cập
    const user = getUserFromToken();
    if (!user || (user.role !== 'Admin' && user.role !== 'ProductManager')) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/orders/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'paid': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'paid': return 'Đã thanh toán';
      default: return status;
    }
  };

  // Lọc orders theo filter
  const filteredOrders = orders.filter((order) => {
    if (filters.minTotal && order.total < Number(filters.minTotal)) return false;
    if (filters.maxTotal && order.total > Number(filters.maxTotal)) return false;
    if (filters.fromDate && new Date(order.createdAt) < new Date(filters.fromDate)) return false;
    if (filters.toDate && new Date(order.createdAt) > new Date(filters.toDate)) return false;
    if (filters.paymentMethod && order.paymentMethod !== filters.paymentMethod) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!(
        order._id.toLowerCase().includes(s) ||
        (order.phone && order.phone.toLowerCase().includes(s)) ||
        (order.address && order.address.toLowerCase().includes(s)) ||
        (order.note && order.note.toLowerCase().includes(s)) ||
        (order.userId?.email && order.userId.email.toLowerCase().includes(s))
      )) return false;
    }
    return true;
  });

  return (
    <>
      <style>{`
        .order-manager-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #fbeee6 0%, #e7d7c1 100%);
          min-height: 100vh;
        }

        .page-header {
          background: linear-gradient(135deg, #e7d7c1 0%, #bfae9e 100%);
          color: #5c4326;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(191, 174, 158, 0.12);
        }

        .page-title {
          font-size: 2.5rem;
          margin: 0;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(191, 174, 158, 0.18);
        }

        .page-subtitle {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          flex-direction: column;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3e9dd;
          border-top: 4px solid #bfae9e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #a58b6f;
          font-size: 1.1rem;
        }

        .error-alert {
          background: linear-gradient(135deg, #eabf9f 0%, #bfae9e 100%);
          color: #5c4326;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 15px rgba(191, 174, 158, 0.18);
        }

        .error-icon {
          margin-right: 15px;
          font-size: 1.5rem;
        }

        .orders-card {
          background: #fffaf3;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(191, 174, 158, 0.10);
          overflow: hidden;
        }

        .table-container {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        .orders-table th {
          background: linear-gradient(135deg, #fbeee6 0%, #e7d7c1 100%);
          color: #5c4326;
          padding: 20px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .orders-table td {
          padding: 20px 15px;
          border-bottom: 1px solid #e7d7c1;
          vertical-align: middle;
        }

        .orders-table tr:hover {
          background: linear-gradient(135deg, #fbeee6 0%, #f5e6d3 100%);
          transform: scale(1.002);
          transition: all 0.3s ease;
        }

        .order-id {
          font-family: 'Courier New', monospace;
          background: #fbeee6;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: bold;
          color: #5c4326;
          border: 1px solid #e7d7c1;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #fffaf3;
          text-shadow: 0 1px 2px rgba(191, 174, 158, 0.18);
        }

        .status-select {
          padding: 8px 12px;
          border: 2px solid #e7d7c1;
          border-radius: 8px;
          background: #fffaf3;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
          color: #5c4326;
        }

        .status-select:focus {
          outline: none;
          border-color: #bfae9e;
          box-shadow: 0 0 0 3px rgba(191, 174, 158, 0.18);
        }

        .status-select:hover {
          border-color: #bfae9e;
        }

        .currency {
          font-weight: 600;
          color: #7c5a36;
          font-size: 1rem;
        }

        .date-text {
          color: #a58b6f;
          font-size: 0.9rem;
        }

        .view-button {
          background: linear-gradient(135deg, #e7d7c1 0%, #bfae9e 100%);
          color: #5c4326;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.85rem;
          box-shadow: 0 2px 8px rgba(191, 174, 158, 0.10);
        }

        .view-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(191, 174, 158, 0.18);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .email {
          color: #a58b6f;
          font-weight: 500;
        }

        .phone {
          color: #a58b6f;
          font-size: 0.9rem;
        }

        .address {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #a58b6f;
        }

        .payment-method {
          background: #fbeee6;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #7c5a36;
          border: 1px solid #e7d7c1;
          text-transform: capitalize;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: #fffaf3;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(191, 174, 158, 0.08);
          text-align: center;
          border-left: 4px solid #bfae9e;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #bfae9e;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #a58b6f;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .order-manager-container {
            padding: 10px;
          }
          
          .page-title {
            font-size: 1.8rem;
          }
          
          .orders-table {
            font-size: 0.8rem;
          }
          
          .orders-table th,
          .orders-table td {
            padding: 10px 8px;
          }
        }
      `}</style>

      <div>
        <div className="page-header">
          <h1 className="page-title">Quản lý đơn hàng</h1>
          <p className="page-subtitle">Theo dõi và quản lý tất cả đơn hàng của khách hàng</p>
        </div>

        {/* Bộ lọc */}
        <form className="row g-2 mb-3" onSubmit={e => e.preventDefault()}>
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
            <input type="text" className="form-control" placeholder="Tìm kiếm mã đơn, SĐT, địa chỉ, ghi chú, email..."
              value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
        </form>

        {!loading && !error && (
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-number">{filteredOrders.length}</div>
              <div className="stat-label">Tổng đơn hàng</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{filteredOrders.filter(o => o.status === 'pending').length}</div>
              <div className="stat-label">Chờ xử lý</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{filteredOrders.filter(o => o.status === 'paid').length}</div>
              <div className="stat-label">Đã thanh toán</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}₫
              </div>
              <div className="stat-label">Tổng doanh thu</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">Đang tải danh sách đơn hàng...</div>
          </div>
        )}

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="orders-card">
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Thông tin khách hàng</th>
                    <th>Địa chỉ</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Phương thức</th>
                    <th>Thời gian nhận</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="order-id">
                          #{order._id.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="email">
                            {order.userId?.email || order.userId || '-'}
                          </div>
                          <div className="phone">
                            📞 {order.phone || 'Chưa có'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="address" title={order.address || 'Chưa có địa chỉ'}>
                          {order.address || 'Chưa có địa chỉ'}
                        </div>
                      </td>
                      <td>
                        {order.status === 'pending' ? (
                          <select
                            className="status-select"
                            value={order.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              if (newStatus === 'paid') {
                                if (!window.confirm('Bạn có chắc chắn muốn chuyển trạng thái đơn hàng này thành đã thanh toán?')) {
                                  return;
                                }
                              }
                              try {
                                const token = localStorage.getItem('token');
                                await api.patch(`/orders/${order._id}/status`, { status: newStatus }, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, status: newStatus } : o));
                              } catch (err) {
                                alert('Không thể cập nhật trạng thái!');
                              }
                            }}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="paid">Đã thanh toán</option>
                          </select>
                        ) : (
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {getStatusText(order.status)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="currency">
                          {order.total?.toLocaleString() || '0'}₫
                        </span>
                      </td>
                      <td>
                        <span className="payment-method">
                          {order.paymentMethod || 'Chưa chọn'}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {order.deliveryTime ? new Date(order.deliveryTime).toLocaleString('vi-VN') : 'Chưa xác định'}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="view-button" 
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
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
    </>
  );
}

export default OrderManagerPage;