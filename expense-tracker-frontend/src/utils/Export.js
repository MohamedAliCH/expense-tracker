import Papa from "papaparse";

/**
 * Export transactions to CSV
 */
export const exportToCSV = (
  transactions,
  categories,
  accounts,
  username = "User",
  currency = "$"
) => {
  const data = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.category_id);
    const account = accounts.find((a) => a.id === t.account_id);

    const date = new Date(t.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return {
      Date: formattedDate,
      Type: t.type,
      Amount: `${currency}${parseFloat(t.amount || 0).toFixed(2)}`,
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
 * Export transactions to PDF (dynamically loads jspdf & jspdf-autotable on demand)
 */
export const exportToPDF = async (
  transactions,
  categories,
  accounts,
  username = "User",
  currency = "$"
) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Expense Tracker — Transaction Report", 14, 22);

  doc.setFontSize(11);
  doc.text(`User: ${username}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  doc.setFontSize(12);
  doc.text(`Total Income: ${currency}${totalIncome.toFixed(2)}`, 14, 47);
  doc.text(`Total Expenses: ${currency}${totalExpense.toFixed(2)}`, 14, 54);
  doc.text(`Net Balance: ${currency}${(totalIncome - totalExpense).toFixed(2)}`, 14, 61);

  const tableData = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.category_id);
    const account = accounts.find((a) => a.id === t.account_id);

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
      `${currency}${parseFloat(t.amount).toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    head: [["Date", "Type", "Description", "Category", "Account", "Amount"]],
    body: tableData,
    startY: 67,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [31, 122, 140] },
  });

  doc.save(
    `${username}_transactions_${new Date().toISOString().split("T")[0]}.pdf`
  );
};

/**
 * Export analytics summary to PDF
 */
export const exportAnalyticsToPDF = async (
  financialSummary,
  monthlyData,
  categoryBreakdown,
  transactions,
  currency = "$"
) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Expense Tracker — Financial Analytics Report", 14, 22);

  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  doc.setFontSize(14);
  doc.text("Summary", 14, 45);
  doc.setFontSize(12);
  doc.text(`Total Income: ${currency}${financialSummary.totalIncome.toFixed(2)}`, 14, 55);
  doc.text(
    `Total Expenses: ${currency}${financialSummary.totalExpense.toFixed(2)}`,
    14,
    62
  );
  doc.text(`Net Balance: ${currency}${financialSummary.balance.toFixed(2)}`, 14, 69);
  doc.text(
    `Total Transactions: ${
      financialSummary.incomeCount + financialSummary.expenseCount
    }`,
    14,
    76
  );

  if (categoryBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.text("Expense Breakdown by Category", 14, 90);

    const categoryData = categoryBreakdown
      .slice(0, 10)
      .map((cat) => [
        cat.name,
        `${currency}${Number(cat.total || cat.value || 0).toFixed(2)}`,
        `${(
          (Number(cat.total || cat.value || 0) /
            Math.max(financialSummary.totalExpense, 1)) *
          100
        ).toFixed(1)}%`,
      ]);

    autoTable(doc, {
      head: [["Category", "Amount", "Percentage"]],
      body: categoryData,
      startY: 95,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [31, 122, 140] },
    });
  }

  doc.save(`analytics_${new Date().toISOString().split("T")[0]}.pdf`);
};
