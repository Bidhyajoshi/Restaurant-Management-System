
async function searchCustomer() {

    const customerId = document.getElementById("customerId").value.trim();
    const message = document.getElementById("message");

    if (customerId === "") {
        message.innerText = "Please enter Customer ID.";
        return;
    }

    try {

        const response = await fetch(`/api/bookings/${customerId}`);

        // IMPORTANT: Convert response into JSON
        const data = await response.json();

        console.log("UPDATE RESPONSE:", data);
        console.log("UPDATE COUNT:", data.booking?.editCount);

        if (!response.ok) {
            message.innerText = data.message;
            return;
        }

        // Show customer details
        document.getElementById("displayCustomerId").value = data.customerId;
        document.getElementById("customerName").value = data.customerName;
        document.getElementById("phone").value = data.phone;
        document.getElementById("date").value = data.date;
        document.getElementById("remarks").value = data.remarks;

        message.innerText = "Customer found successfully.";

        console.log("CUSTOMER DATA:", data);
        console.log("EDIT COUNT:", data.editCount);

    } catch (error) {

        console.error(error);
        message.innerText = "Unable to connect to the server.";

    }
}


async function updateCustomer() {

    const customerId =
        document.getElementById("displayCustomerId").value;

    const customerName =
        document.getElementById("customerName").value;

    const phone =
        document.getElementById("phone").value;

    const date =
        document.getElementById("date").value;

    const remarks =
        document.getElementById("remarks").value;

    const message =
        document.getElementById("message");

    if (customerId === "") {
        message.innerText = "Please search for a customer first.";
        return;
    }

    try {

        const response = await fetch(
            `/api/bookings/${customerId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    customerName: customerName,
                    phone: phone,
                    date: date,
                    remarks: remarks
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.innerText = data.message;
            return;
        }

        message.innerText = "Customer updated successfully.";
        
        window.showUpdatePopup(
            data.booking.customerName,
            data.booking.customerId,
            data.booking.editCount
         );
    } catch (error) {

        console.error(error);

        message.innerText = "Unable to connect to the server.";
    }
}

async function deleteCustomer() {

    const customerId =
        document.getElementById("displayCustomerId").value;

    const message =
        document.getElementById("message");

    if (customerId === "") {
        message.innerText = "Please search for a customer first.";
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `/api/bookings/${customerId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.innerText = data.message;
            return;
        }

        message.innerText =
            "Customer deleted successfully.";

        document.getElementById("displayCustomerId").value = "";
        document.getElementById("customerName").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("date").value = "";
        document.getElementById("remarks").value = "";

    } catch (error) {

        console.error(error);

        message.innerText =
            "Unable to connect to the server.";
    }
}

function alterFields() {
    document.getElementById("alterOptions").style.display = "block";
}

function showAddField() {
    document.getElementById("addFieldSection").style.display = "block";
}

async function addField() {

    const fieldName =
        document.getElementById("newFieldName").value.trim();

    const fieldValue =
        document.getElementById("newFieldValue").value.trim();

    const customerId =
        document.getElementById("displayCustomerId").value;

    const message =
        document.getElementById("message");

    if (customerId === "") {
        message.innerText = "Please search for a customer first.";
        return;
    }

    if (fieldName === "") {
        message.innerText = "Please enter a field name.";
        return;
    }

    if (fieldValue === "") {
        message.innerText = "Please enter a field value.";
        return;
    }

    try {

        const response = await fetch(
            `/api/bookings/${customerId}/fields`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fieldName: fieldName,
                    fieldValue: fieldValue
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.innerText = data.message;
            return;
        }

        message.innerText = "Field added successfully.";

        document.getElementById("newFieldName").value = "";
        document.getElementById("newFieldValue").value = "";

    } catch (error) {

        console.error(error);

        message.innerText = "Unable to connect to the server.";
    }
}

async function showDeleteField() {

    const customerId =
        document.getElementById("displayCustomerId").value;

    const deleteSection =
        document.getElementById("deleteFieldSection");

    const fieldSelect =
        document.getElementById("fieldToDelete");

    if (customerId === "") {
        document.getElementById("message").innerText =
            "Please search for a customer first.";
        return;
    }

    try {

        const response =
            await fetch(`/api/bookings/${customerId}`);

        const booking =
            await response.json();

        if (!response.ok) {
            document.getElementById("message").innerText =
                booking.message;
            return;
        }

        fieldSelect.innerHTML =
            '<option value="">Select field to delete</option>';

        Object.keys(booking).forEach((field) => {

            if (field !== "customerId") {

                const option =
                    document.createElement("option");

                option.value = field;
                option.textContent = field;

                fieldSelect.appendChild(option);
            }
        });

        deleteSection.style.display = "block";

    } catch (error) {

        console.error(error);

        document.getElementById("message").innerText =
            "Unable to load fields.";
    }
}

async function deleteField() {

    const customerId =
        document.getElementById("displayCustomerId").value;

    const fieldName =
        document.getElementById("fieldToDelete").value;

    const message =
        document.getElementById("message");

    if (customerId === "") {
        message.innerText = "Please search for a customer first.";
        return;
    }

    if (fieldName === "") {
        message.innerText = "Please select a field to delete.";
        return;
    }

    try {

        const response = await fetch(
            `/api/bookings/${customerId}/fields/${encodeURIComponent(fieldName)}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.innerText = data.message;
            return;
        }

        message.innerText =
            "Field deleted successfully.";

        document.getElementById("fieldToDelete").value = "";

    } catch (error) {

        console.error(error);

        message.innerText =
            "Unable to connect to the server.";
    }
}