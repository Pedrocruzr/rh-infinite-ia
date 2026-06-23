"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  sessionSnapshot?: GenericSession | null;
  fieldSnapshot?: string | null;
};

type GenericSession = Record<string, unknown> & {
  status?: string;
  assessmentId?: string;
};

type TermsData = {
  nome: string;
  sobrenome: string;
  sexo: string;
  telefone: string;
  email: string;
  estado: string;
  cidade: string;
  empresa: string;
  statusProfissional: string;
  area: string;
  cargo: string;
};

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const AREAS = [
  "Administrativa","Contábil","Financeiro","Recursos Humanos","Vendas / Comercial",
  "Marketing","Operacional / Produção","Logística / Supply Chain","TI / Tecnologia",
  "Jurídico","Saúde","Educação","Engenharia","Compras / Suprimentos","Outro",
];

function TermsForm({ onSubmit }: { onSubmit: (data: TermsData) => void }) {
  const [form, setForm] = useState<TermsData>({
    nome: "", sobrenome: "", sexo: "", telefone: "", email: "",
    estado: "", cidade: "", empresa: "", statusProfissional: "", area: "", cargo: "",
  });
  const [authorized, setAuthorized] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof TermsData | "authorized", string>>>({});

  function set(field: keyof TermsData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.sobrenome.trim()) e.sobrenome = "Obrigatório";
    if (!form.sexo) e.sexo = "Obrigatório";
    if (!form.telefone.trim()) e.telefone = "Obrigatório";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "E-mail inválido";
    if (!form.estado) e.estado = "Obrigatório";
    if (!form.cidade.trim()) e.cidade = "Obrigatório";
    if (!form.statusProfissional) e.statusProfissional = "Obrigatório";
    if (!form.area) e.area = "Obrigatório";
    if (!form.cargo.trim()) e.cargo = "Obrigatório";
    if (!authorized) e.authorized = "Você precisa autorizar para continuar";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  const inputCls = (err?: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      err
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
    }`;

  const selectCls = (err?: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 bg-white outline-none transition focus:ring-2 ${
      err
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <span className="text-white font-bold text-xs">IA</span>
        </div>
        <p className="font-semibold text-sm text-white tracking-wide uppercase">
          Análise de Perfil Comportamental
        </p>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 text-center">
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
              Termos de Aceite
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              Precisamos da sua autorização para uso dos dados preenchidos a seguir. Toda informação
              será gravada em banco de dados e poderá ser utilizada para estudos internos. Mantemos
              estas informações em confidencialidade, serão compartilhadas com a empresa que solicitou
              seu preenchimento para análise de seu perfil comportamental.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Row 1: nome, sobrenome, sexo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Nome *"
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  className={inputCls(errors.nome)}
                />
                {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Sobrenome *"
                  value={form.sobrenome}
                  onChange={(e) => set("sobrenome", e.target.value)}
                  className={inputCls(errors.sobrenome)}
                />
                {errors.sobrenome && <p className="mt-1 text-xs text-red-500">{errors.sobrenome}</p>}
              </div>
              <div>
                <select
                  value={form.sexo}
                  onChange={(e) => set("sexo", e.target.value)}
                  className={selectCls(errors.sexo)}
                >
                  <option value="">Sexo *</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Prefiro não informar</option>
                </select>
                {errors.sexo && <p className="mt-1 text-xs text-red-500">{errors.sexo}</p>}
              </div>
            </div>

            {/* Row 2: telefone, email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="tel"
                  placeholder="Telefone / WhatsApp *"
                  value={form.telefone}
                  onChange={(e) => set("telefone", e.target.value)}
                  className={inputCls(errors.telefone)}
                />
                {errors.telefone && <p className="mt-1 text-xs text-red-500">{errors.telefone}</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-mail *"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* Row 3: estado, cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={form.estado}
                  onChange={(e) => set("estado", e.target.value)}
                  className={selectCls(errors.estado)}
                >
                  <option value="">Estado *</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                {errors.estado && <p className="mt-1 text-xs text-red-500">{errors.estado}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Cidade *"
                  value={form.cidade}
                  onChange={(e) => set("cidade", e.target.value)}
                  className={inputCls(errors.cidade)}
                />
                {errors.cidade && <p className="mt-1 text-xs text-red-500">{errors.cidade}</p>}
              </div>
            </div>

            {/* Row 4: empresa, status, área, cargo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Empresa"
                  value={form.empresa}
                  onChange={(e) => set("empresa", e.target.value)}
                  className={inputCls()}
                />
              </div>
              <div>
                <select
                  value={form.statusProfissional}
                  onChange={(e) => set("statusProfissional", e.target.value)}
                  className={selectCls(errors.statusProfissional)}
                >
                  <option value="">Status *</option>
                  <option value="Candidato">Candidato</option>
                  <option value="Colaborador">Colaborador</option>
                </select>
                {errors.statusProfissional && <p className="mt-1 text-xs text-red-500">{errors.statusProfissional}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  className={selectCls(errors.area)}
                >
                  <option value="">Área *</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                {errors.area && <p className="mt-1 text-xs text-red-500">{errors.area}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Cargo *"
                  value={form.cargo}
                  onChange={(e) => set("cargo", e.target.value)}
                  className={inputCls(errors.cargo)}
                />
                {errors.cargo && <p className="mt-1 text-xs text-red-500">{errors.cargo}</p>}
              </div>
            </div>

            {/* Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => {
                    setAuthorized(e.target.checked);
                    setErrors((prev) => ({ ...prev, authorized: undefined }));
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600 cursor-pointer"
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                  Autorizo o uso dos meus dados e avaliações para fins profissionais.
                </span>
              </label>
              {errors.authorized && (
                <p className="mt-1 ml-7 text-xs text-red-500">{errors.authorized}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white uppercase tracking-wide shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                Prosseguir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AvaliacaoClientPage() {
  const params = useParams();
  const token = params?.token as string;

  const STORAGE_KEY = token ? `avaliacao_${token}` : null;

  function loadPersistedState() {
    if (!STORAGE_KEY) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function persistState(patch: Record<string, unknown>) {
    if (!STORAGE_KEY) return;
    try {
      const current = loadPersistedState() ?? {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {}
  }

  function clearPersistedState() {
    if (!STORAGE_KEY) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  const persisted = loadPersistedState();

  const [termsData, setTermsData] = useState<TermsData | null>(persisted?.termsData ?? null);
  const [session, setSession] = useState<GenericSession | null>(persisted?.session ?? null);
  const [currentField, setCurrentField] = useState<string | null>(persisted?.currentField ?? null);
  const [messages, setMessages] = useState<Message[]>(persisted?.messages ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(persisted?.finished ?? false);
  const [error, setError] = useState<string | null>(null);
  const [agentSlug, setAgentSlug] = useState<string | null>(persisted?.agentSlug ?? null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!loading && !finished) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [messages, loading, finished]);

  async function startConversation(data: TermsData) {
    if (!token) return;
    setTermsData(data);
    try {
      setLoading(true);
      const res = await fetch(`/api/public/avaliacao/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsData: data }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error ?? "Link inválido.");
        return;
      }
      const newSession = resData.session ?? {};
      const newField = resData.nextField ?? null;
      const newSlug = resData.agentSlug ?? null;
      const newMessages: Message[] = [{ id: crypto.randomUUID(), role: "assistant", content: resData.reply }];
      setSession(newSession);
      setCurrentField(newField);
      if (newSlug) setAgentSlug(newSlug);
      setMessages(newMessages);
      persistState({ termsData: data, session: newSession, currentField: newField, messages: newMessages, agentSlug: newSlug, finished: false });
    } catch {
      setError("Não foi possível carregar a avaliação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function cloneSession<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  async function submitAnswer(
    answer: string,
    activeSession: GenericSession,
    activeField: string | null,
    baseMessages?: Message[]
  ) {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: answer,
      sessionSnapshot: cloneSession(activeSession),
      fieldSnapshot: activeField,
    };

    setMessages([...(baseMessages ?? messages), userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/public/avaliacao/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: activeSession, answer, currentField: activeField, termsData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: data.error ?? "Erro ao processar." },
        ]);
        return;
      }
      const updatedSession = data.session ?? {};
      const updatedField = data.nextField ?? null;
      const newMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: data.reply };
      setSession(updatedSession);
      setCurrentField(updatedField);
      setMessages((prev) => {
        const updated = [...prev, newMsg];
        persistState({ session: updatedSession, currentField: updatedField, messages: updated, finished: !!data.done });
        return updated;
      });
      if (data.done) { setFinished(true); clearPersistedState(); }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Erro ao enviar resposta. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendAnswer() {
    if (!input.trim() || !session || loading || finished) return;
    const answer = input.trim();
    if (editingMessageId) {
      setShowEditDialog(true);
      return;
    }
    await submitAnswer(answer, session, currentField);
  }

  async function applySingleEdit() {
    if (!editingMessageId || loading) return;
    const index = messages.findIndex((m) => m.id === editingMessageId);
    if (index === -1) return;
    const target = messages[index];
    if (target.role !== "user") return;
    const nextInput = input.trim();
    if (!nextInput) return;
    const restoredSession = cloneSession(target.sessionSnapshot ?? {});
    const restoredField = target.fieldSnapshot ?? null;
    const truncated = messages.slice(0, index);
    setEditingMessageId(null);
    setShowEditDialog(false);
    setFinished(false);
    await submitAnswer(nextInput, restoredSession, restoredField, truncated);
  }

  function startEdit(messageId: string) {
    if (loading) return;
    const target = messages.find((m) => m.id === messageId);
    if (!target || target.role !== "user") return;
    setEditingMessageId(messageId);
    setInput(target.content);
    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendAnswer();
    }
  }

  // ── tela de erro ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900">Link inválido</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  // ── tela de conclusão ─────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">✅</div>
          <h1 className="text-2xl font-bold text-slate-900">Avaliação concluída!</h1>
          <p className="text-slate-600 leading-relaxed">
            Suas respostas foram registradas com sucesso. O recrutador já pode visualizar
            seu perfil comportamental completo.
          </p>
          <p className="text-sm text-slate-400">Você pode fechar esta janela.</p>
        </div>
      </div>
    );
  }

  // ── formulário de termos ──────────────────────────────────────────────────
  if (!termsData && !loading) {
    return <TermsForm onSubmit={(data) => void startConversation(data)} />;
  }

  // ── loading inicial ───────────────────────────────────────────────────────
  if (!session && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1">
            {[0,1,2].map((i) => (
              <span key={i} className="w-3 h-3 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-sm text-slate-500">Carregando avaliação...</p>
        </div>
      </div>
    );
  }

  // ── chat principal ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <span className="text-white font-bold text-xs">IA</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900">
            {agentSlug === "teste-perfil-disc" ? "Teste DISC" : agentSlug === "agente-teste-bigfive" ? "Teste Big Five" : "Teste de Perfil Comportamental"}
          </p>
          <p className="text-xs text-slate-500">
            Responda com calma. Suas respostas são confidenciais.
          </p>
        </div>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-800 border border-slate-200"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && !finished && (
              <button
                onClick={() => startEdit(msg.id)}
                className="mt-1 text-xs text-slate-400 hover:text-slate-600 transition px-1"
              >
                ✏️ editar
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        {editingMessageId && (
          <div className="max-w-2xl mx-auto mb-2 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <span className="text-xs text-amber-700 font-medium">✏️ Editando resposta anterior</span>
            <button onClick={() => { setEditingMessageId(null); setInput(""); }} className="text-xs text-amber-500 hover:text-amber-700">Cancelar</button>
          </div>
        )}
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || finished}
            placeholder={editingMessageId ? "Digite a nova resposta..." : "Digite sua resposta..."}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 disabled:opacity-50"
          />
          <button
            onClick={() => void sendAnswer()}
            disabled={loading || finished || !input.trim()}
            className="rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {editingMessageId ? "Salvar" : "Enviar"}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          Pressione Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>

      {/* Edit dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-900">Alterar resposta</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Deseja corrigir somente esta resposta e continuar dali, ou reiniciar do início?
            </p>
            <div className="mt-5 grid gap-3">
              <button
                onClick={() => void applySingleEdit()}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Somente esta resposta
              </button>
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingMessageId(null);
                  setSession(null);
                  setCurrentField(null);
                  setMessages([]);
                  setInput("");
                  setFinished(false);
                  setTermsData(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                Reiniciar do início
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowEditDialog(false)} className="text-sm text-slate-400 hover:text-slate-600">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
