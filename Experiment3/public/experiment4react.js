
function UpdatePopup({ customerName, customerId, editCount = 0 }) {

    const [count, setCount] = React.useState(editCount);

    React.useEffect(() => {
        setCount(editCount);
    }, [editCount]);

    return (
        <div className="popup-overlay">
            <div className="popup-content">

                <h2>Profile Updated!</h2>

                <p>Thank you, {customerName}!</p>

                <p>
                    Your profile has been updated {count} time(s).
                </p>

                <p>Customer ID: {customerId}</p>

                <button onClick={() => popupRoot.render(null)}>
                    Close
                </button>

            </div>
        </div>
    );
}

const popupRoot = ReactDOM.createRoot(
    document.getElementById("react-popup-root")
);

window.showUpdatePopup = function(customerName, customerId, editCount) {

    popupRoot.render(
        <UpdatePopup
            customerName={customerName}
            customerId={customerId}
            editCount={editCount}
        />
    );

};
