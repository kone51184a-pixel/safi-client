const BASE_URL = 'https://safi-backend.onrender.com/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (phone, password) => request('/auth/login', { method: 'POST', body: { phone, password } }),

  getProducts: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`, { token });
  },
  getProduct: (token, id) => request(`/products/${id}`, { token }),

  createOrder: (token, order) => request('/orders', { method: 'POST', body: order, token }),
  getOrders: (token) => request('/orders', { token }),
  getOrder: (token, id) => request(`/orders/${id}`, { token }),
  cancelOrder: (token, id) => request(`/orders/${id}/cancel`, { method: 'PATCH', token }),

  getSettings: (token) => request('/settings', { token }),

  createReview: (token, review) => request('/reviews', { method: 'POST', body: review, token }),
  getReviewForOrder: (token, orderId) => request(`/reviews/order/${orderId}`, { token }),

  // Vue publique livreur — pas de token, accès via lien SMS
  getDelivererView: (orderId) => request(`/orders/${orderId}/deliverer-view`, { token: null }),
  respondAsDeliverer: (orderId, action) =>
    request(`/orders/${orderId}/deliverer-response`, { method: 'POST', body: { action } }),
};
