export default function OfflineNotifications({
  subscription,
  unsubscribeFromPush,
  message,
  setMessage,
  sendTestNotification,
  subscribeToPush,
}: {
  subscription?: PushSubscription | null;
  unsubscribeFromPush?: () => void;
  message?: string;
  setMessage?: (message: string) => void;
  sendTestNotification?: () => void;
  subscribeToPush?: () => void;
} = {}) {
  // If no props provided, show a simplified offline status
  if (
    !subscription &&
    !unsubscribeFromPush &&
    !message &&
    !setMessage &&
    !sendTestNotification &&
    !subscribeToPush
  ) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 mt-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 text-sm font-medium">
            {navigator.onLine ? "Online" : "Offline - Local Mode Active"}
          </span>
        </div>
        {!navigator.onLine && (
          <p className="text-blue-600 text-xs text-center mt-2">
            Your data is stored locally. Changes will sync when you&apos;re back
            online.
          </p>
        )}
      </div>
    );
  }

  // Full push notification functionality (when props are provided)
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mx-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Push Notifications
      </h3>
      {subscription ? (
        <div className="space-y-3">
          <p className="text-green-600 text-sm">
            ✅ You are subscribed to push notifications.
          </p>
          <button
            onClick={unsubscribeFromPush}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
          >
            Unsubscribe
          </button>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter notification message"
              value={message || ""}
              onChange={(e) => setMessage?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendTestNotification}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
            >
              Send Test
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            You are not subscribed to push notifications.
          </p>
          <button
            onClick={subscribeToPush}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
          >
            Subscribe
          </button>
        </div>
      )}
    </div>
  );
}
