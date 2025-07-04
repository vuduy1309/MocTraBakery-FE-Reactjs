import React from 'react';
import { BsFacebook, BsMessenger, BsTelephone, BsGeoAlt, BsEnvelope, BsClock } from 'react-icons/bs';

function Footer() {
  // Màu chủ đạo mới
  const mainBg = '#E9D5B4'; // Đậm hơn nữa, tông be nâu rõ rệt
  const mainText = '#4E2E0E'; // Nâu gỗ rất đậm
  const descText = '#3E2723'; // Nâu xám rất đậm
  const accent = '#FF6F00'; // Cam đậm nổi bật
  const border = '#bfa06a'; // Border nâu vàng đậm
  const iconGreen = '#2D5016'; // Xanh lá đậm nhất
  const iconBrown = '#4E2E0E';
  const iconOrange = '#FF6F00';
  const iconShadow = '0 2px 6px rgba(78, 46, 14, 0.22)';
  return (
    <footer 
      style={{
        background: mainBg,
        borderTop: `3px solid ${accent}`,
        color: mainText,
        padding: '3rem 0',
        marginTop: 'auto',
        fontFamily: 'inherit',
      }}
    >
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 1rem'}}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company Info */}
          <div>
            <div style={{marginBottom: '1.5rem'}}>
              <h5 style={{
                fontWeight: 'bold',
                color: accent,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: '1px',
              }}>
                <span style={{marginRight: '0.5rem', fontSize: '1.5rem'}}>🍰</span>
                Mộc Trà Bakery
              </h5>
              <p style={{
                color: descText,
                marginBottom: '1rem',
                lineHeight: '1.6',
                fontSize: '0.95rem',
                opacity: '0.95',
              }}>
                Tiệm bánh thủ công với hương vị truyền thống, mang đến những sản phẩm bánh tươi ngon, 
                được làm từ nguyên liệu chất lượng cao.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: accent,
                marginBottom: '0.5rem',
                opacity: '0.95',
              }}>
                <BsClock style={{marginRight: '0.5rem', color: accent}} />
                <span style={{fontSize: '0.9rem'}}>Mở cửa: 6:00 - 22:00 hàng ngày</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h6 style={{
              fontWeight: 'bold',
              color: accent,
              marginBottom: '1rem',
              letterSpacing: '0.5px',
            }}>
              Thông tin liên hệ
            </h6>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  borderRadius: '50%',
                  backgroundColor: iconGreen,
                  width: '35px',
                  height: '35px',
                  boxShadow: iconShadow,
                }}>
                  <BsGeoAlt size={16} style={{color: '#fff'}} />
                </div>
                <div>
                  <div style={{fontWeight: '500', marginBottom: '0.25rem', color: mainText}}>Địa chỉ</div>
                  <div style={{color: descText, fontSize: '0.9rem', opacity: '0.95'}}>123 Đường Admin, TP. HCM</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  borderRadius: '50%',
                  backgroundColor: iconOrange,
                  width: '35px',
                  height: '35px',
                  boxShadow: iconShadow,
                }}>
                  <BsTelephone size={16} style={{color: '#fff'}} />
                </div>
                <div>
                  <div style={{fontWeight: '500', marginBottom: '0.25rem', color: mainText}}>Hotline</div>
                  <a 
                    href="tel:0901234567" 
                    style={{
                      color: accent,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.3s ease',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF9800'}
                    onMouseLeave={(e) => e.target.style.color = accent}
                  >
                    0901 234 567
                  </a>
                </div>
              </div>

              <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  borderRadius: '50%',
                  backgroundColor: iconBrown,
                  width: '35px',
                  height: '35px',
                  boxShadow: iconShadow,
                }}>
                  <BsEnvelope size={16} style={{color: '#fff'}} />
                </div>
                <div>
                  <div style={{fontWeight: '500', marginBottom: '0.25rem', color: mainText}}>Email</div>
                  <a 
                    href="mailto:info@moctrabakery.com" 
                    style={{
                      color: accent,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'color 0.3s ease',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#FF9800'}
                    onMouseLeave={(e) => e.target.style.color = accent}
                  >
                    info@moctrabakery.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h6 style={{
              fontWeight: 'bold',
              color: accent,
              marginBottom: '1rem',
              letterSpacing: '0.5px',
            }}>
              Kết nối với chúng tôi
            </h6>
            <p style={{
              color: descText,
              fontSize: '0.9rem',
              marginBottom: '1rem',
              opacity: '0.95',
            }}>
              Theo dõi chúng tôi để cập nhật những sản phẩm mới và ưu đãi hấp dẫn!
            </p>
            
            <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: iconGreen,
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 8px rgba(74, 124, 89, 0.13)',
                  border: `2px solid ${accent}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = accent;
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 6px 12px rgba(255, 179, 102, 0.18)';
                  e.target.style.borderColor = iconGreen;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = iconGreen;
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 8px rgba(74, 124, 89, 0.13)';
                  e.target.style.borderColor = accent;
                }}
              >
                <BsFacebook style={{marginRight: '0.5rem'}} size={20} />
                Facebook
              </a>

              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: accent,
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 8px rgba(255, 179, 102, 0.13)',
                  border: `2px solid ${iconGreen}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = iconGreen;
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 6px 12px rgba(74, 124, 89, 0.18)';
                  e.target.style.borderColor = accent;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = accent;
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 8px rgba(255, 179, 102, 0.13)';
                  e.target.style.borderColor = iconGreen;
                }}
              >
                <BsMessenger style={{marginRight: '0.5rem'}} size={20} />
                Zalo
              </a>
            </div>

            {/* Additional info */}
            <div style={{
              backgroundColor: '#FEFCF8',
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${border}`,
              marginTop: '1rem',
            }}>
              <p style={{
                color: descText,
                fontSize: '0.85rem',
                margin: '0',
                opacity: '0.95',
                textAlign: 'center',
              }}>
                <strong style={{color: accent}}>Cam kết:</strong> Sản phẩm tươi ngon, an toàn thực phẩm
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: `1px solid ${border}`,
          paddingTop: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{
            color: descText,
            fontSize: '0.85rem',
            margin: '0',
            opacity: '0.95',
          }}>
            © 2024 <span style={{color: accent, fontWeight: '500'}}>Mộc Trà Bakery</span>. 
            Tất cả quyền được bảo lưu. | Thiết kế với ❤️ tại Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;