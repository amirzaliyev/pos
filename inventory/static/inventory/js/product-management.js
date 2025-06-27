// Product Management Module
class ProductManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentFilters = {};
    this.products = [];
    this.units = [];
    this.editingProductId = null;

    this.initializeElements();
    this.attachEventListeners();
    this.loadInitialData();
  }

  initializeElements() {
    // Main elements
    this.productsTable = document.getElementById("productsTable");
    this.productsTableBody = document.getElementById("productsTableBody");
    this.searchInput = document.getElementById("searchInput");
    this.categoryFilter = document.getElementById("categoryFilter");
    this.unitFilter = document.getElementById("unitFilter");
    this.pagination = document.getElementById("pagination");

    // Modal elements
    this.productModal = document.getElementById("productModal");
    this.productForm = document.getElementById("productForm");
    this.modalTitle = document.getElementById("modalTitle");
    this.addProductBtn = document.getElementById("addProductBtn");
    this.closeModal = document.getElementById("closeModal");
    this.cancelBtn = document.getElementById("cancelBtn");

    // Form fields
    this.productName = document.getElementById("productName");
    this.productBarcode = document.getElementById("productBarcode");
    this.productCategory = document.getElementById("productCategory");
    this.productUnit = document.getElementById("productUnit");
    this.productDescription = document.getElementById("productDescription");
  }

  attachEventListeners() {
    // Search and filter events
    this.searchInput.addEventListener(
      "input",
      Utils.EventUtils.debounce(() => this.handleSearch(), 300),
    );
    this.categoryFilter.addEventListener("change", () =>
      this.handleCategoryFilter(),
    );
    this.unitFilter.addEventListener("change", () => this.handleUnitFilter());

    // Modal events
    this.addProductBtn.addEventListener("click", () => this.openAddModal());
    this.closeModal.addEventListener("click", () => this.closeProductModal());
    this.cancelBtn.addEventListener("click", () => this.closeProductModal());
    this.productForm.addEventListener("submit", (e) =>
      this.handleFormSubmit(e),
    );

    // Close modal when clicking outside
    this.productModal.addEventListener("click", (e) => {
      if (e.target === this.productModal) {
        this.closeProductModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.productModal.style.display === "block") {
        this.closeProductModal();
      }
    });
  }

  async loadInitialData() {
    try {
      Utils.loading.show();

      // Load units for dropdown
      await this.loadUnits();

      // Load products
      await this.loadProducts();
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "loadInitialData");
      Utils.toast.error(message);
    } finally {
      Utils.loading.hide();
    }
  }

  async loadUnits() {
    try {
      const response = await API.units.getUnits();
      this.units = response.data || [];
      this.populateUnitDropdowns();
    } catch (error) {
      console.error("Error loading units:", error);
      Utils.toast.error("Failed to load units");
    }
  }

  populateUnitDropdowns() {
    // Clear existing options (except first option)
    this.productUnit.innerHTML = "<option value=\"\">Select Unit</option>";
    this.unitFilter.innerHTML = "<option value=\"\">All Units</option>";

    this.units.forEach((unit) => {
      // Add to product form dropdown
      const productOption = document.createElement("option");
      productOption.value = unit.id;
      productOption.textContent = `${unit.name} - ${unit.description}`;
      this.productUnit.appendChild(productOption);

      // Add to filter dropdown
      const filterOption = document.createElement("option");
      filterOption.value = unit.id;
      filterOption.textContent = unit.name;
      this.unitFilter.appendChild(filterOption);
    });
  }

  async loadProducts() {
    try {
      const params = {
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.currentFilters,
      };

      const response = await API.products.getProducts(params);
      this.products = response.data || [];

      this.renderProductsTable();
      this.renderPagination(response.pagination);
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "loadProducts");
      Utils.toast.error(message);
      this.renderEmptyState();
    }
  }

  renderProductsTable() {
    if (!this.products.length) {
      this.renderEmptyState();
      return;
    }

    const tbody = this.productsTableBody;
    tbody.innerHTML = "";

    this.products.forEach((product) => {
      const row = this.createProductRow(product);
      tbody.appendChild(row);
    });
  }

  createProductRow(product) {
    const row = document.createElement("tr");

    // Format stock status
    const stockStatus = this.getStockStatus(product.stock_quantity);
    const categoryBadge = this.getCategoryBadge(product.category);

    row.innerHTML = `
            <td>${product.id}</td>
            <td>${Utils.StringUtils.highlightSearch(product.name, this.currentFilters.search || "")}</td>
            <td>${product.barcode || "-"}</td>
            <td>${categoryBadge}</td>
            <td>${product.unit_name || "-"}</td>
            <td title="${product.description || ""}">${Utils.StringUtils.truncate(product.description || "-", 50)}</td>
            <td>${stockStatus}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="productManager.editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="productManager.deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

    return row;
  }

  getStockStatus(quantity) {
    let statusClass, statusText;

    if (quantity === 0) {
      statusClass = "stock-out";
      statusText = "Out of Stock";
    } else if (quantity <= 5) {
      statusClass = "stock-low";
      statusText = `${quantity} Low`;
    } else if (quantity <= 20) {
      statusClass = "stock-medium";
      statusText = `${quantity} Medium`;
    } else {
      statusClass = "stock-high";
      statusText = `${quantity} In Stock`;
    }

    return `<span class="stock-status ${statusClass}">${statusText}</span>`;
  }

  getCategoryBadge(category) {
    const categoryClass = `category-${category}` || "category-default";
    return `<span class="category-badge ${categoryClass}">${Utils.StringUtils.capitalize(category)}</span>`;
  }

  renderEmptyState() {
    this.productsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters, or add a new product.</p>
                </td>
            </tr>
        `;
  }

  renderPagination(pagination) {
    if (!pagination) return;

    const { page, totalPages, total } = pagination;

    let paginationHTML = "";

    // Previous button
    paginationHTML += `
            <button ${page <= 1 ? "disabled" : ""} onclick="productManager.goToPage(${page - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
      paginationHTML += "<button onclick=\"productManager.goToPage(1)\">1</button>";
      if (startPage > 2) {
        paginationHTML += "<span>...</span>";
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
                <button class="${i === page ? "active" : ""}" onclick="productManager.goToPage(${i})">
                    ${i}
                </button>
            `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += "<span>...</span>";
      }
      paginationHTML += `<button onclick="productManager.goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    paginationHTML += `
            <button ${page >= totalPages ? "disabled" : ""} onclick="productManager.goToPage(${page + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

    // Pagination info
    const start = (page - 1) * this.itemsPerPage + 1;
    const end = Math.min(page * this.itemsPerPage, total);
    paginationHTML += `
            <span class="pagination-info">
                Showing ${start}-${end} of ${total} products
            </span>
        `;

    this.pagination.innerHTML = paginationHTML;
  }

  async goToPage(page) {
    this.currentPage = page;
    await this.loadProducts();
  }

  // Search and filter handlers
  handleSearch() {
    const searchTerm = this.searchInput.value.trim();
    if (searchTerm) {
      this.currentFilters.search = searchTerm;
    } else {
      delete this.currentFilters.search;
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  handleCategoryFilter() {
    const category = this.categoryFilter.value;
    if (category) {
      this.currentFilters.category = category;
    } else {
      delete this.currentFilters.category;
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  handleUnitFilter() {
    const unitId = this.unitFilter.value;
    if (unitId) {
      this.currentFilters.unit_id = unitId;
    } else {
      delete this.currentFilters.unit_id;
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  // Modal management
  openAddModal() {
    this.editingProductId = null;
    this.modalTitle.textContent = "Add Product";
    this.resetForm();
    this.showModal();
  }

  openEditModal(product) {
    this.editingProductId = product.id;
    this.modalTitle.textContent = "Edit Product";
    this.populateForm(product);
    this.showModal();
  }

  showModal() {
    this.productModal.style.display = "block";
    document.body.style.overflow = "hidden";
    // Focus on first input
    setTimeout(() => this.productName.focus(), 100);
  }

  closeProductModal() {
    this.productModal.style.display = "none";
    document.body.style.overflow = "auto";
    this.resetForm();
    this.editingProductId = null;
  }

  resetForm() {
    this.productForm.reset();
    // Clear any validation messages
    const errorElements = this.productForm.querySelectorAll(".error-message");
    errorElements.forEach((el) => el.remove());
  }

  populateForm(product) {
    this.productName.value = product.name || "";
    this.productBarcode.value = product.barcode || "";
    this.productCategory.value = product.category || "";
    this.productUnit.value = product.unit_id || "";
    this.productDescription.value = product.description || "";
  }

  // Form submission
  async handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const formData = this.getFormData();

    try {
      Utils.loading.show();

      if (this.editingProductId) {
        await this.updateProduct(this.editingProductId, formData);
        Utils.toast.success("Product updated successfully");
      } else {
        await this.createProduct(formData);
        Utils.toast.success("Product created successfully");
      }

      this.closeProductModal();
      await this.loadProducts();
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "handleFormSubmit");
      Utils.toast.error(message);
    } finally {
      Utils.loading.hide();
    }
  }

  validateForm() {
    this.clearValidationErrors();
    let isValid = true;

    // Validate required fields
    const requiredFields = [
      { field: this.productName, name: "Product Name" },
      { field: this.productCategory, name: "Category" },
      { field: this.productUnit, name: "Unit" },
    ];

    requiredFields.forEach(({ field, name }) => {
      const error = Utils.FormValidator.validateRequired(field.value, name);
      if (error) {
        this.showFieldError(field, error);
        isValid = false;
      }
    });

    // Validate product name length
    if (this.productName.value) {
      const nameError = Utils.FormValidator.validateMinLength(
        this.productName.value,
        2,
        "Product Name",
      );
      if (nameError) {
        this.showFieldError(this.productName, nameError);
        isValid = false;
      }
    }

    return isValid;
  }

  clearValidationErrors() {
    const errorElements = this.productForm.querySelectorAll(".error-message");
    errorElements.forEach((el) => el.remove());

    const fields = this.productForm.querySelectorAll("input, select, textarea");
    fields.forEach((field) => field.classList.remove("error"));
  }

  showFieldError(field, message) {
    field.classList.add("error");

    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.style.color = "#dc3545";
    errorElement.style.fontSize = "0.8rem";
    errorElement.style.marginTop = "0.25rem";

    field.parentNode.appendChild(errorElement);
  }

  getFormData() {
    return {
      name: this.productName.value.trim(),
      barcode: this.productBarcode.value.trim() || null,
      category: this.productCategory.value.trim(),
      unit_id: parseInt(this.productUnit.value),
      description: this.productDescription.value.trim() || null,
    };
  }

  // CRUD operations
  async createProduct(productData) {
    const response = await API.products.createProduct(productData);
    return response.data;
  }

  async updateProduct(id, productData) {
    const response = await API.products.updateProduct(id, productData);
    return response.data;
  }

  async editProduct(id) {
    try {
      Utils.loading.show();
      const response = await API.products.getProduct(id);
      this.openEditModal(response.data);
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "editProduct");
      Utils.toast.error(message);
    } finally {
      Utils.loading.hide();
    }
  }

  async deleteProduct(id) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      Utils.toast.error("Product not found");
      return;
    }

    const confirmed = await this.showDeleteConfirmation(product.name);
    if (!confirmed) return;

    try {
      Utils.loading.show();
      await API.products.deleteProduct(id);
      Utils.toast.success("Product deleted successfully");
      await this.loadProducts();
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "deleteProduct");
      Utils.toast.error(message);
    } finally {
      Utils.loading.hide();
    }
  }

  async showDeleteConfirmation(productName) {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.style.display = "block";
      modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>Delete Product</h3>
                    </div>
                    <div style="padding: 1.5rem;">
                        <p>Are you sure you want to delete "<strong>${productName}</strong>"?</p>
                        <p style="color: #dc3545; font-size: 0.9rem; margin-top: 1rem;">
                            This action cannot be undone.
                        </p>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="confirmCancel">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                    </div>
                </div>
            `;

      document.body.appendChild(modal);

      const cancelBtn = modal.querySelector("#confirmCancel");
      const deleteBtn = modal.querySelector("#confirmDelete");

      const cleanup = () => {
        document.body.removeChild(modal);
      };

      cancelBtn.onclick = () => {
        cleanup();
        resolve(false);
      };

      deleteBtn.onclick = () => {
        cleanup();
        resolve(true);
      };

      // Close on outside click
      modal.onclick = (e) => {
        if (e.target === modal) {
          cleanup();
          resolve(false);
        }
      };
    });
  }

  // Utility methods
  refreshData() {
    this.loadProducts();
  }

  exportProducts() {
    try {
      const csvContent = this.generateCSV();
      this.downloadCSV(csvContent, "products.csv");
      Utils.toast.success("Products exported successfully");
    } catch (error) {
      Utils.toast.error("Failed to export products");
    }
  }

  generateCSV() {
    const headers = [
      "ID",
      "Name",
      "Barcode",
      "Category",
      "Unit",
      "Description",
      "Stock Quantity",
      "Created At",
      "Updated At",
    ];
    const rows = this.products.map((product) => [
      product.id,
      `"${product.name}"`,
      product.barcode || "",
      product.category,
      product.unit_name || "",
      `"${product.description || ""}"`,
      product.stock_quantity,
      Utils.DateUtils.formatDate(product.created_at, "YYYY-MM-DD HH:mm"),
      Utils.DateUtils.formatDate(product.updated_at, "YYYY-MM-DD HH:mm"),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Keyboard shortcuts
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N for new product
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      this.openAddModal();
    }

    // Ctrl/Cmd + F for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      this.searchInput.focus();
    }
  }

  // Initialize keyboard shortcuts
  initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e),
    );
  }

  // Error handling for API calls
  handleAPIError(error, operation) {
    Utils.ErrorHandler.logError(error, `ProductManager.${operation}`, {
      currentPage: this.currentPage,
      currentFilters: this.currentFilters,
      editingProductId: this.editingProductId,
    });

    const message = Utils.ErrorHandler.handle(error, operation);
    Utils.toast.error(message);
  }

  // Product statistics
  getProductStats() {
    const stats = {
      total: this.products.length,
      inStock: this.products.filter((p) => p.stock_quantity > 0).length,
      lowStock: this.products.filter(
        (p) => p.stock_quantity > 0 && p.stock_quantity <= 5,
      ).length,
      outOfStock: this.products.filter((p) => p.stock_quantity === 0).length,
      categories: [...new Set(this.products.map((p) => p.category))].length,
    };

    return stats;
  }

  // Display product statistics (if needed for dashboard)
  displayStats() {
    const stats = this.getProductStats();
    console.log("Product Statistics:", stats);
    // This could be used to update dashboard widgets
  }
}

// CSS for form validation errors
const validationCSS = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .error-message {
        color: #dc3545;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
`;

// Add validation CSS to head
const style = document.createElement("style");
style.textContent = validationCSS;
document.head.appendChild(style);

// Initialize product manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.productManager = new ProductManager();

  // Initialize keyboard shortcuts
  productManager.initKeyboardShortcuts();

  // Add export button to header if needed
  const header = document.querySelector(".content-header");
  if (header) {
    const exportBtn = document.createElement("button");
    exportBtn.className = "btn btn-secondary";
    exportBtn.innerHTML = "<i class=\"fas fa-download\"></i> Export";
    exportBtn.onclick = () => productManager.exportProducts();

    // Insert before the add button
    const addBtn = header.querySelector("#addProductBtn");
    if (addBtn) {
      header.insertBefore(exportBtn, addBtn);
    }
  }

  // Display initial stats
  setTimeout(() => {
    productManager.displayStats();
  }, 1000);
});

// Global functions for onclick handlers
window.editProduct = (id) => productManager.editProduct(id);
window.deleteProduct = (id) => productManager.deleteProduct(id);
