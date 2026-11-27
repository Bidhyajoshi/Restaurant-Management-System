const bookingForm = document.getElementById("bookingForm");
const customerNameInput = document.getElementById("customerName");
const phoneInput = document.getElementById("phone");
const hallCheckboxes = document.querySelectorAll(".hall-checkbox");
const tablesInput = document.getElementById("tables");
const chairsInput = document.getElementById("chairsPerTable"); // FIXED: matched with index.html ID
const dateInput = document.getElementById("date");
const layoutSection = document.getElementById("layoutSection");
const layoutSummary = document.getElementById("layoutSummary");
const layoutInfo = document.getElementById("layoutInfo");
const layoutGrid = document.getElementById("layoutGrid");
const suggestion = document.getElementById("suggestion");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");
const message = document.getElementById("message");
const clearBtn = document.getElementById("clearBtn");
const refreshBtn = document.getElementById("refreshBtn");
const bookingsList = document.getElementById("bookingsList");

let selectedLayout = null;
let currentBookingData = null;

/* =====================================================
   DATE
===================================================== */
function setMinimumDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${year}-${month}-${day}`;
}
setMinimumDate();

/* =====================================================
   PHONE
===================================================== */
phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

/* =====================================================
   ONLY ONE HALL
===================================================== */
hallCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
        if (this.checked) {
            hallCheckboxes.forEach(function (other) {
                if (other !== checkbox) {
                    other.checked = false;
                }
            });
        }
    });
});

/* =====================================================
   GET HALL
===================================================== */
function getSelectedHall() {
    for (const checkbox of hallCheckboxes) {
        if (checkbox.checked) {
            return {
                width: Number(checkbox.dataset.width),
                length: Number(checkbox.dataset.length),
                dimensions: `${checkbox.dataset.width} × ${checkbox.dataset.length} ft`
            };
        }
    }
    return null;
}

/* =====================================================
   HALL CAPACITY
===================================================== */
function calculateCapacity(hallWidth, hallLength) {
    const tableSpace = 4;
    const gap = 1;

    const columns = Math.floor((hallWidth + gap) / (tableSpace + gap));
    const rows = Math.floor((hallLength + gap) / (tableSpace + gap));

    return {
        columns: Math.max(1, columns),
        rows: Math.max(1, rows),
        maxTables: Math.max(1, columns * rows)
    };
}

/* =====================================================
   DATE VALIDATION
===================================================== */
function isDateValid(dateString) {
    if (!dateString) return false;

    const selectedDate = new Date(dateString + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
}

/* =====================================================
   MESSAGE
===================================================== */
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

/* =====================================================
   GENERATE LAYOUTS
===================================================== */
function generateLayouts(hall, tables, chairs, capacity) {
    layoutGrid.innerHTML = "";

    const layouts = [
        { name: "Rows Layout", type: "rows" },
        { name: "Balanced Layout", type: "balanced" },
        { name: "U-Shape Layout", type: "u-shape" },
        { name: "Cluster Layout", type: "cluster" }
    ];

    layouts.forEach(function (layout) {
        const card = createLayoutCard(
            layout.name,
            layout.type,
            hall,
            tables,
            chairs,
            capacity
        );
        layoutGrid.appendChild(card);
    });
}

/* =====================================================
   CREATE LAYOUT CARD
===================================================== */
function createLayoutCard(layoutName, layoutType, hall, tables, chairs, capacity) {
    const card = document.createElement("div");
    card.className = "layout-card";

    const heading = document.createElement("h3");
    heading.textContent = layoutName;

    const description = document.createElement("p");
    description.textContent = `${tables} tables • ${chairs} chairs per table • ${tables * chairs} chairs total`;

    const preview = document.createElement("div");
    preview.className = "hall-preview";

    createHallLayout(preview, layoutType, hall, tables, chairs, capacity);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "select-layout-btn";
    button.textContent = "Select This Layout";

    button.addEventListener("click", function () {
        document.querySelectorAll(".layout-card").forEach(function (otherCard) {
            otherCard.classList.remove("selected-layout");
            const otherButton = otherCard.querySelector(".select-layout-btn");
            if (otherButton) {
                otherButton.textContent = "Select This Layout";
            }
        });

        card.classList.add("selected-layout");
        button.textContent = "✓ Layout Selected";
        selectedLayout = layoutName;
        confirmBookingBtn.disabled = false;
    });

    card.appendChild(heading);
    card.appendChild(description);
    card.appendChild(preview);
    card.appendChild(button);

    return card;
}

/* =====================================================
   CREATE HALL LAYOUT
===================================================== */
function createHallLayout(container, layoutType, hall, tables, chairs, capacity) {
    let positions = [];

    if (layoutType === "rows") {
        let columns = Math.min(capacity.columns, tables);
        let rows = Math.ceil(tables / columns);

        for (let row = 0; row < rows; row++) {
            const tablesInRow = Math.min(columns, tables - row * columns);
            for (let col = 0; col < tablesInRow; col++) {
                positions.push({
                    x: getRowX(col, tablesInRow),
                    y: getRowY(row, rows)
                });
            }
        }
    } else if (layoutType === "balanced") {
        let columns = Math.ceil(Math.sqrt(tables));
        columns = Math.min(columns, capacity.columns);
        columns = Math.max(1, columns);
        let rows = Math.ceil(tables / columns);

        for (let row = 0; row < rows; row++) {
            const tablesInRow = Math.min(columns, tables - row * columns);
            for (let col = 0; col < tablesInRow; col++) {
                positions.push({
                    x: getRowX(col, tablesInRow),
                    y: getRowY(row, rows)
                });
            }
        }
    } else if (layoutType === "u-shape") {
        const topCount = Math.ceil(tables * 0.5);
        const remaining = tables - topCount;
        const sideCount = Math.ceil(remaining / 2);

        for (let i = 0; i < topCount; i++) {
            positions.push({
                x: getRowX(i, topCount),
                y: 25
            });
        }

        for (let i = 0; i < sideCount; i++) {
            positions.push({
                x: 20,
                y: 50 + i * (50 / (sideCount + 1))
            });
        }

        const rightCount = tables - topCount - sideCount;
        for (let i = 0; i < rightCount; i++) {
            positions.push({
                x: 80,
                y: 50 + i * (50 / (rightCount + 1))
            });
        }
    } else {
        let columns = Math.ceil(Math.sqrt(tables));
        columns = Math.min(columns, 3);
        const rows = Math.ceil(tables / columns);

        for (let row = 0; row < rows; row++) {
            const tablesInRow = Math.min(columns, tables - row * columns);
            for (let col = 0; col < tablesInRow; col++) {
                positions.push({
                    x: getRowX(col, tablesInRow),
                    y: getRowY(row, rows)
                });
            }
        }
    }

    positions.forEach(function (position, index) {
        createTable(container, position.x, position.y, index + 1);
    });

    positions.forEach(function (position) {
        createChairs(container, position.x, position.y, chairs);
    });
}

function getRowX(index, count) {
    if (count === 1) return 50;
    const start = 15;
    const end = 85;
    return start + index * ((end - start) / (count - 1));
}

function getRowY(index, count) {
    if (count === 1) return 50;
    const start = 25;
    const end = 75;
    return start + index * ((end - start) / (count - 1));
}

function createTable(container, x, y, tableNumber) {
    const table = document.createElement("div");
    table.className = "table-item";
    table.style.width = "42px";
    table.style.height = "42px";
    table.style.left = x + "%";
    table.style.top = y + "%";
    table.textContent = `T${tableNumber}`;
    container.appendChild(table);
}

function createChairs(container, x, y, count) {
    const distance = 34;
    const chairPositions = [];

    if (count === 1) {
        chairPositions.push({ left: 50, top: 50 - distance });
    } else if (count === 2) {
        chairPositions.push(
            { left: 50, top: 50 - distance },
            { left: 50, top: 50 + distance }
        );
    } else if (count === 3) {
        chairPositions.push(
            { left: 25, top: 50 - distance },
            { left: 75, top: 50 - distance },
            { left: 50, top: 50 + distance }
        );
    } else if (count === 4) {
        chairPositions.push(
            { left: 25, top: 50 - distance },
            { left: 75, top: 50 - distance },
            { left: 25, top: 50 + distance },
            { left: 75, top: 50 + distance }
        );
    } else if (count === 5) {
        chairPositions.push(
            { left: 20, top: 50 - distance },
            { left: 50, top: 50 - distance },
            { left: 80, top: 50 - distance },
            { left: 50 + distance, top: 50 },
            { left: 50, top: 50 + distance }
        );
    } else if (count === 6) {
        chairPositions.push(
            { left: 25, top: 50 - distance },
            { left: 75, top: 50 - distance },
            { left: 50 + distance, top: 50 },
            { left: 25, top: 50 + distance },
            { left: 75, top: 50 + distance },
            { left: 50 - distance, top: 50 }
        );
    } else if (count === 7) {
        chairPositions.push(
            { left: 20, top: 50 - distance },
            { left: 50, top: 50 - distance },
            { left: 80, top: 50 - distance },
            { left: 50 + distance, top: 50 },
            { left: 25, top: 50 + distance },
            { left: 75, top: 50 + distance },
            { left: 50 - distance, top: 50 }
        );
    } else if (count === 8) {
        chairPositions.push(
            { left: 20, top: 50 - distance },
            { left: 40, top: 50 - distance },
            { left: 60, top: 50 - distance },
            { left: 80, top: 50 - distance },
            { left: 20, top: 50 + distance },
            { left: 40, top: 50 + distance },
            { left: 60, top: 50 + distance },
            { left: 80, top: 50 + distance }
        );
    } else if (count === 9) {
        chairPositions.push(
            { left: 25, top: 50 - distance },
            { left: 50, top: 50 - distance },
            { left: 75, top: 50 - distance },
            { left: 50 + distance, top: 35 },
            { left: 50 + distance, top: 65 },
            { left: 25, top: 50 + distance },
            { left: 50, top: 50 + distance },
            { left: 75, top: 50 + distance },
            { left: 50 - distance, top: 50 }
        );
    } else if (count === 10) {
        chairPositions.push(
            { left: 20, top: 50 - distance },
            { left: 40, top: 50 - distance },
            { left: 60, top: 50 - distance },
            { left: 80, top: 50 - distance },
            { left: 50 + distance, top: 50 },
            { left: 20, top: 50 + distance },
            { left: 40, top: 50 + distance },
            { left: 60, top: 50 + distance },
            { left: 80, top: 50 + distance },
            { left: 50 - distance, top: 50 }
        );
    } else {
        for (let i = 0; i < count; i++) {
            const angle = (360 / count) * i;
            const radians = (angle * Math.PI) / 180;
            chairPositions.push({
                left: 50 + Math.cos(radians) * distance,
                top: 50 + Math.sin(radians) * distance
            });
        }
    }

    chairPositions.forEach(function (position) {
        const chair = document.createElement("div");
        chair.className = "chair";
        chair.style.left = `calc(${x}% + ${position.left - 50}px)`;
        chair.style.top = `calc(${y}% + ${position.top - 50}px)`;
        container.appendChild(chair);
    });
}

/* =====================================================
   FORM SUBMIT
===================================================== */
bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const customerName = customerNameInput.value.trim();
    if (customerName.length < 2) {
        showMessage("Please enter a valid customer name.", "error");
        return;
    }

    const phone = phoneInput.value.trim();
    if (!/^\d{10}$/.test(phone)) {
        showMessage("Phone number must contain exactly 10 digits.", "error");
        return;
    }

    const hall = getSelectedHall();
    if (!hall) {
        showMessage("Please select one hall.", "error");
        return;
    }

    const tables = Number(tablesInput.value);
    if (!Number.isInteger(tables) || tables < 1 || tables > 50) {
        showMessage("Please enter a valid number of tables.", "error");
        return;
    }

    const chairs = Number(chairsInput.value);
    if (!Number.isInteger(chairs) || chairs < 1 || chairs > 10) {
        showMessage("Please enter a valid number of chairs per table (1 to 10).", "error");
        return;
    }

    const date = dateInput.value;
    if (!isDateValid(date)) {
        showMessage("Booking date cannot be in the past.", "error");
        return;
    }

    const capacity = calculateCapacity(hall.width, hall.length);

    if (tables > capacity.maxTables) {
        layoutSection.classList.remove("hidden");
        layoutSummary.textContent = `${hall.dimensions} Hall | ${tables} Tables | ${chairs} Chairs Per Table`;
        layoutGrid.innerHTML = "";
        suggestion.classList.remove("hidden");
        suggestion.innerHTML = `
            <h3>❌ Arrangement Cannot Fit</h3>
            <p>The selected hall cannot comfortably accommodate <strong>${tables}</strong> tables.</p>
            <p>This hall can accommodate approximately <strong>${capacity.maxTables}</strong> tables.</p>
            <p><strong>Suggestions:</strong></p>
            <ul>
                <li>Reduce the number of tables.</li>
                <li>Select a larger hall.</li>
            </ul>
        `;
        confirmBookingBtn.disabled = true;
        selectedLayout = null;
        showMessage("The selected arrangement does not fit in the hall.", "error");
        return;
    }

    currentBookingData = {
        customerName,
        phone,
        hallWidth: hall.width,
        hallLength: hall.length,
        hallDimensions: hall.dimensions,
        tables,
        chairs,
        totalChairs: tables * chairs,
        date,
        remarks: document.getElementById("remarks").value.trim()
    };

    selectedLayout = null;
    confirmBookingBtn.disabled = true;

    layoutSection.classList.remove("hidden");
    layoutSummary.textContent = `${hall.dimensions} Hall | ${tables} Tables | ${chairs} Chairs Per Table`;
    layoutInfo.innerHTML = `
        <p><strong>Hall:</strong> ${hall.dimensions}</p>
        <p><strong>Number of Tables:</strong> ${tables}</p>
        <p><strong>Chairs Per Table:</strong> ${chairs}</p>
        <p><strong>Total Chairs:</strong> ${tables * chairs}</p>
    `;

    suggestion.classList.add("hidden");
    generateLayouts(hall, tables, chairs, capacity);
    showMessage("Possible layouts generated. Select one layout to continue.", "success");
    layoutSection.scrollIntoView({ behavior: "smooth" });
});

/* =====================================================
   CONFIRM BOOKING
===================================================== */
confirmBookingBtn.addEventListener("click", async function () {
    if (!selectedLayout) {
        showMessage("Please select a layout first.", "error");
        return;
    }

    if (!currentBookingData) {
        showMessage("Booking information is missing.", "error");
        return;
    }

    const booking = {
        customerName: currentBookingData.customerName,
        phone: currentBookingData.phone,
        hallWidth: currentBookingData.hallWidth,
        hallLength: currentBookingData.hallLength,
        hallDimensions: currentBookingData.hallDimensions,
        tables: currentBookingData.tables,
        chairsPerTable: currentBookingData.chairs, // Matches server expectation
        totalChairs: currentBookingData.totalChairs,
        date: currentBookingData.date,
        remarks: currentBookingData.remarks,
        selectedLayout,
        status: "Booked"
    };

    try {
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booking)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to save booking.");
        }

        showMessage(`Booking confirmed successfully! Customer ID: ${result.booking.customerId}`, "success");
        selectedLayout = null;
        currentBookingData = null;
        confirmBookingBtn.disabled = true;
        loadBookings();
    } catch (error) {
        showMessage(error.message, "error");
    }
});

/* =====================================================
   CLEAR
===================================================== */
clearBtn.addEventListener("click", function () {
    bookingForm.reset();
    layoutSection.classList.add("hidden");
    layoutGrid.innerHTML = "";
    layoutInfo.innerHTML = "";
    suggestion.classList.add("hidden");
    confirmBookingBtn.disabled = true;
    selectedLayout = null;
    currentBookingData = null;
    message.className = "message hidden";
    setMinimumDate();
});

/* =====================================================
   LOAD BOOKINGS
===================================================== */
async function loadBookings() {
    try {
        const response = await fetch("/api/bookings");
        const data = await response.json();
        const bookings = Array.isArray(data) ? data : (data.bookings || []);

        bookingsList.innerHTML = "";

        if (bookings.length === 0) {
            bookingsList.innerHTML = "<p>No bookings found.</p>";
            return;
        }

        bookings.forEach(function (booking) {
            const item = document.createElement("div");
            item.className = "booking-item";
            item.innerHTML = `
                <h3>${escapeHTML(booking.customerName)}</h3>
                <p><strong>Customer ID:</strong> ${escapeHTML(booking.customerId)}</p>
                <p><strong>Phone:</strong> ${escapeHTML(booking.phone)}</p>
                <p><strong>Hall:</strong> ${escapeHTML(booking.hallDimensions)}</p>
                <p><strong>Tables:</strong> ${booking.tables}</p>
                <p><strong>Chairs Per Table:</strong> ${booking.chairsPerTable || booking.chairs}</p>
                <p><strong>Total Chairs:</strong> ${booking.totalChairs || (booking.tables * (booking.chairsPerTable || booking.chairs))}</p>
                <p><strong>Date:</strong> ${escapeHTML(booking.date)}</p>
                <p><strong>Selected Layout:</strong> ${escapeHTML(booking.selectedLayout || "Not selected")}</p>
                <p><strong>Status:</strong> <span class="status">${escapeHTML(booking.status || "Booked")}</span></p>
                <p><strong>Remarks:</strong> ${escapeHTML(booking.remarks || "None")}</p>
            `;
            bookingsList.appendChild(item);
        });
    } catch (error) {
        bookingsList.innerHTML = "<p>Unable to load bookings.</p>";
    }
}

function escapeHTML(value) {
    if (value === undefined || value === null) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

refreshBtn.addEventListener("click", loadBookings);
loadBookings();