import Layout from "@/components/Layout";
import Link from "next/link";

export default function Custom404() {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg mb-8">
          Sorry, the page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-4 rounded"
        >
          Return Home
        </Link>
      </div>
    </Layout>
  );
}
