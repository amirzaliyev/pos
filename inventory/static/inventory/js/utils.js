// Utility Functions for POS System

// Toast notification system
class ToastManager {
  constructor() {
    this.container = document.getElementById("toastContainer");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toastContainer";
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  }

  show(message, type = "info", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = this.getIcon(type);
    toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;

    this.container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = "toastSlideOut 0.3s ease forwards";
        setTimeout(() => {
          if (toast.parentNode) {
            this.container.removeChild(toast);
          }
        }, 300);
      }
    }, duration);

    return toast;
  }

  getIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };
    return icons[type] || icons.info;
  }

  success(message, duration) {
    return this.show(message, "success", duration);
  }

  error(message, duration) {
    return this.show(message, "error", duration);
  }

  warning(message, duration) {
    return this.show(message, "warning", duration);
  }

  info(message, duration) {
    return this.show(message, "info", duration);
  }
}

// Loading overlay manager
class LoadingManager {
  constructor() {
    this.overlay = document.getElementById("loadingOverlay");
    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.id = "loadingOverlay";
      this.overlay.className = "loading-overlay";
      this.overlay.innerHTML = "<div class=\"spinner\"></div>";
      document.body.appendChild(this.overlay);
    }
  }

  show() {
    this.overlay.style.display = "block";
  }

  hide() {
    this.overlay.style.display = "none";
  }
}

// Form validation utilities
class FormValidator {
  static validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  }

  static validateMinLength(value, minLength, fieldName) {
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  }

  static validateMaxLength(value, maxLength, fieldName) {
    if (value.length > maxLength) {
      return `${fieldName} must not exceed ${maxLength} characters`;
    }
    return null;
  }

  static validateNumber(value, fieldName) {
    if (isNaN(value) || isNaN(parseFloat(value))) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  }

  static validatePositiveNumber(value, fieldName) {
    const numberError = this.validateNumber(value, fieldName);
    if (numberError) return numberError;

    if (parseFloat(value) < 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  }
}

// Date formatting utilities
class DateUtils {
  static formatDate(date, format = "YYYY-MM-DD") {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY-MM-DD HH:mm":
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      case "DD/MM/YYYY HH:mm":
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case "YYYY-MM-DD HH:mm:ss":
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  static formatRelativeTime(date) {
    if (!date) return "";

    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  }

  static getCurrentTimestamp() {
    return new Date().toISOString();
  }
}

// String utilities
class StringUtils {
  static capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static truncate(str, maxLength, suffix = "...") {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  static slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static highlightSearch(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "<span class=\"search-highlight\">$1</span>");
  }

  static removeHtml(str) {
    const tmp = document.createElement("div");
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || "";
  }
}

// Number formatting utilities
class NumberUtils {
  static formatCurrency(amount, currency = "USD", locale = "en-US") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  static formatNumber(number, decimals = 2) {
    return Number(number).toFixed(decimals);
  }

  static formatPercentage(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  static addCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

// Local storage utilities
class StorageUtils {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  }

  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }
}

// Event utilities
class EventUtils {
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// DOM utilities
class DOMUtils {
  static createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.keys(attributes).forEach((key) => {
      if (key === "className") {
        element.className = attributes[key];
      } else if (key === "innerHTML") {
        element.innerHTML = attributes[key];
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });

    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  }

  static show(element) {
    if (element) {
      element.style.display = "block";
    }
  }

  static hide(element) {
    if (element) {
      element.style.display = "none";
    }
  }

  static toggle(element) {
    if (element) {
      element.style.display =
        element.style.display === "none" ? "block" : "none";
    }
  }

  static addClass(element, className) {
    if (element && className) {
      element.classList.add(className);
    }
  }

  static removeClass(element, className) {
    if (element && className) {
      element.classList.remove(className);
    }
  }

  static toggleClass(element, className) {
    if (element && className) {
      element.classList.toggle(className);
    }
  }
}

// Error handling utilities
class ErrorHandler {
  static handle(error, context = "") {
    console.error(`Error in ${context}:`, error);

    let message = "An unexpected error occurred";

    if (error.response) {
      // API error
      message =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Network error
      message = "Network error. Please check your connection.";
    } else if (error.message) {
      // JavaScript error
      message = error.message;
    }

    return message;
  }

  static logError(error, context = "", additionalData = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: error.message || error,
      stack: error.stack,
      additionalData,
    };

    console.error("Error logged:", errorInfo);

    // In production, you might want to send this to a logging service
    // this.sendToLoggingService(errorInfo);
  }
}

// Initialize global instances
const toast = new ToastManager();
const loading = new LoadingManager();

// Export utilities for use in other modules
window.Utils = {
  toast,
  loading,
  FormValidator,
  DateUtils,
  StringUtils,
  NumberUtils,
  StorageUtils,
  EventUtils,
  DOMUtils,
  ErrorHandler,
};
