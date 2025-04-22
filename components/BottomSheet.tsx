export default function BottomSheet({
  handleCallback,
  label,
}: {
  handleCallback: () => void;
  label: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-accent p-4">
      <button
        onClick={handleCallback}
        className="w-full bg-orange-500 active:bg-orange-300 text-black py-3 rounded font-bold cursor-pointer"
      >
        {label}
      </button>
    </div>
  );
}
