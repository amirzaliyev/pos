// API Service for POS System
class APIService {
  constructor() {
    this.baseURL = "http://localhost:8000/api"; // Change this to your backend URL
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: "GET",
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

// Product API Service
class ProductAPI extends APIService {
  constructor() {
    super();
    this.endpoint = "/products";
  }

  // Get all products with optional filtering and pagination
  async getProducts(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Get single product by ID
  async getProduct(id) {
    return this.get(`${this.endpoint}/${id}`);
  }

  // Create new product
  async createProduct(productData) {
    return this.post(this.endpoint, productData);
  }

  // Update product
  async updateProduct(id, productData) {
    return this.put(`${this.endpoint}/${id}`, productData);
  }

  // Delete product
  async deleteProduct(id) {
    return this.delete(`${this.endpoint}/${id}`);
  }

  // Search products
  async searchProducts(searchTerm, filters = {}) {
    const params = {
      search: searchTerm,
      ...filters,
    };
    return this.get(`${this.endpoint}/search`, params);
  }

  // Get products by category
  async getProductsByCategory(category) {
    return this.get(`${this.endpoint}/category/${category}`);
  }

  // Get product stock information
  async getProductStock(id) {
    return this.get(`${this.endpoint}/${id}/stock`);
  }

  // Update product stock
  async updateProductStock(id, stockData) {
    return this.patch(`${this.endpoint}/${id}/stock`, stockData);
  }
}

// Units API Service
class UnitsAPI extends APIService {
  constructor() {
    super();
    this.endpoint = "/units";
  }

  // Get all units
  async getUnits() {
    return this.get(this.endpoint);
  }

  // Get single unit by ID
  async getUnit(id) {
    return this.get(`${this.endpoint}/${id}`);
  }

  // Create new unit
  async createUnit(unitData) {
    return this.post(this.endpoint, unitData);
  }

  // Update unit
  async updateUnit(id, unitData) {
    return this.put(`${this.endpoint}/${id}`, unitData);
  }

  // Delete unit
  async deleteUnit(id) {
    return this.delete(`${this.endpoint}/${id}`);
  }
}

// Inventory API Service
class InventoryAPI extends APIService {
  constructor() {
    super();
    this.endpoint = "/inventory";
  }

  // Get all inventory items
  async getInventory(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Get inventory for specific product
  async getProductInventory(productId) {
    return this.get(`${this.endpoint}/product/${productId}`);
  }

  // Update inventory quantity
  async updateInventory(productId, inventoryData) {
    return this.put(`${this.endpoint}/product/${productId}`, inventoryData);
  }

  // Get low stock items
  async getLowStockItems(threshold = 10) {
    return this.get(`${this.endpoint}/low-stock`, { threshold });
  }

  // Get stock movements
  async getStockMovements(params = {}) {
    return this.get("/stock-movements", params);
  }

  // Add stock movement
  async addStockMovement(movementData) {
    return this.post("/stock-movements", movementData);
  }
}

// Mock Data Service (for development/testing)
class MockDataService {
  constructor() {
    this.products = [
      {
        id: 1,
        name: "Margherita Pizza",
        barcode: "1234567890123",
        category: "food",
        unit_id: 1,
        unit_name: "piece",
        description:
          "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil",
        stock_quantity: 25,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      {
        id: 2,
        name: "Coca Cola",
        barcode: "9876543210987",
        category: "beverage",
        unit_id: 2,
        unit_name: "bottle",
        description: "Refreshing cola drink, 500ml bottle",
        stock_quantity: 150,
        created_at: "2024-01-16T09:15:00Z",
        updated_at: "2024-01-21T11:20:00Z",
      },
      {
        id: 3,
        name: "Chocolate Cake",
        barcode: "5555666677778",
        category: "dessert",
        unit_id: 3,
        unit_name: "slice",
        description: "Rich chocolate cake with chocolate frosting",
        stock_quantity: 8,
        created_at: "2024-01-17T15:45:00Z",
        updated_at: "2024-01-22T16:30:00Z",
      },
      {
        id: 4,
        name: "Caesar Salad",
        barcode: "1111222233334",
        category: "food",
        unit_id: 4,
        unit_name: "bowl",
        description:
          "Fresh lettuce with caesar dressing, croutons, and parmesan cheese",
        stock_quantity: 2,
        created_at: "2024-01-18T12:00:00Z",
        updated_at: "2024-01-23T13:15:00Z",
      },
      {
        id: 5,
        name: "Orange Juice",
        barcode: "7777888899990",
        category: "beverage",
        unit_id: 5,
        unit_name: "glass",
        description: "Freshly squeezed orange juice",
        stock_quantity: 0,
        created_at: "2024-01-19T08:30:00Z",
        updated_at: "2024-01-24T09:45:00Z",
      },
    ];

    this.units = [
      { id: 1, name: "piece", description: "Individual items" },
      { id: 2, name: "bottle", description: "Bottled beverages" },
      { id: 3, name: "slice", description: "Sliced items" },
      { id: 4, name: "bowl", description: "Bowl servings" },
      { id: 5, name: "glass", description: "Glass servings" },
      { id: 6, name: "kg", description: "Kilograms" },
      { id: 7, name: "liter", description: "Liters" },
    ];
  }

  // Simulate API delay
  async delay(ms = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Mock product API methods
  async getProducts(params = {}) {
    await this.delay();

    let filteredProducts = [...this.products];

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.barcode.includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm),
      );
    }

    // Apply category filter
    if (params.category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === params.category,
      );
    }

    // Apply unit filter
    if (params.unit_id) {
      filteredProducts = filteredProducts.filter(
        (product) => product.unit_id === parseInt(params.unit_id),
      );
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;

    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
      },
    };
  }

  async getProduct(id) {
    await this.delay();
    const product = this.products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }
    return { data: product };
  }

  async createProduct(productData) {
    await this.delay();
    const newProduct = {
      id: Math.max(...this.products.map((p) => p.id)) + 1,
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stock_quantity: 0,
    };

    // Add unit name
    const unit = this.units.find((u) => u.id === parseInt(productData.unit_id));
    if (unit) {
      newProduct.unit_name = unit.name;
    }

    this.products.push(newProduct);
    return { data: newProduct };
  }

  async updateProduct(id, productData) {
    await this.delay();
    const index = this.products.findIndex((p) => p.id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }

    const updatedProduct = {
      ...this.products[index],
      ...productData,
      updated_at: new Date().toISOString(),
    };

    // Update unit name if unit_id changed
    if (productData.unit_id) {
      const unit = this.units.find(
        (u) => u.id === parseInt(productData.unit_id),
      );
      if (unit) {
        updatedProduct.unit_name = unit.name;
      }
    }

    this.products[index] = updatedProduct;
    return { data: updatedProduct };
  }

  async deleteProduct(id) {
    await this.delay();
    const index = this.products.findIndex((p) => p.id === parseInt(id));
    if (index === -1) {
      throw new Error("Product not found");
    }

    this.products.splice(index, 1);
    return { success: true };
  }

  async getUnits() {
    await this.delay();
    return { data: this.units };
  }
}

// Initialize API services
const productAPI = new ProductAPI();
const unitsAPI = new UnitsAPI();
const inventoryAPI = new InventoryAPI();
const mockAPI = new MockDataService();

// Configuration for switching between real API and mock data
const API_CONFIG = {
  USE_MOCK_DATA: true, // Set to false when backend is ready
};

// API facade that switches between real and mock APIs
class API {
  static get products() {
    return API_CONFIG.USE_MOCK_DATA ? mockAPI : productAPI;
  }

  static get units() {
    return API_CONFIG.USE_MOCK_DATA ? mockAPI : unitsAPI;
  }

  static get inventory() {
    return API_CONFIG.USE_MOCK_DATA ? mockAPI : inventoryAPI;
  }
}

// Make API available globally
window.API = API;
