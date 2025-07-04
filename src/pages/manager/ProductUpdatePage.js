import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../../api';

const allProductFields = [
  { name: 'origin', label: 'Xuất xứ', type: 'text' },
  { name: 'shelfLifeDays', label: 'Hạn sử dụng (ngày)', type: 'number' },
  { name: 'isRefrigerated', label: 'Bảo quản lạnh', type: 'text' },
  { name: 'isVegetarian', label: 'Chay', type: 'text' },
  { name: 'calories', label: 'Calories', type: 'number' },
  {
    name: 'includedFlavors',
    label: 'Hương vị kèm theo (danh sách)',
    type: 'text',
  },
  { name: 'packaging', label: 'Đóng gói', type: 'text' },
  {
    name: 'sizes',
    label: 'Kích cỡ (Small, Medium, Large)',
    type: 'multiselect',
  },
];

const defaultFields = [
  { name: 'name', label: 'Tên sản phẩm', required: true, type: 'text' },
  { name: 'price', label: 'Giá', required: true, type: 'number' },
  { name: 'stock', label: 'Tồn kho', required: true, type: 'number' },
  { name: 'categoryId', label: 'Danh mục (ID)', required: false, type: 'text' },
  { name: 'origin', label: 'Xuất xứ', required: false, type: 'text' },
  { name: 'isActive', label: 'Kích hoạt', required: false, type: 'text' },
  {
    name: 'images',
    label: 'Ảnh (URL, cách nhau bởi dấu phẩy)',
    required: false,
    type: 'text',
  },
  { name: 'description', label: 'Mô tả', required: false, type: 'text' },
];

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

