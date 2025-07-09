import React from 'react';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import {
  BsCart3,
  BsBell,
  BsEnvelope,
  BsPersonCircle,
  BsHouseFill,
  BsBoxSeam,
  BsJournalText,
} from 'react-icons/bs';
import { Link } from 'react-router-dom';

const MyLink = ({ to, children, className, title, ...props }) => (
  <a
    href={to}
    className={className}
    title={title}
    style={{ textDecoration: 'none' }}
    {...props}
  >
    {children}
  </a>
);

function Header() {
  const cartCount = 2;
  const notificationCount = 3;
  const messageCount = 1;

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            name: payload.fullName || payload.email || 'User',
            role: payload.role,
          });
        } catch (err) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    // Lắng nghe custom event để cập nhật user sau login
    window.addEventListener('user-login', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('user-login', checkUser);
    };
  }, []);

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Gửi event để các tab khác cũng update
    window.dispatchEvent(new Event('user-login'));
    window.location.href = '/login';
  };

  return (
    <Navbar
      expand="lg"
      className="shadow-sm border-bottom header-soft-brown"
      style={{
        minHeight: '80px',
        borderBottom: '2px solid #e9ecef',
        background: '#FFF8F0',
      }}
    >
      <Container fluid className="px-4">
        {/* Logo */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center fw-bold fs-3 text-soft-brown"
          style={{
            textDecoration: 'none',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#8B4513')}
          onMouseLeave={(e) => (e.target.style.color = '#8B4513')}
        >
          <span className="me-2" style={{ fontSize: '2rem' }}>
            🍰
          </span>
          <span>
            Mộc Trà
            <span style={{ color: '#D2691E', filter: 'saturate(1.2)' }} className="ms-1">
              Bakery
            </span>
          </span>
        </Navbar.Brand>

        {/* Navigation */}
        <Nav className="mx-auto flex-nowrap align-items-center" style={{ gap: 8, whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '60vw' }}>
          <Nav.Link
            as={Link}
            to="/"
            className="px-3 fw-medium text-dark position-relative flex-shrink-0"
            style={{
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              minWidth: 120,
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#4A7C59';
              e.target.style.backgroundColor = '#F0F8F0';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#212529';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <BsHouseFill className="me-2" />
            Trang chủ
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/products"
            className="px-3 fw-medium text-dark flex-shrink-0"
            style={{
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              minWidth: 120,
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#4A7C59';
              e.target.style.backgroundColor = '#F0F8F0';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#212529';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <BsBoxSeam className="me-2" />
            Sản phẩm
          </Nav.Link>
          <Nav.Link
            className="px-3 fw-medium text-dark flex-shrink-0"
            style={{
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              cursor: 'not-allowed',
              opacity: 0.7,
              minWidth: 120,
              textAlign: 'center',
            }}
            title="Coming soon"
            onClick={(e) => {
              e.preventDefault();
              alert('Tính năng Blog sẽ ra mắt sớm!');
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#4A7C59';
              e.target.style.backgroundColor = '#F0F8F0';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#212529';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <BsJournalText className="me-2" />
            Blogpost
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/cart"
            className="px-3 fw-medium text-dark flex-shrink-0"
            style={{
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              minWidth: 120,
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#4A7C59';
              e.target.style.backgroundColor = '#F0F8F0';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#212529';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <BsCart3 className="me-2" />
            Giỏ hàng
          </Nav.Link>
          {/* Menu quản trị cho admin/manager */}
          {user &&
            (user.role === 'Admin' || user.role === 'ProductManager') && (
              <Nav.Link
                as={Link}
                to={user.role === 'Admin' ? '/admin' : '/manager/dashboard'}
                className={`px-3 fw-medium text-dark flex-shrink-0`}
                style={{
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px',
                  fontWeight: 600,
                  minWidth: 160,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#fff';
                  e.target.style.backgroundColor =
                    user.role === 'Admin' ? '#8B4513' : '#D2691E';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color =
                    user.role === 'Admin' ? '#8B4513' : '#D2691E';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <BsBoxSeam className="me-2" />
                Dashboard quản trị
              </Nav.Link>
            )}
        </Nav>

        {/* Right side icons and auth */}
        <div className="d-flex align-items-center">
          {/* Icon buttons */}
          <div className="d-flex align-items-center me-3">
            <Button
              as={Link}
              to="/cart"
              size="sm"
              className="position-relative me-2 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '45px',
                height: '45px',
                border: '2px solid #4A7C59',
                background: '#fff',
                color: '#4A7C59',
                transition: 'all 0.3s ease',
              }}
              title="Giỏ hàng"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4A7C59';
                e.target.style.borderColor = '#4A7C59';
                e.target.style.color = '#fff';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = '#4A7C59';
                e.target.style.color = '#4A7C59';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <BsCart3 size={18} />
              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  className="position-absolute top-0 start-100 translate-middle rounded-pill"
                  style={{
                    fontSize: '0.7rem',
                    animation: 'pulse 2s infinite',
                    backgroundColor: '#CD853F',
                    border: 'none',
                  }}
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            <Button
              as={Link}
              to="/orders"
              size="sm"
              className="position-relative me-2 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '45px',
                height: '45px',
                border: '2px solid #D2691E',
                background: '#fff',
                color: '#D2691E',
                transition: 'all 0.3s ease',
              }}
              title="Lịch sử đơn hàng"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#D2691E';
                e.target.style.borderColor = '#D2691E';
                e.target.style.color = '#fff';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = '#D2691E';
                e.target.style.color = '#D2691E';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <BsJournalText size={18} />
            </Button>

            <Button
              size="sm"
              className="position-relative rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '45px',
                height: '45px',
                border: '2px solid #8B7355',
                background: '#fff',
                color: '#8B7355',
                transition: 'all 0.3s ease',
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
              title="Coming soon"
              onClick={(e) => {
                e.preventDefault();
                alert('Tính năng Tin nhắn sẽ ra mắt sớm!');
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#8B7355';
                e.target.style.borderColor = '#8B7355';
                e.target.style.color = '#fff';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = '#8B7355';
                e.target.style.color = '#8B7355';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <BsEnvelope size={18} />
              {messageCount > 0 && (
                <Badge
                  bg="info"
                  className="position-absolute top-0 start-100 translate-middle rounded-pill"
                  style={{
                    fontSize: '0.7rem',
                    animation: 'pulse 2s infinite',
                    backgroundColor: '#D2691E',
                    border: 'none',
                  }}
                >
                  {messageCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Auth section */}
          <div className="border-start ps-3">
            {user ? (
              <div className="d-flex align-items-center">
                <Button
                  as={Link}
                  to="/profile"
                  variant="link"
                  className="d-flex align-items-center px-3 py-2 rounded-pill me-3 fw-medium"
                  style={{
                    border: '1px solid #4A7C59',
                    backgroundColor: '#F0F8F0',
                    color: '#2D5016',
                    textDecoration: 'none',
                  }}
                  title="Xem thông tin cá nhân"
                >
                  <BsPersonCircle size={20} className="me-2" style={{ color: '#4A7C59' }} />
                  <span className="fw-medium small">
                    Xin chào, {user.name}
                  </span>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-pill fw-medium"
                  style={{
                    transition: 'all 0.3s ease',
                    border: '2px solid #A0522D',
                    color: '#A0522D',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#A0522D';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#A0522D';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <Button
                  as={Link}
                  to="/login"
                  size="sm"
                  className="d-flex align-items-center me-2 rounded-pill fw-medium"
                  style={{
                    background: '#fff',
                    color: '#4A7C59',
                    border: '2px solid #4A7C59',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4A7C59';
                    e.target.style.color = '#fff';
                    e.target.style.borderColor = '#4A7C59';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.color = '#4A7C59';
                    e.target.style.borderColor = '#4A7C59';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <BsPersonCircle size={16} className="me-1" />
                  Đăng nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  size="sm"
                  className="rounded-pill fw-medium"
                  style={{
                    background: '#D2691E',
                    color: '#fff',
                    border: '2px solid #D2691E',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(210, 105, 30, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#B8860B';
                    e.target.style.color = '#fff';
                    e.target.style.borderColor = '#B8860B';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow =
                      '0 4px 8px rgba(210, 105, 30, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#D2691E';
                    e.target.style.color = '#fff';
                    e.target.style.borderColor = '#D2691E';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow =
                      '0 2px 4px rgba(210, 105, 30, 0.2)';
                  }}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Navbar>
  );
}

export default Header;