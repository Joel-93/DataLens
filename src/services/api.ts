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

const API_URL = "http://localhost:5000/api/orders";

// 🔥 helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const api = {

  // =======================
  // GET ORDERS
  // =======================
  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    // 🔥 prevent crash if unauthorized
    if (!Array.isArray(data)) {
      console.error("Invalid response (likely unauthorized):", data);
      return [];
    }

    return data;
  },

  // =======================
  // CREATE ORDER
  // =======================
  createOrder: async (orderData: any): Promise<Order> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    return res.json();
  },

  // =======================
  // UPDATE ORDER
  // =======================
  updateOrder: async (id: string, orderData: any) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    return res.json();
  },

  // =======================
  // DELETE ORDER
  // =======================
  deleteOrder: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return res.json();
  }

};