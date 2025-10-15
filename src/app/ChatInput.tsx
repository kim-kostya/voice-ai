import { Mic, Volume2, Send } from "lucide-react";

export default function ChatInput() {
  return (
    <div className="border-t bg-white">
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg border hover:bg-gray-50" title="Mic (placeholder)">
            <Mic className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg border hover:bg-gray-50" title="Speaker (placeholder)">
            <Volume2 className="w-5 h-5" />
          </button>

          <input
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="Ask me anything or use voice input..."
          />

          <button className="p-2 rounded-lg bg-green-600 text-white" title="Send (placeholder)">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
