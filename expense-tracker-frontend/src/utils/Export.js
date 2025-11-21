import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

/**
 * Export transactions to CSV
 */
export const exportToCSV = (
  transactions,
  categories,
  accounts,
  username = "User"
) => {
  const data = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.category_id);
    const account = accounts.find((a) => a.id === t.account_id);

    // Format date
    const date = new Date(t.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return {
      Date: formattedDate,
      Type: t.type,
      Amount: t.amount,
      Description: t.description,
      Category: category?.name || "Unknown",
      Account: account?.name || "Unknown",
    };
  });

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${username}_transactions_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export transactions to PDF
 */
export const exportToPDF = (
  transactions,
  categories,
  accounts,
  username = "User"
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Transaction Report", 14, 22);

  // User and Date
  doc.setFontSize(11);
  doc.text(`User: ${username}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Summary
  doc.setFontSize(12);
  doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 14, 47);
  doc.text(`Total Expenses: $${totalExpense.toFixed(2)}`, 14, 54);
  doc.text(`Net Balance: $${(totalIncome - totalExpense).toFixed(2)}`, 14, 61);

  // Table
  const tableData = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.category_id);
    const account = accounts.find((a) => a.id === t.account_id);

    // Format date
    const date = new Date(t.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return [
      formattedDate,
      t.type.toUpperCase(),
      t.description,
      category?.name || "Unknown",
      account?.name || "Unknown",
      `$${parseFloat(t.amount).toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    head: [["Date", "Type", "Description", "Category", "Account", "Amount"]],
    body: tableData,
    startY: 67,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [168, 85, 247] },
  });

  doc.save(
    `${username}_transactions_${new Date().toISOString().split("T")[0]}.pdf`
  );
};

/**
 * Export analytics to PDF
 */
export const exportAnalyticsToPDF = (
  financialSummary,
  monthlyData,
  categoryBreakdown,
  transactions
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Financial Analytics Report", 14, 22);

  // Date
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  // Summary
  doc.setFontSize(14);
  doc.text("Summary", 14, 45);
  doc.setFontSize(12);
  doc.text(`Total Income: $${financialSummary.totalIncome.toFixed(2)}`, 14, 55);
  doc.text(
    `Total Expenses: $${financialSummary.totalExpense.toFixed(2)}`,
    14,
    62
  );
  doc.text(`Net Balance: $${financialSummary.balance.toFixed(2)}`, 14, 69);
  doc.text(
    `Total Transactions: ${
      financialSummary.incomeCount + financialSummary.expenseCount
    }`,
    14,
    76
  );

  // Category Breakdown
  if (categoryBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.text("Expense Breakdown by Category", 14, 90);

    const categoryData = categoryBreakdown
      .slice(0, 10)
      .map((cat) => [
        cat.name,
        `$${cat.total.toFixed(2)}`,
        `${((cat.total / financialSummary.totalExpense) * 100).toFixed(1)}%`,
      ]);

    autoTable(doc, {
      head: [["Category", "Amount", "Percentage"]],
      body: categoryData,
      startY: 95,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [168, 85, 247] },
    });
  }

  doc.save(`analytics_${new Date().toISOString().split("T")[0]}.pdf`);
};
