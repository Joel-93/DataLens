// API service for DataLens (connected to Node.js + SQLite backend with JWT)

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdBy: string;
  createdAt: string;
}

const API_URL = "/api/orders";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "API Error");
  }
  return res.json();
};

export const api = {

  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  },

  createOrder: async (orderData: any): Promise<Order> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    return handleResponse(res);
  },

  updateOrder: async (id: string, orderData: any) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    return handleResponse(res);
  },

  deleteOrder: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return handleResponse(res);
  }
};