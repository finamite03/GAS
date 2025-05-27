function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle("Inventory Management System")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Fetch SKUs from SKU sheet
function getSKUs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SKU");
  Logger.log("Accessing 'SKU' sheet.");

  const data = sheet.getDataRange().getValues();
  Logger.log("Data range retrieved. Total rows including header: " + data.length);

  const headers = data.shift(); // Remove header row and store headers
  Logger.log("Header row removed: " + headers.join(", "));

  const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone(); // Get spreadsheet timezone
  Logger.log("Spreadsheet timezone: " + timezone);

  const filteredData = data.filter(row => row.some(cell => cell !== ""));
  Logger.log("Filtered non-empty rows. Rows remaining: " + filteredData.length);

  const skus = filteredData.map(row => {
    const skuObject = {
      id: row[0],
      itemName: row[1],
      sku: row[2],
      uom: row[3],
      minLvl: row[4],
      maxLvl: row[5],
      reorderQty: row[6],
      warehouse: row[7],
      location: row[8],
      openingStock: row[9],
      price: row[10],
      vendor1: row[11],
      vendor2: row[12],
      vendor3: row[13],
      vendor4: row[14],
      vendor5: row[15],
      status: row[16],
      addedOn: row[17] instanceof Date ? Utilities.formatDate(row[17], timezone, "dd-MM-yyyy HH:mm:ss") : row[17],
      currentStock: row[18]
    };
    Logger.log("Processed SKU: " + JSON.stringify(skuObject));
    return skuObject;
  });

  Logger.log("Total SKUs processed: " + skus.length);
  return skus;
}


function addSKU(skuData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const skuSheet = ss.getSheetByName("ADD-SKU");
  const stockSheet = ss.getSheetByName("Stock Adjustment_Entries");

  // --- ADD TO ADD-SKU ---
  const skuIds = skuSheet.getRange("A2:A").getValues().flat().filter(Number);
  const newId = skuIds.length > 0 ? Math.max(...skuIds) + 1 : 1;
  const totalValue = skuData.openingStock * skuData.price;

  skuSheet.appendRow([
    newId,
    skuData.itemName,
    skuData.sku,
    skuData.uom,
    skuData.minLvl,
    skuData.maxLvl,
    skuData.reorderQty,
    skuData.warehouse,
    skuData.location,
    skuData.openingStock,
    skuData.price,
    skuData.vendor1 || '',
    skuData.vendor2 || '',
    skuData.vendor3 || '',
    skuData.vendor4 || '',
    skuData.vendor5 || '',
    totalValue,
    "Active",
    new Date()
  ]);

  // --- ADD TO Stock Adjustment_Entries ---
  const stockIds = stockSheet.getRange("A2:A").getValues().flat().filter(Number);
  const newStockId = stockIds.length > 0 ? Math.max(...stockIds) + 1 : 1;

  stockSheet.appendRow([
    newStockId,
    skuData.itemName,
    skuData.sku,
    skuData.openingStock,
    "Opening Stock",
    "",
    new Date()
  ]);

  return "SKU added successfully";
}


// Add this function in the Google Apps Script (server-side code)
function updateSKUStatus(skuId, newStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ADD-SKU'); // Adjust to your sheet
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === skuId) { // Assuming SKU is in column C
      sheet.getRange(i + 1, 18).setValue(newStatus); // Assuming Status is in column Q
      break;
    }
  }
}
function updateSKU(skuData) {
  console.log('Updating SKU:', skuData); // Debugging: Log the SKU data
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ADD-SKU");
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const skuColumnIndex = 2; // SKU is in column C (index 2)

for (let i = 0; i < values.length; i++) {
  if (values[i][skuColumnIndex] === skuData.sku) {
    console.log('SKU found at row:', i + 1); // Debugging: Log the row number
    sheet.getRange(i + 1, 3, 1, 14).setValues(
      [[skuData.sku,
      skuData.uom, 
      skuData.minLvl, 
      skuData.maxLvl, 
      skuData.reorderQty, 
      skuData.warehouse, 
      skuData.location, 
      skuData.openingStock, 
      skuData.price, 
      skuData.vendor1 || '', 
      skuData.vendor2 || '', 
      skuData.vendor3 || '', 
      skuData.vendor4 || '', 
      skuData.vendor5 || '']]);
    return "SKU updated successfully";
  }
}
console.log('SKU not found:', skuData.sku); // Debugging: Log if SKU is not found

  throw new Error("SKU not found");
}
function getVendorNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SKU");
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row

  const vendorColumns = [11, 12, 13, 14, 15]; // Indices for V1, V2, V3, V4, V5 columns
  const vendorsSet = new Set();

  data.forEach(row => {
    vendorColumns.forEach(index => {
      if (row[index]) {
        vendorsSet.add(row[index]);
      }
    });
  });

  return Array.from(vendorsSet);
}
function addSupplier(formData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Suppliers');

  // Get all existing values in column B (ID column)
  const idColumn = sheet.getRange('B2:B' + sheet.getLastRow()).getValues().flat();

  // Find the last ID and increment it
  const lastId = idColumn.filter(id => !isNaN(id)).pop() || 0;
  const newId = lastId + 1;

  const newRow = [
    new Date(),      // Column A: Timestamp
    newId,           // Column B: Auto-generated ID
    formData.vendorName,
    formData.contactPersonName,
    formData.contactNumber,
    formData.addressLine1,
    formData.addressLine2,
    formData.addressLine3,
    formData.city,
    formData.state,
    formData.pinCode,
    formData.gstNo,
    formData.emailId,
    formData.whatsappNo
  ];

  sheet.appendRow(newRow);

  return { status: 'success', message: 'Supplier added successfully', supplierId: newId };
}


