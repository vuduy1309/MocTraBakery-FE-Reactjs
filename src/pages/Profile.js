
import React, { useState } from 'react';
import { Card, Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import { BsPersonCircle } from 'react-icons/bs';


function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', phone: '', address: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  // State cho modal đổi mật khẩu
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  React.useEffect(() => {
    fetch('http://localhost:3000/users/profile', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error('Không thể lấy thông tin người dùng: ' + text);
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setEditData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  const handleEditOpen = () => {
    setEditError('');
    setEditSuccess('');
    setShowEdit(true);
  };

  const handleEditClose = () => {
    setShowEdit(false);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const res = await fetch('http://localhost:3000/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        credentials: 'include',
        body: JSON.stringify(editData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const updated = await res.json();
      setUser((u) => ({ ...u, ...editData }));
      setEditSuccess('Cập nhật thành công!');
      setShowEdit(false);
    } catch (err) {
      setEditError('Cập nhật thất bại: ' + (err.message || 'Lỗi không xác định'));
    }
    setEditLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-lg">
            <Card.Body className="text-center">
              <BsPersonCircle size={64} style={{ color: '#8B4513' }} />
              <h3 className="mt-3 mb-1">{user.fullName || user.email}</h3>
              <div className="mb-2 text-muted">{user.email}</div>
              <div className="mb-2">Số điện thoại: {user.phone || '-'}</div>
              <div className="mb-2">Địa chỉ: {user.address || '-'}</div>
              <div className="mb-2">Ngày tạo: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</div>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button variant="primary" onClick={handleEditOpen}>Chỉnh sửa thông tin</Button>
                <Button variant="warning" onClick={() => { setPwError(''); setPwSuccess(''); setShowChangePw(true); }}>Đổi mật khẩu</Button>
              </div>
              {editSuccess && <div className="text-success mt-3">{editSuccess}</div>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal chỉnh sửa thông tin */}
      <Modal show={showEdit} onHide={handleEditClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control name="fullName" value={editData.fullName} onChange={handleEditChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control name="phone" value={editData.phone} onChange={handleEditChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control name="address" value={editData.address} onChange={handleEditChange} />
            </Form.Group>
            {editError && <div className="text-danger mb-2">{editError}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleEditClose} disabled={editLoading}>Huỷ</Button>
            <Button variant="primary" type="submit" disabled={editLoading}>Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal show={showChangePw} onHide={() => setShowChangePw(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Form onSubmit={async (e) => {
          e.preventDefault();
          setPwLoading(true);
          setPwError('');
          setPwSuccess('');
          if (!pwData.oldPassword || !pwData.newPassword || !pwData.confirmPassword) {
            setPwError('Vui lòng nhập đầy đủ thông tin');
            setPwLoading(false);
            return;
          }
          if (pwData.newPassword !== pwData.confirmPassword) {
            setPwError('Mật khẩu mới không khớp');
            setPwLoading(false);
            return;
          }
          try {
            const res = await fetch('http://localhost:3000/users/change-password', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('token'),
              },
              credentials: 'include',
              body: JSON.stringify({
                oldPassword: pwData.oldPassword,
                newPassword: pwData.newPassword,
              }),
            });
            if (!res.ok) {
              const text = await res.text();
              throw new Error(text);
            }
            setPwSuccess('Đổi mật khẩu thành công!');
            setShowChangePw(false);
          } catch (err) {
            setPwError('Đổi mật khẩu thất bại: ' + (err.message || 'Lỗi không xác định'));
          }
          setPwLoading(false);
        }}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu cũ</Form.Label>
              <Form.Control type="password" name="oldPassword" value={pwData.oldPassword} onChange={e => setPwData({ ...pwData, oldPassword: e.target.value })} required autoFocus />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control type="password" name="newPassword" value={pwData.newPassword} onChange={e => setPwData({ ...pwData, newPassword: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nhập lại mật khẩu mới</Form.Label>
              <Form.Control type="password" name="confirmPassword" value={pwData.confirmPassword} onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })} required />
            </Form.Group>
            {pwError && <div className="text-danger mb-2">{pwError}</div>}
            {pwSuccess && <div className="text-success mb-2">{pwSuccess}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowChangePw(false)} disabled={pwLoading}>Huỷ</Button>
            <Button variant="primary" type="submit" disabled={pwLoading}>Đổi mật khẩu</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Profile;
