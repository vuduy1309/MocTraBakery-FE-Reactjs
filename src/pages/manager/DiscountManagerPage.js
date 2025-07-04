import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Badge, Button, Row, Col, Card, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import BadgePopover from '../../components/BadgePopover';

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

function DiscountManagerPage() {
  const navigate = useNavigate();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [productDetail, setProductDetail] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [selectedDiscount, setSelectedDiscount] = useState(null);

    // Thêm mới khuyến mãi
    const [addForm, setAddForm] = useState({
        name: '',
        percent: '',
        description: '',
        active: true
    });
    const [addLoading, setAddLoading] = useState(false);
    const handleAddInput = (e) => {
        const { name, value, type, checked } = e.target;
        setAddForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    // Thêm mới khuyến mãi - chọn sản phẩm áp dụng
    const [allProducts, setAllProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [applyType, setApplyType] = useState('all'); // 'all', 'category', 'custom'
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

useEffect(() => {
    if (showModal) {
        // Luôn lấy danh sách sản phẩm và category khi mở modal (add hoặc edit)
        api.get('/products').then(res => setAllProducts(res.data)).catch(() => { });
        api.get('/categories').then(res => setAllCategories(res.data)).catch(() => { });
    }
}, [showModal]);

    const handleApplyTypeChange = (e) => {
        setApplyType(e.target.value);
        setSelectedCategory('');
        setSelectedProducts([]);
    };
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedProducts([]);
    };
    const handleProductSelect = (e) => {
        const value = e.target.value;
        setSelectedProducts(prev => prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            // Xác định danh sách sản phẩm áp dụng
            let productIds = [];
            if (applyType === 'all') {
                productIds = allProducts.map(p => p._id);
            } else if (applyType === 'category') {
                productIds = allProducts.filter(p => p.categoryId === selectedCategory || p.categoryId?._id === selectedCategory).map(p => p._id);
            } else if (applyType === 'custom') {
                productIds = selectedProducts;
            }
            const res = await api.post('/discounts', {
                name: addForm.name,
                percent: Number(addForm.percent),
                description: addForm.description,
                active: addForm.active,
                productIds
            });
            setDiscounts([res.data, ...discounts]);
            setShowModal(false);
            setAddForm({ name: '', percent: '', description: '', active: true });
            setApplyType('all');
            setSelectedCategory('');
            setSelectedProducts([]);
        } catch (err) {
            setError('Không thể tạo khuyến mãi mới!');
        } finally {
            setAddLoading(false);
        }
    };

    // Sửa discount
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDiscount) return;
        setAddLoading(true);
        try {
            // Xác định danh sách sản phẩm áp dụng
            let productIds = [];
            if (applyType === 'all') {
                productIds = allProducts.map(p => p._id);
            } else if (applyType === 'category') {
                productIds = allProducts.filter(p => p.categoryId === selectedCategory || p.categoryId?._id === selectedCategory).map(p => p._id);
            } else if (applyType === 'custom') {
                productIds = selectedProducts;
            }
            const res = await api.put(`/discounts/${selectedDiscount._id}`, {
                name: addForm.name,
                percent: Number(addForm.percent),
                description: addForm.description,
                active: addForm.active,
                productIds
            });
            setDiscounts(discounts.map(d => d._id === selectedDiscount._id ? res.data : d));
            setShowModal(false);
            setAddForm({ name: '', percent: '', description: '', active: true });
            setApplyType('all');
            setSelectedCategory('');
            setSelectedProducts([]);
        } catch (err) {
            setError('Không thể cập nhật khuyến mãi!');
        } finally {
            setAddLoading(false);
        }
    };

    // Khi mở modal sửa, fill dữ liệu
    useEffect(() => {
        if (showModal && modalType === 'edit' && selectedDiscount) {
            setAddForm({
                name: selectedDiscount.name || '',
                percent: selectedDiscount.percent || '',
                description: selectedDiscount.description || '',
                active: !!selectedDiscount.active
            });
            // Xác định loại áp dụng và fill lại selectedCategory/selectedProducts
            if (selectedDiscount.products && selectedDiscount.products.length > 0) {
                // Tìm loại áp dụng
                let type = 'custom';
                let catId = '';
                if (allProducts.length > 0 && selectedDiscount.products.length === allProducts.length) {
                    type = 'all';
                } else if (allCategories.length > 0 && allProducts.length > 0) {
                    // Đếm số sản phẩm theo từng categoryId
                    const catCount = {};
                    selectedDiscount.products.forEach(p => {
                        const cId = p.categoryId?._id || p.categoryId;
                        catCount[cId] = (catCount[cId] || 0) + 1;
                    });
                    const catIds = Object.keys(catCount);
                    if (catIds.length === 1) {
                        const totalInCat = allProducts.filter(p => (p.categoryId?._id || p.categoryId) === catIds[0]).length;
                        if (catCount[catIds[0]] === totalInCat) {
                            type = 'category';
                            catId = catIds[0];
                        }
                    }
                }
                setApplyType(type);
                setSelectedCategory(catId);
                setSelectedProducts(selectedDiscount.products.map(p => p._id));
            } else {
                setApplyType('all');
                setSelectedCategory('');
                setSelectedProducts([]);
            }
        }
    }, [showModal, modalType, selectedDiscount, allProducts, allCategories]);

    useEffect(() => {
        async function fetchDiscounts() {
            setLoading(true);
            try {
                const res = await api.get('/discounts');
                console.log('Discounts data:', res.data);
                setDiscounts(res.data);
            } catch (err) {
                setError('Không thể tải danh sách khuyến mãi!');
            } finally {
                setLoading(false);
            }
        }
        fetchDiscounts();
    }, []);

    const handleAddDiscount = () => {
        setModalType('add');
        setSelectedDiscount(null);
        setShowModal(true);
    };

    const handleEditDiscount = (discount) => {
        setModalType('edit');
        setSelectedDiscount(discount);
        setShowModal(true);
    };

    const handleDeleteDiscount = async (discountId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
            try {
                await api.delete(`/discounts/${discountId}`);
                setDiscounts(discounts.filter(d => d._id !== discountId));
                // Hiển thị thông báo thành công
            } catch (err) {
                setError('Không thể xóa khuyến mãi!');
            }
        }
    };

    // Helper: xác định loại áp dụng discount
    const getDiscountApplyType = (discount) => {
        if (!discount.products || discount.products.length === 0) return { type: 'none' };
        // Nếu số lượng sản phẩm = tổng số sản phẩm => tất cả
        if (allProducts.length > 0 && discount.products.length === allProducts.length) {
            return { type: 'all', count: discount.products.length };
        }
        // Nếu tất cả sản phẩm cùng 1 category và số lượng bằng số sản phẩm trong category đó => category
        if (discount.products.length > 0 && allCategories.length > 0 && allProducts.length > 0) {
            // Đếm số sản phẩm theo từng categoryId
            const catCount = {};
            discount.products.forEach(p => {
                const catId = p.categoryId?._id || p.categoryId;
                catCount[catId] = (catCount[catId] || 0) + 1;
            });
            // Nếu chỉ có 1 categoryId và số lượng sản phẩm đúng bằng số sản phẩm trong category đó => là category
            const catIds = Object.keys(catCount);
            if (catIds.length === 1) {
                const catId = catIds[0];
                const totalInCat = allProducts.filter(p => (p.categoryId?._id || p.categoryId) === catId).length;
                if (catCount[catId] === totalInCat) {
                    const cat = allCategories.find(c => c._id === catId);
                    return { type: 'category', category: cat, count: discount.products.length };
                }
            }
        }
        // Mặc định: custom
        return { type: 'custom', count: discount.products.length };
    };

    // Helper: render popover content
    const renderProductListPopover = (products) => {
        if (!products || products.length === 0) return <div>Chưa áp dụng sản phẩm nào</div>;
        const maxShow = 5;
        return (
            <div>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {products.slice(0, maxShow).map(p => (
                        <li key={p._id}>{p.name}</li>
                    ))}
                </ul>
                {products.length > maxShow && (
                    <div style={{ color: '#a0826d', fontStyle: 'italic', marginTop: 4 }}>
                        ...và {products.length - maxShow} sản phẩm khác
                    </div>
                )}
            </div>
        );
    };

    const bakeryStyles = {
        pageWrapper: {
            background: 'linear-gradient(135deg, #f5f1eb 0%, #ede4d3 100%)',
            minHeight: '100vh',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },

        headerSection: {
            background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
            padding: '2rem 0',
            marginBottom: '2rem',
            borderRadius: '0 0 20px 20px',
            boxShadow: '0 8px 32px rgba(180, 134, 11, 0.2)'
        },

        pageTitle: {
            color: '#ffffff',
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            margin: 0,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
        },

        subtitle: {
            color: '#f4e4c1',
            fontSize: '1.1rem',
            textAlign: 'center',
            marginTop: '0.5rem',
            fontWeight: '400'
        },

        statsCard: {
            background: 'linear-gradient(135deg, #ffffff 0%, #faf7f2 100%)',
            border: '2px solid #e8dcc0',
            borderRadius: '15px',
            padding: '1.5rem',
            margin: '1rem 0',
            boxShadow: '0 6px 20px rgba(139, 69, 19, 0.08)',
            textAlign: 'center'
        },

        statsNumber: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#8b4513',
            margin: 0
        },

        statsLabel: {
            fontSize: '1rem',
            color: '#a0826d',
            marginTop: '0.5rem'
        },

        addButton: {
            background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#ffffff',
            boxShadow: '0 6px 20px rgba(180, 134, 11, 0.3)',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },

        tableContainer: {
            background: '#ffffff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(139, 69, 19, 0.1)',
            border: '2px solid #f0e6d6'
        },

        tableHeader: {
            background: 'linear-gradient(135deg, #deb887 0%, #d2b48c 100%)',
            color: '#8b4513',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '1.2rem 1rem',
            textAlign: 'center',
            borderBottom: '3px solid #c19a6b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },

        tableRow: {
            backgroundColor: '#fefcf9',
            borderBottom: '1px solid #f0e6d6',
            transition: 'all 0.3s ease'
        },

        tableCell: {
            padding: '1.2rem 1rem',
            verticalAlign: 'middle',
            color: '#5d4037',
            fontSize: '0.95rem',
            borderRight: '1px solid #f5f0e8'
        },

        discountBadge: {
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '1.1rem',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
        },

        activeBadge: {
            background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            color: '#ffffff',
            padding: '0.4rem 1rem',
            borderRadius: '15px',
            fontSize: '0.9rem',
            fontWeight: '600'
        },

        inactiveBadge: {
            background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
            color: '#ffffff',
            padding: '0.4rem 1rem',
            borderRadius: '15px',
            fontSize: '0.9rem',
            fontWeight: '600'
        },

        actionButton: {
            margin: '0 0.3rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '500',
            border: 'none',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
        },

        editButton: {
            background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(253, 203, 110, 0.3)'
        },

        deleteButton: {
            background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(253, 121, 168, 0.3)'
        },

        productList: {
            margin: 0,
            paddingLeft: '1rem',
            listStyle: 'none'
        },

        productItem: {
            background: 'linear-gradient(135deg, #f8f4f0 0%, #f0e6d6 100%)',
            margin: '0.3rem 0',
            padding: '0.5rem 0.8rem',
            borderRadius: '8px',
            border: '1px solid #e8dcc0',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            fontSize: '0.9rem',
            color: '#8b4513'
        },

        emptyState: {
            textAlign: 'center',
            padding: '3rem 2rem',
            color: '#a0826d',
            fontSize: '1.1rem',
            fontStyle: 'italic'
        },

        loadingSpinner: {
            textAlign: 'center',
            padding: '4rem 2rem'
        },

        spinner: {
            width: '3rem',
            height: '3rem',
            color: '#d4af37'
        }
    };

    const renderProductTooltip = (product, detail) => {
        return `
      <div style="background: linear-gradient(135deg, #ffffff 0%, #faf7f2 100%); 
                  border: 2px solid #d4af37; 
                  border-radius: 12px; 
                  padding: 1rem; 
                  box-shadow: 0 8px 32px rgba(180, 134, 11, 0.2);
                  min-width: 250px;
                  color: #5d4037;">
        <div style="font-size: 1.2rem; font-weight: 700; color: #8b4513; margin-bottom: 0.5rem;">
          🧁 ${detail.name}
        </div>
        <hr style="border-color: #e8dcc0; margin: 0.5rem 0;">
        <div style="font-size: 0.9rem; line-height: 1.6;">
          ${detail.images && detail.images.length > 0 ?
                `<div style="margin: 0.5rem 0;">
              <img src='${detail.images[0]}' 
                   style='width: 100px; height: 100px; object-fit: cover; 
                          border-radius: 8px; border: 2px solid #f0e6d6; 
                          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.1);' />
            </div>` : ''}
          <div><strong>💰 Giá:</strong> 
            <span style="color: #d4af37; font-weight: 600;">
              ${detail.price ? detail.price.toLocaleString() + ' đ' : 'Chưa có giá'}
            </span>
          </div>
          <div><strong>📝 Mô tả:</strong> ${detail.description || 'Chưa có mô tả'}</div>
          <div><strong>📦 Tồn kho:</strong> ${detail.stock !== undefined ? detail.stock : 'N/A'}</div>
          <div><strong>🏷️ Danh mục:</strong> ${detail.categoryId?.name || detail.categoryId || 'Chưa phân loại'}</div>
          <div><strong>⚡ Trạng thái:</strong> 
            <span style="color: ${detail.isActive ? '#00b894' : '#fd79a8'}; font-weight: 600;">
              ${detail.isActive ? '✅ Đang bán' : '❌ Tạm ngưng'}
            </span>
          </div>
        </div>
      </div>
    `;
    };

    return (
        <div style={bakeryStyles.pageWrapper}>
            {/* Header Section */}
            <div style={bakeryStyles.headerSection}>
                <Container>
                    <h1 style={bakeryStyles.pageTitle}>🍰 Quản lý Khuyến mãi</h1>
                    <p style={bakeryStyles.subtitle}>Hệ thống quản trị tiệm bánh ngọt</p>

                    {/* Stats Cards */}
                    <Row className="mt-4">
                        <Col md={3}>
                            <div style={bakeryStyles.statsCard}>
                                <div style={bakeryStyles.statsNumber}>{discounts.length}</div>
                                <div style={bakeryStyles.statsLabel}>Tổng khuyến mãi</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div style={bakeryStyles.statsCard}>
                                <div style={bakeryStyles.statsNumber}>
                                    {discounts.filter(d => d.active).length}
                                </div>
                                <div style={bakeryStyles.statsLabel}>Đang hoạt động</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div style={bakeryStyles.statsCard}>
                                <div style={bakeryStyles.statsNumber}>
                                    {discounts.reduce((sum, d) => sum + (d.products?.length || 0), 0)}
                                </div>
                                <div style={bakeryStyles.statsLabel}>Sản phẩm áp dụng</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div style={bakeryStyles.statsCard}>
                                <div style={bakeryStyles.statsNumber}>
                                    {Math.max(...discounts.map(d => d.percent || 0), 0)}%
                                </div>
                                <div style={bakeryStyles.statsLabel}>Giảm giá cao nhất</div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container>
                {/* Action Bar */}
                <Row className="mb-4">
                    <Col>
                        <Button
                            style={bakeryStyles.addButton}
                            onClick={handleAddDiscount}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(180, 134, 11, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 6px 20px rgba(180, 134, 11, 0.3)';
                            }}
                        >
                            ✨ Thêm khuyến mãi mới
                        </Button>
                    </Col>
                </Row>

                {/* Error Alert */}
                {error && (
                    <Alert
                        variant="danger"
                        style={{
                            background: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontWeight: '500'
                        }}
                    >
                        ⚠️ {error}
                    </Alert>
                )}

                {/* Loading State */}
                {loading ? (
                    <div style={bakeryStyles.loadingSpinner}>
                        <Spinner animation="border" style={bakeryStyles.spinner} />
                        <p style={{ color: '#8b4513', marginTop: '1rem', fontSize: '1.1rem' }}>
                            Đang tải dữ liệu khuyến mãi...
                        </p>
                    </div>
                ) : (
                    /* Main Table */
                    <div style={bakeryStyles.tableContainer}>
                        <Table hover style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={bakeryStyles.tableHeader}>#</th>
                                    <th style={bakeryStyles.tableHeader}>Tên khuyến mãi</th>
                                    <th style={bakeryStyles.tableHeader}>Mức giảm</th>
                                    <th style={bakeryStyles.tableHeader}>Mô tả</th>
                                    <th style={bakeryStyles.tableHeader}>Trạng thái</th>
                                    <th style={bakeryStyles.tableHeader}>Loại áp dụng</th>
                                    <th style={bakeryStyles.tableHeader}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={bakeryStyles.emptyState}>
                                            🍰 Chưa có khuyến mãi nào. Hãy thêm khuyến mãi đầu tiên!
                                        </td>
                                    </tr>
                                ) : (
                                    discounts.map((discount, idx) => (
                                        <tr
                                            key={discount._id || idx}
                                            style={bakeryStyles.tableRow}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f5f0e8';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.08)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fefcf9';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <td style={bakeryStyles.tableCell}>
                                                <strong style={{ color: '#d4af37' }}>{idx + 1}</strong>
                                            </td>

                                            <td style={bakeryStyles.tableCell}>
                                                <div style={{ fontWeight: '600', color: '#8b4513', fontSize: '1rem' }}>
                                                    {discount.name}
                                                </div>
                                            </td>

                                            <td style={bakeryStyles.tableCell}>
                                                <Badge style={bakeryStyles.discountBadge}>
                                                    -{discount.percent}%
                                                </Badge>
                                            </td>

                                            <td style={bakeryStyles.tableCell}>
                                                <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                                                    {discount.description ||
                                                        <span style={{ color: '#a0826d', fontStyle: 'italic' }}>
                                                            Chưa có mô tả
                                                        </span>
                                                    }
                                                </div>
                                            </td>

                                            <td style={bakeryStyles.tableCell}>
                                                <Badge style={discount.active ? bakeryStyles.activeBadge : bakeryStyles.inactiveBadge}>
                                                    {discount.active ? '✅ Hoạt động' : '❌ Tạm ngưng'}
                                                </Badge>
                                            </td>

                                            <td style={bakeryStyles.tableCell}>
                                                {(() => {
                                                    const apply = getDiscountApplyType(discount);
                                                    if (apply.type === 'all')
                                                        return (
                                                            <BadgePopover label="Tất cả" count={apply.count} variant="success">
                                                                {renderProductListPopover(discount.products)}
                                                            </BadgePopover>
                                                        );
                                                    if (apply.type === 'category') {
                                                        // Hiển thị rõ tên danh mục và số sản phẩm
                                                        const catName = apply.category ? apply.category.name : 'Theo danh mục';
                                                        return (
                                                            <BadgePopover label={<span>📂 {catName} <span style={{color:'#888',fontWeight:400}}>({apply.count})</span></span>} count={undefined} variant="info">
                                                                {renderProductListPopover(discount.products)}
                                                            </BadgePopover>
                                                        );
                                                    }
                                                    if (apply.type === 'custom')
                                                        return (
                                                            <BadgePopover label="Tùy chọn" count={apply.count} variant="warning">
                                                                {renderProductListPopover(discount.products)}
                                                            </BadgePopover>
                                                        );
                                                    return <span style={{ color: '#a0826d', fontStyle: 'italic' }}>Chưa áp dụng bánh nào</span>;
                                                })()}
                                            </td>

                                            <td style={bakeryStyles.tableCell}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <Button
                                                        size="sm"
                                                        style={{ ...bakeryStyles.actionButton, ...bakeryStyles.editButton }}
                                                        onClick={() => handleEditDiscount(discount)}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 6px 18px rgba(253, 203, 110, 0.4)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.transform = 'translateY(0)';
                                                            e.target.style.boxShadow = '0 4px 12px rgba(253, 203, 110, 0.3)';
                                                        }}
                                                    >
                                                        ✏️ Sửa
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        style={{ ...bakeryStyles.actionButton, ...bakeryStyles.deleteButton }}
                                                        onClick={() => handleDeleteDiscount(discount._id)}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 6px 18px rgba(253, 121, 168, 0.4)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.transform = 'translateY(0)';
                                                            e.target.style.boxShadow = '0 4px 12px rgba(253, 121, 168, 0.3)';
                                                        }}
                                                    >
                                                        🗑️ Xóa
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}

                {/* Modal Thêm/Sửa khuyến mãi */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalType === 'add' ? 'Thêm khuyến mãi mới' : 'Sửa khuyến mãi'}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={modalType === 'add' ? handleAddSubmit : handleEditSubmit}>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên khuyến mãi</Form.Label>
                                <Form.Control name="name" value={addForm.name} onChange={handleAddInput} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phần trăm giảm (%)</Form.Label>
                                <Form.Control name="percent" type="number" min={1} max={100} value={addForm.percent} onChange={handleAddInput} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả</Form.Label>
                                <Form.Control name="description" as="textarea" rows={2} value={addForm.description} onChange={handleAddInput} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check name="active" type="checkbox" label="Kích hoạt ngay" checked={addForm.active} onChange={handleAddInput} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Áp dụng cho</Form.Label>
                                <Form.Select value={applyType} onChange={handleApplyTypeChange}>
                                    <option value="all">Tất cả sản phẩm</option>
                                    <option value="category">Theo danh mục</option>
                                    <option value="custom">Chọn sản phẩm cụ thể</option>
                                </Form.Select>
                            </Form.Group>
                            {applyType === 'category' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Chọn danh mục</Form.Label>
                                    <Form.Select value={selectedCategory} onChange={handleCategoryChange} required>
                                        <option value="">-- Chọn danh mục --</option>
                                        {allCategories.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            )}
                            {applyType === 'custom' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Chọn sản phẩm</Form.Label>
                                    <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
                                        {allProducts.map(p => (
                                            <Form.Check
                                                key={p._id}
                                                type="checkbox"
                                                label={p.name}
                                                value={p._id}
                                                checked={selectedProducts.includes(p._id)}
                                                onChange={handleProductSelect}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" variant="primary" disabled={addLoading}>
                                {addLoading ? (modalType === 'add' ? 'Đang lưu...' : 'Đang cập nhật...') : (modalType === 'add' ? 'Tạo khuyến mãi' : 'Lưu thay đổi')}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Container>
        </div>
    );
}

export default DiscountManagerPage;