function updateSupplier(formData) {
  console.log('Updating Supplier:', formData); // Debugging: Log the form data
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Suppliers');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    data.shift(); // Remove header row

    // Find the row with the matching ID
    for (let i = 0; i < data.length; i++) {
      if (data[i][1].toString().trim() === formData.id.toString().trim()) { // Compare Supplier ID
        // Update the row only if the form data has a value
        if (formData.supplierName) sheet.getRange(i + 2, 3).setValue(formData.supplierName); // Column C: Supplier Name
        if (formData.contactPersonName) sheet.getRange(i + 2, 4).setValue(formData.contactPersonName); // Column D: Contact Person Name
        if (formData.contactNumber) sheet.getRange(i + 2, 5).setValue(formData.contactNumber); // Column E: Contact Number
        if (formData.addressLine1) sheet.getRange(i + 2, 6).setValue(formData.addressLine1); // Column F: Address Line 1
        if (formData.addressLine2) sheet.getRange(i + 2, 7).setValue(formData.addressLine2); // Column G: Address Line 2
        if (formData.addressLine3) sheet.getRange(i + 2, 8).setValue(formData.addressLine3); // Column H: Address Line 3
        if (formData.city) sheet.getRange(i + 2, 9).setValue(formData.city); // Column I: City
        if (formData.state) sheet.getRange(i + 2, 10).setValue(formData.state); // Column J: State
        if (formData.pinCode) sheet.getRange(i + 2, 11).setValue(formData.pinCode); // Column K: PIN Code
        if (formData.gstNo) sheet.getRange(i + 2, 12).setValue(formData.gstNo); // Column L: GST No.
        if (formData.emailId) sheet.getRange(i + 2, 13).setValue(formData.emailId); // Column M: Email ID
        if (formData.whatsappNo) sheet.getRange(i + 2, 14).setValue(formData.whatsappNo); // Column N: WhatsApp No.

        console.log('Supplier updated successfully:', formData.id); // Debugging: Log successful update
        return { status: 'success', message: 'Supplier updated successfully' };
      }
    }

    console.error('Supplier not found:', formData.id); // Debugging: Log if supplier is not found
    return { status: 'error', message: 'Supplier not found' };
  } catch (error) {
    console.error('Error updating supplier:', error); // Debugging: Log any errors
    return { status: 'error', message: 'Error updating supplier: ' + error.message };
  }
}

function getSuppliers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Suppliers");
  const data = sheet.getDataRange().getValues();
  const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone(); // Get spreadsheet timezone
  data.shift(); // Remove the header row

  return data.map(row => ({
    DateAdded: row[0] instanceof Date ? Utilities.formatDate(row[0], timezone, "dd-MM-yyyy hh:mm:ss") : "",
    SupplierID: row[1], // Ensure Supplier ID is correctly mapped
    SupplierName: row[2],
    ContactPersonName: row[3],
    ContactNumber: row[4],
    AddressLine1: row[5],
    AddressLine2: row[6],
    AddressLine3: row[7],
    City: row[8],
    State: row[9],
    PINCode: row[10],
    GSTNo: row[11],
    EmailID: row[12],
    WhatsAppNo: row[13]
  }));
}


