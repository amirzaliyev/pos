// Inventory Management Module
class InventoryManager {
  constructor() {
    this.currentTab = "inventory";
    this.currentPage = 1;
    this.movementsPage = 1;
    this.itemsPerPage = 10;
    this.currentFilters = {};
    this.movementFilters = {};
    this.inventoryData = [];
    this.movementsData = [];
    this.products = [];
    this.editingStockId = null;

    this.initializeElements();
    this.attachEventListeners();
    this.loadInitialData();
  }

  initializeElements() {
    // Tab elements
    this.tabButtons = document.querySelectorAll(".tab-btn");
    this.tabContents = document.querySelectorAll(".tab-content");

    // Inventory tab elements
    this.inventorySearchInput = document.getElementById("inventorySearchInput");
    this.stockStatusFilter = document.getElementById("stockStatusFilter");
    this.categoryFilterInventory = document.getElementById(
      "categoryFilterInventory",
    );
    this.sortBy = document.getElementById("sortBy");
    this.inventoryTableBody = document.getElementById("inventoryTableBody");
    this.inventoryPagination = document.getElementById("inventoryPagination");

    // Movements tab elements
    this.movementsSearchInput = document.getElementById("movementsSearchInput");
    this.movementTypeFilter = document.getElementById("movementTypeFilter");
    this.dateFromFilter = document.getElementById("dateFromFilter");
    this.dateToFilter = document.getElementById("dateToFilter");
    this.movementsTableBody = document.getElementById("movementsTableBody");
    this.movementsPagination = document.getElementById("movementsPagination");

    // Alert elements
    this.lowStockAlerts = document.getElementById("lowStockAlerts");
    this.outOfStockAlerts = document.getElementById("outOfStockAlerts");

    // Stats elements
    this.totalItems = document.getElementById("totalItems");
    this.lowStockItems = document.getElementById("lowStockItems");
    this.outOfStockItems = document.getElementById("outOfStockItems");

    // Action buttons
    this.addStockBtn = document.getElementById("addStockBtn");
    this.stockAdjustmentBtn = document.getElementById("stockAdjustmentBtn");
    this.exportInventoryBtn = document.getElementById("exportInventoryBtn");

    // Stock modal elements
    this.stockModal = document.getElementById("stockModal");
    this.stockForm = document.getElementById("stockForm");
    this.stockModalTitle = document.getElementById("stockModalTitle");
    this.closeStockModal = document.getElementById("closeStockModal");
    this.cancelStockBtn = document.getElementById("cancelStockBtn");
    this.stockProduct = document.getElementById("stockProduct");
    this.movementType = document.getElementById("movementType");
    this.stockQuantity = document.getElementById("stockQuantity");
    this.currentStockDisplay = document.getElementById("currentStockDisplay");
    this.movementReference = document.getElementById("movementReference");
    this.stockSubmitText = document.getElementById("stockSubmitText");

    // Bulk stock modal elements
    this.bulkStockModal = document.getElementById("bulkStockModal");
    this.closeBulkStockModal = document.getElementById("closeBulkStockModal");
    this.bulkStockFile = document.getElementById("bulkStockFile");
    this.downloadTemplateBtn = document.getElementById("downloadTemplateBtn");
    this.bulkPreviewSection = document.getElementById("bulkPreviewSection");
    this.bulkPreviewBody = document.getElementById("bulkPreviewBody");
    this.cancelBulkBtn = document.getElementById("cancelBulkBtn");
    this.processBulkBtn = document.getElementById("processBulkBtn");
  }

