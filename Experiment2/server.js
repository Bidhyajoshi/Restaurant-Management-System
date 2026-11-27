const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = 3000;

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_DIR = path.join(ROOT_DIR, "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

// =========================
// CREATE DATA FOLDER / FILE
// =========================

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            {
                bookings: []
            },
            null,
            2
        )
    );
}

// =========================
// READ BOOKINGS
// =========================

function readBookings() {
    try {

        const data = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        if (!data.trim()) {
            return {
                bookings: []
            };
        }

        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed.bookings)) {
            return {
                bookings: []
            };
        }

        return parsed;

    } catch (error) {

        console.error(
            "Error reading bookings.json:",
            error
        );

        return {
            bookings: []
        };
    }
}

// =========================
// WRITE BOOKINGS
// =========================

function writeBookings(data) {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 2)
    );
}

// =========================
// SEND JSON
// =========================

function sendJSON(
    response,
    statusCode,
    data
) {

    response.writeHead(
        statusCode,
        {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    );

    response.end(
        JSON.stringify(data)
    );
}

// =========================
// VALIDATE BOOKING
// =========================

function validateBooking(data) {

    if (!data || typeof data !== "object") {
        return "Invalid booking data.";
    }

    // Customer Name
    if (
        typeof data.customerName !== "string" ||
        data.customerName.trim() === ""
    ) {
        return "Customer name is required.";
    }

    // Phone
    if (
        typeof data.phone !== "string" ||
        !/^\d{10}$/.test(data.phone)
    ) {
        return "Phone number must be exactly 10 digits.";
    }

    // Hall
    if (
        !Number.isFinite(data.hallWidth) ||
        !Number.isFinite(data.hallLength)
    ) {
        return "Hall dimensions are required.";
    }

    // Tables
    if (
        !Number.isInteger(data.tables) ||
        data.tables < 1 ||
        data.tables > 50
    ) {
        return "Number of tables must be between 1 and 50.";
    }

    // Chairs per table
    if (
        !Number.isInteger(data.chairsPerTable) ||
        data.chairsPerTable < 1 ||
        data.chairsPerTable > 10
    ) {
        return "Number of chairs per table must be between 1 and 10.";
    }

    // Total chairs
    const expectedTotal =
        data.tables * data.chairsPerTable;

    if (
        !Number.isInteger(data.totalChairs) ||
        data.totalChairs !== expectedTotal
    ) {
        return "Invalid total number of chairs.";
    }

    // Date
    if (
        typeof data.date !== "string" ||
        data.date.trim() === ""
    ) {
        return "Date is required.";
    }

    // Selected layout
    if (
        typeof data.selectedLayout !== "string" ||
        data.selectedLayout.trim() === ""
    ) {
        return "Please select a layout.";
    }

    return null;
}

// =========================
// CUSTOMER ID
// =========================

function generateCustomerId() {

    const bookingsData = readBookings();

    let maxNumber = 0;

    bookingsData.bookings.forEach((booking) => {

        if (
            typeof booking.customerId === "string"
        ) {

            const match =
                booking.customerId.match(
                    /CUST-(\d+)/
                );

            if (match) {

                const number =
                    parseInt(match[1]);

                if (number > maxNumber) {
                    maxNumber = number;
                }
            }
        }
    });

    return `CUST-${String(maxNumber + 1).padStart(4, "0")}`;
}

// =========================
// PARSE REQUEST BODY
// =========================

function getRequestBody(request) {

    return new Promise((resolve, reject) => {

        let body = "";

        request.on("data", (chunk) => {
            body += chunk.toString();

            if (body.length > 1024 * 1024) {
                reject(
                    new Error("Request body too large.")
                );

                request.destroy();
            }
        });

        request.on("end", () => {

            try {

                const data =
                    body.trim()
                        ? JSON.parse(body)
                        : {};

                resolve(data);

            } catch (error) {

                reject(
                    new Error(
                        "Invalid JSON data."
                    )
                );
            }
        });

        request.on("error", reject);
    });
}

// =========================
// STATIC FILE
// =========================

function serveStaticFile(
    request,
    response
) {

    const urlPath =
        request.url.split("?")[0];

    let filePath;

    if (
        urlPath === "/" ||
        urlPath === ""
    ) {
        filePath =
            path.join(
                PUBLIC_DIR,
                "index.html"
            );
    } else {

        const safePath =
            path.normalize(
                urlPath
            )
            .replace(/^(\.\.[\/\\])+/, "");

        filePath =
            path.join(
                PUBLIC_DIR,
                safePath
            );
    }

    if (!filePath.startsWith(PUBLIC_DIR)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }

    fs.readFile(
        filePath,
        (error, content) => {

            if (error) {

                response.writeHead(404, {
                    "Content-Type": "text/plain"
                });

                response.end(
                    "File not found"
                );

                return;
            }

            const ext =
                path.extname(filePath)
                    .toLowerCase();

            const contentTypes = {
                ".html": "text/html; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".css": "text/css; charset=utf-8",
                ".json": "application/json; charset=utf-8",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".svg": "image/svg+xml",
                ".ico": "image/x-icon"
            };

            response.writeHead(
                200,
                {
                    "Content-Type":
                        contentTypes[ext] ||
                        "application/octet-stream"
                }
            );

            response.end(content);
        }
    );
}

// =========================
// SERVER
// =========================

const server = http.createServer(
    async (request, response) => {

        try {

            // =========================
            // GET BOOKINGS
            // =========================

            if (
                request.method === "GET" &&
                request.url.startsWith("/api/bookings")
            ) {

                const bookings =
                    readBookings();

                sendJSON(
                    response,
                    200,
                    bookings
                );

                return;
            }

            // =========================
            // POST BOOKING
            // =========================

            if (
                request.method === "POST" &&
                request.url.startsWith("/api/bookings")
            ) {

                let data;

                try {

                    data =
                        await getRequestBody(
                            request
                        );

                } catch (error) {

                    sendJSON(
                        response,
                        400,
                        {
                            message:
                                error.message
                        }
                    );

                    return;
                }

                const validationError =
                    validateBooking(data);

                if (validationError) {

                    sendJSON(
                        response,
                        400,
                        {
                            message:
                                validationError
                        }
                    );

                    return;
                }

                const bookingsData =
                    readBookings();

                const customerId =
                    generateCustomerId();

                const booking = {

                    customerId,

                    customerName:
                        data.customerName.trim(),

                    phone:
                        data.phone,

                    hallWidth:
                        data.hallWidth,

                    hallLength:
                        data.hallLength,

                    hallDimensions:
                        data.hallDimensions,

                    tables:
                        data.tables,

                    chairsPerTable:
                        data.chairsPerTable,

                    totalChairs:
                        data.totalChairs,

                    date:
                        data.date,

                    remarks:
                        typeof data.remarks === "string"
                            ? data.remarks.trim()
                            : "",

                    selectedLayout:
                        data.selectedLayout,

                    createdAt:
                        new Date().toISOString()
                };

                bookingsData.bookings.push(
                    booking
                );

                writeBookings(
                    bookingsData
                );

                sendJSON(
                    response,
                    201,
                    {
                        message:
                            "Booking saved successfully.",
                        booking
                    }
                );

                return;
            }

            // =========================
            // STATIC FILES
            // =========================

            if (request.method === "GET") {

                serveStaticFile(
                    request,
                    response
                );

                return;
            }

            // =========================
            // OTHER METHODS
            // =========================

            response.writeHead(
                405,
                {
                    "Content-Type":
                        "application/json; charset=utf-8"
                }
            );

            response.end(
                JSON.stringify({
                    message:
                        "Method not allowed."
                })
            );

        } catch (error) {

            console.error(
                "Server error:",
                error
            );

            sendJSON(
                response,
                500,
                {
                    message:
                        "Internal server error."
                }
            );
        }
    }
);

// =========================
// START SERVER
// =========================

server.listen(
    PORT,
    () => {

        console.log(
            `Hotel Management System running at http://localhost:${PORT}`
        );
    }
);