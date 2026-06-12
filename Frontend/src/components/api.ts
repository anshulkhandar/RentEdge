const API_BASE_URL = 'http://localhost:5000/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rentedge_token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

// ─── Session helpers ──────────────────────────────────────────────

function storeSession(data: { token: string; user: any }) {
  localStorage.setItem('rentedge_token', data.token);
  localStorage.setItem('rentedge_authenticated', 'true');
  localStorage.setItem('rentedge_user_fullname', data.user.fullName);
  localStorage.setItem('rentedge_user_email', data.user.email);
  localStorage.setItem('rentedge_user_role', data.user.role);
}

function clearSession() {
  localStorage.removeItem('rentedge_token');
  localStorage.removeItem('rentedge_authenticated');
  localStorage.removeItem('rentedge_user_fullname');
  localStorage.removeItem('rentedge_user_email');
  localStorage.removeItem('rentedge_user_role');
  localStorage.removeItem('rentedge_lifecycle_state');
  localStorage.removeItem('rentedge_selected_property_id');
}

// ─── API Methods ──────────────────────────────────────────────────

export const api = {
  // Auth — Lookup Email
  async lookupEmail(payload: { identifier: string }) {
    return apiFetch('/auth/lookup-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Auth — Pre-check account availability and handle JIT cleanup
  async preCheck(payload: { email: string; phone: string }) {
    return apiFetch('/auth/pre-check', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Auth — Complete signup with Firebase token
  async completeSignup(payload: {
    fullName: string;
    role: string;
    firebaseIdToken: string;
  }) {
    const data = await apiFetch('/auth/complete-signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      storeSession(data);
    }
    return data;
  },

  // Auth — Login
  async login(payload: { firebaseIdToken: string }) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      storeSession(data);
    }
    return data;
  },

  // Auth — Logout
  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors on logout
    }
    clearSession();
  },

  // Auth — Get current user
  async getMe() {
    return apiFetch('/auth/me');
  },

  // Properties APIs
  async getProperties() {
    return apiFetch('/properties');
  },

  async getProperty(id: string) {
    return apiFetch(`/properties/${id}`);
  },

  async createProperty(propertyData: any) {
    return apiFetch('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  async updateProperty(id: string, propertyData: any) {
    return apiFetch(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  },

  // ImageKit
  async getImageKitAuth() {
    return apiFetch('/imagekit/auth');
  },

  async saveTempUpload(uploadData: { session_id: string; imagekit_file_id: string; image_url: string }) {
    return apiFetch('/imagekit/temp-upload', {
      method: 'POST',
      body: JSON.stringify(uploadData),
    });
  },

  async deleteTempUpload(fileId: string) {
    return apiFetch(`/imagekit/temp-upload/${fileId}`, {
      method: 'DELETE',
    });
  },

  async deleteTempUploads(sessionId: string) {
    return apiFetch(`/imagekit/temp/${sessionId}`, {
      method: 'DELETE',
    });
  },

  async deleteProperty(id: string) {
    return apiFetch(`/properties/${id}`, {
      method: 'DELETE',
    });
  },


  async deletePropertyImage(propertyId: string, imageId: string) {
    return apiFetch(`/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
    });
  },

  async setCoverImage(propertyId: string, imageId: string) {
    return apiFetch(`/properties/${propertyId}/images/${imageId}/cover`, {
      method: 'PATCH',
    });
  },

  async reorderImages(propertyId: string, orderData: { id: string, display_order: number }[]) {
    return apiFetch(`/properties/${propertyId}/images/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  },

  async addPropertyImage(propertyId: string, imageData: any) {
    return apiFetch(`/properties/${propertyId}/images`, {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  },


  async addPropertyContact(propertyId: string, contactData: any) {
    return apiFetch(`/properties/${propertyId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  async deletePropertyContact(propertyId: string, contactId: string) {
    return apiFetch(`/properties/${propertyId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  // Tenants APIs
  async getTenantProfile() {
    return apiFetch('/tenants/me');
  },

  async updateTenantProfile(profileData: any) {
    return apiFetch('/tenants/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Leases/Access Codes APIs
  async generateAccessCode(propertyId: string, unitIndex: number) {
    return apiFetch('/leases/generate-code', {
      method: 'POST',
      body: JSON.stringify({ propertyId, unitIndex }),
    });
  },

  async verifyAccessCode(code: string) {
    return apiFetch('/leases/verify-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async getMyLeases() {
    return apiFetch('/leases/my-leases');
  },

  async revokeLease(id: string) {
    return apiFetch(`/leases/${id}`, {
      method: 'DELETE',
    });
  },

  // Payments APIs
  async getPayments() {
    return apiFetch('/payments');
  },

  async recordPayment(paymentData: any) {
    return apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
};
