export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = (title, body) => {
    if (Notification.permission === "granted") {
        const options = {
            body: body,
            icon: '/ninja-icon-192.png', // Assuming pwa icon exists
            vibrate: [200, 100, 200]
        };
        new Notification(title, options);
    }
};

export const scheduleReminder = (title, body, delayMs) => {
    setTimeout(() => {
        sendNotification(title, body);
    }, delayMs);
};