function updateWarehouse(warehouseData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Warehouse");
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row

  // Find the row with the matching ID
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == warehouseData.id) {
      // Update the row
      sheet.getRange(i + 2, 2).setValue(warehouseData.vendorName);
      sheet.getRange(i + 2, 3).setValue(warehouseData.location);
      sheet.getRange(i + 2, 4).setValue(warehouseData.managerName);
      sheet.getRange(i + 2, 5).setValue(new Date());

      return "Warehouse updated successfully";
    }
  }

  return "Warehouse not found";
}
// Fetch Warehouse data from Warehouse sheet
function getWarehouseData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Warehouse");
  const data = sheet.getDataRange().getValues();
  data.shift();

  return data.map(row => ({
    srNo: row[0],
    vendorName: row[1],
    location: row[2],
    managerName: row[3],
    addedOn: row[4] instanceof Date ? Utilities.formatDate(row[4], Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss") : row[4]
  }));
}

// Fetch Warehouse names for dropdown
function getWarehouseNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Warehouse");
  const data = sheet.getDataRange().getValues();
  data.shift();
  return data.map(row => row[1]);
}

// Add Warehouse to Warehouse sheet
function addWarehouse(warehouseData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Warehouse");
  const lastRow = sheet.getLastRow();
  const newId = lastRow ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;

  sheet.appendRow([
    newId,
    warehouseData.vendorName,
    warehouseData.location,
    warehouseData.managerName,
    new Date()
  ]);

  return "Warehouse added successfully";
}



// Fetch Transactions from Transactions sheet
function getTransactions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transactions");
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row

  return data
    .filter(row => row.some(cell => cell !== ""))
    .map(row => {
      // Format row[0] if it's a Date
      if (row[0] instanceof Date) {
        row[0] = Utilities.formatDate(row[0], Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss");
      }

      // Format row[3] if it's a Date
      if (row[3] instanceof Date) {
        row[3] = Utilities.formatDate(row[3], Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss");
      }

      return row;
    });
}


// Fetch Manager names for filtering
function getManagerNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Warehouse");
  const data = sheet.getDataRange().getValues();
  data.shift();
  return [...new Set(data.map(row => row[3]))];
}

function addStockAdjustment(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock Adjustment_Entries");
    const lastRow = sheet.getLastRow();
    const newId = lastRow ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    const adjustedOn = new Date();

    // Ensure the data contains the necessary fields
    if (!data.itemName || !data.sku || !data.qty || !data.transactionType) {
        throw new Error("Missing required fields");
    }

    sheet.appendRow([
        newId, // Adjustment Id
        data.itemName, // Item Name
        data.sku, // SKU
        data.qty, // Qty
        data.transactionType, // Adjustment Type
        data.remarks || "", // Remarks (optional)
        adjustedOn // Adjusted On
    ]);

    return "Stock adjustment added successfully";
}

// Fetch Stock Trend Data from Stock Trend sheet
function getStockTrendData() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock Trend");
    const data = sheet.getRange("A2:T" + sheet.getLastRow()).getValues(); // Only get data up to the last row
    return data.filter(row => row[0] !== ""); // Ensure column A (index 0) is not empty
}

function getLocationNames() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Location');
    const data = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();  // Column B (2nd column)
    return data.map(row => row[0]).filter(location => location); // Filter out empty locations
}

function addLocation(locationData) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Location');
    const lastRow = sheet.getLastRow();
    const newRow = [locationData.locationId || '', locationData.location, locationData.locationHandler || ''];
    sheet.getRange(lastRow + 1, 1, 1, 3).setValues([newRow]);
}

// Fetch Locations from Location sheet
function getLocations() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Location');
    const data = sheet.getRange("A2:C" + sheet.getLastRow()).getValues(); // Only get data up to the last row
    return data.filter(row => row[0] !== ""); // Ensure column A (index 0) is not empty
}

// Fetch Manager names for filtering
function getManagerNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Warehouse");
  const data = sheet.getDataRange().getValues();
  data.shift();
  return [...new Set(data.map(row => row[3]))];
}

// Fetch Supplier updates from Supplier Updates sheet
function getSupplierUpdates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Supplier Updates");
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row
  return data.filter(row => row.some(cell => cell !== ""));
}

