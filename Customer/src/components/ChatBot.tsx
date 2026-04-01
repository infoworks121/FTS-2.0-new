import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

// TODO: Configure actual chat API endpoint
const CHAT_URL = import.meta.env.VITE_CHAT_API_URL || "/api/chat";

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(import.meta.env.VITE_CHAT_API_KEY ? { Authorization: `Bearer ${import.meta.env.VITE_CHAT_API_KEY}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    onError(err.error || "Something went wrong. Please try again.");
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const quickActions = [
  "🌱 Recommend seeds for this season",
  "📦 How to track my order?",
  "💰 How do referrals work?",
  "🔄 How to return a product?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantText = "";
    const updateAssistant = (chunk: string) => {
      assistantText += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
        }
        return [...prev, { role: "assistant", content: assistantText }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: updateAssistant,
        onDone: () => setLoading(false),
        onError: (msg) => {
          setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
          setLoading(false);
        },
      });
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95",
          open
            ? "bg-foreground text-background rotate-0"
            : "bg-primary text-primary-foreground shadow-primary/40 hover:shadow-primary/50"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
        open ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4 pointer-events-none"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">FTS Assistant</h3>
            <p className="text-white/70 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online · AI Powered
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Minimize2 className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[380px] bg-gradient-to-b from-muted/30 to-transparent">
          {messages.length === 0 && (
            <div className="text-center pt-4 pb-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="font-bold text-sm">Hi there! 👋</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px] mx-auto">I'm your FTS assistant. Ask me anything about products, orders, or farming!</p>
              <div className="mt-4 space-y-2">
                {quickActions.map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl bg-card border hover:border-primary/30 hover:bg-primary/3 transition-all duration-200 shadow-sm">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border rounded-bl-md"
              )}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none [&_p]:text-sm [&_li]:text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-card">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 h-10 px-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50"
            />
            <Button type="submit" size="icon" className="h-10 w-10 rounded-xl shrink-0 shadow-md" disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Powered by FTS AI · Responses may vary</p>
        </div>
      </div>
    </>
  );
}
