import moment from "moment";
import { db } from "../connect.js";

export const getSale = (req, res) => {
  const q =
    "SELECT id,item_id,customer_name,quantity,unit_price,total_price,sale_date FROM sale WHERE is_delete = 0";

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

// export const addSale = (req, res) => {
//   const { item_id, customer_name, quantity, unit_price, warranty_period } =
//     req.body;

//   const total_price = quantity * unit_price;

//   const sale_date = moment().format("YYYY-MM-DD");

//   // Calculate warranty_expiry based on warranty_period (in months)
//   const warranty_expiry = moment()
//     .add(warranty_period, "months")
//     .format("YYYY-MM-DD");

//   // First, check if enough stock is available
//   const checkStockQuery = "SELECT quantity FROM items WHERE id = ?";

//   db.query(checkStockQuery, [item_id], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length === 0) return res.status(404).json("Item not found!");

//     const availableQuantity = data[0].quantity;

//     // Check if the sale quantity is greater than available stock
//     if (quantity > availableQuantity) {
//       return res
//         .status(400)
//         .json(`Insufficient stock! Available quantity: ${availableQuantity}`);
//     }

//     const q =
//       "INSERT INTO sale (`item_id`,`customer_name`,`quantity`,`unit_price`,`total_price`,`sale_date`,`warranty_period`,`warranty_expiry`,`is_delete`) VALUES (?)";

//     const values = [
//       item_id,
//       customer_name,
//       quantity,
//       unit_price,
//       total_price,
//       sale_date,
//       warranty_period,
//       warranty_expiry,
//       0, // is_delete = 0 (active)
//     ];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);

//       const updateItem =
//         "UPDATE items SET quantity = quantity - ? WHERE id = ?";
//       db.query(updateItem, [quantity, item_id], (err, data) => {
//         if (err) return res.status(500).json(err);
//         res.json(
//           "Sale has been created successfully, and item quantity updated!"
//         );
//       });
//     });
//   });
// };

export const addSale = (req, res) => {
  const { item_id, customer_name, quantity, unit_price, warranty_period } =
    req.body;

  const total_price = quantity * unit_price;
  const sale_date = moment().format("YYYY-MM-DD");

  // Calculate warranty_expiry based on warranty_period (in months)
  const warranty_expiry = moment()
    .add(warranty_period, "months")
    .format("YYYY-MM-DD");

  // First, check if enough stock is available
  const checkStockQuery = "SELECT quantity FROM items WHERE id = ?";

  db.query(checkStockQuery, [item_id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Item not found!");

    const availableQuantity = data[0].quantity;

    // Check if the sale quantity is greater than available stock
    if (quantity > availableQuantity) {
      return res
        .status(400)
        .json(`Insufficient stock! Available quantity: ${availableQuantity}`);
    }

    const q =
      "INSERT INTO sale (`item_id`,`customer_name`,`quantity`,`unit_price`,`total_price`,`sale_date`,`warranty_period`,`warranty_expiry`,`is_delete`) VALUES (?)";

    const values = [
      item_id,
      customer_name,
      quantity,
      unit_price,
      total_price,
      sale_date,
      warranty_period,
      warranty_expiry,
      0, // is_delete = 0 (active)
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);

      // Update the item quantity
      const updateItemQuantity =
        "UPDATE items SET quantity = quantity - ? WHERE id = ?";
      db.query(updateItemQuantity, [quantity, item_id], (err, data) => {
        if (err) return res.status(500).json(err);

        // Now, update the status based on the new quantity
        const updateItemStatus = "UPDATE items SET status = ? WHERE id = ?";
        let statusValue = "out of stock"; // Default status

        // Get the updated quantity of the item
        const getItemQuantity = "SELECT quantity FROM items WHERE id = ?";
        db.query(getItemQuantity, [item_id], (err, data) => {
          if (err) return res.status(500).json(err);
          const updatedQuantity = data[0].quantity;

          // Set status based on the updated quantity
          if (updatedQuantity === 0) {
            statusValue = "out of stock";
          } else if (updatedQuantity < 5) {
            statusValue = "low stock";
          } else {
            statusValue = "in stock";
          }

          // Update the status after quantity change
          db.query(updateItemStatus, [statusValue, item_id], (err, data) => {
            if (err) return res.status(500).json(err);
            res.json(
              "Sale has been created successfully, item quantity updated, and status updated!"
            );
          });
        });
      });
    });
  });
};

export const saleById = (req, res) => {
  const SaleId = req.params.SaleId;

  const q =
    "SELECT id,item_id,customer_name,quantity,unit_price,total_price,sale_date FROM sale WHERE id =? AND is_delete = 0";

  db.query(q, [SaleId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Sale not found!");
    res.json(data[0]);
  });
};

// export const updateSale = (req, res) => {
//   const SaleId = req.params.SaleId;
//   const { item_id, customer_name, quantity, unit_price, warranty_period } =
//     req.body;

//   // Calculate total price
//   const total_price = quantity * unit_price;

//   // Current date for sale_date
//   const sale_date = moment().format("YYYY-MM-DD");

//   // Calculate warranty_expiry
//   const warranty_expiry = moment()
//     .add(warranty_period, "months")
//     .format("YYYY-MM-DD");

//   // Get the old sale quantity and item_id
//   const oldSaleQuery = "SELECT quantity, item_id FROM sale WHERE id = ?";
//   db.query(oldSaleQuery, [SaleId], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length === 0) return res.status(404).json("Sale not found");

