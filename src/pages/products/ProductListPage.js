import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Card,
  Spinner,
  Alert,
  Badge,
  Button
} from 'react-bootstrap';
import api from '../../api';
import ProductCard from '../../components/product/ProductCard';
import './ProductListPage.css';

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [origin, setOrigin] = useState('');
  const [isRefrigerated, setIsRefrigerated] = useState('');
  const [isVegetarian, setIsVegetarian] = useState('');
  const [minCalories, setMinCalories] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  const [minShelfLife, setMinShelfLife] = useState('');
  const [maxShelfLife, setMaxShelfLife] = useState('');
  const [flavor, setFlavor] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        setProducts(productRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        setError('Không thể tải dữ liệu');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Lọc sản phẩm theo search, category, giá và các trường phụ
  // Lọc sản phẩm chỉ hiển thị isActive === true và các điều kiện khác
  const activeProducts = products.filter((p) => p.isActive === true);
  const filteredProducts = activeProducts.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    let matchCategory = true;
    if (category) {
      if (typeof p.categoryId === 'object' && p.categoryId !== null) {
        matchCategory = p.categoryId._id === category;
      } else {
        matchCategory = p.categoryId === category;
      }
    }
    let matchPrice = true;
    const price = typeof p.price === 'number' ? p.price : parseInt(p.price || '0');
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : Infinity;
    matchPrice = price >= min && price <= max;

    // Origin
    let matchOrigin = true;
    if (origin) {
      matchOrigin = (p.origin || '').toLowerCase().includes(origin.toLowerCase());
    }
    // isRefrigerated
    let matchRefrigerated = true;
    if (isRefrigerated) {
      matchRefrigerated = String(p.isRefrigerated) === isRefrigerated;
    }
    // isVegetarian
    let matchVegetarian = true;
    if (isVegetarian) {
      matchVegetarian = String(p.isVegetarian) === isVegetarian;
    }
    // Calories
    let matchCalories = true;
    const cal = typeof p.calories === 'number' ? p.calories : parseInt(p.calories || '0');
    const minC = minCalories ? parseInt(minCalories) : 0;
    const maxC = maxCalories ? parseInt(maxCalories) : Infinity;
    matchCalories = cal >= minC && cal <= maxC;
    // Shelf life
    let matchShelf = true;
    const shelf = typeof p.shelfLifeDays === 'number' ? p.shelfLifeDays : parseInt(p.shelfLifeDays || '0');
    const minSh = minShelfLife ? parseInt(minShelfLife) : 0;
    const maxSh = maxShelfLife ? parseInt(maxShelfLife) : Infinity;
    matchShelf = shelf >= minSh && shelf <= maxSh;
    // Flavor
    let matchFlavor = true;
    if (flavor) {
      matchFlavor = Array.isArray(p.includedFlavors) && p.includedFlavors.includes(flavor);
    }
    return (
      matchName && matchCategory && matchPrice && matchOrigin &&
      matchRefrigerated && matchVegetarian && matchCalories && matchShelf && matchFlavor
    );
  });

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setOrigin('');
    setIsRefrigerated('');
    setIsVegetarian('');
    setMinCalories('');
    setMaxCalories('');
    setMinShelfLife('');
    setMaxShelfLife('');
    setFlavor('');
  };

  return (

    <div className="product-list-page" style={{ background: '#F8F5F0', minHeight: '100vh', padding: '1.5rem 0' }}>
      <Container fluid className="px-4">

        {/* Header Section - ĐÃ KHÔI PHỤC */}
        <Row className="mb-4">
          <Col>
            <div className="py-4 text-center">
              <h1 className="fw-bold mb-2" style={{ color: '#6B4F27', fontSize: '2.5rem', letterSpacing: '1px' }}>
                Danh sách sản phẩm
              </h1>
              <p className="lead mb-0" style={{ color: '#8B6F3A' }}>
                Khám phá các sản phẩm bánh tươi, trà và đồ ăn vặt chất lượng từ Mộc Trà Bakery. Lọc, tìm kiếm và chọn món bạn yêu thích!
              </p>
            </div>
          </Col>
        </Row>

        {/* Search Section - Giữ nguyên vị trí */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0" style={{ background: '#FAF6F1' }}>
              <Card.Body className="p-4">
                <Row className="justify-content-center">
                  <Col lg={8}>
                    <Form.Label className="fw-semibold mb-2" style={{ color: '#8B6F3A' }}>
                      Tìm kiếm sản phẩm
                    </Form.Label>
                    <InputGroup size="lg">
                      <InputGroup.Text className="bg-white border-end-0">
                        <i className="fas fa-search" style={{ color: '#A4907C' }}></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên sản phẩm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-start-0 ps-0"
                        style={{ boxShadow: 'none' }}
                      />
                      {search && (
                        <Button
                          variant="outline-secondary"
                          onClick={() => setSearch('')}
                          className="border-start-0"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      )}
                    </InputGroup>
                  </Col>
                </Row>

                {/* Search Summary */}
                {search && (
                  <Row className="mt-3 pt-3 border-top justify-content-center">
                    <Col lg={8}>
                      <small className="text-muted">
                        Tìm kiếm: <strong>"{search}"</strong>
                      </small>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row className="g-4">
          {/* Sidebar Filter - Bên trái */}
          <Col lg={3}>
            <Card className="shadow-sm border-0 sticky-top" style={{ background: '#FAF6F1', top: '20px' }}>
              <Card.Header className="bg-transparent border-0 pt-4 pb-2">
                <h5 className="mb-0 fw-bold d-flex align-items-center" style={{ color: '#6B4F27' }}>
                  <i className="fas fa-filter me-2" style={{ color: '#A4907C' }}></i>
                  Bộ lọc
                </h5>
              </Card.Header>
              <Card.Body className="pt-2">
        {/* Category Filter - Đầu tiên */}
        <div className="mb-4">
          <Form.Label className="fw-semibold mb-3 d-block" style={{ color: '#8B6F3A' }}>
            <i className="fas fa-tag me-2" style={{ color: '#A4907C' }}></i>
            Danh mục
          </Form.Label>
          <div className="category-list">
            <Form.Check
              type="radio"
              id="category-all"
              name="category"
              label="Tất cả danh mục"
              checked={category === ''}
              onChange={() => setCategory('')}
              className="mb-2 category-radio"
            />
            {categories.map(c => (
              <Form.Check
                key={c._id}
                type="radio"
                id={`category-${c._id}`}
                name="category"
                label={c.name}
                checked={category === c._id}
                onChange={() => setCategory(c._id)}
                className="mb-2 category-radio"
              />
            ))}
          </div>
        </div>

        {/* Origin Filter - Thứ hai */}
        <div className="mb-4">
          <Form.Label className="fw-semibold mb-3 d-block" style={{ color: '#8B6F3A' }}>
            <i className="fas fa-globe me-2" style={{ color: '#A4907C' }}></i>
            Xuất xứ
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập xuất xứ..."
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            style={{ boxShadow: 'none', borderColor: '#D4C4B0' }}
          />
        </div>

        {/* Bảo quản lạnh & Chay - Thứ ba */}
        <div className="mb-4">
          <Form.Check
            type="checkbox"
            id="refrigerated"
            label="Bảo quản lạnh"
            checked={isRefrigerated === 'true'}
            onChange={e => setIsRefrigerated(e.target.checked ? 'true' : '')}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            id="vegetarian"
            label="Sản phẩm chay"
            checked={isVegetarian === 'true'}
            onChange={e => setIsVegetarian(e.target.checked ? 'true' : '')}
          />
        </div>

        {/* Price Range Filter - Cuối cùng */}
        <div className="mb-4">
          <Form.Label className="fw-semibold mb-3 d-block" style={{ color: '#8B6F3A' }}>
            <i className="fas fa-money-bill-wave me-2" style={{ color: '#A4907C' }}></i>
            Khoảng giá
          </Form.Label>
          <Row className="g-2">
            <Col>
              <Form.Control
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                style={{ boxShadow: 'none', borderColor: '#D4C4B0' }}
                min="0"
              />
              <small className="text-muted">VNĐ</small>
            </Col>
            <Col xs="auto" className="d-flex align-items-center">
              <span style={{ color: '#A4907C' }}>-</span>
            </Col>
            <Col>
              <Form.Control
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                style={{ boxShadow: 'none', borderColor: '#D4C4B0' }}
                min="0"
              />
              <small className="text-muted">VNĐ</small>
            </Col>
          </Row>
        </div>

                {/* Filter Summary & Clear */}
                <div className="border-top pt-3">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <Badge pill className="fs-6 px-3 py-2" style={{ background: '#A4907C', color: '#fff' }}>
                      <i className="fas fa-box me-2"></i>
                      {filteredProducts.length} sản phẩm
                    </Badge>
                  </div>

                  {(category || minPrice || maxPrice) && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={clearFilters}
                      className="w-100 d-flex align-items-center justify-content-center"
                      style={{ borderColor: '#A4907C', color: '#A4907C' }}
                    >
                      <i className="fas fa-times me-2"></i>
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Products Content - Bên phải */}
          <Col lg={9}>
            {/* Loading State */}
            {loading && (
              <div className="d-flex justify-content-center py-5">
                <div className="text-center">
                  <Spinner
                    animation="border"
                    style={{ width: '3rem', height: '3rem', color: '#A4907C' }}
                  />
                  <div className="mt-3">
                    <h5 style={{ color: '#A4907C' }}>Đang tải sản phẩm...</h5>
                    <p className="mb-0" style={{ color: '#8B6F3A' }}>Vui lòng chờ trong giây lát</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert style={{ background: '#FAF6F1', color: '#6B4F27', border: '1px solid #A4907C' }} className="d-flex align-items-center py-3">
                <i className="fas fa-exclamation-circle me-3 fa-lg" style={{ color: '#A4907C' }}></i>
                <div>
                  <strong>Có lỗi xảy ra!</strong> {error}
                </div>
              </Alert>
            )}

            {/* Products Grid */}
            {!loading && filteredProducts.length > 0 && (
              <>
                <Row className="g-4">
                  {filteredProducts.map((p) => (
                    <Col key={p._id} xs={12} sm={6} xl={4}>
                      <div className="h-100 product-card-hover" style={{ background: '#FAF6F1', borderRadius: '1rem' }}>
                        <ProductCard
                          {...p}
                          discount={p.discountId && (typeof p.discountId === 'object' ? p.discountId : null)}
                          buttonHoverColor="#A4907C"
                        />
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Results Summary */}
                <div className="mt-5">
                  <div className="text-center py-4 border-top">
                    <p className="mb-0" style={{ color: '#8B6F3A' }}>
                      Hiển thị <strong style={{ color: '#6B4F27' }}>{filteredProducts.length}</strong> trong
                      tổng số <strong style={{ color: '#6B4F27' }}>{activeProducts.length}</strong> sản phẩm
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="d-flex justify-content-center py-5">
                <div className="text-center py-5">
                  <div className="d-inline-flex align-items-center justify-content-center"
                    style={{ width: '100px', height: '100px', background: '#FAF6F1', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <i className="fas fa-box-open fa-3x" style={{ color: '#A4907C' }}></i>
                  </div>
                  <h4 className="mb-3" style={{ color: '#A4907C' }}>Không có sản phẩm phù hợp</h4>
                  <p className="mb-4" style={{ color: '#8B6F3A' }}>
                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục để tìm sản phẩm bạn cần
                  </p>
                  {(search || category || minPrice || maxPrice) && (
                    <Button
                      style={{ background: '#A4907C', border: 'none' }}
                      onClick={clearFilters}
                      className="d-flex align-items-center mx-auto"
                    >
                      <i className="fas fa-redo me-2"></i>
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProductListPage;