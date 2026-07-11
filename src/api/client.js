const BASE_URL = 'http://localhost:5000/api';

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
};