// Fetch Warehouse updates from Warehouse Updates sheet
function getWarehouseUpdates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Warehouse Updates");
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row
  return data.filter(row => row.some(cell => cell !== ""));
}

function getDashboardData(startDate, endDate) {
  const skus = getSKUs(); // Must include sku, itemName, price, currentStock, warehouse, minLvl, maxLvl, addedOn
  const allTransactions = getTransactions(); // No filtering by date anymore

  // Helper function to correctly parse dates in dd/mm/yyyy format
  function parseCorrectDate(dateStr) {
    if (!dateStr) return null;
    // Check if dateStr is already a Date object
    if (dateStr instanceof Date) return dateStr;
    
    // Extract components - expects format: "dd/mm/yyyy hh:mm:ss" or similar
    const parts = dateStr.split(' ')[0].split('/');
    if (parts.length !== 3) return new Date(dateStr); // fallback to default parsing
    
    // Create date with parts in correct order: year, month (0-based), day
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
  }

  const totalSKUs = skus.length;
  const totalTransactions = allTransactions.length;
  const totalVendors = new Set(skus.map(sku => sku.vendor1)).size;
  const totalWarehouses = new Set(skus.map(sku => sku.warehouse)).size;

  const inventoryValuation = skus.reduce((total, sku) => {
    const stock = sku.currentStock;
    const price = parseFloat(sku.price) || 0;
    return total + (stock * price);
  }, 0);

  const lowStock = skus.filter(sku => sku.currentStock < sku.minLvl);
  const overStock = skus.filter(sku => sku.currentStock > sku.maxLvl);

  const skuTransactionsMap = {};
  allTransactions.forEach(t => {
    const sku = t[3]; // Assuming SKU is in column D
    const qty = parseFloat(t[4]) || 0;
    if (!skuTransactionsMap[sku]) {
      skuTransactionsMap[sku] = 0;
    }
    skuTransactionsMap[sku] += qty;
  });

  const sortedSKUs = Object.entries(skuTransactionsMap).sort((a, b) => b[1] - a[1]);
  const mostMovingSKU = sortedSKUs[0] || ['', 0];
  const leastMovingSKU = sortedSKUs[sortedSKUs.length - 1] || ['', 0];

  const transactionsByType = allTransactions.reduce((acc, t) => {
    const type = t[5]; // Assuming transaction type is column F
    if (type) {
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {});

  const today = new Date();
  const deadStock = skus.filter(sku => {
    const addedOn = parseCorrectDate(sku.addedOn);
    const ageInDays = addedOn ? (today - addedOn) / (1000 * 60 * 60 * 24) : 0;
    const hasTransactions = allTransactions.some(t => t[3] === sku.sku);
    return ageInDays > 30 && !hasTransactions;
  });
  const deadStockCount = deadStock.length;

  const transactionSummary = skus.map(sku => {
    const skuTransactions = allTransactions.filter(t => t[3] === sku.sku);
    const total = skuTransactions.length;
    const purchaseCount = skuTransactions.filter(t => t[5] === 'Purchase').length;
    const saleCount = skuTransactions.filter(t => t[5] === 'Sale').length;
    const adjustedInCount = skuTransactions.filter(t => t[5] === 'Adjusted In').length;
    const adjustedOutCount = skuTransactions.filter(t => t[5] === 'Adjusted Out').length;
    return {
      itemName: sku.itemName,
      sku: sku.sku,
      totalTransactions: total,
      purchase: purchaseCount,
      sale: saleCount,
      adjustedIn: adjustedInCount,
      adjustedOut: adjustedOutCount
    };
  });

  const overallTransactionSummary = {
    totalTransactions: totalTransactions,
    purchase: transactionsByType['Purchase'] || 0,
    sale: transactionsByType['Sale'] || 0,
    adjustedIn: transactionsByType['Adjusted In'] || 0,
    adjustedOut: transactionsByType['Adjusted Out'] || 0
  };

  const inventoryByWarehouse = skus.reduce((acc, sku) => {
    const warehouse = sku.warehouse;
    acc[warehouse] = (acc[warehouse] || 0) + 1;
    return acc;
  }, {});

  const adjustmentTypesCount = allTransactions.reduce((acc, t) => {
    const type = t[5];
    if (type) {
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {});

  // New metrics: Growth in Inventory levels and Stock Movements for last 6 months
  const monthlyGrowth = {};
  const monthlyMovements = {};
  
  // Get last 6 months
  const lastSixMonths = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthYear = `${d.getMonth() + 1}/${d.getFullYear()}`;
    lastSixMonths.push({
      monthYear: monthYear,
      month: d.getMonth(),
      year: d.getFullYear()
    });
    // Initialize with zero values
    monthlyGrowth[monthYear] = 0;
    monthlyMovements[monthYear] = 0;
  }

  // Process transactions for growth and movements
  allTransactions.forEach(t => {
    const timestamp = parseCorrectDate(t[0]); // Use our custom date parser
    if (!timestamp || isNaN(timestamp.getTime())) return; // Skip invalid dates
    
    const monthYear = `${timestamp.getMonth() + 1}/${timestamp.getFullYear()}`;
    const quantity = parseFloat(t[4]) || 0; // Column E for quantity
    const isPositive = t[6] === "Positive"; // Column G for positive/negative indicator
    
    // Check if this transaction is within the last 6 months
    const isInLastSixMonths = lastSixMonths.some(m => 
      m.month === timestamp.getMonth() && m.year === timestamp.getFullYear());
    
    if (isInLastSixMonths) {
      // Growth: Sum where Column G = Positive
      if (isPositive) {
        monthlyGrowth[monthYear] = (monthlyGrowth[monthYear] || 0) + quantity;
      }
      
      // Stock Movements: Sum of all quantities (positive - negative)
      monthlyMovements[monthYear] = (monthlyMovements[monthYear] || 0) + quantity;
    }
  });

  // Convert to arrays for easier display
  const growthData = Object.entries(monthlyGrowth)
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });

  const movementData = Object.entries(monthlyMovements)
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });

  // Calculate Top 10 Items by Available Stock
  const top10ItemsByStock = skus
    .map(sku => ({
      itemName: sku.itemName,
      sku: sku.sku,
      currentStock: sku.currentStock
    }))
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 10);

  Logger.log('Top 10 Items by Stock:', top10ItemsByStock);

  return {
    totalSKUs: totalSKUs,
    totalTransactions: totalTransactions,
    totalVendors: totalVendors,
    totalWarehouses: totalWarehouses,
    inventoryValuation: inventoryValuation.toFixed(2),
    lowStock: lowStock.map(sku => [sku.itemName, sku.sku, sku.minLvl, sku.currentStock]),
    overStock: overStock.map(sku => [sku.itemName, sku.sku, sku.maxLvl, sku.currentStock]),
    mostMovingSKU: mostMovingSKU,
    leastMovingSKU: leastMovingSKU,
    transactionsByType: transactionsByType,
    transactionSummary: transactionSummary,
    overallTransactionSummary: overallTransactionSummary,
    inventoryByWarehouse: inventoryByWarehouse,
    adjustmentTypesCount: adjustmentTypesCount,
    deadStockCount: deadStockCount,
    // New metrics
    inventoryGrowth: growthData,
    stockMovements: movementData,
    top10ItemsByStock: top10ItemsByStock // Add this line
  };
}


