import { useEffect } from "react";
import { useRouter } from "next/router";

export const dynamic = "force-dynamic"; // ensures this page is rendered on the client

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/games?new_player=1");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
