import { useState, useRef, useEffect } from "react";
import {
  Plus, Settings, RotateCcw, Pencil, Copy, Check, ChevronDown, X,
  Palette, FileText, Cpu, BarChart3, Database, Search, Plug, Send,
  Sparkles, PanelLeft, Brain, Trash2,
} from "lucide-react";

const BACKEND_URL = "https://backend-2imb.onrender.com";

const THEMES = {
  warm: {
    name: "暖灰 · 淡粉",
    bg: "#F6F1EC", surface: "#FFFFFF", surfaceSoft: "#FBF6F2",
    accent: "#E2A0AE", accentSoft: "#F5DCE1", text: "#3D3733",
    textSoft: "#9A8E83", border: "#EAE1D8",
    swatch: ["#F6F1EC", "#E2A0AE", "#F5DCE1"],
  },
  dusk: {
    name: "雾紫 · 灰蓝",
    bg: "#F1EFF4", surface: "#FFFFFF", surfaceSoft: "#F7F5FA",
    accent: "#9C96C8", accentSoft: "#E3E0F1", text: "#36333F",
    textSoft: "#928DA3", border: "#E5E2EE",
    swatch: ["#F1EFF4", "#9C96C8", "#E3E0F1"],
  },
  sage: {
    name: "燕麦 · 苔绿",
    bg: "#F3F1E9", surface: "#FFFFFF", surfaceSoft: "#F8F6EF",
    accent: "#9AAE8C", accentSoft: "#E3EADC", text: "#373A32",
    textSoft: "#928F7E", border: "#E7E2D4",
    swatch: ["#F3F1E9", "#9AAE8C", "#E3EADC"],
  },
};

const MODELS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet", provider: "Anthropic" },
  { id: "deepseek-chat", label: "DeepSeek Chat", provider: "DeepSeek" },
];

function Avatar({ theme }) {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
      style={{ background: theme.accentSoft, color: theme.text }}>
      晏
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
        style={{ background: theme.accent, borderColor: theme.surface, animation: "yanPulse 2.4s ease-in-out infinite" }} />
    </div>
  );
}

function MessageBubble({ msg, theme, onCopy, copiedId }) {
  const isUser = msg.role === "user";
  return (
    <div className={`group flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && <Avatar theme={theme} />}
      <div className={`flex max-w-[72%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div className="rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed"
          style={{
            background: isUser ? theme.accentSoft : theme.surface,
            color: theme.text,
            border: isUser ? "none" : `1px solid ${theme.border}`,
            borderTopRightRadius: isUser ? 6 : undefined,
            borderTopLeftRadius: !isUser ? 6 : undefined,
            whiteSpace: "pre-wrap",
          }}>
          {msg.content || msg.text}
        </div>
        <div className="mt-1 flex items-center gap-2.5 px-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button onClick={() => onCopy(msg.id, msg.content || msg.text)}
            className="flex items-center gap-1 text-[11px]" style={{ color: theme.textSoft }}>
            {copiedId === msg.id ? <><Check size={11} /> 已复制</> : <><Copy size={11} /> 复制</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, theme }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200"
      style={{ background: checked ? theme.accent : theme.border }}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
    </button>
  );
}

function SettingsModal({ theme, themeKey, setThemeKey, onClose, settings, onSaveSettings }) {
  const [view, setView] = useState("list");
  const [systemPrompt, setSystemPrompt] = useState(settings?.system_prompt || "你是阿晏，说话简洁温柔，不绕弯，不说教。");
  const [saving, setSaving] = useState(false);

  const items = [
    { id: "appearance", label: "外观", icon: Palette },
    { id: "prompt", label: "系统提示词", icon: FileText },
    { id: "model", label: "模型", icon: Cpu },
    { id: "memory", label: "记忆库", icon: Brain },
    { id: "usage", label: "用量记录", icon: BarChart3 },
    { id: "data", label: "数据管理", icon: Database },
    { id: "search", label: "联网搜索", icon: Search },
    { id: "mcp", label: "MCP 接口", icon: Plug },
  ];

  const savePrompt = async () => {
    setSaving(true);
    await onSaveSettings({ system_prompt: systemPrompt });
    setSaving(false);
  };

  const renderDetail = () => {
    switch (view) {
      case "appearance":
        return (
          <div className="flex flex-col gap-3">
            <p className="text-xs" style={{ color: theme.textSoft }}>选一个看着舒服的主题色</p>
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key} onClick={() => setThemeKey(key)}
                className="flex items-center justify-between rounded-xl px-3.5 py-3"
                style={{ border: `1.5px solid ${themeKey === key ? t.accent : theme.border}`, background: theme.surfaceSoft }}>
                <div className="flex items-center gap-2.5">
                  <div className="flex overflow-hidden rounded-md">
                    {t.swatch.map((c, i) => <span key={i} style={{ background: c, width: 16, height: 16 }} />)}
                  </div>
                  <span className="text-[14px]" style={{ color: theme.text }}>{t.name}</span>
                </div>
                {themeKey === key && <Check size={15} style={{ color: t.accent }} />}
              </button>
            ))}
          </div>
        );
      case "prompt":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-xs" style={{ color: theme.textSoft }}>定义阿晏说话和行事的方式</p>
            <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={10}
              className="w-full resize-none rounded-xl p-3 text-[14px] outline-none"
              style={{ background: theme.surfaceSoft, border: `1px solid ${theme.border}`, color: theme.text }} />
            <button onClick={savePrompt}
              className="rounded-xl py-2 text-[13px] font-medium"
              style={{ background: theme.accent, color: "#fff" }}>
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        );
      default:
        return <p className="text-[13px]" style={{ color: theme.textSoft }}>待开发</p>;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: theme.surface }}>
      {view === "list" ? (
        <>
          <div className="flex shrink-0 items-center justify-between px-4 py-3.5"
            style={{ borderBottom: `1px solid ${theme.border}` }}>
            <span className="text-[15px] font-medium" style={{ color: theme.text }}>设置</span>
            <button onClick={onClose} style={{ color: theme.textSoft }}><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {items.map(it => {
              const Icon = it.icon;
              return (
                <button key={it.id} onClick={() => setView(it.id)}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-3.5 text-left">
                  <span className="flex items-center gap-3 text-[14px]" style={{ color: theme.text }}>
                    <Icon size={16} style={{ color: theme.textSoft }} />{it.label}
                  </span>
                  <ChevronDown size={14} style={{ color: theme.textSoft, transform: "rotate(-90deg)" }} />
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-2 px-3 py-3.5"
            style={{ borderBottom: `1px solid ${theme.border}` }}>
            <button onClick={() => setView("list")}
              className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ color: theme.text }}>
              <ChevronDown size={16} style={{ transform: "rotate(90deg)" }} />
            </button>
            <span className="text-[15px] font-medium" style={{ color: theme.text }}>
              {items.find(it => it.id === view)?.label}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{renderDetail()}</div>
        </>
      )}
    </div>
  );
}

