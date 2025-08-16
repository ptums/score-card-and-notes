"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { localAuth, LocalUser } from "@/lib/localAuth";

interface HybridAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function HybridAuthGuard({
  children,
  fallback,
}: HybridAuthGuardProps) {
  console.log("Fallback", fallback);
  return <>{children}</>;
  // const { isSignedIn, isLoaded: clerkLoaded, user: clerkUser } = useAuth();
  // const [isLocalAuthenticated, setIsLocalAuthenticated] = useState<
  //   boolean | null
  // >(null);
  // const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  // const [isOnline, setIsOnline] = useState(true);
  // const [showLocalAuth, setShowLocalAuth] = useState(false);

  // useEffect(() => {
  //   // Check online status
  //   const checkOnlineStatus = () => {
  //     setIsOnline(navigator.onLine);
  //   };

  //   // Check local authentication
  //   const checkLocalAuth = async () => {
  //     try {
  //       const authenticated = await localAuth.isAuthenticated();
  //       setIsLocalAuthenticated(authenticated);

  //       if (authenticated) {
  //         const user = await localAuth.getCurrentUser();
  //         setLocalUser(user);
  //       }
  //     } catch (error) {
  //       console.error("Error checking local auth:", error);
  //       setIsLocalAuthenticated(false);
  //     }
  //   };

  //   // Initial checks
  //   checkOnlineStatus();
  //   checkLocalAuth();

  //   // Listen for online/offline events
  //   window.addEventListener("online", checkOnlineStatus);
  //   window.addEventListener("offline", checkOnlineStatus);

  //   return () => {
  //     window.removeEventListener("online", checkOnlineStatus);
  //     window.removeEventListener("offline", checkOnlineStatus);
  //   };
  // }, []);

  // // Show loading while checking authentication
  // if (clerkLoaded === false || isLocalAuthenticated === null) {
  //   return (
  //     <div className="min-h-screen bg-amber-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
  //         <p className="text-slate-600">Checking authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // // Online and signed in with Clerk
  // if (isOnline && isSignedIn) {
  //   return <>{children}</>;
  // }

  // // Offline but locally authenticated
  // if (!isOnline && isLocalAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-amber-50">
  //       {/* Offline Banner */}
  //       <div className="bg-orange-100 border-b border-orange-200 p-3 text-center">
  //         <p className="text-orange-800 text-sm">
  //           🔌 You're offline. Using local authentication.
  //         </p>
  //       </div>

  //       {/* Password Expiry Warning */}
  //       {localUser && localAuth.isPasswordExpired(localUser) && (
  //         <div className="bg-red-100 border-b border-red-200 p-3 text-center">
  //           <p className="text-red-800 text-sm">
  //             ⚠️ Your local password has expired. Please update it to continue.
  //           </p>
  //           <button
  //             onClick={() => setShowLocalAuth(true)}
  //             className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
  //           >
  //             Update Password
  //           </button>
  //         </div>
  //       )}

  //       {/* Password Expiry Reminder */}
  //       {localUser &&
  //         !localAuth.isPasswordExpired(localUser) &&
  //         (() => {
  //           const daysLeft = localAuth.getDaysUntilPasswordExpiry(localUser);
  //           if (daysLeft <= 30) {
  //             return (
  //               <div className="bg-yellow-100 border-b border-yellow-200 p-3 text-center">
  //                 <p className="text-yellow-800 text-sm">
  //                   ⏰ Your local password expires in {daysLeft} days. Consider
  //                   updating it soon.
  //                 </p>
  //                 <button
  //                   onClick={() => setShowLocalAuth(true)}
  //                   className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
  //                 >
  //                   Update Password
  //                 </button>
  //               </div>
  //             );
  //           }
  //           return null;
  //         })()}

  //       {children}
  //     </div>
  //   );
  // }

  // // Show local authentication form
  // if (showLocalAuth || (!isOnline && !isLocalAuthenticated)) {
  //   return <LocalAuthForm onSuccess={() => setShowLocalAuth(false)} />;
  // }

  // // Fallback for other cases
  // return (
  //   fallback || (
  //     <div className="min-h-screen bg-amber-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-slate-800 mb-4">
  //           Authentication Required
  //         </h2>
  //         <p className="text-slate-600 mb-6">
  //           {!isOnline
  //             ? "You're offline. Please sign in with your local password to continue."
  //             : "Please sign in to continue."}
  //         </p>
  //         <button
  //           onClick={() => setShowLocalAuth(true)}
  //           className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
  //         >
  //           Sign In
  //         </button>
  //       </div>
  //     </div>
  //   )
  // );
}

// // Local Authentication Form Component
// function LocalAuthForm({ onSuccess }: { onSuccess: () => void }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       if (isSignUp) {
//         // Create new local user
//         await localAuth.createLocalUser(email, password);
//         onSuccess();
//       } else {
//         // Authenticate existing user
//         const session = await localAuth.authenticateLocal(email, password);
//         if (session) {
//           onSuccess();
//         } else {
//           setError("Invalid email or password");
//         }
//       }
//     } catch (error) {
//       setError(
//         error instanceof Error ? error.message : "Authentication failed"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-slate-800 mb-2">
//             {isSignUp ? "Create Local Account" : "Sign In"}
//           </h2>
//           <p className="text-slate-600">
//             {isSignUp
//               ? "Create a local account for offline use"
//               : "Sign in with your local password"}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-slate-700 mb-2"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               required
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-slate-700 mb-2"
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               required
//             />
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//               <p className="text-red-800 text-sm">{error}</p>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading
//               ? "Processing..."
//               : isSignUp
//               ? "Create Account"
//               : "Sign In"}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <button
//             onClick={() => setIsSignUp(!isSignUp)}
//             className="text-orange-600 hover:text-orange-700 text-sm"
//           >
//             {isSignUp
//               ? "Already have an account? Sign in"
//               : "Need an account? Sign up"}
//           </button>
//         </div>

//         <div className="mt-6 p-4 bg-amber-50 rounded-lg">
//           <p className="text-amber-800 text-sm text-center">
//             <strong>Local Authentication:</strong> Your data is stored locally
//             on your device. You'll be reminded to update your password every 3
//             months for security.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
