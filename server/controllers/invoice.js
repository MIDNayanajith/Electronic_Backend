import moment from "moment";
import { db } from "../connect.js";

// Create Invoice
export const createInvoice = (req, res) => {
  const { customer_name, items } = req.body; // customer_name and items array with item_id, quantity

  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json("Customer name and items are required");
  }

  // Calculate total amount for the invoice
  let totalAmount = 0;
  items.forEach((item) => {
    totalAmount += item.quantity * item.unit_price;
  });

  // Create the invoice in the invoice table
  const invoiceQuery = `
    INSERT INTO invoices (customer_name, total_amount, created_at, is_delete)
    VALUES (?, ?, ?, ?)
  `;
  const invoiceValues = [
    customer_name,
    totalAmount,
    moment().format("YYYY-MM-DD HH:mm:ss"),
    0, // is_delete = 0 (active)
  ];

  db.query(invoiceQuery, invoiceValues, (err, invoiceData) => {
    if (err) return res.status(500).json(err);

    const invoiceId = invoiceData.insertId;

    // Now, create the sales records and update the item quantities
    const saleQuery = `
      INSERT INTO sale (item_id, invoice_id, customer_name, quantity, unit_price, total_price, sale_date, warranty_period, warranty_expiry, is_delete)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    items.forEach((item) => {
      const total_price = item.quantity * item.unit_price;
      const saleDate = moment().format("YYYY-MM-DD");
      const warranty_expiry = moment()
        .add(item.warranty_period, "months")
        .format("YYYY-MM-DD");

      // Insert the sale record
      const saleValues = [
        item.item_id,
        invoiceId,
        customer_name,
        item.quantity,
        item.unit_price,
        total_price,
        saleDate,
        item.warranty_period,
        warranty_expiry,
        0, // is_delete = 0 (active)
      ];

      db.query(saleQuery, saleValues, (err, saleData) => {
        if (err) return res.status(500).json(err);

        // Update the quantity of the item in the items table
        const updateItemQuery = `
          UPDATE items SET quantity = quantity - ? WHERE id = ?
        `;
        db.query(
          updateItemQuery,
          [item.quantity, item.item_id],
          (err, updateData) => {
            if (err) return res.status(500).json(err);

            // Update the item status if quantity is low or out of stock
            updateItemStatus(item.item_id);
          }
        );
      });
    });

    res.json({
      message: "Invoice created successfully!",
      invoiceId: invoiceId,
      totalAmount: totalAmount,
    });
  });
};

// Helper function to update item status based on quantity
const updateItemStatus = (itemId) => {
  const checkQuantityQuery = "SELECT quantity FROM items WHERE id = ?";

  db.query(checkQuantityQuery, [itemId], (err, data) => {
    if (err) return;

    const quantity = data[0].quantity;
    let status = "out of stock";

    if (quantity > 5) {
      status = "in stock";
    } else if (quantity > 0) {
      status = "low stock";
    }

    // Update the item status
    const updateStatusQuery = "UPDATE items SET status = ? WHERE id = ?";
    db.query(updateStatusQuery, [status, itemId], (err) => {
      if (err) return;
    });
  });
};
