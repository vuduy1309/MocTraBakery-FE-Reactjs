import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  OverlayTrigger,
  Tooltip,
  Image,
} from 'react-bootstrap';
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaStar,
  FaGift,
  FaLeaf,
  FaSnowflake,
} from 'react-icons/fa';
import './ProductCard.css';

const API_URL = 'http://localhost:3000'; // Đổi thành domain backend nếu deploy

function ProductCard({
  _id,
  name,
  price,
  image,
  images,
  sizes = [],
  discount,
  isVegetarian,
  isRefrigerated,
  rating: propRating,
  reviewCount: propReviewCount,
  buttonHoverColor = '#A4907C',
  ...rest
}) {
  const [rating, setRating] = useState(typeof propRating === 'number' ? propRating : 0);
  const [reviewCount, setReviewCount] = useState(typeof propReviewCount === 'number' ? propReviewCount : 0);
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  // Tự động chuyển ảnh khi không hover
  React.useEffect(() => {
    let timer;
    const imgArr = Array.isArray(images) ? images : [];
    if (imgArr.length > 1 && !isHovered) {
      timer = setInterval(() => {
        setCurrentImageIdx((prev) => (prev + 1) % imgArr.length);
      }, 2000); // 2s mỗi ảnh
    }
    return () => timer && clearInterval(timer);
  }, [images, isHovered]);

  // Lấy rating/reviewCount thực tế từ API nếu chưa truyền vào hoặc luôn muốn cập nhật mới
  React.useEffect(() => {
    async function fetchRating() {
      try {
        const res = await fetch(`http://localhost:3000/comments?productId=${_id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const avg = data.reduce((sum, c) => sum + (c.rating || 0), 0) / data.length;
          setRating(Number(avg.toFixed(1)));
          setReviewCount(data.length);
        } else {
          setRating(0);
          setReviewCount(0);
        }
      } catch {
        // fallback giữ nguyên rating cũ
      }
    }
    if (_id) fetchRating();
  }, [_id]);
  // Khi hover thì không chuyển, khi hover vào thì giữ nguyên ảnh hiện tại
  React.useEffect(() => {
    if (isHovered) {
      // Không làm gì, giữ nguyên currentImageIdx
    }
  }, [isHovered]);

  // Tìm giá nhỏ nhất trong các size (nếu có)
  let displayPrice = price;
  let sizeLabel = '';
  if (sizes && sizes.length > 0) {
    const minSize = sizes.reduce(
      (min, s) => (s.price < min.price ? s : min),
      sizes[0],
    );
    displayPrice = minSize.price;
    sizeLabel = `Từ ${minSize.name}`;
  }

  // Tính giá khuyến mãi nếu có discount
  let finalPrice = displayPrice;
  let discountPercent = 0;
  if (discount && discount.percent) {
    finalPrice = Math.round(displayPrice * (1 - discount.percent / 100));
    discountPercent = discount.percent;
  } else if (discount && discount.amount) {
    finalPrice = Math.max(0, displayPrice - discount.amount);
    discountPercent = Math.round((discount.amount / displayPrice) * 100);
  }

  const handleCardClick = () => {
    if (_id) navigate(`/products/${_id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    // Logic thêm nhanh vào giỏ hàng
    console.log('Quick add to cart:', _id);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-warning" size={12} />);
    }
    if (hasHalfStar) {
      stars.push(
        <FaStar
          key="half"
          className="text-warning"
          size={12}
          style={{ opacity: 0.5 }}
        />,
      );
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="text-muted" size={12} />,
      );
    }
    return stars;
  };

  // Xử lý ảnh: ưu tiên images từ backend, fallback về image
  let imageUrl = '';
  const imageSource = images || image;
  let imgArr = Array.isArray(imageSource) ? imageSource : [];
  let imgObj = imgArr.length > 0 ? imgArr[currentImageIdx] : null;
  if (typeof imgObj === 'string') {
    imageUrl = imgObj;
  } else if (imgObj && typeof imgObj === 'object') {
    imageUrl = imgObj.image || imgObj.url || '';
  } else if (imageSource && typeof imageSource === 'object' && !Array.isArray(imageSource)) {
    imageUrl = imageSource.image || imageSource.url || '';
  } else if (typeof imageSource === 'string') {
    imageUrl = imageSource;
  }
  // Xử lý URL ảnh
  if (imageUrl) {
    if (imageUrl.startsWith('/uploads')) {
      imageUrl = API_URL + imageUrl;
    } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = API_URL + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
    }
  }

  return (
    <Card
      className="product-card h-100 border-0 shadow-sm position-relative"
      style={{
        cursor: 'pointer',
        transition: 'box-shadow 0.3s cubic-bezier(.4,2,.6,1), transform 0.25s cubic-bezier(.4,2,.6,1)',
        background: '#FAF6F1',
        borderRadius: '1rem',
        boxShadow: isHovered ? '0 8px 32px 0 rgba(164,144,124,0.18)' : '0 2px 8px 0 rgba(164,144,124,0.08)',
        transform: isHovered ? 'translateY(-6px) scale(1.025)' : 'none',
        outline: isHovered ? '2px solid #E9D5B4' : 'none',
        outlineOffset: isHovered ? '2px' : '0',
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <Badge
          bg="danger"
          className="position-absolute top-0 start-0 m-2 px-2 py-1 fs-6"
          style={{ zIndex: 10 }}
        >
          <FaGift className="me-1" size={10} />-{discountPercent}%
        </Badge>
      )}

      {/* Favorite Button */}
      <Button
        variant={isFavorite ? 'danger' : 'light'}
        size="sm"
        className="position-absolute top-0 end-0 m-2 rounded-circle p-1 border-0"
        style={{
          zIndex: 10,
          width: '32px',
          height: '32px',
          backgroundColor: isFavorite ? undefined : 'rgba(255, 255, 255, 0.9)',
        }}
        onClick={handleFavoriteClick}
      >
        {isFavorite ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
      </Button>

      {/* Product Image */}
      <div
        className="position-relative overflow-hidden"
        style={{ height: '200px', background: '#F8F5F0', borderRadius: '1rem 1rem 0 0', transition: 'background 0.3s' }}
      >
        <Image
          src={imageUrl || '/default-product.png'}
          alt={name}
          className="w-100 h-100 object-fit-cover"
          style={{
            transition: 'transform 0.4s cubic-bezier(.4,2,.6,1), filter 0.3s',
            transform: isHovered ? 'scale(1.07)' : 'scale(1)',
            filter: isHovered ? 'brightness(1.04) saturate(1.08)' : 'none',
          }}
        />

        {/* Quick Add Button - appears on hover */}
        {isHovered && (
          <Button
            variant="primary"
            size="sm"
            className="position-absolute bottom-0 end-0 m-2 rounded-circle p-2"
            onClick={handleQuickAdd}
            style={{
              animation: 'slideUp 0.3s cubic-bezier(.4,2,.6,1)',
              width: '40px',
              height: '40px',
              background: '#A4907C',
              border: 'none',
              color: '#fff',
              boxShadow: '0 2px 8px 0 rgba(164,144,124,0.18)',
              transition: 'background 0.2s',
            }}
          >
            <FaShoppingCart size={16} />
          </Button>
        )}
      </div>

      <Card.Body className="p-3">
        {/* Product Features */}
        <div className="d-flex align-items-center mb-2">
          {isVegetarian && (
            <OverlayTrigger overlay={<Tooltip>Thực phẩm chay</Tooltip>}>
              <span className="me-2">
                <FaLeaf color="#6B8E23" size={14} />
              </span>
            </OverlayTrigger>
          )}
          {isRefrigerated && (
            <OverlayTrigger overlay={<Tooltip>Bảo quản lạnh</Tooltip>}>
              <span className="me-2">
                <FaSnowflake color="#7FB3D5" size={14} />
              </span>
            </OverlayTrigger>
          )}
          {sizeLabel && (
            <Badge bg="light" text="dark" className="ms-auto" style={{ background: '#F8F5F0', color: '#6B4F27', border: '1px solid #E9D5B4' }}>
              {sizeLabel}
            </Badge>
          )}
        </div>

        {/* Product Name */}
        <Card.Title
          as="h6"
          className="mb-2 text-truncate fw-bold"
          style={{
            fontSize: '1rem',
            lineHeight: '1.2',
            minHeight: '1.2rem',
          }}
        >
          {name}
        </Card.Title>

        {/* Rating */}
        <div className="d-flex align-items-center mb-2">
          <div className="d-flex align-items-center me-2">
            {renderStars(rating)}
          </div>
          <small className="text-muted">
            ({reviewCount > 0 ? reviewCount : 'Chưa có'} đánh giá)
          </small>
        </div>

        {/* Price */}
        <div className="mb-3">
          {finalPrice !== displayPrice ? (
            <div>
              <span className="h6 fw-bold mb-0" style={{ color: '#4E944F' }}>
                {finalPrice.toLocaleString()}đ
              </span>
              <span className="ms-2 small text-muted text-decoration-line-through">
                {displayPrice.toLocaleString()}đ
              </span>
            </div>
          ) : (
            <span className="h6 fw-bold mb-0" style={{ color: '#4E944F' }}>
              {finalPrice.toLocaleString()}đ
            </span>
          )}
        </div>

        {/* Action Button */}
        <Button
          variant="outline-primary"
          size="sm"
          className="w-100 fw-bold"
          style={{
            borderColor: '#A4907C',
            color: isBtnHovered ? '#fff' : '#A4907C',
            background: isBtnHovered ? buttonHoverColor : 'transparent',
            transition: 'all 0.2s',
          }}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          Xem chi tiết
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