function handleTransactionImport(rows) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Stock Adjustment_Entries');
    if (!sheet) {
      sheet = ss.insertSheet('Stock Adjustment_Entries');
      sheet.appendRow(['Adjustment Id', 'SKU', 'Qty', 'Adjusted On', 'Adjustment Type', 'Item Name']);
    }

    const lastRow = sheet.getLastRow();
    let lastId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) || 0 : 0;

    const timestamp = new Date();
    const skuSheet = ss.getSheetByName('SKU');
    const skuData = skuSheet.getDataRange().getValues();
    const skuMap = {};
    skuData.slice(1).forEach(row => {
      skuMap[row[2]] = row[1]; // SKU (Column C) -> Item Name (Column B)
    });

    const newRows = rows.map(row => {
      lastId++;
      const sku = row[0];
      const itemName = skuMap[sku] || 'Unknown';
      return [
        lastId, // Adjustment Id
        sku, // SKU
        parseFloat(row[1]) || 0, // Qty
        timestamp, // Adjusted On
        row[2], // Adjustment Type
        itemName // Item Name
      ];
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    return { status: 'success', message: 'Transactions imported successfully' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

function handleSKUImport(rows) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('ADD-SKU');
    if (!sheet) {
      sheet = ss.insertSheet('ADD-SKU');
      sheet.appendRow(['ID', 'Item Name', 'SKU', 'UOM', 'Min Lvl', 'Max Lvl', 'Reorder Qty', 'Warehouse', 'Location', 'Opening Stock', 'Price', 'V1', 'V2', 'V3', 'V4', 'V5', 'Opening Stock*Price', 'SKU Status', 'Added ON']);
    }

    const lastRow = sheet.getLastRow();
    let lastId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) || 0 : 0;

    const timestamp = new Date();
    const newRows = rows.map(row => {
      lastId++;
      const openingStock = parseFloat(row[8]) || 0;
      const price = parseFloat(row[9]) || 0;
      return [
        lastId, // ID
        row[0], // Item Name
        row[1], // SKU
        row[2], // UOM
        parseFloat(row[3]) || 0, // Min Lvl
        parseFloat(row[4]) || 0, // Max Lvl
        parseFloat(row[5]) || 0, // Reorder Qty
        row[6], // Warehouse
        row[7], // Location
        openingStock, // Opening Stock
        price, // Price
        row[10], // V1
        row[11], // V2
        row[12], // V3
        row[13], // V4
        row[14], // V5
        openingStock * price, // Opening Stock*Price
        'Active', // SKU Status
        timestamp // Added ON
      ];
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    return { status: 'success', message: 'SKUs imported successfully' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

function getRecentActivities() {
  console.log('🔍 Starting getRecentActivities function');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log('📒 Active spreadsheet fetched');

  const transactionsSheet = ss.getSheetByName("Transactions");
  const skuSheet = ss.getSheetByName("SKU"); // ✅ Changed from "ADD-SKU" to "SKU"
  console.log('📄 Sheets fetched: Transactions and SKU');

  const transactionsData = transactionsSheet.getDataRange().getValues();
  const skuData = skuSheet.getDataRange().getValues();
  console.log(`📊 Transactions rows: ${transactionsData.length}, SKU rows: ${skuData.length}`);

  const currentTime = new Date();
  const twentyFourHoursAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
  console.log(`⏰ Current time: ${currentTime}, 24 hours ago: ${twentyFourHoursAgo}`);

  const recentTransactions = transactionsData.slice(1).filter(row => {
    const timestamp = new Date(row[0]); // ✅ Column A (Timestamp)
    const isRecent = timestamp >= twentyFourHoursAgo;
    console.log(`🔄 Checking transaction: ${timestamp} -> ${isRecent}`);
    return isRecent;
  }).map(row => {
    const activity = {
      type: "Transaction",
      productName: row[2],      // Column C (Product Name)
      quantity: row[4],         // Column E (Quantity)
      adjustmentType: row[5],   // Column F (Transaction Type)
      timestamp: row[0]         // Column A (Timestamp)
    };
    console.log('✅ Recent Transaction:', activity);
    return activity;
  });

  const recentAddSKUs = skuData.slice(1).filter(row => {
    const timestamp = new Date(row[17]); // Column R (Added On)
    const isRecent = timestamp >= twentyFourHoursAgo;
    console.log(`📦 Checking SKU: ${timestamp} -> ${isRecent}`);
    return isRecent;
  }).map(row => {
    const activity = {
      type: "ADD-SKU",
      skuName: row[1],     // Column B (SKU Name)
      timestamp: row[17]   // Column R (Added On)
    };
    console.log('✅ Recent SKU Added:', activity);
    return activity;
  });

  const result = {
    recentTransactions: recentTransactions || [],
    recentAddSKUs: recentAddSKUs || []
  };

  console.log('📦 Final result:', result);
  return result;
}




function getDropdownValues() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Dropdown");
    const range = sheet.getRange("A2:A");
    const values = range.getValues().flat().filter(value => value !== '');
    return values;
}

function getSKUsForVendorMapping() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SKU");
    if (!sheet) {
        Logger.log('Sheet "SKU" not found');
        return [];
    }
    const data = sheet.getDataRange().getValues();
    Logger.log('Data from SKU sheet:', data); // Debugging: Log the data fetched from the sheet
    if (data.length === 0) {
        Logger.log('No data in "SKU" sheet');
        return [];
    }
    data.shift(); // Remove header row
    Logger.log('Data after removing header row:', data); // Debugging: Log the data after removing the header row
    return data.filter(row => row.some(cell => cell !== ""));
}
function saveVendorMappings(mappings) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ADD-SKU");
    const data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row

    mappings.forEach(mapping => {
        const sku = mapping.sku;
        const row = data.find(row => row[2] === sku); // SKU (Column C)

        if (row) {
            const rowIndex = data.indexOf(row) + 2; // +2 because we removed the header row and indexes are 1-based in Sheets
            sheet.getRange(rowIndex, 11).setValue(mapping.V1 || ''); // V1 (Column K)
            sheet.getRange(rowIndex, 12).setValue(mapping.V2 || ''); // V2 (Column L)
            sheet.getRange(rowIndex, 13).setValue(mapping.V3 || ''); // V3 (Column M)
            sheet.getRange(rowIndex, 14).setValue(mapping.V4 || ''); // V4 (Column N)
            sheet.getRange(rowIndex, 15).setValue(mapping.V5 || ''); // V5 (Column O)
        }
    });

    return "Vendor mappings saved successfully";
}

// Fetch Item Names from SKU sheet
function getItemNames() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SKU");
    const data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row
    return [...new Set(data.map(row => row[1]))]; // Item Name (Column B)
}

// Fetch SKUs by Item Name from SKU sheet
function getSKUsByItemName(itemName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SKU");
    const data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row
    return data.filter(row => row[1] === itemName).map(row => row[2]); // SKU (Column C)
}

// Fetch Adjustment Types from Adjustment Options sheet
function getAdjustmentTypes() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Adjustment Options");
    const data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row
    return data.map(row => row[0]); // Adjustment Type (Column A)
}