export default function YanChatInterface() {
  const [booted, setBooted] = useState(false);
  const [themeKey, setThemeKey] = useState("warm");
  const theme = THEMES[themeKey];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [model, setModel] = useState(MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const scrollRef = useRef(null);

  // 加载会话列表
  const loadSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`);
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !activeSession) {
        setActiveSession(data[0]);
      }
    } catch (e) { console.error(e); }
  };

  // 加载消息
  const loadMessages = async (sessionId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions/${sessionId}/messages`);
      const data = await res.json();
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
    } catch (e) { console.error(e); }
  };

  // 加载设置
  const loadSettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadSessions(); loadSettings(); }, []);

  useEffect(() => {
    if (activeSession) loadMessages(activeSession.id);
  }, [activeSession]);

  const newSession = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "新对话" }),
      });
      const data = await res.json();
      setSessions(prev => [data, ...prev]);
      setActiveSession(data);
      setMessages([]);
    } catch (e) { console.error(e); }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    await fetch(`${BACKEND_URL}/sessions/${id}`, { method: "DELETE" });
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSession?.id === id) {
      setActiveSession(updated[0] || null);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSession || loading) return;
    const text = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: `tmp-${Date.now()}`, role: "user", content: text }]);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSession.id, message: text, model: model.id }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: `tmp-ai-${Date.now()}`, role: "assistant", content: data.reply }]);
      // 更新会话名（如果还是"新对话"就用第一条消息前10字）
      if (activeSession.name === "新对话") {
        const newName = text.slice(0, 20);
        await fetch(`${BACKEND_URL}/sessions/${activeSession.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });
        setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, name: newName } : s));
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "出错了，再试一下" }]);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const saveSettings = async (patch) => {
    try {
      const res = await fetch(`${BACKEND_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      setSettings(data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden"
      style={{ background: theme.bg, fontFamily: "'PingFang SC','Hiragino Sans GB',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes yanPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${theme.accent}55; }
          50% { box-shadow: 0 0 0 4px ${theme.accent}00; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap');
        .yan-wordmark { font-family: 'Cormorant Garamond', serif; }
        .sidebar-session:hover .delete-btn { opacity: 1; }
      `}</style>

      {/* 开屏页 */}
      {!booted && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-5"
          style={{ background: theme.bg }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: theme.accentSoft, animation: "yanPulse 2.4s ease-in-out infinite" }}>
            <Sparkles size={22} style={{ color: theme.accent }} />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="yan-wordmark text-4xl font-semibold tracking-wide" style={{ color: theme.text }}>Yan</span>
            <span className="text-[12px]" style={{ color: theme.textSoft }}>我们的小世界，一直都在</span>
          </div>
          <button onClick={() => setBooted(true)}
            className="mt-3 rounded-full px-7 py-2.5 text-[13px] font-medium"
            style={{ background: theme.accent, color: "#fff" }}>
            进来看看
          </button>
        </div>
      )}

      {/* 侧边栏 */}
      <div className="flex shrink-0 flex-col overflow-hidden p-3 transition-all duration-200"
        style={{
          borderRight: sidebarOpen ? `1px solid ${theme.border}` : "none",
          width: sidebarOpen ? 224 : 0,
          paddingLeft: sidebarOpen ? 12 : 0,
          paddingRight: sidebarOpen ? 12 : 0,
        }}>
        <div className="mb-4 flex items-center gap-2 px-1 pt-1">
          <Sparkles size={16} style={{ color: theme.accent }} />
          <span className="yan-wordmark text-xl font-semibold tracking-wide" style={{ color: theme.text }}>Yan</span>
        </div>

        <button onClick={newSession}
          className="mb-4 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-medium"
          style={{ background: theme.accentSoft, color: theme.text }}>
          <Plus size={14} /> 新建对话
        </button>

        <div className="flex-1 overflow-y-auto">
          {sessions.map(s => (
            <div key={s.id} className="sidebar-session relative mb-0.5">
              <button onClick={() => setActiveSession(s)}
                className="block w-full truncate rounded-lg px-2.5 py-2 text-left text-[13px] pr-8"
                style={{
                  background: activeSession?.id === s.id ? theme.surface : "transparent",
                  color: activeSession?.id === s.id ? theme.text : theme.textSoft,
                }}>
                {s.name}
              </button>
              <button onClick={e => deleteSession(s.id, e)}
                className="delete-btn absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity"
                style={{ color: theme.textSoft }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px]"
          style={{ color: theme.textSoft }}>
          <Settings size={14} /> 设置
        </button>
      </div>

      {/* 主区域 */}
      <div className="flex flex-1 flex-col">
        <div className="relative flex items-center justify-center py-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}>
          <button onClick={() => setSidebarOpen(v => !v)}
            className="absolute left-4 flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ color: theme.textSoft }}>
            <PanelLeft size={16} />
          </button>
          <div className="relative">
            <button onClick={() => setModelOpen(v => !v)}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px]"
              style={{ background: theme.surfaceSoft, border: `1px solid ${theme.border}`, color: theme.text }}>
              {model.label}
              <ChevronDown size={12} style={{ color: theme.textSoft }} />
            </button>
            {modelOpen && (
              <div className="absolute left-1/2 z-10 mt-1.5 w-44 -translate-x-1/2 overflow-hidden rounded-xl shadow-md"
                style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                {MODELS.map(m => (
                  <button key={m.id} onClick={() => { setModel(m); setModelOpen(false); }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px]"
                    style={{ background: model.id === m.id ? theme.accentSoft : "transparent", color: theme.text }}>
                    {m.label}
                    <span style={{ color: theme.textSoft, fontSize: 10 }}>{m.provider}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {!activeSession && (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px]" style={{ color: theme.textSoft }}>新建一个对话开始聊天</p>
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} theme={theme} onCopy={handleCopy} copiedId={copiedId} />
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <Avatar theme={theme} />
              <div className="rounded-2xl px-4 py-2.5 text-[14px]"
                style={{ background: theme.surface, border: `1px solid ${theme.border}`, color: theme.textSoft }}>
                思考中…
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 pt-2">
          <div className="flex items-end gap-2 rounded-2xl px-3 py-2"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={activeSession ? "想说什么都行" : "先新建一个对话"}
              rows={1} disabled={!activeSession}
              className="flex-1 resize-none bg-transparent text-[13px] outline-none"
              style={{ color: theme.text }} />
            <button onClick={handleSend} disabled={!activeSession || loading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: theme.accent, color: "#fff", opacity: (!activeSession || loading) ? 0.5 : 1 }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <SettingsModal theme={theme} themeKey={themeKey} setThemeKey={setThemeKey}
          onClose={() => setSettingsOpen(false)} settings={settings} onSaveSettings={saveSettings} />
      )}
    </div>
  );
}