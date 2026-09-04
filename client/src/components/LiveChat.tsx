import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: number;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "أهلاً! 👋 كيف يمكننا مساعدتك اليوم؟",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Bot responses (simple logic - replace with actual API)
  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    const responses: { [key: string]: string } = {
      "مرحبا": "أهلاً! 👋 كيف يمكنني مساعدتك؟",
      "شكرا": "العفو! 😊 هل هناك شيء آخر يمكنني مساعدتك به؟",
      "التوصيل": "📦 نقدم توصيل سريع في غضون 30-60 دقيقة لمعظم المناطق. هل تريد معرفة المزيد؟",
      "الدفع": "💳 نقبل البطاقات الائتمانية والمحافظ الرقمية والدفع عند الاستلام. أي منها تفضل؟",
      "مشكلة": "😟 أسف! هل يمكنك وصف المشكلة بالتفصيل؟",
      "ساعات التشغيل": "⏰ نحن متاحون 24/7 للدعم والطلبات!",
      "الأسعار": "💰 تختلف الأسعار حسب المنتجات. يمكنك البحث عن المنتج المحدد للحصول على السعر الفوري.",
    };

    // Check for keyword matches
    for (const [key, value] of Object.entries(responses)) {
      if (msg.includes(key)) {
        return value;
      }
    }

    return "شكراً على سؤالك! 😊 يمكنك التواصل مع فريق الدعم للحصول على مساعدة أسرع أو اطّلع على الأسئلة الشائعة.";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: getBotResponse(input),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }, 500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 size-14 bg-app-green text-white rounded-full shadow-lg hover:bg-app-green-light transition-colors flex items-center justify-center group z-50"
        title="فتح الدعم الفني"
      >
        <MessageCircle className="size-6" />
        <span className="absolute -top-2 -right-2 size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          1
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${
        isMinimized ? "h-14" : "h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="bg-app-green text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div>
          <h3 className="font-semibold">دعم العملاء</h3>
          <p className="text-xs text-white/80">نحن هنا للمساعدة!</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="size-5" />
            ) : (
              <Minimize2 className="size-5" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-app-cream/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-lg ${
                    msg.type === "user"
                      ? "bg-app-green text-white rounded-br-none"
                      : "bg-white border border-app-border rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-app-border px-4 py-2.5 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="size-2 bg-app-green rounded-full animate-bounce" />
                    <div className="size-2 bg-app-green rounded-full animate-bounce delay-100" />
                    <div className="size-2 bg-app-green rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-app-border p-4 space-y-2">
            {/* Quick Replies */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {["التوصيل", "الدفع", "مشكلة", "شكراً"].map((quick) => (
                <button
                  key={quick}
                  onClick={() => {
                    setInput(quick);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-3 py-1.5 bg-app-green/10 text-app-green text-xs rounded-full whitespace-nowrap hover:bg-app-green/20 transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب رسالتك..."
                className="flex-1 px-3 py-2 border border-app-border rounded-lg text-sm focus:border-app-green outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="p-2 bg-app-green text-white rounded-lg hover:bg-app-green-light transition-colors disabled:opacity-50"
              >
                <Send className="size-5" />
              </button>
            </div>

            {/* Help Note */}
            <div className="flex gap-2 text-xs text-app-text-light bg-blue-50 p-2 rounded-lg">
              <AlertCircle className="size-3 shrink-0 mt-0.5" />
              <p>للقضايا المعقدة، سيتم تحويلك لفريق الدعم البشري.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveChat;
