export default function BottomSheet({
  handleCallback,
  label,
}: {
  handleCallback: () => void;
  label: string;
}) {
  return (
    <button
      onClick={handleCallback}
      className="mb-2 sm:mb-0 sm:mx-2 text-center justify-center w-full sm:flex-1 flex flex-col sm:flex-row justify-between bg-orange-500 active:bg-orange-300 text-black py-3 rounded font-bold cursor-pointer"
    >
      {label}
    </button>
  );
}
