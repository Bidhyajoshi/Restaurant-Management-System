
import { useState } from 'react';
import './App.css';

function App() {
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [editCount, setEditCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  // Search customer
  const searchCustomer = async () => {
    if (!customerId.trim()) {
      setMessage('Please enter Customer ID.');
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${customerId}`);
      const data = await response.json();

      if (!response.ok) {
        setCustomer(null);
        setMessage(data.message);
        return;
      }

      setCustomer(data);
      setEditCount(data.editCount || 0);
      setMessage('Customer found successfully.');
      setShowThankYou(false);

    } catch (error) {
      setMessage('Unable to connect to the server.');
    }
  };

  // Update customer
  const updateCustomer = async () => {
    if (!customer) {
      setMessage('Please search for a customer first.');
      return;
    }

    try {
      const response = await fetch(
        `/api/bookings/${customer.customerId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerName: customer.customerName,
            phone: customer.phone,
            date: customer.date,
            remarks: customer.remarks
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setCustomer(data.booking);
      setEditCount(data.booking.editCount || editCount + 1);
      setShowThankYou(true);
      setMessage('Profile updated successfully.');

    } catch (error) {
      setMessage('Unable to connect to the server.');
    }
  };

  return (
    <div className="app-container">

      <h1>Customer Registration Management</h1>
      <p>Search and update customer registrations.</p>

      <div className="search-section">
        <label>Customer ID</label>

        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter Customer ID"
        />

        <button onClick={searchCustomer}>
          Search Customer
        </button>
      </div>

      <p className="message">{message}</p>

      {customer && (
        <div className="customer-section">

          <h2>Customer Details</h2>

          <label>Customer ID</label>
          <input value={customer.customerId || ''} readOnly />

          <label>Customer Name</label>
          <input
            value={customer.customerName || ''}
            onChange={(e) =>
              setCustomer({
                ...customer,
                customerName: e.target.value
              })
            }
          />

          <label>Phone</label>
          <input
            value={customer.phone || ''}
            onChange={(e) =>
              setCustomer({
                ...customer,
                phone: e.target.value
              })
            }
          />

          <label>Date</label>
          <input
            type="date"
            value={customer.date || ''}
            onChange={(e) =>
              setCustomer({
                ...customer,
                date: e.target.value
              })
            }
          />

          <label>Remarks</label>
          <textarea
            value={customer.remarks || ''}
            onChange={(e) =>
              setCustomer({
                ...customer,
                remarks: e.target.value
              })
            }
          />

          <button onClick={updateCustomer}>
            Update Profile
          </button>

          <button
            className="count-button"
            onClick={() => setShowPopup(true)}
          >
            View Editing Count
          </button>

        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Editing History</h2>
            <h1>{editCount}</h1>
            <p>Times this customer profile has been edited.</p>

            <button onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showThankYou && customer && (
        <div className="popup">
          <div className="popup-content">
            <h2>Profile Updated Successfully!</h2>
            <p>
              Thank you, {customer.customerName}!
              Your profile has been updated.
            </p>

            <button onClick={() => setShowThankYou(false)}>
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
