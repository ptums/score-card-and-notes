"use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@clerk/nextjs";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  // const router = useRouter();
  // const { isSignedIn, isLoaded } = useAuth();

  // useEffect(() => {
  //   if (isLoaded && !isSignedIn) {
  //     router.push("/sign-in");
  //   }
  // }, [isSignedIn, isLoaded, router]);

  // if (!isLoaded) {
  //   return (
  //     <div className="min-h-screen bg-amber-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
  //         <p className="text-slate-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isSignedIn) {
  //   return (
  //     <div className="min-h-screen bg-amber-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
  //         <p className="text-slate-600">Redirecting to sign in...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
}
