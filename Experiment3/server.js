const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

// Frontend folder
const PUBLIC_DIR = path.join(__dirname, "public");

// Existing JSON file from Experiment 2
const DATA_FILE = path.join(
    __dirname,
    "..",
    "Experiment2",
    "data",
    "bookings.json"
);

// Experiment 3 JSON file - only for ALTER
const ALTER_DATA_FILE = path.join(
    __dirname,
    "data",
    "bookings.json"
);

// Create Experiment3 data folder/file if they do not exist
if (!fs.existsSync(path.dirname(ALTER_DATA_FILE))) {
    fs.mkdirSync(path.dirname(ALTER_DATA_FILE), { recursive: true });
}

if (!fs.existsSync(ALTER_DATA_FILE)) {
    fs.writeFileSync(
        ALTER_DATA_FILE,
        JSON.stringify({ bookings: [] }, null, 2)
    );
}

// Middleware
app.use(express.json());
app.use(express.static(PUBLIC_DIR));


// ===============================
// GET CUSTOMER BY CUSTOMER ID
// ===============================

app.get("/api/bookings/:customerId", (req, res) => {

    try {
        // Read bookings.json
        const data = fs.readFileSync(DATA_FILE, "utf8");

        // Convert JSON text into JavaScript object
        const bookingsData = JSON.parse(data);

        // Get customer ID from URL
        const customerId = req.params.customerId;

        // Find the customer
        const booking = bookingsData.bookings.find(
            (item) => item.customerId === customerId
        );

        // If customer does not exist
        if (!booking) {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        // Send customer data
        res.json(booking);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error reading bookings.json"
        });
    }
});




// ===============================
// UPDATE CUSTOMER
// ===============================


app.put("/api/bookings/:customerId", (req, res) => {

    try {

        const data = fs.readFileSync(DATA_FILE, "utf8");
        const bookingsData = JSON.parse(data);

        const customerId = req.params.customerId;

        const booking = bookingsData.bookings.find(
            (item) => item.customerId === customerId
        );

        if (!booking) {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        // Update selected customer details
        booking.customerName = req.body.customerName;
        booking.phone = req.body.phone;
        booking.date = req.body.date;
        booking.remarks = req.body.remarks;

        // Increase edit count
        booking.editCount = Number(booking.editCount || 0) + 1;

        // Save updated data
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(bookingsData, null, 2)
        );

        // Send response with booking and editCount
        res.json({
            message: "Customer updated successfully.",
            booking: booking
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error updating customer."
        });
    }
});


// ===============================
// ADD NEW FIELD - ALTER ONLY
// ===============================

app.post("/api/bookings/:customerId/fields", (req, res) => {

    try {

        // Read original Experiment2 data
        const originalData = fs.readFileSync(DATA_FILE, "utf8");
        const originalBookings = JSON.parse(originalData);

        // Read Experiment3 ALTER data
        const alterData = fs.readFileSync(ALTER_DATA_FILE, "utf8");
        const alterBookings = JSON.parse(alterData);

        const customerId = req.params.customerId;

        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;

        // Check field name and value
        if (!fieldName || !fieldValue) {
            return res.status(400).json({
                message: "Field name and value are required."
            });
        }

        // Customer ID should not be changed/added
        if (fieldName === "customerId") {
            return res.status(400).json({
                message: "Customer ID cannot be added or changed."
            });
        }

        // Find customer in Experiment2
        const originalBooking = originalBookings.bookings.find(
            (item) => item.customerId === customerId
        );

        if (!originalBooking) {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        // Check if customer already exists in Experiment3 ALTER data
        let alteredBooking = alterBookings.bookings.find(
            (item) => item.customerId === customerId
        );

        // If customer is being altered for the FIRST time,
        // copy the COMPLETE customer data from Experiment2
        if (!alteredBooking) {

            alteredBooking = {
                ...originalBooking
            };

            alterBookings.bookings.push(alteredBooking);
        }

        // Check whether field already exists
        if (Object.prototype.hasOwnProperty.call(alteredBooking, fieldName)) {
            return res.status(400).json({
                message: "This field already exists."
            });
        }

        // Add the new field to Experiment3 copy
        alteredBooking[fieldName] = fieldValue;

        // IMPORTANT:
        // Save ONLY to Experiment3 JSON
        fs.writeFileSync(
            ALTER_DATA_FILE,
            JSON.stringify(alterBookings, null, 2)
        );

        res.json({
            message: "Field added successfully.",
            booking: alteredBooking
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error adding field."
        });
    }
});
// ===============================
// DELETE FIELD - ALTER ONLY
// ===============================

app.delete("/api/bookings/:customerId/fields/:fieldName", (req, res) => {

    try {

        // Read original Experiment2 data
        const originalData = fs.readFileSync(DATA_FILE, "utf8");
        const originalBookings = JSON.parse(originalData);

        // Read Experiment3 ALTER data
        const alterData = fs.readFileSync(ALTER_DATA_FILE, "utf8");
        const alterBookings = JSON.parse(alterData);

        const customerId = req.params.customerId;
        const fieldName = req.params.fieldName;

        // Find customer in Experiment2
        const originalBooking = originalBookings.bookings.find(
            (item) => item.customerId === customerId
        );

        if (!originalBooking) {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        // Find customer in Experiment3
        let alteredBooking = alterBookings.bookings.find(
            (item) => item.customerId === customerId
        );

        // If customer is being altered for the first time,
        // copy complete data from Experiment2
        if (!alteredBooking) {

            alteredBooking = {
                ...originalBooking
            };

            alterBookings.bookings.push(alteredBooking);
        }

        // Customer ID cannot be deleted
        if (fieldName === "customerId") {
            return res.status(400).json({
                message: "Customer ID cannot be deleted."
            });
        }

        // Check whether field exists
        if (!Object.prototype.hasOwnProperty.call(alteredBooking, fieldName)) {
            return res.status(404).json({
                message: "Field not found."
            });
        }

        // Delete field from Experiment3 copy
        delete alteredBooking[fieldName];

        // IMPORTANT: save only to Experiment3 JSON
        fs.writeFileSync(
            ALTER_DATA_FILE,
            JSON.stringify(alterBookings, null, 2)
        );

        res.json({
            message: "Field deleted successfully.",
            booking: alteredBooking
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error deleting field."
        });
    }
});

app.delete("/api/bookings/:customerId", (req, res) => {
    try {

        const data = fs.readFileSync(DATA_FILE, "utf8");
        const bookingsData = JSON.parse(data);

        const customerId = req.params.customerId;

        const bookingIndex = bookingsData.bookings.findIndex(
            (item) => item.customerId === customerId
        );

        if (bookingIndex === -1) {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        bookingsData.bookings.splice(bookingIndex, 1);

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(bookingsData, null, 2)
        );

        res.json({
            message: "Customer deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error deleting customer."
        });
    }
});


// ===============================
// START SERVER
// =============================


app.listen(PORT, () => {
    console.log(`Experiment 3 running at http://localhost:${PORT}`);
});



