import React from 'react';

function Settings(props) {
    console.log(props, Notification, Notification.permission)

    function notifyMe() {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification("Notifications are already granted");
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification("Welcome to Notifications!");
                }
            });
        }

        // At last, if the user has denied notifications, and you
        // want to be respectful there is no need to bother them any more.
    }

    return (
        <div>
            <h2>Settings</h2>
            {/* {Notification.permission === 'granted' ?
                <button onClick={notifyMe}>Disable Notifications</button>
                : */}
            <button onClick={notifyMe}>Enable Notifications</button>





        </div>
    );
}

export default Settings;