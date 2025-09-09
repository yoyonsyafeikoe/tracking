export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        {/* Judul */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>

        {/* Pesan */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Tombol */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Deleting..." : "Deleted"}
          </button>
        </div>
      </div>
    </div>
  );
}
