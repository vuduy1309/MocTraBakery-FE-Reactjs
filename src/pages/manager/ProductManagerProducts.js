import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Modal } from 'react-bootstrap';
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

function ProductManagerProducts() {
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [feedbackLoading, setFeedbackLoading] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const navigate = useNavigate();

  // Xem feedback cho sản phẩm
  const handleViewFeedback = async (product) => {
    setSelectedProduct(product);
    setShowFeedbackModal(true);
    setFeedbackLoading(true);
    setFeedbackError('');
    setFeedbacks([]);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/comments?productId=${product._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      setFeedbackError('Không thể tải phản hồi.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  React.useEffect(() => {
    // Chỉ cho Admin và ProductManager truy cập
    const user = getUserFromToken();
    if (!user || (user.role !== 'Admin' && user.role !== 'ProductManager')) {
      navigate('/login');
      return;
    }
    // Lấy sản phẩm
    api
      .get('/products')
      .then((res) => {
        setProducts(res.data);
        console.log('Products fetched:', res.data);
      })
      .catch(() => setProducts([]));
    // Lấy danh mục
    api
      .get('/categories')
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => setCategories([]));
  }, [navigate]);

  React.useEffect(() => {
    console.log('Products state:', products);
  }, [products]);

  const handleAdd = () => {
    navigate('/manager/add-product')
  };

  const handleEdit = (id) => {
    navigate('/manager/update-product/' + id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(products.filter((p) => p._id !== id));
    }
  };

  // Filter state
  const [filter, setFilter] = React.useState({
    name: '',
    category: '',
    isActive: '',
    origin: '',
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const nameMatch =
      filter.name === '' ||
      (p.name && p.name.toLowerCase().includes(filter.name.toLowerCase()));
    // Lọc theo tên danh mục lấy từ categories nếu categoryId là id
    let categoryName = '';
    if (p.categoryId && typeof p.categoryId === 'object' && p.categoryId.name) {
      categoryName = p.categoryId.name;
    } else if (typeof p.categoryId === 'string' && categories.length > 0) {
      const found = categories.find((c) => c._id === p.categoryId);
      if (found) categoryName = found.name;
    }
    const categoryMatch =
      filter.category === '' ||
      (categoryName &&
        categoryName.toLowerCase().includes(filter.category.toLowerCase()));
    const isActiveMatch =
      filter.isActive === '' ||
      (filter.isActive === 'active' && p.isActive) ||
      (filter.isActive === 'inactive' && !p.isActive);
    const originMatch =
      filter.origin === '' ||
      (p.origin &&
        p.origin.toLowerCase().includes(filter.origin.toLowerCase()));
    return nameMatch && categoryMatch && isActiveMatch && originMatch;
  });

  // Responsive styles for different screen sizes
  const containerStyle = {
    backgroundColor: '#f7f3f0',
    minHeight: '100vh',
    width: '100%',
    padding: '1rem',
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflow: 'auto',
    '@media (min-width: 1200px)': {
      padding: '2rem',
    },
    '@media (min-width: 1400px)': {
      padding: '2.5rem',
    },
    '@media (min-width: 1600px)': {
      padding: '3rem',
    }
  };

  const contentWrapperStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    '@media (min-width: 1200px)': {
      maxWidth: '1140px',
    },
    '@media (min-width: 1400px)': {
      maxWidth: '1320px',
    },
    '@media (min-width: 1600px)': {
      maxWidth: '1500px',
    },
    '@media (min-width: 1920px)': {
      maxWidth: '1800px',
    }
  };

  const headerStyle = {
    color: '#8b4513',
    fontWeight: '700',
    fontSize: 'clamp(1.5rem, 2vw, 2.2rem)',
    marginBottom: '1.5rem',
    textAlign: 'left'
  };

  const addButtonStyle = {
    background: 'linear-gradient(135deg, #d2b48c 0%, #bc9a6a 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#8b4513',
    fontWeight: '600',
    fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
    padding: 'clamp(10px, 1.5vw, 12px) clamp(20px, 2.5vw, 24px)',
    boxShadow: '0 8px 20px rgba(210, 180, 140, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0)',
    whiteSpace: 'nowrap'
  };

  const filterContainerStyle = {
    background: '#faf8f5',
    borderRadius: '12px',
    padding: 'clamp(1rem, 1.5vw, 1.5rem)',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.08)',
    border: '1px solid #e6d7c3'
  };

  const filterInputStyle = {
    border: '2px solid #d4c4b0',
    borderRadius: '8px',
    padding: 'clamp(8px, 1vw, 12px) clamp(12px, 1.5vw, 16px)',
    backgroundColor: '#fefcfa',
    color: '#8b4513',
    fontSize: 'clamp(0.85rem, 1vw, 0.95rem)',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(139, 69, 19, 0.05)',
    width: '100%'
  };

  const tableContainerStyle = {
    background: '#fefcfa',
    borderRadius: '12px',
    padding: '0',
    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.08)',
    border: '1px solid #e6d7c3',
    overflow: 'hidden'
  };

  const tableStyle = {
    minWidth: '100%',
    backgroundColor: 'transparent',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)',
    '@media (min-width: 1600px)': {
      fontSize: '0.9rem',
    }
  };

  const tableHeaderStyle = {
    background: 'linear-gradient(135deg, #d2b48c 0%, #bc9a6a 100%)',
    color: '#8b4513',
    fontWeight: '700',
    fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)',
    padding: 'clamp(8px, 1.2vw, 12px) clamp(6px, 1vw, 8px)',
    textAlign: 'center',
    borderColor: 'rgba(139, 69, 19, 0.2)',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    zIndex: 10
  };

  const tableCellStyle = {
    padding: 'clamp(8px, 1.2vw, 12px) clamp(6px, 1vw, 8px)',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)',
    borderBottom: '1px solid #e6d7c3'
  };

  const getStatusStyle = (isActive) => {
    const baseStyle = {
      padding: 'clamp(4px, 0.8vw, 6px) clamp(8px, 1.2vw, 12px)',
      borderRadius: '20px',
      fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    };

    if (isActive === undefined) return {
      ...baseStyle,
      backgroundColor: '#a0826d',
      color: 'white',
    };
    return isActive
      ? {
        ...baseStyle,
        backgroundColor: '#9b7653',
        color: 'white',
      }
      : {
        ...baseStyle,
        backgroundColor: '#b8860b',
        color: 'white',
      };
  };

  const getButtonStyle = (variant) => {
    const baseStyle = {
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)',
      padding: 'clamp(6px, 1vw, 8px) clamp(10px, 1.5vw, 14px)',
      border: 'none',
      transition: 'all 0.2s ease',
      minWidth: 'clamp(60px, 8vw, 80px)',
      whiteSpace: 'nowrap'
    };

    switch (variant) {
      case 'edit':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ddbf94 0%, #d4a574 100%)',
          color: '#8b4513'
        };
      case 'delete':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #cd853f 0%, #a0522d 100%)',
          color: '#ffffff'
        };
      case 'feedback':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #bc9a6a 0%, #a0826d 100%)',
          color: '#ffffff'
        };
      default:
        return baseStyle;
    }
  };

  // Responsive image size
  const getImageSize = () => {
    const vw = window.innerWidth;
    if (vw >= 1600) return { width: 90, height: 90 };
    if (vw >= 1400) return { width: 80, height: 80 };
    if (vw >= 1200) return { width: 70, height: 70 };
    return { width: 60, height: 60 };
  };

  // Component hiển thị nhiều ảnh - responsive
  const ImageGallery = ({ product }) => {
    const [imageSize, setImageSize] = React.useState(getImageSize());

    React.useEffect(() => {
      const handleResize = () => {
        setImageSize(getImageSize());
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    let images = [];

    if (Array.isArray(product.images) && product.images.length > 0) {
      images = product.images.map(img => {
        if (typeof img === 'string') {
          return img;
        } else if (img && typeof img === 'object') {
          return img.image || img.url || '';
        }
        return '';
      }).filter(Boolean);
    } else if (product.image) {
      if (typeof product.image === 'object') {
        const imgUrl = product.image.image || product.image.url || '';
        if (imgUrl) images = [imgUrl];
      } else if (typeof product.image === 'string') {
        images = [product.image];
      }
    }

    images = images.map(img =>
      img.startsWith('/uploads') ? 'http://localhost:3000' + img : img
    );

    if (images.length === 0) {
      return (
        <div style={{
          width: imageSize.width,
          height: imageSize.height,
          backgroundColor: '#f0ead6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a0826d',
          fontSize: 'clamp(0.6rem, 0.7vw, 0.75rem)',
          textAlign: 'center',
          padding: '4px'
        }}>
          Không có ảnh
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <img
          src={images[0]}
          alt={product.name}
          style={{
            width: imageSize.width,
            height: imageSize.height,
            objectFit: 'cover',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(139, 69, 19, 0.15)'
          }}
        />
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: images.length === 2 ? '1fr 1fr' : '1fr 1fr',
        gap: '2px',
        width: imageSize.width,
        height: imageSize.height
      }}>
        {images.slice(0, 4).map((img, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <img
              src={img}
              alt={`${product.name} ${idx + 1}`}
              style={{
                width: '100%',
                height: images.length <= 2 ? `${imageSize.height}px` : `${(imageSize.height - 2) / 2}px`,
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
            {idx === 3 && images.length > 4 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(139, 69, 19, 0.7)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 'clamp(0.6rem, 0.7vw, 0.7rem)',
                fontWeight: '600'
              }}>
                +{images.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={headerStyle}>Quản lý sản phẩm</h1>
          <Button
            style={addButtonStyle}
            onClick={handleAdd}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 24px rgba(210, 180, 140, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(210, 180, 140, 0.3)';
            }}
          >
            Thêm sản phẩm mới
          </Button>
        </div>

        {/* Bộ lọc */}
        <div style={filterContainerStyle}>
          <div className="row g-3">
            <div className="col-xl-3 col-lg-6 col-md-6">
              <input
                type="text"
                style={filterInputStyle}
                className="form-control"
                placeholder="Tìm theo tên sản phẩm..."
                value={filter.name}
                onChange={(e) => setFilter((f) => ({ ...f, name: e.target.value }))}
                onFocus={(e) => e.target.style.borderColor = '#bc9a6a'}
                onBlur={(e) => e.target.style.borderColor = '#d4c4b0'}
              />
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <select
                style={filterInputStyle}
                className="form-select"
                value={filter.category}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, category: e.target.value }))
                }
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <select
                style={filterInputStyle}
                className="form-select"
                value={filter.isActive}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, isActive: e.target.value }))
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Có sẵn</option>
                <option value="inactive">Hết hàng</option>
              </select>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <input
                type="text"
                style={filterInputStyle}
                className="form-control"
                placeholder="Nguồn gốc..."
                value={filter.origin}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, origin: e.target.value }))
                }
                onFocus={(e) => e.target.style.borderColor = '#bc9a6a'}
                onBlur={(e) => e.target.style.borderColor = '#d4c4b0'}
              />
            </div>
          </div>
        </div>

        <div style={tableContainerStyle} className="table-responsive">
          <Table
            hover
            className="align-middle mb-0"
            style={tableStyle}
          >
            <thead>
              <tr>
                <th style={tableHeaderStyle}>STT</th>
                <th style={tableHeaderStyle}>Hình ảnh</th>
                <th style={tableHeaderStyle}>Tên sản phẩm</th>
                <th style={tableHeaderStyle}>Mô tả</th>
                <th style={tableHeaderStyle}>Giá</th>
                <th style={tableHeaderStyle}>Số lượng</th>
                <th style={tableHeaderStyle}>Trạng thái</th>
                <th style={tableHeaderStyle}>Danh mục</th>
                <th style={tableHeaderStyle}>Khuyến mãi</th>
                <th style={tableHeaderStyle}>Ngày tạo</th>
                <th style={tableHeaderStyle}>Thuần chay</th>
                <th style={tableHeaderStyle}>HSD (ngày)</th>
                <th style={tableHeaderStyle}>Bảo quản lạnh</th>
                <th style={tableHeaderStyle}>Không gluten</th>
                <th style={tableHeaderStyle}>Nguồn gốc</th>
                <th style={tableHeaderStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, idx) => (
                <tr
                  key={p._id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#fefcfa' : '#f7f3f0',
                    borderBottom: '1px solid #e6d7c3'
                  }}
                >
                  <td style={{ ...tableCellStyle, fontWeight: '600', color: '#8b4513' }}>
                    {idx + 1}
                  </td>
                  <td style={tableCellStyle}>
                    <ImageGallery product={p} />
                  </td>
                  <td style={{
                    ...tableCellStyle,
                    fontWeight: '700',
                    color: '#8b4513',
                    maxWidth: 'clamp(120px, 15vw, 180px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <span title={p.name}>{p.name || 'Không có tên'}</span>
                  </td>
                  <td style={{
                    ...tableCellStyle,
                    maxWidth: 'clamp(150px, 20vw, 260px)',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    color: '#a0826d',
                    textAlign: 'left'
                  }}>
                    {p.description || 'Không có mô tả'}
                  </td>
                  <td style={{
                    ...tableCellStyle,
                    fontWeight: '700',
                    color: '#9b7653',
                    whiteSpace: 'nowrap'
                  }}>
                    {p.price ? p.price.toLocaleString('vi-VN') + ' đ' : 'Chưa có giá'}
                  </td>
                  <td style={{
                    ...tableCellStyle,
                    fontWeight: '600',
                    color: p.stock > 10 ? '#9b7653' : '#cd853f'
                  }}>
                    {p.stock ?? 'Không có'}
                  </td>
                  <td style={tableCellStyle}>
                    <span style={getStatusStyle(p.isActive)}>
                      {p.isActive === undefined
                        ? 'Không '
                        : p.isActive
                          ? 'Có sẵn'
                          : 'Hết hàng'}
                    </span>
                  </td>
                  <td style={{ ...tableCellStyle, color: '#a0826d', fontWeight: '500' }}>
                    {p.categoryId &&
                      typeof p.categoryId === 'object' &&
                      p.categoryId.name
                      ? p.categoryId.name
                      : typeof p.categoryId === 'string' &&
                        categories.length > 0
                        ? categories.find((c) => c._id === p.categoryId)
                          ?.name || 'Chưa phân loại'
                        : 'Chưa phân loại'}
                  </td>
                  <td style={{ ...tableCellStyle, color: '#d2b48c', fontWeight: '500' }}>
                    {p.discountId &&
                      typeof p.discountId === 'object' &&
                      p.discountId.name
                      ? p.discountId.name
                      : 'Không có'}
                  </td>
                  <td style={{ ...tableCellStyle, color: '#a0826d' }}>
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString('vi-VN')
                      : 'Không '}
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: 'clamp(3px, 0.5vw, 4px) clamp(6px, 1vw, 8px)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.6rem, 0.7vw, 0.75rem)',
                      fontWeight: '600',
                      backgroundColor: p.isVegetarian === undefined ? '#a0826d' : p.isVegetarian ? '#9b7653' : '#cd853f',
                      color: 'white',
                      whiteSpace: 'nowrap'
                    }}>
                      {p.isVegetarian === undefined ? 'Không ' : p.isVegetarian ? 'Có' : 'Không'}
                    </span>
                  </td>
                  <td style={{ ...tableCellStyle, fontWeight: '600', color: '#bc9a6a' }}>
                    {p.shelfLifeDays ?? 'Không '}
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: 'clamp(3px, 0.5vw, 4px) clamp(6px, 1vw, 8px)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.6rem, 0.7vw, 0.75rem)',
                      fontWeight: '600',
                      backgroundColor: p.isRefrigerated === undefined ? '#a0826d' : p.isRefrigerated ? '#bc9a6a' : '#d2b48c',
                      color: 'white',
                      whiteSpace: 'nowrap'
                    }}>
                      {p.isRefrigerated === undefined ? 'Không ' : p.isRefrigerated ? 'Có' : 'Không'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: 'clamp(3px, 0.5vw, 4px) clamp(6px, 1vw, 8px)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.6rem, 0.7vw, 0.75rem)',
                      fontWeight: '600',
                      backgroundColor: p.isGlutenFree === undefined ? '#a0826d' : p.isGlutenFree ? '#9b7653' : '#cd853f',
                      color: 'white',
                      whiteSpace: 'nowrap'
                    }}>
                      {p.isGlutenFree === undefined ? 'Không ' : p.isGlutenFree ? 'Có' : 'Không'}
                    </span>
                  </td>
                  <td style={{ ...tableCellStyle, color: '#a0826d', fontWeight: '500' }}>
                    {p.origin || 'Không '}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1vw, 8px)', alignItems: 'center' }}>
                      <Button
                        size="sm"
                        style={getButtonStyle('edit')}
                        onClick={() => handleEdit(p._id)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        style={getButtonStyle('delete')}
                        onClick={() => handleDelete(p._id)}
                      >
                        Xóa
                      </Button>
                      <Button
                        size="sm"
                        style={getButtonStyle('feedback')}
                        onClick={() => handleViewFeedback(p)}
                      >
                        Phản hồi
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal xem tất cả phản hồi về sản phẩm */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Phản hồi về sản phẩm: {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {feedbackLoading && <div>Đang tải phản hồi...</div>}
          {feedbackError && <div className="text-danger mb-2">{feedbackError}</div>}
          {!feedbackLoading && !feedbackError && feedbacks.length === 0 && (
            <div>Chưa có phản hồi nào cho sản phẩm này.</div>
          )}
          {!feedbackLoading && !feedbackError && feedbacks.length > 0 && (
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                              <table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th>Người đánh giá</th>
                                    <th>Chấm điểm</th>
                                    <th>Bình luận</th>
                                    <th>Thời gian</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {feedbacks.map((fb, idx) => (
                                    <tr key={fb._id || idx}>
                                      <td>{fb.author?.fullName || fb.author?.email || 'Ẩn danh'}</td>
                                      <td>{fb.rating ? `${fb.rating} ⭐` : '-'}</td>
                                      <td>{fb.content}</td>
                                      <td>{fb.createdAt ? new Date(fb.createdAt).toLocaleString('vi-VN') : '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProductManagerProducts;