// API Service for POS System
class APIService {
  constructor() {
    this.baseURL = "http://localhost:3000/api"; // Change this to your backend URL
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

  // Mock inventory methods
  async getInventory(params = {}) {
    await this.delay();

    // Create inventory data from products
    let inventoryData = this.products.map((product) => ({
      id: product.id,
      product_id: product.id,
      name: product.name,
      category: product.category,
      quantity: product.stock_quantity,
      unit_name: product.unit_name,
      branch_id: 1,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      inventoryData = inventoryData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm),
      );
    }

    // Apply stock status filter
    if (params.stock_status) {
      inventoryData = inventoryData.filter((item) => {
        switch (params.stock_status) {
          case "in_stock":
            return item.quantity > 5;
          case "low_stock":
            return item.quantity > 0 && item.quantity <= 5;
          case "out_of_stock":
            return item.quantity === 0;
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (params.category) {
      inventoryData = inventoryData.filter(
        (item) => item.category === params.category,
      );
    }

    // Apply sorting
    if (params.sort) {
      switch (params.sort) {
        case "name":
          inventoryData.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "stock_asc":
          inventoryData.sort((a, b) => a.quantity - b.quantity);
          break;
        case "stock_desc":
          inventoryData.sort((a, b) => b.quantity - a.quantity);
          break;
        case "updated_desc":
          inventoryData.sort(
            (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
          );
          break;
      }
    }

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;

    const paginatedData = inventoryData.slice(offset, offset + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: inventoryData.length,
        totalPages: Math.ceil(inventoryData.length / limit),
      },
    };
  }

  async getLowStockItems(threshold = 5) {
    await this.delay();
    const lowStockItems = this.products.filter(
      (product) =>
        product.stock_quantity > 0 && product.stock_quantity <= threshold,
    );
    return { data: lowStockItems };
  }

  async getStockMovements(params = {}) {
    await this.delay();

    // Generate mock stock movements
    const movements = [
      {
        id: 1,
        product_id: 1,
        product_name: "Margherita Pizza",
        type: "in",
        quantity: 20,
        previous_quantity: 5,
        new_quantity: 25,
        reference: "Purchase Order #001",
        created_at: "2024-01-25T10:30:00Z",
      },
      {
        id: 2,
        product_id: 2,
        product_name: "Coca Cola",
        type: "out",
        quantity: 10,
        previous_quantity: 160,
        new_quantity: 150,
        reference: "Sale #456",
        created_at: "2024-01-25T14:15:00Z",
      },
      {
        id: 3,
        product_id: 3,
        product_name: "Chocolate Cake",
        type: "adjustment",
        quantity: 2,
        previous_quantity: 10,
        new_quantity: 8,
        reference: "Inventory count adjustment",
        created_at: "2024-01-25T16:45:00Z",
      },
      {
        id: 4,
        product_id: 4,
        product_name: "Caesar Salad",
        type: "out",
        quantity: 3,
        previous_quantity: 5,
        new_quantity: 2,
        reference: "Sale #789",
        created_at: "2024-01-25T18:20:00Z",
      },
      {
        id: 5,
        product_id: 5,
        product_name: "Orange Juice",
        type: "out",
        quantity: 5,
        previous_quantity: 5,
        new_quantity: 0,
        reference: "Sale #101",
        created_at: "2024-01-25T19:30:00Z",
      },
      {
        id: 6,
        product_id: 1,
        product_name: "Margherita Pizza",
        type: "in",
        quantity: 15,
        previous_quantity: 25,
        new_quantity: 40,
        reference: "Restock delivery",
        created_at: "2024-01-26T09:00:00Z",
      },
    ];

    let filteredMovements = [...movements];

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredMovements = filteredMovements.filter(
        (movement) =>
          movement.product_name.toLowerCase().includes(searchTerm) ||
          movement.reference.toLowerCase().includes(searchTerm),
      );
    }

    // Apply type filter
    if (params.type) {
      filteredMovements = filteredMovements.filter(
        (movement) => movement.type === params.type,
      );
    }

    // Apply date filters
    if (params.date_from) {
      const fromDate = new Date(params.date_from);
      filteredMovements = filteredMovements.filter(
        (movement) => new Date(movement.created_at) >= fromDate,
      );
    }

    if (params.date_to) {
      const toDate = new Date(params.date_to);
      toDate.setHours(23, 59, 59, 999); // End of day
      filteredMovements = filteredMovements.filter(
        (movement) => new Date(movement.created_at) <= toDate,
      );
    }

    // Apply product filter
    if (params.product_id) {
      filteredMovements = filteredMovements.filter(
        (movement) => movement.product_id === parseInt(params.product_id),
      );
    }

    // Sort by date (newest first)
    filteredMovements.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;

    const paginatedMovements = filteredMovements.slice(offset, offset + limit);

    return {
      data: paginatedMovements,
      pagination: {
        page,
        limit,
        total: filteredMovements.length,
        totalPages: Math.ceil(filteredMovements.length / limit),
      },
    };
  }

  async addStockMovement(movementData) {
    await this.delay();

    // Find the product
    const productIndex = this.products.findIndex(
      (p) => p.id === movementData.product_id,
    );
    if (productIndex === -1) {
      throw new Error("Product not found");
    }

    const product = this.products[productIndex];
    const previousQuantity = product.stock_quantity;
    let newQuantity = previousQuantity;

    // Calculate new quantity based on movement type
    switch (movementData.type) {
      case "in":
        newQuantity = previousQuantity + movementData.quantity;
        break;
      case "out":
        newQuantity = Math.max(0, previousQuantity - movementData.quantity);
        break;
      case "adjustment":
        newQuantity = movementData.quantity;
        break;
    }

    // Update product stock
    this.products[productIndex].stock_quantity = newQuantity;
    this.products[productIndex].updated_at = new Date().toISOString();

    // Create movement record
    const movement = {
      id: Date.now(), // Simple ID generation
      product_id: movementData.product_id,
      product_name: product.name,
      type: movementData.type,
      quantity: movementData.quantity,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reference: movementData.reference || "",
      created_at: new Date().toISOString(),
    };

    return { data: movement };
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