function ProductUpdatePage() {
  const { id } = useParams();
  const [fields, setFields] = useState(defaultFields);
  const [form, setForm] = useState({});
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ cho Admin và ProductManager truy cập
    const user = getUserFromToken();
    if (!user || (user.role !== 'Admin' && user.role !== 'ProductManager')) {
      navigate('/login');
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products/${id}`),
        ]);
        setCategories(catRes.data);
        const prod = prodRes.data;
        // Lưu lại ảnh cũ và category cũ để so sánh khi submit
        setForm({ ...prod, _oldImages: prod.images, _oldCategoryId: prod.categoryId });
        // Thêm các trường động nếu có dữ liệu thực sự
        const dynamicFields = allProductFields.filter((f) => {
          if (defaultFields.some((df) => df.name === f.name)) return false;
          const val = prod[f.name];
          if (val === undefined || val === null) return false;
          if (Array.isArray(val) && val.length === 0) return false;
          if (typeof val === 'string' && val.trim() === '') return false;
          if (typeof val === 'object' && Object.keys(val).length === 0) return false;
          return true;
        });
        setFields([...defaultFields, ...dynamicFields.map(f => ({ ...f, required: false }))]);
      } catch (err) {
        setError('Không thể tải dữ liệu sản phẩm hoặc danh mục.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) return;
    if (fields.some((f) => f.name === newField.name)) return;
    const found = allProductFields.find((f) => f.name === newField.name);
    if (!found) return;
    setFields([...fields, { ...found, required: false }]);
    setNewField({ name: '', label: '', type: 'text' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    for (let f of fields) {
      if (f.required && !form[f.name]) {
        setError(`Vui lòng nhập ${f.label}`);
        return;
      }
    }

    // Validate giá và tồn kho
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (isNaN(price) || price < 1000) {
      setError('Giá sản phẩm phải lớn hơn hoặc bằng 1000');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setError('Tồn kho không được âm');
      return;
    }

    // Validate sizes nếu có
    if (form.sizes && Array.isArray(form.sizes) && form.sizes.length > 0) {
      // Chỉ cho phép tối đa 3 size: small, medium, large, không trùng lặp
      const allowedSizes = ['small', 'medium', 'large'];
      const sizeNames = form.sizes.map((sz) => sz.name);
      const uniqueNames = Array.from(new Set(sizeNames));
      if (uniqueNames.length !== sizeNames.length) {
        setError('Không được chọn trùng size.');
        return;
      }
      if (!uniqueNames.every((n) => allowedSizes.includes(n))) {
        setError('Chỉ được chọn các size: Small, Medium, Large.');
        return;
      }
      if (uniqueNames.length > 3) {
        setError('Chỉ được thêm tối đa 3 size: Small, Medium, Large.');
        return;
      }

      // Validate giá các size
      let small = form.sizes.find((sz) => sz.name === 'small');
      let medium = form.sizes.find((sz) => sz.name === 'medium');
      let large = form.sizes.find((sz) => sz.name === 'large');
      let smallPrice = small ? Number(small.price) : null;
      let mediumPrice = medium ? Number(medium.price) : null;
      let largePrice = large ? Number(large.price) : null;
      if (small && (isNaN(smallPrice) || smallPrice < 1000)) {
        setError('Giá của size Small phải lớn hơn hoặc bằng 1000');
        return;
      }
      if (medium && (isNaN(mediumPrice) || mediumPrice < 1000)) {
        setError('Giá của size Medium phải lớn hơn hoặc bằng 1000');
        return;
      }
      if (large && (isNaN(largePrice) || largePrice < 1000)) {
        setError('Giá của size Large phải lớn hơn hoặc bằng 1000');
        return;
      }
      // So sánh giá
      if (small && medium && smallPrice >= mediumPrice) {
        setError('Giá Small phải nhỏ hơn Medium');
        return;
      }
      if (medium && large && mediumPrice >= largePrice) {
        setError('Giá Medium phải nhỏ hơn Large');
        return;
      }
      if (small && large && smallPrice >= largePrice) {
        setError('Giá Small phải nhỏ hơn Large');
        return;
      }
      // Giá trị tăng dần: small < medium < large
      if (small && medium && large && !(smallPrice < mediumPrice && mediumPrice < largePrice)) {
        setError('Giá phải theo thứ tự: Small < Medium < Large');
        return;
      }

      // Validate giá sản phẩm chính so với size
      if (medium) {
        if (price !== mediumPrice) {
          setError('Nếu có size Medium thì giá sản phẩm phải bằng giá của size Medium');
          return;
        }
      } else {
        // Không có medium, chỉ có small hoặc large
        if (large && price >= largePrice) {
          setError('Giá sản phẩm phải nhỏ hơn giá của size Large');
          return;
        }
        if (small && price <= smallPrice) {
          setError('Giá sản phẩm phải lớn hơn giá của size Small');
          return;
        }
      }

      // Tổng stock các size phải bằng stock tổng
      const totalSizeStock = form.sizes.reduce((sum, sz) => sum + Number(sz.stock || 0), 0);
      if (totalSizeStock !== stock) {
        setError('Tổng số lượng tồn kho của các size phải bằng tồn kho tổng');
        return;
      }
      // Không cho nhập stock tổng nhỏ hơn tổng stock các size
      if (stock < totalSizeStock) {
        setError('Tồn kho tổng không được nhỏ hơn tổng tồn kho các size');
        return;
      }
    }

    let submitData = { ...form };

    // Xử lý ảnh: tách riêng File (ảnh mới) và string (ảnh cũ)
    let newFiles = [];
    let oldImages = [];
    if (Array.isArray(form.images) && form.images.length > 0) {
      newFiles = form.images.filter(img => img instanceof File);
      oldImages = form.images.filter(img => typeof img === 'string' && img.trim() !== '');
    } else if (Array.isArray(form._oldImages)) {
      oldImages = form._oldImages.filter(img => typeof img === 'string' && img.trim() !== '');
    }

    // Upload tất cả ảnh mới
    const uploadedUrls = [];
    for (let file of newFiles) {
      const data = new FormData();
      data.append('file', file);
      try {
        const res = await api.post('/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(res.data.url);
      } catch (err) {
        setError('Lỗi upload ảnh: ' + (err.response?.data?.message || err.message));
        return;
      }
    }
    submitData.images = [...oldImages, ...uploadedUrls];

    // Danh mục: Nếu không thay đổi thì giữ category cũ
    if (!submitData.categoryId || submitData.categoryId === '' || (typeof submitData.categoryId === 'object' && submitData.categoryId !== null)) {
      // Nếu là object (populate) hoặc rỗng thì lấy lại id cũ
      if (typeof form._oldCategoryId === 'object' && form._oldCategoryId !== null) {
        submitData.categoryId = form._oldCategoryId._id;
      } else {
        submitData.categoryId = form._oldCategoryId;
      }
    }

    // Xóa các trường tạm
    delete submitData._oldImages;
    delete submitData._oldCategoryId;

    // --- Xác định các field bị xóa để gửi $unset ---
    // Lấy danh sách field cũ (từ _oldProductFields)
    // Ta sẽ lấy keys của sản phẩm ban đầu (prod) và so sánh với keys hiện tại
    // Để đơn giản, lấy từ form._oldProductFields nếu có, hoặc từ form._oldImages, _oldCategoryId, hoặc từ fields ban đầu
    // Nhưng ở đây, ta sẽ lấy từ các trường động allProductFields
    const oldDynamicFields = allProductFields
      .map(f => f.name)
      .filter(name => form[name] !== undefined || (form._oldImages && name === 'images') || (form._oldCategoryId && name === 'categoryId'));
    // Các field hiện tại (sau khi đã xóa trên FE)
    const currentFields = fields.map(f => f.name);
    // Các field động đã bị xóa
    const removedFields = oldDynamicFields.filter(name => !currentFields.includes(name));
    // Nếu có field bị xóa, gửi $unset và xóa field đó khỏi submitData để tránh conflict MongoDB
    if (removedFields.length > 0) {
      submitData.$unset = {};
      removedFields.forEach(name => {
        submitData.$unset[name] = "";
        delete submitData[name];
      });
    }

    try {
      await api.put(`/products/${id}`, submitData);
      setSuccess('Cập nhật sản phẩm thành công!');
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Lỗi không xác định',
      );
    }
  };

  // Xóa các thuộc tính không phải mặc định
  const handleRemoveCustomFields = () => {
    setFields(defaultFields);
    // Xóa giá trị các thuộc tính khỏi form
    const newForm = { ...form };
    Object.keys(newForm).forEach((key) => {
      if (!defaultFields.some((f) => f.name === key)) {
        delete newForm[key];
      }
    });
    setForm(newForm);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" /> Đang tải dữ liệu...
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h3>Cập nhật sản phẩm</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row>
          {fields.map((f) => (
            <Col md={6} key={f.name} className="mb-3">
              <Form.Group>
                <Form.Label>
                  {f.label}{' '}
                  {f.required && <span style={{ color: 'red' }}>*</span>}
                  {/* Chỉ cho phép xóa các trường động vừa được thêm vào (không có dữ liệu từ DB) */}
                  {!defaultFields.some((df) => df.name === f.name) && form[f.name] === undefined && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      style={{ float: 'right', padding: '0 6px', fontSize: 13 }}
                      onClick={() => {
                        setFields(fields.filter((ff) => ff.name !== f.name));
                        // Không cần xóa khỏi form vì chưa có dữ liệu
                      }}
                    >
                      Xóa
                    </Button>
                  )}
                </Form.Label>
                {f.name === 'categoryId' ? (
                  <div>
                    {form._oldCategoryId && categories.length > 0 && (
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
                        Danh mục hiện tại:{' '}
                        <b>
                          {(() => {
                            // Nếu _oldCategoryId là object (populate), lấy name, nếu là string thì tìm trong categories
                            if (typeof form._oldCategoryId === 'object' && form._oldCategoryId !== null) {
                              return form._oldCategoryId.name || '';
                            }
                            const cat = categories.find(c => c._id === form._oldCategoryId);
                            return cat ? cat.name : form._oldCategoryId;
                          })()}
                        </b>
                      </div>
                    )}
                    <Form.Select
                      name="categoryId"
                      value={form['categoryId'] || ''}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                ) : f.name === 'images' ? (
                  <div>
                    {form._oldImages && Array.isArray(form._oldImages) && form._oldImages.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 13, color: '#888' }}>Ảnh hiện tại:</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {form._oldImages.map((img, idx) => {
                            let src = '';
                            if (typeof img === 'string') {
                              if (img.startsWith('http')) {
                                src = img;
                              } else {
                                src = `http://localhost:3000${img.startsWith('/') ? '' : '/'}${img}`;
                              }
                            } else {
                              src = '';
                            }
                            return (
                              <div key={idx} style={{ position: 'relative' }}>
                                <img src={src} alt="Ảnh sản phẩm" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (!e.target.files || e.target.files.length === 0) return;
                        const files = Array.from(e.target.files);
                        setForm({
                          ...form,
                          images: [...(form.images || []), ...files],
                        });
                        e.target.value = '';
                      }}
                    />
                    {/* Hiển thị preview ảnh mới chọn */}
                    {form.images && Array.isArray(form.images) && form.images.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {form.images.map((file, idx) => {
                          let src = '';
                          if (file instanceof File) {
                            src = URL.createObjectURL(file);
                          } else if (typeof file === 'string') {
                            if (file.startsWith('http')) {
                              src = file;
                            } else {
                              src = `http://localhost:3000${file.startsWith('/') ? '' : '/'}${file}`;
                            }
                          }
                          return (
                            <div key={idx} style={{ position: 'relative' }}>
                              <img
                                src={src}
                                alt={`preview-${idx}`}
                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }}
                              />
                              <Button
                                size="sm"
                                variant="danger"
                                style={{ position: 'absolute', top: -8, right: -8, borderRadius: '50%', padding: '0 6px', fontSize: 13, zIndex: 2 }}
                                onClick={() => {
                                  const arr = [...form.images];
                                  arr.splice(idx, 1);
                                  setForm({ ...form, images: arr });
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : f.name === 'isActive' ||
                  f.name === 'isRefrigerated' ||
                  f.name === 'isVegetarian' ? (
                  <Form.Select
                    name={f.name}
                    value={
                      form[f.name] === undefined
                        ? ''
                        : form[f.name]
                          ? 'true'
                          : 'false'
                    }
                    onChange={(e) =>
                      setForm({ ...form, [f.name]: e.target.value === 'true' })
                    }
                    required={f.required}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </Form.Select>
                ) : f.name === 'sizes' ? (
                  <div
                    style={{
                      border: '1px solid #eee',
                      borderRadius: 4,
                      padding: 8,
                      marginBottom: 8,
                    }}
                  >
                    {(form.sizes || [{ name: '', price: '', stock: '' }]).map(
                      (sz, idx) => (
                        <Row key={idx} className="mb-2">
                          <Col md={4}>
                            <Form.Select
                              value={sz.name || ''}
                              onChange={(e) => {
                                const arr = [...(form.sizes || [])];
                                arr[idx] = {
                                  ...arr[idx],
                                  name: e.target.value,
                                };
                                setForm({ ...form, sizes: arr });
                              }}
                            >
                              <option value="">-- Size --</option>
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </Form.Select>
                          </Col>
                          <Col md={4}>
                            <Form.Control
                              type="number"
                              placeholder="Giá"
                              value={sz.price || ''}
                              onChange={(e) => {
                                const arr = [...(form.sizes || [])];
                                arr[idx] = {
                                  ...arr[idx],
                                  price: e.target.value,
                                };
                                setForm({ ...form, sizes: arr });
                              }}
                            />
                          </Col>
                          <Col md={3}>
                            <Form.Control
                              type="number"
                              placeholder="Tồn kho"
                              value={sz.stock || ''}
                              onChange={(e) => {
                                const arr = [...(form.sizes || [])];
                                arr[idx] = {
                                  ...arr[idx],
                                  stock: e.target.value,
                                };
                                setForm({ ...form, sizes: arr });
                              }}
                            />
                          </Col>
                          <Col md={1}>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                const arr = [...(form.sizes || [])];
                                arr.splice(idx, 1);
                                setForm({ ...form, sizes: arr });
                              }}
                            >
                              -
                            </Button>
                          </Col>
                        </Row>
                      ),
                    )}
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => {
                        setForm({
                          ...form,
                          sizes: [
                            ...(form.sizes || []),
                            { name: '', price: '', stock: '' },
                          ],
                        });
                      }}
                    >
                      + Thêm size
                    </Button>
                  </div>
                ) : (
                  <Form.Control
                    type={f.type}
                    name={f.name}
                    value={form[f.name] || ''}
                    onChange={handleChange}
                    required={f.required}
                  />
                )}
              </Form.Group>
            </Col>
          ))}
        </Row>
        <Button type="submit" variant="primary" className="me-2">
          Cập nhật sản phẩm
        </Button>
      </Form>
      <hr />
      <h5>Thêm thuộc tính mới (tùy chọn)</h5>
      <Row>
        <Col md={5}>
          <Form.Select
            value={newField.name}
            onChange={(e) => {
              const selected = allProductFields.find(
                (f) => f.name === e.target.value,
              );
              setNewField(
                selected
                  ? { ...selected, label: selected.label }
                  : { name: '', label: '', type: 'text' },
              );
            }}
          >
            <option value="">-- Chọn thuộc tính --</option>
            {allProductFields
              .filter((f) => !fields.some((ff) => ff.name === f.name))
              .map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            placeholder="Nhãn hiển thị"
            value={newField.label}
            onChange={(e) =>
              setNewField({ ...newField, label: e.target.value })
            }
            disabled={!newField.name}
          />
        </Col>
        <Col md={2}>
          <Button
            variant="info"
            onClick={handleAddField}
            disabled={!newField.name}
          >
            Thêm thuộc tính
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default ProductUpdatePage;
