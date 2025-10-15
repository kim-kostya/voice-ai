export default function ChatWindow() {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <p className="font-semibold">Respona</p>
          <span className="text-xs text-gray-500">Always here to help</span>
        </div>

        {/* Sample assistant bubble */}
        <div className="bg-gray-50 rounded-lg p-3 w-fit">
          <p>Hello! I’m Respona, your AI assistant. How can I help you today?</p>
          <p className="text-xs text-gray-400 mt-1">03:22 AM</p>
        </div>
      </div>
    </div>
  );
}