function getAdjustmentNature(adjustmentType) {
    console.log('Getting Adjustment Nature for:', adjustmentType); // Debugging: Log the adjustment type
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Adjustment Options");
        const data = sheet.getDataRange().getValues();
        data.shift(); // Remove header row
        const row = data.find(row => row[0] === adjustmentType); // Adjustment Type (Column A)
        if (row) {
            console.log('Found Adjustment Nature:', row[1]); // Debugging: Log the adjustment nature
            return row[1]; // Adjustment Nature (Column B)
        } else {
            console.log('Adjustment Type not found:', adjustmentType); // Debugging: Log if adjustment type is not found
            return '';
        }
    } catch (error) {
        console.error('Error getting adjustment nature:', error); // Debugging: Log any errors
        return '';
    }
}

function getStockAgingReport() {
  const transactionsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transactions");
  const skuSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SKU");
  
  const transactionsData = transactionsSheet.getDataRange().getValues();
  const skuData = skuSheet.getDataRange().getValues();
  
  // Remove header rows
  transactionsData.shift();
  skuData.shift();
  
  const currentTime = new Date();
  const skuTransactionsMap = {};

  // Map transactions to their respective SKUs
  transactionsData.forEach(row => {
    const timestampStr = row[0]; // Assuming Timestamp is in Column A
    const sku = row[3]; // Assuming SKU is in Column D

    if (!sku || !timestampStr) return; // Skip rows with missing SKU or Timestamp

    let timestamp;
    if (timestampStr instanceof Date) {
      timestamp = timestampStr;
    } else {
      // Try parsing the string as a date
      timestamp = new Date(timestampStr);
      if (isNaN(timestamp)) return; // Skip invalid dates
    }

    if (!skuTransactionsMap[sku]) {
      skuTransactionsMap[sku] = [];
    }
    skuTransactionsMap[sku].push(timestamp);
  });

  // Generate the report data
  const reportData = skuData.map(skuRow => {
    const skuCode = skuRow[2]; // Assuming SKU is in Column C
    const skuTransactions = skuTransactionsMap[skuCode] || [];

    if (skuTransactions.length === 0) return null;

    const firstTransactionDate = new Date(Math.min(...skuTransactions));
    const latestTransactionDate = new Date(Math.max(...skuTransactions));

    const daysSinceFirst = Math.floor((currentTime - firstTransactionDate) / (1000 * 60 * 60 * 24));
    const daysSinceLatest = Math.floor((currentTime - latestTransactionDate) / (1000 * 60 * 60 * 24));

    return {
      id: skuRow[0], // Assuming ID is in Column A
      itemName: skuRow[1], // Assuming Item Name is in Column B
      sku: skuCode,
      addedOn: skuRow[17] instanceof Date ? Utilities.formatDate(skuRow[17], Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss") : skuRow[17], // Assuming Added On is in Column R
      daysSinceAdded: daysSinceFirst,
      lastTransactionOn: skuTransactions.length > 0 ? Utilities.formatDate(latestTransactionDate, Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss") : 'N/A',
      daysSinceLastTransaction: skuTransactions.length > 0 ? daysSinceLatest : 'N/A',
      totalTransactions: skuTransactions.length
    };
  }).filter(row => row !== null);

  return reportData;
}
function getSalesDispatchReport() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sale Order _ Dispatch");
    const data = sheet.getDataRange().getValues();
    const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone(); // Get spreadsheet timezone
    data.shift(); // Remove header row

    const reportData = data.map(row => ({
        salesOrder: row[0], // Sales Order (Column A)
        timestamp: row[1] instanceof Date ? Utilities.formatDate(row[1], timezone, "dd-MM-yyyy HH:mm:ss") : row[1], // Timestamp (Column B)
        itemName: row[2], // Item Name (Column C)
        sku: row[3], // SKU (Column D)
        quantity: row[4], // QUANTITY (Column E)
        dispatchQuantity: row[5], // Dispatch Quantity (Column F)
        remainingQuantity: row[6], // Remaining Quantity (Column G)
        dispatchDate: row[7] instanceof Date ? Utilities.formatDate(row[7], timezone, "dd-MM-yyyy HH:mm:ss") : row[7], // Dispatch Date (Column H)
        status: row[8] // Status (Column I)
    }));

    return reportData;
}
function getSalesReturnReport() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sale Return");
    const data = sheet.getDataRange().getValues();
    const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone(); // Get spreadsheet timezone
    data.shift(); // Remove header row

    const reportData = data.map(row => ({
        returnId: row[0], // Return ID (Column A)
        orderId: row[1], // Order ID (Column B)
        customerName: row[2], // Customer Name (Column C)
        itemName: row[3], // Item Name (Column D)
        sku: row[4], // SKU (Column E)
        remainingUnits: row[5], // Remaining Units (Column F)
        dispatchUnits: row[6], // Dispatch Units (Column G)
        returnUnits: row[7], // Return Units (Column H)
        remark: row[8], // Remark (Column I)
        returnDate: row[9] instanceof Date ? Utilities.formatDate(row[9], timezone, "dd-MM-yyyy HH:mm:ss") : row[9], // Return Date (Column J)
        status: row[10], // Status (Column K)
        returnAction: row[11], // Return Action (Column L)
        timestamp: row[12] instanceof Date ? Utilities.formatDate(row[12], timezone, "dd-MM-yyyy HH:mm:ss") : row[12] // Timestamp (Column M)
    }));

    return reportData;
}

