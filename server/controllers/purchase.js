import moment from "moment";
import { db } from "../connect.js";

export const getPurchase = (req, res) => {
  const q =
    "SELECT id,item_id,supplier_id,quantity,unit_price,total_price,date FROM purchase WHERE is_delete = 0";

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

// export const addPurchase = (req, res) => {
//   const { item_id, supplier_id, quantity, unit_price } = req.body;

//   // Calculate total_price
//   const total_price = quantity * unit_price;

//   const q =
//     "INSERT INTO purchase (`item_id`,`supplier_id`,`quantity`,`unit_price`,`total_price`,`date`,`is_delete`) VALUES (?)";

//   const values = [
//     item_id,
//     supplier_id,
//     quantity,
//     unit_price,
//     total_price,
//     moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//     0, // is_delete = 0 (active)
//   ];

//   db.query(q, [values], (err, data) => {
//     if (err) return res.status(500).json(err);

//     const updateItem = "UPDATE items SET quantity = quantity + ? WHERE id = ?";
//     db.query(updateItem, [quantity, item_id], (err, data) => {
//       if (err) return res.status(500).json(err);
//       res.json(
//         "Purchase has been created successfully, and item quantity updated!"
//       );
//     });
//   });
// };

export const addPurchase = (req, res) => {
  const { item_id, supplier_id, quantity, unit_price } = req.body;

  // Calculate total_price
  const total_price = quantity * unit_price;

  const q =
    "INSERT INTO purchase (`item_id`,`supplier_id`,`quantity`,`unit_price`,`total_price`,`date`,`is_delete`) VALUES (?)";

  const values = [
    item_id,
    supplier_id,
    quantity,
    unit_price,
    total_price,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    0, // is_delete = 0 (active)
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);

    // Update the item quantity
    const updateItemQuantity =
      "UPDATE items SET quantity = quantity + ? WHERE id = ?";
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
            "Purchase has been created successfully, item quantity updated, and status updated!"
          );
        });
      });
    });
  });
};

export const purchaseById = (req, res) => {
  const PurchaseId = req.params.PurchaseId;

  const q =
    "SELECT id,item_id,supplier_id,quantity,unit_price,total_price,date FROM purchase WHERE id =? AND is_delete = 0";

  db.query(q, [PurchaseId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Purchase not found!");
    res.json(data[0]);
  });
};

export const updatePurchase = (req, res) => {
  const PurchaseId = req.params.PurchaseId;
  const { item_id, supplier_id, quantity, unit_price } = req.body;

  // Calculate total_price
  const total_price = quantity * unit_price;

  // Get the old purchase quantity to calculate the difference
  const oldPurchaseQuantity =
    "SELECT quantity, item_id FROM purchase WHERE id = ?";
  db.query(oldPurchaseQuantity, [PurchaseId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Purchase not found");

    const oldQuantity = data[0].quantity;
    const oldItemId = data[0].item_id;

    // Calculate the difference in quantity
    const difference = quantity - oldQuantity;

    // Update the purchase table
    const q =
      "UPDATE purchase SET item_id =?, supplier_id =?, quantity =?, unit_price =?, total_price =?, date =? WHERE id =? AND is_delete = 0";

    const values = [
      item_id,
      supplier_id,
      quantity,
      unit_price,
      total_price,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      PurchaseId,
    ];
    db.query(q, [...values, PurchaseId], (err, data) => {
      if (err) return res.status(500).json(err);

      // Now, update the item quantity based on the difference in quantity
      const updateItemQuantity =
        "UPDATE items SET quantity = quantity + ? WHERE id = ?";
      db.query(updateItemQuantity, [difference, item_id], (err, data) => {
        if (err) return res.status(500).json(err);

        // Now, update the status based on the new quantity
        const updateItemStatus = "UPDATE items SET status = ? WHERE id = ?";
        const getItemQuantity = "SELECT quantity FROM items WHERE id = ?";
        db.query(getItemQuantity, [item_id], (err, data) => {
          if (err) return res.status(500).json(err);

          const updatedQuantity = data[0].quantity;
          let statusValue = "out of stock"; // Default status

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
              "Purchase updated successfully, and item quantity adjusted!"
            );
          });
        });
      });
    });
  });
};

// export const updatePurchase = (req, res) => {
//   const PurchaseId = req.params.PurchaseId;
//   const { item_id, supplier_id, quantity, unit_price } = req.body;

//   // Calculate total_price
//   const total_price = quantity * unit_price;

//   //Get the old purchase quantity
//   const oldPurchaseQuantity =
//     "SELECT quantity, item_id FROM purchase WHERE id = ?";
//   db.query(oldPurchaseQuantity, [PurchaseId], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length === 0) return res.status(404).json("Purchase not found");

//     const oldQuantity = data[0].quantity;
//     const oldItemId = data[0].item_id;

//     //Calculate the difference
//     const difference = quantity - oldQuantity;

//     //Update purchase table
//     const q =
//       "UPDATE purchase SET item_id =?, supplier_id =?, quantity =?, unit_price =?, total_price =?, date =? WHERE id =? AND is_delete = 0";

//     const values = [
//       item_id,
//       supplier_id,
//       quantity,
//       unit_price,
//       total_price,
//       moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
//       PurchaseId,
//     ];
//     db.query(q, [...values, PurchaseId], (err, data) => {
//       if (err) return res.status(500).json(err);

//       const updateItem =
//         "UPDATE items SET quantity = quantity + ? WHERE  id =? ";
//       db.query(updateItem, [difference, item_id], (err, data) => {
//         if (err) return res.status(500).json(err);
//         res.json("Purchase updated successfully, and item quantity adjusted!");
//       });
//     });
//   });
// };

export const deletePurchase = (req, res) => {
  const PurchaseId = req.params.PurchaseId;
  const q = "UPDATE purchase SET is_delete = 1 WHERE id = ? AND is_delete = 0";

  db.query(q, [PurchaseId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Purchase has been deleted successfully!");
  });
};
