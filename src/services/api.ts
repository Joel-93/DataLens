// API service for DataLens (connected to Node.js + SQLite backend)

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

export const api = {

  getOrders: async () => {
    const res = await fetch(API_URL);
    return res.json();
  },

  createOrder: async (orderData: any) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const data = await res.json();
    return data; // ✅ IMPORTANT (must return backend id)
  },

  updateOrder: async (id: string, orderData: any) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    return res.json();
  },

  deleteOrder: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    return res.json();
  }

};