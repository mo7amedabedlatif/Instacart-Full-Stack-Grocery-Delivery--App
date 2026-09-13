import { useState, useRef, useEffect } from "react";
import { Send, Phone, MapPin, Clock, X } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "delivery";
  timestamp: number;
}

interface DeliveryChatProps {
  orderId: string;
  deliveryPersonName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const DeliveryChat = ({
  orderId,
  deliveryPersonName = "عامل التوصيل",
  isOpen,
  onClose,
}: DeliveryChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "مرحباً! أنا في الطريق إليك 🚚",
      sender: "delivery",
      timestamp: Date.now(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setLoading(true);

    // Simulate delivery response
    setTimeout(() => {
      const responses = [
        "حسناً، سأتأكد من ذلك! 👍",
        "لا مشكلة، أنا قادم الآن 🚗",
        "تم فهم الطلب! شكراً لك 😊",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const deliveryMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "delivery",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, deliveryMsg]);
      setLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-40">
      {/* Header */}
      <div className="bg-app-green text-white rounded-t-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold">{deliveryPersonName}</p>
          <p className="text-xs opacity-90">⚫ متصل الآن</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-app-border">
        <button className="flex items-center justify-center gap-2 py-2 bg-app-green/10 text-app-green rounded-lg hover:bg-app-green/20 transition-colors text-xs font-medium">
          <Phone className="size-4" />
          اتصل
        </button>
        <button className="flex items-center justify-center gap-2 py-2 bg-app-green/10 text-app-green rounded-lg hover:bg-app-green/20 transition-colors text-xs font-medium">
          <MapPin className="size-4" />
          الموقع
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-app-cream/50 max-h-96">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-app-green text-white rounded-br-none"
                  : "bg-white text-app-text border border-app-border rounded-bl-none"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === "user" ? "opacity-70" : "text-app-text-light"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString("ar", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-app-text border border-app-border rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                <div className="size-2 bg-app-text-light rounded-full animate-bounce" />
                <div
                  className="size-2 bg-app-text-light rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="size-2 bg-app-text-light rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-app-border p-4 space-y-3">
        <div className="flex gap-2 text-xs text-app-text-light">
          <Clock className="size-3" />
          <span>الوقت المتبقي: ٧ دقائق</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-3 py-2 border border-app-border rounded-lg text-sm focus:border-app-green outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || loading}
            className="px-4 py-2 bg-app-green text-white rounded-lg hover:bg-app-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChat;
