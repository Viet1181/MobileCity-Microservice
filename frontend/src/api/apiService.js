import axiosInstance from "./axiosConfig";

// Utility functions to maintain backward compatibility
export const GET_ALL = async (endpoint, params) => {
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
};

export const GET_ID = async (endpoint, id) => {
    if (endpoint.includes('email')) {
        const response = await axiosInstance.get(endpoint);
        return response.data;
    }
    const response = await axiosInstance.get(`${endpoint}/${id}`);
    return response.data;
};
export const getAuthUser = async () => {
  const userId = localStorage.getItem('userId'); // lưu userId khi login
  if (!userId) return null;
  return await getUserById(userId);
};
export const GET_ID_NEW = async (endpoint, method = 'GET') => {
    const response = await axiosInstance({
        method,
        url: endpoint
    });
    return response.data;
};

export const POST_NEW = async (endpoint, data = null) => {
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
};

export const PUT_NEW = async (endpoint, data) => {
    const response = await axiosInstance.put(endpoint, data);
    return response.data;
};

export const DELETE_NEW = async (endpoint) => {
    const response = await axiosInstance.delete(endpoint);
    return response.data;
};

export const PUT_EDIT = async (endpoint, data) => {
    const response = await axiosInstance.put(endpoint, data);
    return response.data;
};

// Category APIs
export const getAllCategories = async () => {
    const response = await axiosInstance.get('/catalog/categories');
    return response.data;
};

export const getCategoryById = async (id) => {
    const response = await axiosInstance.get(`/catalog/categories/${id}`);
    return response.data;
};

export const searchCategories = async (params) => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    // Thêm các tham số khác nếu backend hỗ trợ
    const response = await axiosInstance.get(`/catalog/categories/search?${queryParams.toString()}`);
    return response.data;
};

// Brand APIs
export const getAllBrands = async () => {
    const response = await axiosInstance.get('/catalog/brands');
    return response.data;
};

export const getBrandById = async (id) => {
    const response = await axiosInstance.get(`/catalog/brands/${id}`);
    return response.data;
};

export const searchBrands = async (params) => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    // Thêm các tham số khác nếu backend hỗ trợ
    const response = await axiosInstance.get(`/catalog/brands/search?${queryParams.toString()}`);
    return response.data;
};

// Product APIs
export const getAllProducts = async () => {
    const response = await axiosInstance.get('/catalog/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await axiosInstance.get(`/catalog/products/${id}`);
    return response.data;
};

export const getProductsByCategory = async (categoryId) => {
    const response = await axiosInstance.get(`/catalog/products?categoryId=${categoryId}`);
    return response.data;
};

export const getProductsByBrand = async (brandId) => {
    const response = await axiosInstance.get(`/catalog/products?brandId=${brandId}`);
    return response.data;
};

export const searchProducts = async (params) => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('keyword', params.name); // Sửa: truyền keyword thay vì name
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.brandId) queryParams.append('brandId', params.brandId);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    // Đảm bảo truyền đúng tham số order cho backend (asc/desc)
    if (params.sortDirection) queryParams.append('order', params.sortDirection);
    // Thêm các tham số khác nếu backend hỗ trợ
    const response = await axiosInstance.get(`/catalog/products/search?${queryParams.toString()}`);
    return response.data;
};
// User APIs
export const getAllUsers = async () => {
    const response = await axiosInstance.get('/accounts/users');
    return response.data;
};