function getUniqueItemNames() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SKU'); // Adjust to your sheet
  const data = sheet.getDataRange().getValues();
  const itemNames = new Set(data.slice(1).map(row => row[1])); // Assuming Item Name is in column B
  return Array.from(itemNames);
}

function getUniqueSKUs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SKU'); // Adjust to your sheet
  const data = sheet.getDataRange().getValues();
  const skus = new Set(data.slice(1).map(row => row[2])); // Assuming SKU is in column C
  return Array.from(skus);
}

function getUniqueUOMs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SKU'); // Adjust to your sheet
  const data = sheet.getDataRange().getValues();
  const uoms = new Set(data.slice(1).map(row => row[3])); // Assuming UOM is in column D
  return Array.from(uoms);
}
function getUniqueWarehouses() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SKU'); // Adjust to your sheet
  const data = sheet.getDataRange().getValues();
  const warehouses = new Set(data.slice(1).map(row => row[7])); // Assuming Warehouse is in column H
  return Array.from(warehouses);
}

function getSKUsForVendorMapping() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SKU");
    const data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row
    return data.filter(row => row.some(cell => cell !== ""));
}

function saveVendorMappings(mappings) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ADD-SKU");
    const data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row

    mappings.forEach(mapping => {
        const sku = mapping.sku;
        const row = data.find(row => row[2] === sku); // SKU (Column C)

        if (row) {
            const rowIndex = data.indexOf(row) + 2; // +2 because we removed the header row and indexes are 1-based in Sheets
            sheet.getRange(rowIndex, 12).setValue(mapping.V1 || ''); // V1 (Column K)
            sheet.getRange(rowIndex, 13).setValue(mapping.V2 || ''); // V2 (Column L)
            sheet.getRange(rowIndex, 14).setValue(mapping.V3 || ''); // V3 (Column M)
            sheet.getRange(rowIndex, 15).setValue(mapping.V4 || ''); // V4 (Column N)
            sheet.getRange(rowIndex, 16).setValue(mapping.V5 || ''); // V5 (Column O)
        }
    });

    return "Vendor mappings saved successfully";
}

