
import React from 'react';
import { Table, Card, Button, Badge } from 'react-bootstrap';
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

function UserManagerPage() {
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [filter, setFilter] = React.useState({
    search: '',
    role: '',
    phone: '',
    name: '',
    email: '',
  });

  React.useEffect(() => {
    // Chỉ cho Admin truy cập
    const user = getUserFromToken();
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    setLoading(true);
    api.get('/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách người dùng');
        setLoading(false);
      });
  }, [navigate]);

  // Filter logic
  const filteredUsers = users.filter((u) => {
    // Search chung
    const search = filter.search.trim().toLowerCase();
    if (search && !(
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.fullName && u.fullName.toLowerCase().includes(search)) ||
      (u.phone && u.phone.toLowerCase().includes(search))
    )) return false;
    // Filter từng trường
    if (filter.role && u.role !== filter.role) return false;
    if (filter.phone && (!u.phone || !u.phone.includes(filter.phone))) return false;
    if (filter.name && (!u.fullName || !u.fullName.toLowerCase().includes(filter.name.toLowerCase()))) return false;
    if (filter.email && (!u.email || !u.email.toLowerCase().includes(filter.email.toLowerCase()))) return false;
    return true;
  });

  return (
    <Card className="shadow-sm mt-4">
      <Card.Header>Quản lý người dùng</Card.Header>
      <Card.Body>
        {/* Filter UI */}
        <div className="mb-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm chung (email, tên, SĐT)"
            style={{ maxWidth: 220 }}
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Lọc theo tên"
            style={{ maxWidth: 160 }}
            value={filter.name}
            onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Lọc theo email"
            style={{ maxWidth: 180 }}
            value={filter.email}
            onChange={e => setFilter(f => ({ ...f, email: e.target.value }))}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Lọc theo SĐT"
            style={{ maxWidth: 140 }}
            value={filter.phone}
            onChange={e => setFilter(f => ({ ...f, phone: e.target.value }))}
          />
          <select
            className="form-select"
            style={{ maxWidth: 140 }}
            value={filter.role}
            onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}
          >
            <option value="">Tất cả vai trò</option>
            <option value="Admin">Admin</option>
            <option value="ProductManager">Product Manager</option>
            <option value="Customer">Khách hàng</option>
          </select>
        </div>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Role</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.email}</td>
                  <td>{u.fullName}</td>
                  <td><Badge bg={u.role === 'Admin' ? 'danger' : u.role === 'ProductManager' ? 'warning' : 'secondary'}>{u.role}</Badge></td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.address || '-'}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleString('vi-VN') : '-'}</td>
                  <td>{u.isActive !== false ? <Badge bg="success">Hoạt động</Badge> : <Badge bg="secondary">Khoá</Badge>}</td>
                  <td>
                    {u.isActive !== false ? (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={u.role === 'Admin'}
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc chắn muốn khoá tài khoản này?')) {
                            try {
                              await api.patch(`/users/${u._id}/lock`);
                              setUsers(users => users.map(user => user._id === u._id ? { ...user, isActive: false } : user));
                            } catch (e) {
                              alert('Khoá tài khoản thất bại!');
                            }
                          }
                        }}
                      >
                        Khoá
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline-success"
                        disabled={u.role === 'Admin'}
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc chắn muốn mở khoá tài khoản này?')) {
                            try {
                              await api.patch(`/users/${u._id}/unlock`);
                              setUsers(users => users.map(user => user._id === u._id ? { ...user, isActive: true } : user));
                            } catch (e) {
                              alert('Mở khoá tài khoản thất bại!');
                            }
                          }
                        }}
                      >
                        Mở khoá
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

export default UserManagerPage;
