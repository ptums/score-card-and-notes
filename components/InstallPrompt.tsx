import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<{
    name: string;
    version: string;
    supportsPWA: boolean;
  }>({ name: "", version: "", supportsPWA: false });
  const [showAlternativeInstall, setShowAlternativeInstall] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setManifestStatus] = useState<"checking" | "accessible" | "error">(
    "checking"
  );

  useEffect(() => {
    // Detect iOS
    setIsIOS(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    // Detect Android
    setIsAndroid(/Android/.test(navigator.userAgent));

    // Check if already installed
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Detect browser and PWA support
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      let browserName = "Unknown";
      let browserVersion = "";
      let supportsPWA = false;

      if (userAgent.includes("Chrome")) {
        browserName = "Chrome";
        browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || "";
        supportsPWA = parseInt(browserVersion) >= 67;
      } else if (userAgent.includes("Firefox")) {
        browserName = "Firefox";
        browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || "";
        supportsPWA = parseInt(browserVersion) >= 58;
      } else if (
        userAgent.includes("Safari") &&
        !userAgent.includes("Chrome")
      ) {
        browserName = "Safari";
        browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || "";
        supportsPWA = parseInt(browserVersion) >= 11;
      } else if (userAgent.includes("Edge")) {
        browserName = "Edge";
        browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || "";
        supportsPWA = parseInt(browserVersion) >= 79;
      }

      setBrowserInfo({
        name: browserName,
        version: browserVersion,
        supportsPWA,
      });
    };

    // Check manifest accessibility
    const checkManifest = async () => {
      try {
        const response = await fetch("/manifest.json");
        if (response.ok) {
          console.log("Manifest is accessible");
          setManifestStatus("accessible");
        } else {
          console.error(
            "Manifest not accessible:",
            response.status,
            response.statusText
          );
          setManifestStatus("error");
        }
      } catch (error) {
        console.error("Error checking manifest:", error);
        setManifestStatus("error");
      }
    };

    detectBrowser();
    checkManifest();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Check if PWA can be installed
    const checkInstallability = () => {
      // Check if service worker is registered
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            console.log("Service worker is registered:", registration);
          } else {
            console.log("No service worker registration found");
          }
        });
      }

      // Check if manifest is accessible
      if (document.querySelector('link[rel="manifest"]')) {
        console.log("Manifest link found");
      } else {
        console.log("No manifest link found");
      }

      // If no deferred prompt after a delay, show alternative installation methods
      setTimeout(() => {
        if (!deferredPrompt && browserInfo.supportsPWA) {
          console.log(
            "No beforeinstallprompt event, showing alternative methods"
          );
          setShowAlternativeInstall(true);
        }
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check installability after a short delay to allow service worker registration
    setTimeout(checkInstallability, 1000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [deferredPrompt, browserInfo.supportsPWA]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        console.log("Showing install prompt...");
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
      } catch (error) {
        console.error("Error during installation:", error);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const handleRefreshClick = () => {
    window.location.reload();
  };

  const handleManualInstall = () => {
    // Try to trigger installation manually
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => {
        // Show a message to guide the user
        alert(
          "To install this app:\n\n1. Look for the install icon (📱) in your browser's address bar\n2. Or check the browser menu (⋮) for 'Install App'\n3. Or try 'Add to Home Screen' from the browser menu\n\nIf you don't see these options, try refreshing the page."
        );
      });
    }
  };

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      <div className="text-center">
        {/* Install Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-800 mb-3">
          Install Golf Buddy
        </h3>

        {/* Description */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          Install for quick access and basic offline functionality
        </p>

        {/* Install Button */}
        <button
          onClick={handleInstallClick}
          disabled={!deferredPrompt || isInstalling}
          className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 ${
            deferredPrompt && !isInstalling
              ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isInstalling ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Installing...
            </div>
          ) : deferredPrompt ? (
            "Add to Home Screen"
          ) : (
            "Installation Not Available"
          )}
        </button>

        {/* Alternative Installation Methods */}
        {showAlternativeInstall && !deferredPrompt && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">
              Alternative Installation Methods
            </h4>
            <div className="space-y-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefreshClick}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔄 Refresh Page & Try Again
              </button>

              {/* Manual Install Button */}
              <button
                onClick={handleManualInstall}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                📱 Manual Installation Guide
              </button>

              {/* Manual Installation Instructions */}
              <div className="text-sm text-blue-700 text-left">
                <p className="mb-2">
                  <strong>Manual Installation:</strong>
                </p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • Look for the install icon in your browser&apos;s address
                    bar
                  </li>
                  <li>
                    • Check the browser menu (⋮) for &quot;Install App&quot;
                  </li>
                  <li>• Try adding to home screen from browser menu</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* iOS Instructions */}
        {isIOS && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-slate-700 leading-relaxed">
              To install this app on your iOS device, tap the share button
              <span
                role="img"
                aria-label="share icon"
                className="inline-block mx-1 text-lg"
              >
                ⎋
              </span>
              and then &quot;Add to Home Screen&quot;
              <span
                role="img"
                aria-label="plus icon"
                className="inline-block mx-1 text-lg"
              >
                ➕
              </span>
              .
            </p>
          </div>
        )}

        {/* Android Instructions */}
        {isAndroid && !deferredPrompt && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-slate-700 leading-relaxed">
              To install this app on your Android device, tap the menu button
              <span
                role="img"
                aria-label="menu icon"
                className="inline-block mx-1 text-lg"
              >
                ⋮
              </span>
              and then &quot;Add to Home Screen&quot; or &quot;Install
              App&quot;.
            </p>
          </div>
        )}

        {/* Browser-specific Instructions */}
        {!deferredPrompt && !isIOS && !isAndroid && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>{browserInfo.name}</strong> {browserInfo.version}
            </p>
            {browserInfo.supportsPWA ? (
              <p className="text-sm text-gray-600">
                Your browser supports PWA installation. Try refreshing the page
                or check the browser menu for installation options.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                PWA installation is not available in this browser. Try using
                Chrome, Edge, or Safari.
              </p>
            )}
          </div>
        )}

        {/* General PWA Instructions */}
        {!deferredPrompt && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Tip:</strong> Look for the install option in your
              browser&apos;s menu, address bar, or try refreshing the page.
            </p>
          </div>
        )}

        {/* Lightweight PWA Info */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            <strong>Lightweight PWA:</strong> This app provides core offline
            functionality for score tracking and game management.
          </p>
        </div>
      </div>
    </div>
  );
}