//     const oldQuantity = data[0].quantity;
//     const oldItemId = data[0].item_id;

//     // Restore the old quantity to stock before updating
//     const restoreStockQuery =
//       "UPDATE items SET quantity = quantity + ? WHERE id = ?";
//     db.query(restoreStockQuery, [oldQuantity, oldItemId], (err) => {
//       if (err) return res.status(500).json(err);

//       // Check if enough stock is available for the new sale quantity
//       const checkStockQuery = "SELECT quantity FROM items WHERE id = ?";
//       db.query(checkStockQuery, [item_id], (err, data) => {
//         if (err) return res.status(500).json(err);
//         if (data.length === 0) return res.status(404).json("Item not found!");

//         const availableQuantity = data[0].quantity;

//         if (quantity > availableQuantity) {
//           return res
//             .status(400)
//             .json(
//               `Insufficient stock! Available quantity: ${availableQuantity}`
//             );
//         }

//         // Update the sale record
//         const updateSaleQuery = `
//                 UPDATE sale
//                 SET item_id = ?, customer_name = ?, quantity = ?, unit_price = ?,
//                     total_price = ?, sale_date = ?, warranty_period = ?, warranty_expiry = ?
//                 WHERE id = ? AND is_delete = 0
//             `;

//         const values = [
//           item_id,
//           customer_name,
//           quantity,
//           unit_price,
//           total_price,
//           sale_date,
//           warranty_period,
//           warranty_expiry,
//           SaleId,
//         ];

//         db.query(updateSaleQuery, values, (err) => {
//           if (err) return res.status(500).json(err);

//           // Deduct the new quantity from stock
//           const deductStockQuery =
//             "UPDATE items SET quantity = quantity - ? WHERE id = ?";
//           db.query(deductStockQuery, [quantity, item_id], (err) => {
//             if (err) return res.status(500).json(err);
//             res.json("Sale updated successfully, and item quantity adjusted!");
//           });
//         });
//       });
//     });
//   });
// };
export const updateSale = (req, res) => {
  const SaleId = req.params.SaleId;
  const { item_id, customer_name, quantity, unit_price, warranty_period } =
    req.body;

  // Calculate total price
  const total_price = quantity * unit_price;

  // Current date for sale_date
  const sale_date = moment().format("YYYY-MM-DD");

  // Calculate warranty_expiry
  const warranty_expiry = moment()
    .add(warranty_period, "months")
    .format("YYYY-MM-DD");

  // Get the old sale quantity and item_id
  const oldSaleQuery = "SELECT quantity, item_id FROM sale WHERE id = ?";
  db.query(oldSaleQuery, [SaleId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Sale not found");

    const oldQuantity = data[0].quantity;
    const oldItemId = data[0].item_id;

    // Restore the old quantity to stock before updating
    const restoreStockQuery =
      "UPDATE items SET quantity = quantity + ? WHERE id = ?";
    db.query(restoreStockQuery, [oldQuantity, oldItemId], (err) => {
      if (err) return res.status(500).json(err);

      // Check if enough stock is available for the new sale quantity
      const checkStockQuery = "SELECT quantity FROM items WHERE id = ?";
      db.query(checkStockQuery, [item_id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Item not found!");

        const availableQuantity = data[0].quantity;

        if (quantity > availableQuantity) {
          return res
            .status(400)
            .json(
              `Insufficient stock! Available quantity: ${availableQuantity}`
            );
        }

        // Update the sale record
        const updateSaleQuery = `
                  UPDATE sale 
                  SET item_id = ?, customer_name = ?, quantity = ?, unit_price = ?, 
                      total_price = ?, sale_date = ?, warranty_period = ?, warranty_expiry = ? 
                  WHERE id = ? AND is_delete = 0
              `;

        const values = [
          item_id,
          customer_name,
          quantity,
          unit_price,
          total_price,
          sale_date,
          warranty_period,
          warranty_expiry,
          SaleId,
        ];

        db.query(updateSaleQuery, values, (err) => {
          if (err) return res.status(500).json(err);

          // Deduct the new quantity from stock
          const deductStockQuery =
            "UPDATE items SET quantity = quantity - ? WHERE id = ?";
          db.query(deductStockQuery, [quantity, item_id], (err) => {
            if (err) return res.status(500).json(err);

            // Now update the status based on the new quantity
            const getItemQuantity = "SELECT quantity FROM items WHERE id = ?";
            db.query(getItemQuantity, [item_id], (err, data) => {
              if (err) return res.status(500).json(err);
              const updatedQuantity = data[0].quantity;

              let statusValue = "out of stock"; // Default status
              if (updatedQuantity === 0) {
                statusValue = "out of stock";
              } else if (updatedQuantity < 5) {
                statusValue = "low stock";
              } else {
                statusValue = "in stock";
              }

              // Update item status after the stock deduction
              const updateItemStatusQuery =
                "UPDATE items SET status = ? WHERE id = ?";
              db.query(updateItemStatusQuery, [statusValue, item_id], (err) => {
                if (err) return res.status(500).json(err);
                res.json(
                  "Sale updated successfully, item quantity and status adjusted!"
                );
              });
            });
          });
        });
      });
    });
  });
};

export const deleteSale = (req, res) => {
  const SaleId = req.params.SaleId;
  const q = "UPDATE sale SET is_delete = 1 WHERE id = ? AND is_delete = 0";

  db.query(q, [SaleId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Sale has been deleted successfully!");
  });
};