export const getUserById = async (id) => {
    try {
        const response = await axiosInstance.get(`/accounts/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        throw error;
    }
};

export const getUserByName = async (name) => {
    const response = await axiosInstance.get(`/accounts/users?name=${name}`);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await axiosInstance.put(`/accounts/users/${id}`, userData);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axiosInstance.delete(`/accounts/users/${id}`);
    return response.data;
};

// Hàm tiện ích để xử lý cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, path = '/') => {
  // Xóa cookie cũ
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  // Set cookie mới
  document.cookie = `${name}=${value}; path=${path}`;
};

// Cart APIs
export const getCart = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  const cartId = getCookie('cartId');
  if (!cartId) {
    throw new Error('Không tìm thấy cartId');
  }

  const response = await axiosInstance.get(
    '/shop/cart',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `cartId=${cartId}`
      },
      withCredentials: true
    }
  );
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  let cartId = getCookie('cartId');
  if (!cartId) {
    cartId = Date.now().toString();
    setCookie('cartId', cartId);
  }

  const response = await axiosInstance.post(
    `/shop/cart?productId=${productId}&quantity=${quantity}`,
    null,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `cartId=${cartId}`
      },
      withCredentials: true
    }
  );
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  const cartId = getCookie('cartId');
  if (!cartId) {
    throw new Error('Không tìm thấy cartId');
  }

  const response = await axiosInstance.put(
    `/shop/cart?productId=${productId}&quantity=${quantity}`,
    null,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `cartId=${cartId}`
      },
      withCredentials: true
    }
  );
  return response.data;
};

export const removeFromCart = async (productId) => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  const cartId = getCookie('cartId');
  if (!cartId) {
    throw new Error('Không tìm thấy cartId');
  }

  const response = await axiosInstance.delete(
    `/shop/cart?productId=${productId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `cartId=${cartId}`
      },
      withCredentials: true
    }
  );
  return response.data;
};

// Order APIs
export const createOrder = async (userId) => {
    const response = await axiosInstance.post(`/shop/order/${userId}`);
    return response.data;
};

export const getOrder = async (orderId) => {
    const response = await axiosInstance.get(`/shop/order/${orderId}`);
    return response.data;
};

export const getAllOrders = async () => {
    const response = await axiosInstance.get('/shop/order/');
    return response.data;
};

export const cancelOrder = async (orderId) => {
  // Gửi PUT để cập nhật trạng thái đơn hàng thành CANCELLED
  const response = await axiosInstance.put(`/shop/order/${orderId}`, { status: 'CANCELLED' });
  return response.data;
};

export const getOrdersByUserName = async (userName) => {
    const response = await axiosInstance.get(`/shop/order/user?name=${userName}`);
    return response.data;
};

// Lấy danh sách sản phẩm theo tên (dùng cho đồng bộ microservice)
export const getProductsByName = async (productName) => {
    const response = await axiosInstance.get(`/catalog/products?name=${encodeURIComponent(productName)}`);
    return response.data;
};

// Cập nhật tồn kho sản phẩm (dùng cho admin hoặc service backend)
export const updateProductAvailability = async (productId, newAvailability) => {
    const response = await axiosInstance.patch(`/catalog/products/${productId}/availability?availability=${newAvailability}`);
    return response.data;
};

export const payOrder = async (orderId) => {
    const response = await axiosInstance.post(`/shop/order/pay/${orderId}`);
    return response.data;
};

// Review APIs
export const addProductReview = async (userId, productId, rating, comment = '') => {
    const response = await axiosInstance.post(
        `/review/${userId}/recommendations/${productId}?rating=${rating}&comment=${encodeURIComponent(comment)}`
    );
    return response.data;
};

export const getProductReviews = async (productName) => {
    const response = await axiosInstance.get(`/review/recommendations?name=${encodeURIComponent(productName)}`);
    return response.data;
};

export const deleteProductReview = async (reviewId) => {
    const response = await axiosInstance.delete(`/review/recommendations/${reviewId}`);
    return response.data;
};

// Tính trung bình đánh giá
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

// Auth APIs
export const LOGIN = async (credentials) => {
    try {
        const response = await axiosInstance.post('/auth/login', {
            userName: credentials.userName,
            password: credentials.password
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi đăng nhập:', error.response?.data || error.message);
        throw error;
    }
};

export const REGISTER = async (userData) => {
    try {
        const response = await axiosInstance.post('/accounts/users', userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const LOGOUT = async () => {
    try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('rememberedEmail');
        await axiosInstance.post('/auth/logout');
        window.location.href = '/login';
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('rememberedEmail');
        window.location.href = '/login';
        throw error;
    }
};
