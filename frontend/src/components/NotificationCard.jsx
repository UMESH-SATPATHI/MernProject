const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const NotificationCard = ({ notification, expanded, onToggle, actions = [], busy = false }) => {
    const booking = notification?.booking || {};
    const sender = notification?.sender || {};
    const vehicle = notification?.vehicle || booking?.vehicle || {};
    const bookingUserName = booking?.user?.name || sender?.name || "Unknown user";
    const bookingUserEmail = booking?.user?.email || sender?.email || "N/A";
    const notificationDate = formatDate(notification?.createdAt);
    const startDate = formatDate(booking?.startDate);
    const endDate = formatDate(booking?.endDate);
    const isUnread = !notification?.isRead;

    const handleCardClick = () => {
        onToggle?.(notification);
    };

    return (
        <article
            className={`notification-card ${isUnread ? "unread" : "read"} ${expanded ? "expanded" : ""}`.trim()}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleCardClick();
                }
            }}
        >
            <div className="notification-card-header">
                <div className="notification-card-topline">
                    <span className="notification-card-title">{notification?.message || "Notification"}</span>
                    <div className="notification-card-badges">
                        {isUnread && <span className="notification-badge unread">Unread</span>}
                        <span className="notification-badge type">{notification?.type?.replaceAll("_", " ")}</span>
                    </div>
                </div>
                <div className="notification-card-meta">
                    <span>{notificationDate}</span>
                    <span>{vehicle?.vehicleName || "Vehicle"}</span>
                </div>
            </div>

            {expanded && (
                <div className="notification-card-body">
                    <div className="notification-detail-grid">
                        <div>
                            <span>User name</span>
                            <strong>{bookingUserName}</strong>
                        </div>
                        <div>
                            <span>User email</span>
                            <strong>{bookingUserEmail}</strong>
                        </div>
                        <div>
                            <span>Vehicle</span>
                            <strong>{vehicle?.vehicleName || "N/A"}</strong>
                        </div>
                        <div>
                            <span>Vehicle type</span>
                            <strong>{vehicle?.vehicleType || "N/A"}</strong>
                        </div>
                        <div>
                            <span>Start date</span>
                            <strong>{startDate}</strong>
                        </div>
                        <div>
                            <span>End date</span>
                            <strong>{endDate}</strong>
                        </div>
                        <div>
                            <span>Booking status</span>
                            <strong>{booking?.status || "N/A"}</strong>
                        </div>
                        <div>
                            <span>Location</span>
                            <strong>{vehicle?.location || "N/A"}</strong>
                        </div>
                    </div>

                    {actions.length > 0 && (
                        <div className="notification-actions" onClick={(event) => event.stopPropagation()}>
                            {actions.map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    className={`notification-action-btn ${action.variant || "primary"}`}
                                    disabled={busy || action.disabled}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        action.onClick?.(notification);
                                    }}
                                >
                                    {busy && action.loadingLabel ? action.loadingLabel : action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
};

export default NotificationCard;
