import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Badge,
  Spinner,
  Alert,
  Carousel,
  Image,
} from 'react-bootstrap';
import {
  FaStore,
  FaLeaf,
  FaHeart,
  FaShippingFast,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaStar,
  FaQuoteLeft,
} from 'react-icons/fa';
import './HomePage.css';
import './HomePage.custom.css';
import ProductCard from '../components/product/ProductCard';
import api from '../api';

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promo, setPromo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/homepage-data');
        setFeaturedProducts(res.data.featuredProducts || []);
        setPromo(res.data.promo || null);
        setReviews(res.data.reviews || []);
        setDiscounts(res.data.discounts || []);
      } catch (err) {
        setError('Không thể tải dữ liệu trang chủ');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const features = [
    {
      icon: <FaLeaf className="feature-icon-leaf" size={40} />,
      title: 'Nguyên liệu tự nhiên',
      description: '100% nguyên liệu tươi ngon, không chất bảo quản',
    },
    {
      icon: <FaHeart className="feature-icon-heart" size={40} />,
      title: 'Làm bằng tình yêu',
      description: 'Mỗi chiếc bánh được làm với tâm huyết và tình yêu',
    },
    {
      icon: <FaShippingFast className="feature-icon-ship" size={40} />,
      title: 'Giao hàng nhanh',
      description: 'Giao hàng tận nơi trong 30 phút',
    },
    {
      icon: <FaStore className="feature-icon-store" size={40} />,
      title: 'Cửa hàng uy tín',
      description: 'Hơn 5 năm phục vụ khách hàng tận tâm',
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Banner */}
      <section className="hero-section bg-gradient-hero py-5 mb-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-4 hero-title">
                Mộc Trà Bakery
              </h1>
              <p className="lead mb-4 fs-5 hero-desc">
                Ngọt ngào từ tâm - Bánh tươi mỗi ngày
              </p>
              <p className="mb-4 hero-desc">
                Khám phá thế giới bánh ngọt tuyệt vời với hương vị đặc biệt,
                được chế biến từ những nguyên liệu tươi ngon nhất.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                <Button
                  size="lg"
                  onClick={() => (window.location.href = '/products')}
                  className="px-4 py-2 fw-bold btn-order-now"
                >
                  Đặt hàng ngay
                </Button>
                <Button size="lg" className="px-4 py-2 fw-bold btn-learn-more">
                  Tìm hiểu thêm
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center mt-4 mt-lg-0">
              <div className="rounded-3 shadow-lg hero-logo-bg d-inline-block p-3">
                <Image
                  src="/Mộc Trà Bakery.png"
                  alt="Mộc Trà Bakery"
                  className="img-fluid rounded-3 hero-logo-text"
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Container>
        {/* Features Section */}
        <section className="features-section features-section-bg mb-5 rounded-4 py-3 px-2">
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-6 fw-bold features-title mb-3">
                Tại sao chọn chúng tôi?
              </h2>
              <p className="lead features-desc">
                Cam kết mang đến những sản phẩm chất lượng cao với dịch vụ tốt
                nhất
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={3} md={6} key={index}>
                <Card className="h-100 border-0 shadow-sm text-center feature-card">
                  <Card.Body className="p-4">
                    <div className="mb-3">{feature.icon}</div>
                    <Card.Title className="h5 mb-3 feature-card-title">
                      {feature.title}
                    </Card.Title>
                    <Card.Text className="feature-card-desc">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Featured Products Section */}
        <section className="featured-section mb-5">
          <Row className="text-center mb-4">
            <Col>
              <h2 className="display-6 fw-bold text-soft-beige mb-3">
                Sản phẩm nổi bật
              </h2>
              <p className="lead text-muted">
                Những sản phẩm được khách hàng yêu thích nhất
              </p>
            </Col>
          </Row>

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="text-center">
              <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {!loading && !error && (
            <>
              <Row className="g-4 mb-4">
                {featuredProducts.slice(0, 8).map((product, index) => (
                  <Col lg={3} md={4} sm={6} key={product._id || index}>
                    <ProductCard
                      {...product}
                      discount={
                        product.discountId &&
                        (typeof product.discountId === 'object'
                          ? product.discountId
                          : null)
                      }
                    />
                  </Col>
                ))}
              </Row>
              <div className="text-center">
                <Button
                  variant="soft-beige"
                  size="lg"
                  onClick={() => (window.location.href = '/products')}
                  className="px-5 py-3 fw-bold btn-soft-beige"
                >
                  Xem tất cả sản phẩm
                </Button>
              </div>
            </>
          )}
        </section>

        {/* Promo Section */}
        {discounts && discounts.length > 0 && (
          <section className="promo-section mb-5">
            <Card className="bg-gradient-soft-beige text-soft-beige border-0">
              <Card.Body className="p-5 text-center">
                <h2 className="display-6 fw-bold mb-3">
                  <FaStar className="me-2" />
                  Ưu đãi nổi bật
                </h2>
                <div className="lead">
                  <div className="fw-bold mb-2">{discounts[0].name || 'Ưu đãi đặc biệt'}</div>
                  {discounts[0].description || discounts[0].content || 'Hãy khám phá các ưu đãi hấp dẫn tại Mộc Trà Bakery!'}
                </div>
                {discounts[0].code && (
                  <div className="mt-3">
                    <Badge bg="warning" text="dark" className="fs-5 px-3 py-2">Mã: {discounts[0].code}</Badge>
                  </div>
                )}
                {discounts[0].percent && (
                  <div className="mt-2 text-success fw-bold">Giảm {discounts[0].percent}%</div>
                )}
                {discounts[0].amount && (
                  <div className="mt-2 text-success fw-bold">Giảm {discounts[0].amount.toLocaleString()}đ</div>
                )}
              </Card.Body>
            </Card>
          </section>
        )}

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <section className="review-section mb-5">
            <Row className="text-center mb-4">
              <Col>
                <h2 className="display-6 fw-bold text-soft-beige mb-3">
                  Khách hàng nói gì?
                </h2>
                <p className="lead text-muted">
                  Những đánh giá chân thực từ khách hàng của chúng tôi
                </p>
              </Col>
            </Row>
            <Carousel interval={5000} className="review-carousel">
              {reviews.map((review, index) => {
                let authorName = 'Ẩn danh';
                if (review.author && typeof review.author === 'object') {
                  authorName = review.author.fullName || review.author.name || review.author.email || 'Ẩn danh';
                } else if (typeof review.author === 'string') {
                  // Nếu là id, không hiển thị, nếu là tên thì giữ tên
                  if (/^[0-9a-fA-F]{24}$/.test(review.author)) {
                    authorName = 'Ẩn danh';
                  } else {
                    authorName = review.author;
                  }
                }
                return (
                  <Carousel.Item key={index}>
                    <Card
                      className="border-0 shadow-sm mx-auto"
                      style={{ maxWidth: '600px' }}
                    >
                      <Card.Body className="p-4 text-center">
                        <FaQuoteLeft className="text-soft-beige mb-3" size={30} />
                        <blockquote className="mb-3 fs-5 fst-italic">
                          "{review.content}"
                        </blockquote>
                        <div className="d-flex justify-content-center mb-2">
                          {[...Array(Math.round(review.rating || 5))].map((_, i) => (
                            <FaStar key={i} className="text-warning me-1" />
                          ))}
                        </div>
                        <cite className="fw-bold text-soft-beige">
                          — {authorName}
                        </cite>
                      </Card.Body>
                    </Card>
                  </Carousel.Item>
                );
              })}
            </Carousel>
          </section>
        )}
      </Container>
    </div>
  );
}

export default HomePage;
