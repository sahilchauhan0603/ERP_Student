// Utility functions for formatting data consistently across the application

/**
 * Formats family income range values to display-friendly text
 * @param {string} income - The income range value from the database
 * @returns {string} - Formatted income range text
 */
export const formatFamilyIncome = (income) => {
  if (!income) return "N/A";
  
  switch (income) {
    case "<5":
      return "Less than ₹5 Lacs";
    case "5-7":
      return "₹5-7 Lacs";
    case "7-10":
      return "₹7-10 Lacs";
    case ">10":
      return "More than ₹10 Lacs";
    default:
      return income; // fallback for any other values
  }
};

/**
 * Formats currency values with proper Indian numbering system
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

/**
 * Formats date strings to a readable format
 * @param {string} dateStr - Date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (error) {
    return dateStr; // fallback to original string if parsing fails
  }
}; 