  attachEventListeners() {
    // Tab navigation
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    // Inventory filters
    this.inventorySearchInput.addEventListener(
      "input",
      Utils.EventUtils.debounce(() => this.handleInventorySearch(), 300),
    );
    this.stockStatusFilter.addEventListener("change", () =>
      this.handleStockStatusFilter(),
    );
    this.categoryFilterInventory.addEventListener("change", () =>
      this.handleCategoryFilter(),
    );
    this.sortBy.addEventListener("change", () => this.handleSortChange());

    // Movement filters
    this.movementsSearchInput.addEventListener(
      "input",
      Utils.EventUtils.debounce(() => this.handleMovementsSearch(), 300),
    );
    this.movementTypeFilter.addEventListener("change", () =>
      this.handleMovementTypeFilter(),
    );
    this.dateFromFilter.addEventListener("change", () =>
      this.handleDateFilter(),
    );
    this.dateToFilter.addEventListener("change", () => this.handleDateFilter());

    // Action buttons
    this.addStockBtn.addEventListener("click", () =>
      this.openStockModal("add"),
    );
    this.stockAdjustmentBtn.addEventListener("click", () =>
      this.openStockModal("adjustment"),
    );
    this.exportInventoryBtn.addEventListener("click", () =>
      this.exportInventory(),
    );

    // Stock modal events
    this.closeStockModal.addEventListener("click", () =>
      this.closeStockModalHandler(),
    );
    this.cancelStockBtn.addEventListener("click", () =>
      this.closeStockModalHandler(),
    );
    this.stockForm.addEventListener("submit", (e) => this.handleStockSubmit(e));
    this.stockProduct.addEventListener("change", () =>
      this.updateCurrentStockDisplay(),
    );

    // Bulk stock modal events
    this.closeBulkStockModal.addEventListener("click", () =>
      this.closeBulkStockModalHandler(),
    );
    this.cancelBulkBtn.addEventListener("click", () =>
      this.closeBulkStockModalHandler(),
    );
    this.downloadTemplateBtn.addEventListener("click", () =>
      this.downloadBulkTemplate(),
    );
    this.bulkStockFile.addEventListener("change", () =>
      this.handleBulkFileUpload(),
    );
    this.processBulkBtn.addEventListener("click", () =>
      this.processBulkUpdate(),
    );

    // Close modals when clicking outside
    this.stockModal.addEventListener("click", (e) => {
      if (e.target === this.stockModal) {
        this.closeStockModalHandler();
      }
    });

    this.bulkStockModal.addEventListener("click", (e) => {
      if (e.target === this.bulkStockModal) {
        this.closeBulkStockModalHandler();
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.stockModal.style.display === "block") {
          this.closeStockModalHandler();
        }
        if (this.bulkStockModal.style.display === "block") {
          this.closeBulkStockModalHandler();
        }
      }
    });
  }

  async loadInitialData() {
    try {
      Utils.loading.show();

      // Load products for dropdown
      await this.loadProducts();

      // Load inventory data
      await this.loadInventoryData();

      // Load movements data
      await this.loadMovementsData();

      // Load alerts
      await this.loadAlerts();

      // Update stats
      this.updateStats();
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "loadInitialData");
      Utils.toast.error(message);
    } finally {
      Utils.loading.hide();
    }
  }

  async loadProducts() {
    try {
      const response = await API.products.getProducts({ limit: 1000 });
      this.products = response.data || [];
      this.populateProductDropdown();
    } catch (error) {
      console.error("Error loading products:", error);
      Utils.toast.error("Failed to load products");
    }
  }

  populateProductDropdown() {
    this.stockProduct.innerHTML = "<option value=\"\">Select Product</option>";

    this.products.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = `${product.name} (${product.stock_quantity || 0} ${product.unit_name || ""})`;
      option.dataset.currentStock = product.stock_quantity || 0;
      this.stockProduct.appendChild(option);
    });
  }

  // Tab Management
  switchTab(tabName) {
    // Update active tab button
    this.tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update active tab content
    this.tabContents.forEach((content) => {
      content.classList.toggle("active", content.id === `${tabName}Tab`);
    });

    this.currentTab = tabName;

    // Load data for the active tab
    switch (tabName) {
      case "inventory":
        this.loadInventoryData();
        break;
      case "movements":
        this.loadMovementsData();
        break;
      case "alerts":
        this.loadAlerts();
        break;
    }
  }

  // Inventory Data Management
  async loadInventoryData() {
    try {
      const params = {
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.currentFilters,
      };

      const response = await API.inventory.getInventory(params);
      this.inventoryData = response.data || [];

      this.renderInventoryTable();
      this.renderInventoryPagination(response.pagination);
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "loadInventoryData");
      Utils.toast.error(message);
      this.renderInventoryEmptyState();
    }
  }

  renderInventoryTable() {
    if (!this.inventoryData.length) {
      this.renderInventoryEmptyState();
      return;
    }

    const tbody = this.inventoryTableBody;
    tbody.innerHTML = "";

    this.inventoryData.forEach((item) => {
      const row = this.createInventoryRow(item);
      tbody.appendChild(row);
    });
  }

  createInventoryRow(item) {
    const row = document.createElement("tr");

    const stockStatus = this.getStockStatus(item.quantity);
    const categoryBadge = this.getCategoryBadge(item.category);
    const lastUpdated = Utils.DateUtils.formatRelativeTime(item.updated_at);

    row.innerHTML = `
            <td>
                <div class="product-info">
                    <div class="product-name">${Utils.StringUtils.highlightSearch(item.name, this.currentFilters.search || "")}</div>
                    <div class="product-details">ID: ${item.product_id}</div>
                </div>
            </td>
            <td>${categoryBadge}</td>
            <td>
                <div class="stock-level">
                    <span class="stock-quantity">${item.quantity}</span>
                    <span class="stock-indicator ${this.getStockIndicatorClass(item.quantity)}"></span>
                </div>
                <div class="stock-progress">
                    <div class="stock-progress-bar ${this.getStockIndicatorClass(item.quantity)}" 
                         style="width: ${this.getStockPercentage(item.quantity)}%"></div>
                </div>
            </td>
            <td>${item.unit_name || "-"}</td>
            <td>${stockStatus}</td>
            <td title="${Utils.DateUtils.formatDate(item.updated_at, "YYYY-MM-DD HH:mm")}">${lastUpdated}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-success" onclick="inventoryManager.quickStockIn(${item.product_id})" title="Quick Stock In">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="inventoryManager.editStock(${item.product_id})" title="Adjust Stock">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="inventoryManager.viewMovements(${item.product_id})" title="View Movements">
                        <i class="fas fa-history"></i>
                    </button>
                </div>
            </td>
        `;

    return row;
  }

  getStockStatus(quantity) {
    let statusClass, statusText;

    if (quantity === 0) {
      statusClass = "out-of-stock";
      statusText = "Out of Stock";
    } else if (quantity <= 5) {
      statusClass = "low-stock";
      statusText = "Low Stock";
    } else {
      statusClass = "in-stock";
      statusText = "In Stock";
    }

    return `<span class="stock-status ${statusClass}">${statusText}</span>`;
  }

  getStockIndicatorClass(quantity) {
    if (quantity === 0) return "out";
    if (quantity <= 5) return "low";
    if (quantity <= 20) return "medium";
    return "high";
  }

  getStockPercentage(quantity) {
    // Calculate percentage based on a reasonable max (e.g., 100)
    const max = 100;
    return Math.min((quantity / max) * 100, 100);
  }

  getCategoryBadge(category) {
    const categoryClass = `category-${category}` || "category-default";
    return `<span class="category-badge ${categoryClass}">${Utils.StringUtils.capitalize(category)}</span>`;
  }

  renderInventoryEmptyState() {
    this.inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-warehouse"></i>
                    <h3>No inventory data found</h3>
                    <p>Try adjusting your search or filters.</p>
                </td>
            </tr>
        `;
  }

  renderInventoryPagination(pagination) {
    if (!pagination) return;

    const { page, totalPages, total } = pagination;
    let paginationHTML = "";

    // Previous button
    paginationHTML += `
            <button ${page <= 1 ? "disabled" : ""} onclick="inventoryManager.goToInventoryPage(${page - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
                <button class="${i === page ? "active" : ""}" onclick="inventoryManager.goToInventoryPage(${i})">
                    ${i}
                </button>
            `;
    }

    // Next button
    paginationHTML += `
            <button ${page >= totalPages ? "disabled" : ""} onclick="inventoryManager.goToInventoryPage(${page + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

    // Pagination info
    const start = (page - 1) * this.itemsPerPage + 1;
    const end = Math.min(page * this.itemsPerPage, total);
    paginationHTML += `
            <span class="pagination-info">
                Showing ${start}-${end} of ${total} items
            </span>
        `;

    this.inventoryPagination.innerHTML = paginationHTML;
  }

  async goToInventoryPage(page) {
    this.currentPage = page;
    await this.loadInventoryData();
  }

  // Filter handlers for inventory
  handleInventorySearch() {
    const searchTerm = this.inventorySearchInput.value.trim();
    if (searchTerm) {
      this.currentFilters.search = searchTerm;
    } else {
      delete this.currentFilters.search;
    }
    this.currentPage = 1;
    this.loadInventoryData();
  }

  handleStockStatusFilter() {
    const status = this.stockStatusFilter.value;
    if (status) {
      this.currentFilters.stock_status = status;
    } else {
      delete this.currentFilters.stock_status;
    }
    this.currentPage = 1;
    this.loadInventoryData();
  }

  handleCategoryFilter() {
    const category = this.categoryFilterInventory.value;
    if (category) {
      this.currentFilters.category = category;
    } else {
      delete this.currentFilters.category;
    }
    this.currentPage = 1;
    this.loadInventoryData();
  }

  handleSortChange() {
    const sortBy = this.sortBy.value;
    if (sortBy) {
      this.currentFilters.sort = sortBy;
    } else {
      delete this.currentFilters.sort;
    }
    this.currentPage = 1;
    this.loadInventoryData();
  }

  // Stock Movements Management
  async loadMovementsData() {
    try {
      const params = {
        page: this.movementsPage,
        limit: this.itemsPerPage,
        ...this.movementFilters,
      };

      const response = await API.inventory.getStockMovements(params);
      this.movementsData = response.data || [];

      this.renderMovementsTable();
      this.renderMovementsPagination(response.pagination);
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "loadMovementsData");
      Utils.toast.error(message);
      this.renderMovementsEmptyState();
    }
  }

  renderMovementsTable() {
    if (!this.movementsData.length) {
      this.renderMovementsEmptyState();
      return;
    }

    const tbody = this.movementsTableBody;
    tbody.innerHTML = "";

    this.movementsData.forEach((movement) => {
      const row = this.createMovementRow(movement);
      tbody.appendChild(row);
    });
  }

  createMovementRow(movement) {
    const row = document.createElement("tr");

    const movementType = this.getMovementTypeBadge(movement.type);
    const quantityChange = this.getQuantityChange(
      movement.type,
      movement.quantity,
    );
    const date = Utils.DateUtils.formatDate(
      movement.created_at,
      "DD/MM/YYYY HH:mm",
    );

    row.innerHTML = `
            <td>${date}</td>
            <td>
                <div class="product-info">
                    <div class="product-name">${movement.product_name}</div>
                    <div class="product-details">ID: ${movement.product_id}</div>
                </div>
            </td>
            <td>${movementType}</td>
            <td>${quantityChange}</td>
            <td class="text-muted">${movement.previous_quantity || 0}</td>
            <td class="text-muted">${movement.new_quantity || 0}</td>
            <td>${movement.reference || "-"}</td>
        `;

    return row;
  }

  getMovementTypeBadge(type) {
    const typeClass = `movement-type ${type}`;
    const typeText =
      type === "in" ? "Stock In" : type === "out" ? "Stock Out" : "Adjustment";
    return `<span class="${typeClass}">${typeText}</span>`;
  }

  getQuantityChange(type, quantity) {
    const isPositive = type === "in";
    const className = isPositive ? "positive" : "negative";
    const icon = isPositive ? "fa-arrow-up" : "fa-arrow-down";
    const sign = isPositive ? "+" : "-";

    return `
            <div class="quantity-change ${className}">
                <i class="fas ${icon}"></i>
                <span>${sign}${quantity}</span>
            </div>
        `;
  }

  renderMovementsEmptyState() {
    this.movementsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <h3>No stock movements found</h3>
                    <p>Try adjusting your search or filters.</p>
                </td>
            </tr>
        `;
  }

  renderMovementsPagination(pagination) {
    if (!pagination) return;

    const { page, totalPages, total } = pagination;
    let paginationHTML = "";

    // Previous button
    paginationHTML += `
            <button ${page <= 1 ? "disabled" : ""} onclick="inventoryManager.goToMovementsPage(${page - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
                <button class="${i === page ? "active" : ""}" onclick="inventoryManager.goToMovementsPage(${i})">
                    ${i}
                </button>
            `;
    }

    // Next button
    paginationHTML += `
            <button ${page >= totalPages ? "disabled" : ""} onclick="inventoryManager.goToMovementsPage(${page + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

    // Pagination info
    const start = (page - 1) * this.itemsPerPage + 1;
    const end = Math.min(page * this.itemsPerPage, total);
    paginationHTML += `
            <span class="pagination-info">
                Showing ${start}-${end} of ${total} movements
            </span>
        `;

    this.movementsPagination.innerHTML = paginationHTML;
  }

  async goToMovementsPage(page) {
    this.movementsPage = page;
    await this.loadMovementsData();
  }

  // Filter handlers for movements
  handleMovementsSearch() {
    const searchTerm = this.movementsSearchInput.value.trim();
    if (searchTerm) {
      this.movementFilters.search = searchTerm;
    } else {
      delete this.movementFilters.search;
    }
    this.movementsPage = 1;
    this.loadMovementsData();
  }

  handleMovementTypeFilter() {
    const type = this.movementTypeFilter.value;
    if (type) {
      this.movementFilters.type = type;
    } else {
      delete this.movementFilters.type;
    }
    this.movementsPage = 1;
    this.loadMovementsData();
  }

  handleDateFilter() {
    const fromDate = this.dateFromFilter.value;
    const toDate = this.dateToFilter.value;

    if (fromDate) {
      this.movementFilters.date_from = fromDate;
    } else {
      delete this.movementFilters.date_from;
    }

    if (toDate) {
      this.movementFilters.date_to = toDate;
    } else {
      delete this.movementFilters.date_to;
    }

    this.movementsPage = 1;
    this.loadMovementsData();
  }

  // Stock Alerts Management
  async loadAlerts() {
    try {
      const lowStockResponse = await API.inventory.getLowStockItems(5);
      const outOfStockItems = this.inventoryData.filter(
        (item) => item.quantity === 0,
      );

      this.renderLowStockAlerts(lowStockResponse.data || []);
      this.renderOutOfStockAlerts(outOfStockItems);
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "loadAlerts");
      Utils.toast.error(message);
    }
  }

  renderLowStockAlerts(lowStockItems) {
    if (!lowStockItems.length) {
      this.lowStockAlerts.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No low stock alerts</h3>
                    <p>All products have sufficient stock levels.</p>
                </div>
            `;
      return;
    }

    this.lowStockAlerts.innerHTML = "";
    lowStockItems.forEach((item) => {
      const alertElement = this.createAlertItem(item, "low-stock");
      this.lowStockAlerts.appendChild(alertElement);
    });
  }

  renderOutOfStockAlerts(outOfStockItems) {
    if (!outOfStockItems.length) {
      this.outOfStockAlerts.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No out of stock alerts</h3>
                    <p>All products are currently in stock.</p>
                </div>
            `;
      return;
    }

    this.outOfStockAlerts.innerHTML = "";
    outOfStockItems.forEach((item) => {
      const alertElement = this.createAlertItem(item, "out-of-stock");
      this.outOfStockAlerts.appendChild(alertElement);
    });
  }

  createAlertItem(item, alertType) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert-item ${alertType}`;

    const isUrgent = alertType === "out-of-stock";
    if (isUrgent) {
      alertDiv.classList.add("urgent");
    }

    alertDiv.innerHTML = `
            <div class="alert-content">
                <div class="alert-product">${item.name || item.product_name}</div>
                <div class="alert-details">
                    Current Stock: ${item.quantity} ${item.unit_name || ""}
                    ${alertType === "low-stock" ? "(Below threshold)" : "(Out of stock)"}
                </div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-sm btn-success" onclick="inventoryManager.quickStockIn(${item.product_id || item.id})">
                    <i class="fas fa-plus"></i> Add Stock
                </button>
                <button class="btn btn-sm btn-info" onclick="inventoryManager.viewMovements(${item.product_id || item.id})">
                    <i class="fas fa-history"></i> History
                </button>
            </div>
        `;

    return alertDiv;
  }

  // Stock Management Modal
  openStockModal(mode = "add", productId = null) {
    this.editingStockId = productId;

    if (mode === "add") {
      this.stockModalTitle.textContent = "Add Stock";
      this.movementType.value = "in";
      this.stockSubmitText.textContent = "Add Stock";
    } else {
      this.stockModalTitle.textContent = "Stock Adjustment";
      this.movementType.value = "";
      this.stockSubmitText.textContent = "Update Stock";
    }

    if (productId) {
      this.stockProduct.value = productId;
      this.updateCurrentStockDisplay();
    }

    this.resetStockForm();
    this.showStockModal();
  }

  showStockModal() {
    this.stockModal.style.display = "block";
    document.body.style.overflow = "hidden";
    setTimeout(() => this.stockQuantity.focus(), 100);
  }

  closeStockModalHandler() {
    this.stockModal.style.display = "none";
    document.body.style.overflow = "auto";
    this.resetStockForm();
    this.editingStockId = null;
  }

  resetStockForm() {
    this.stockForm.reset();
    this.currentStockDisplay.textContent =
      "Select a product to see current stock";
    this.currentStockDisplay.classList.remove("loaded");
    this.clearStockValidationErrors();
  }

  updateCurrentStockDisplay() {
    const selectedOption = this.stockProduct.selectedOptions[0];
    if (selectedOption && selectedOption.value) {
      const currentStock = selectedOption.dataset.currentStock || 0;
      const productName = selectedOption.textContent.split(" (")[0];

      this.currentStockDisplay.textContent = `${productName}: ${currentStock} units`;
      this.currentStockDisplay.classList.add("loaded");
    } else {
      this.currentStockDisplay.textContent =
        "Select a product to see current stock";
      this.currentStockDisplay.classList.remove("loaded");
    }
  }

  async handleStockSubmit(e) {
    e.preventDefault();

    if (!this.validateStockForm()) {
      return;
    }

    const formData = this.getStockFormData();

    try {
      Utils.loading.show();

      await API.inventory.addStockMovement(formData);
      Utils.toast.success("Stock updated successfully");

      this.closeStockModalHandler();
      await this.refreshAllData();
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "handleStockSubmit");
      Utils.toast.error(message);
    } finally {
      Utils.loading.hide();
    }
  }

  validateStockForm() {
    this.clearStockValidationErrors();
    let isValid = true;

    // Validate required fields
    const requiredFields = [
      { field: this.stockProduct, name: "Product" },
      { field: this.movementType, name: "Movement Type" },
      { field: this.stockQuantity, name: "Quantity" },
    ];

    requiredFields.forEach(({ field, name }) => {
      const error = Utils.FormValidator.validateRequired(field.value, name);
      if (error) {
        this.showStockFieldError(field, error);
        isValid = false;
      }
    });

    // Validate quantity
    if (this.stockQuantity.value) {
      const quantityError = Utils.FormValidator.validatePositiveNumber(
        this.stockQuantity.value,
        "Quantity",
      );
      if (quantityError) {
        this.showStockFieldError(this.stockQuantity, quantityError);
        isValid = false;
      }
    }

    return isValid;
  }

  clearStockValidationErrors() {
    const errorElements = this.stockForm.querySelectorAll(".error-message");
    errorElements.forEach((el) => el.remove());

    const fields = this.stockForm.querySelectorAll("input, select, textarea");
    fields.forEach((field) => field.classList.remove("error"));
  }

  showStockFieldError(field, message) {
    field.classList.add("error");

    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.style.color = "#dc3545";
    errorElement.style.fontSize = "0.8rem";
    errorElement.style.marginTop = "0.25rem";

    field.parentNode.appendChild(errorElement);
  }

  getStockFormData() {
    return {
      product_id: parseInt(this.stockProduct.value),
      type: this.movementType.value,
      quantity: parseInt(this.stockQuantity.value),
      reference: this.movementReference.value.trim() || null,
    };
  }

  // Quick Actions
  async quickStockIn(productId) {
    this.openStockModal("add", productId);
  }

  async editStock(productId) {
    this.openStockModal("adjustment", productId);
  }

  async viewMovements(productId) {
    // Switch to movements tab and filter by product
    this.switchTab("movements");
    this.movementFilters.product_id = productId;
    this.movementsPage = 1;
    await this.loadMovementsData();

    // Highlight the filter
    Utils.toast.info(`Showing movements for product ID: ${productId}`);
  }

  // Bulk Stock Operations
  closeBulkStockModalHandler() {
    this.bulkStockModal.style.display = "none";
    document.body.style.overflow = "auto";
    this.bulkPreviewSection.style.display = "none";
    this.bulkStockFile.value = "";
    this.bulkPreviewBody.innerHTML = "";
  }

  downloadBulkTemplate() {
    const csvContent =
      "product_id,type,quantity,reference\n1,in,10,Purchase Order #123\n2,out,5,Sale #456\n3,adjustment,15,Inventory Count";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "bulk_stock_template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async handleBulkFileUpload() {
    const file = this.bulkStockFile.files[0];
    if (!file) return;

    try {
      const text = await this.readFileAsText(file);
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        Utils.toast.error(
          "File must contain at least a header and one data row",
        );
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const requiredHeaders = ["product_id", "type", "quantity", "reference"];

      if (!requiredHeaders.every((h) => headers.includes(h))) {
        Utils.toast.error(
          "File must contain columns: product_id, type, quantity, reference",
        );
        return;
      }

      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }

      this.previewBulkData(data);
    } catch (error) {
      Utils.toast.error("Error reading file: " + error.message);
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  }

  previewBulkData(data) {
    this.bulkPreviewBody.innerHTML = "";

    data.forEach((row) => {
      const product = this.products.find((p) => p.id == row.product_id);
      const isValid =
        product &&
        ["in", "out", "adjustment"].includes(row.type) &&
        row.quantity &&
        !isNaN(row.quantity) &&
        parseInt(row.quantity) > 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${product ? product.name : `Unknown (${row.product_id})`}</td>
                <td>${row.type}</td>
                <td>${row.quantity}</td>
                <td>${row.reference || "-"}</td>
                <td>
                    <span class="preview-status ${isValid ? "valid" : "invalid"}">
                        ${isValid ? "Valid" : "Invalid"}
                    </span>
                </td>
            `;
      this.bulkPreviewBody.appendChild(tr);
    });

    this.bulkPreviewSection.style.display = "block";
    this.bulkData = data;
  }

  async processBulkUpdate() {
    if (!this.bulkData || !this.bulkData.length) {
      Utils.toast.error("No data to process");
      return;
    }

    try {
      Utils.loading.show();

      let successCount = 0;
      let errorCount = 0;

      for (const row of this.bulkData) {
        const product = this.products.find((p) => p.id == row.product_id);
        const isValid =
          product &&
          ["in", "out", "adjustment"].includes(row.type) &&
          row.quantity &&
          !isNaN(row.quantity) &&
          parseInt(row.quantity) > 0;

        if (isValid) {
          try {
            await API.inventory.addStockMovement({
              product_id: parseInt(row.product_id),
              type: row.type,
              quantity: parseInt(row.quantity),
              reference: row.reference || "Bulk Update",
            });
            successCount++;
          } catch (error) {
            errorCount++;
            console.error("Error processing row:", row, error);
          }
        } else {
          errorCount++;
        }
      }

      Utils.toast.success(
        `Bulk update completed: ${successCount} successful, ${errorCount} errors`,
      );
      this.closeBulkStockModalHandler();
      await this.refreshAllData();
    } catch (error) {
      const message = Utils.ErrorHandler.handle(error, "processBulkUpdate");
      Utils.toast.error(message);
    } finally {
      Utils.loading.hide();
    }
  }

  // Export and Statistics
  exportInventory() {
    try {
      const csvContent = this.generateInventoryCSV();
      this.downloadCSV(csvContent, "inventory_report.csv");
      Utils.toast.success("Inventory exported successfully");
    } catch (error) {
      Utils.toast.error("Failed to export inventory");
    }
  }

  generateInventoryCSV() {
    const headers = [
      "Product ID",
      "Product Name",
      "Category",
      "Current Stock",
      "Unit",
      "Status",
      "Last Updated",
    ];
    const rows = this.inventoryData.map((item) => [
      item.product_id,
      `"${item.name}"`,
      item.category,
      item.quantity,
      item.unit_name || "",
      this.getStockStatusText(item.quantity),
      Utils.DateUtils.formatDate(item.updated_at, "YYYY-MM-DD HH:mm"),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  getStockStatusText(quantity) {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 5) return "Low Stock";
    return "In Stock";
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

  updateStats() {
    const totalItems = this.inventoryData.length;
    const lowStockItems = this.inventoryData.filter(
      (item) => item.quantity > 0 && item.quantity <= 5,
    ).length;
    const outOfStockItems = this.inventoryData.filter(
      (item) => item.quantity === 0,
    ).length;

    this.totalItems.textContent = totalItems;
    this.lowStockItems.textContent = lowStockItems;
    this.outOfStockItems.textContent = outOfStockItems;

    // Animate the numbers
    this.animateNumber(this.totalItems, totalItems);
    this.animateNumber(this.lowStockItems, lowStockItems);
    this.animateNumber(this.outOfStockItems, outOfStockItems);
  }

  animateNumber(element, target) {
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (target - start) * progress);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  async refreshAllData() {
    await Promise.all([
      this.loadProducts(),
      this.loadInventoryData(),
      this.loadMovementsData(),
      this.loadAlerts(),
    ]);
    this.updateStats();
  }

  // Utility methods
  getInventoryStats() {
    return {
      total: this.inventoryData.length,
      inStock: this.inventoryData.filter((item) => item.quantity > 0).length,
      lowStock: this.inventoryData.filter(
        (item) => item.quantity > 0 && item.quantity <= 5,
      ).length,
      outOfStock: this.inventoryData.filter((item) => item.quantity === 0)
        .length,
      totalValue: this.inventoryData.reduce(
        (sum, item) => sum + item.quantity * (item.cost || 0),
        0,
      ),
    };
  }
}

// Global functions for onclick handlers
window.inventoryManager = null;

// Initialize inventory manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.inventoryManager = new InventoryManager();

  // Add bulk stock button to header
  const headerActions = document.querySelector(".header-actions");
  if (headerActions) {
    const bulkBtn = document.createElement("button");
    bulkBtn.className = "btn btn-secondary";
    bulkBtn.innerHTML = "<i class=\"fas fa-upload\"></i> Bulk Update";
    bulkBtn.onclick = () => {
      inventoryManager.bulkStockModal.style.display = "block";
      document.body.style.overflow = "hidden";
    };

    // Insert before the add stock button
    const addBtn = headerActions.querySelector("#addStockBtn");
    if (addBtn) {
      headerActions.insertBefore(bulkBtn, addBtn);
    }
  }
});

// Global functions for onclick handlers
window.editStock = (productId) => inventoryManager.editStock(productId);
window.quickStockIn = (productId) => inventoryManager.quickStockIn(productId);
window.viewMovements = (productId) => inventoryManager.viewMovements(productId);
