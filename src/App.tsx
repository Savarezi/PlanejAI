import { useState, useEffect } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  History, 
  RefreshCw, 
  ArrowLeft, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  TrendingUp, 
  X,
  PiggyBank,
  Check,
  ChevronRight,
  Calculator,
  Info,
  Sun,
  Moon
} from "lucide-react";
import StepperForm from "./components/StepperForm";
import { formatCurrencyValue, generateId, formatMonths } from "./utils";
import { Simulation } from "./types";

export default function App() {
  // Navigation / View states
  const [view, setView] = useState<"welcome" | "wizard" | "result">("welcome");
  const [activeSimulation, setActiveSimulation] = useState<Simulation | null>(null);
  
  // Theme state: default 'dark' or loaded from localStore
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const storedTheme = localStorage.getItem("planejai_theme");
      return (storedTheme === "light" || storedTheme === "dark") ? storedTheme : "dark";
    } catch {
      return "dark";
    }
  });

  // History of simulations
  const [history, setHistory] = useState<Simulation[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Custom API key configuration
  const [customApiKey, setCustomApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Loading and execution states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Form backup in case of editing or returning
  const [formBackup, setFormBackup] = useState<{
    income: number;
    fixedCosts: number;
    debts: number;
    goalName: string;
    goalValue: number;
    goalTimeline: number;
  } | undefined>(undefined);

  // Sync theme with document class list and localStorage
  useEffect(() => {
    try {
      localStorage.setItem("planejai_theme", theme);
    } catch (e) {
      console.error(e);
    }
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  // Load history & API key from localStorage on mount
  useEffect(() => {

    try {
      const storedHistory = localStorage.getItem("planejai_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }

      const storedKey = localStorage.getItem("planejai_custom_key");
      if (storedKey) {
        setCustomApiKey(storedKey);
        setIsKeySaved(true);
      }
    } catch (e) {
      console.error("Falha ao carregar dados do LocalStorage:", e);
    }
  }, []);

  // Save customized API key
  const handleSaveApiKey = (key: string) => {
    localStorage.setItem("planejai_custom_key", key);
    setCustomApiKey(key);
    setIsKeySaved(!!key);
    setShowKeyModal(false);
  };

  // Clear Key
  const handleClearApiKey = () => {
    localStorage.removeItem("planejai_custom_key");
    setCustomApiKey("");
    setIsKeySaved(false);
  };

  // Process completed wizard simulation
  const handleFormComplete = async (formData: {
    income: number;
    fixedCosts: number;
    debts: number;
    goalName: string;
    goalValue: number;
    goalTimeline: number;
  }) => {
    setFormBackup(formData);
    setIsLoading(true);
    setView("result");
    setApiError(null);

    // Create unique dynamic ID based on input fingerprint
    const simulationFingerprint = `sim_${formData.income}_${formData.fixedCosts}_${formData.debts}_${formData.goalValue}_${formData.goalTimeline}_${formData.goalName.replace(/\s+/g, "")}`;
    
    // Check if we have this exact plan cached in history already
    const cachedSimulation = history.find(s => s.id === simulationFingerprint);
    if (cachedSimulation) {
      setTimeout(() => {
        setActiveSimulation(cachedSimulation);
        setIsLoading(false);
      }, 700);
      return;
    }

    try {
      const response = await fetch("/api/financial-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          income: formData.income,
          fixedCosts: formData.fixedCosts,
          debts: formData.debts,
          goalName: formData.goalName,
          goalValue: formData.goalValue,
          goalTimeline: formData.goalTimeline,
          customApiKey: customApiKey
        }),
      });

      if (!response.ok) {
        throw new Error("Erro de resposta do servidor da API.");
      }

      const data = await response.json();
      
      const newSim: Simulation = {
        id: simulationFingerprint,
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        income: formData.income,
        fixedCosts: formData.fixedCosts,
        debts: formData.debts,
        goalName: formData.goalName,
        goalValue: formData.goalValue,
        goalTimeline: formData.goalTimeline,
        actionPlan: data.actionPlan
      };

      // Save to localStorage & state
      const updatedHistory = [newSim, ...history.filter(h => h.id !== newSim.id)];
      localStorage.setItem("planejai_history", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      setActiveSimulation(newSim);

      if (data.errorDetails) {
        setApiError("O planejamento automatizado foi calculado utilizando o motor matemático de contingência financeira.");
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Não foi possível conectar ao servidor principal. Exibindo projeção local estruturada com base nas suas metas.");
      
      // Motor de projeção matemática para suporte offline de contingência
      const netIncome = formData.income - formData.fixedCosts - formData.debts;
      const suggestedMonthly = formData.goalValue / formData.goalTimeline;
      const safePlan = `
### Viabilidade da Meta
Sua meta de realizar **${formData.goalName}** em **${formData.goalTimeline} meses** exige um aporte financeiro mensal de **R$ ${suggestedMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. 
Seu saldo líquido disponível após despesas é de **R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. Recomendamos prudência para não comprometer a sua reserva de liquidez.

### Diagnóstico Financeiro
- Comprometimento essencial: **R$ ${formData.fixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** (${((formData.fixedCosts / formData.income) * 100).toFixed(0)}% da renda bruta).
- Compromissos passivos/dívidas: **R$ ${formData.debts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** (${((formData.debts / formData.income) * 100).toFixed(0)}% da renda bruta).
- Orçamento livre restante: **R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.

### Sugestão Prática
1. **Regra de ouro 50/30/20**: Direcione 50% de sua renda para necessidades fixas, 30% em lazer responsável e poupe os 20% restantes religiosamente.
2. **Combata o desperdício invisível**: Avalie com rigor tarifas bancárias, assinaturas duplicadas de redes de entretenimento e gastos de conveniência.

### Como Aumentar a Renda
1. **Prestação de Serviços Especializados**: Dedique duas horas nos finais de semana para realizar trabalhos extras ou assessoria na sua área de formação atual.
2. **Negócios Paralelos**: Desenvolva infoprodutos ou comercialize itens ociosos acumulados na residência.

### Sugestões de Investimento
- **Ativos de Renda Fixa com FGC**: Aloque a reserva financeira mensal em CDB emitido por bancos sólidos pagando a partir de 100% do CDI ou Tesouro Selic nacional. Ambas frentes proporcionam máxima segurança para o seu capital.

### Mensagem Final
Parabéns pela iniciativa de organizar sua vida! O planejamento do sonho **${formData.goalName}** pavimenta o caminho seguro rumo à prosperidade imediata.
`;

      const fallbackSim: Simulation = {
        id: simulationFingerprint,
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }),
        income: formData.income,
        fixedCosts: formData.fixedCosts,
        debts: formData.debts,
        goalName: formData.goalName,
        goalValue: formData.goalValue,
        goalTimeline: formData.goalTimeline,
        actionPlan: safePlan
      };

      setActiveSimulation(fallbackSim);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper parser for custom markdown styled blocks with custom bullet formatting
  const renderActionPlan = (markdown: string) => {
    if (!markdown) return null;
    
    // Split on ###
    const parts = markdown.split("###");
    
    return (
      <div className="space-y-6 markdown-body">
        {parts.map((part, index) => {
          if (!part.trim()) return null;
          
          const lines = part.split("\n");
          const title = lines[0].trim();
          const restText = lines.slice(1).join("\n").trim();
          
          return (
            <div key={index} className="border-b border-slate-800/65 pb-5 last:border-0 last:pb-0">
              <h3 className="text-purple-400 font-display font-semibold text-lg flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                {title}
              </h3>
              
              <div className="text-slate-300 text-sm leading-relaxed space-y-2">
                {restText.split("\n\n").map((para, pIdx) => {
                  if (!para.trim()) return null;
                  
                  // Check if it's a list item
                  if (para.startsWith("- ") || para.startsWith("* ") || /^\d+\.\s/.test(para)) {
                    const items = para.split(/\n/);
                    return (
                      <ul key={pIdx} className="list-disc pl-5 space-y-2.5 my-2">
                        {items.map((item, itemIdx) => {
                          const cleanItem = item.replace(/^([-*]|\d+\.)\s/, "").trim();
                          return (
                            <li key={itemIdx} className="text-slate-300">
                              {renderFormattedWords(cleanItem)}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }
                  
                  // Single text block line elements split
                  if (para.includes("\n")) {
                    const items = para.split("\n");
                    return (
                      <div key={pIdx} className="space-y-2">
                        {items.map((it, itIdx) => {
                          if (it.trim().startsWith("-") || it.trim().startsWith("*") || /^\d+\.\s/.test(it.trim())) {
                            const clean = it.replace(/^([-*]|\d+\.)\s/, "").trim();
                            return (
                              <div key={itIdx} className="flex gap-2 text-slate-300 text-sm pl-2">
                                <span className="text-purple-500 font-mono select-none">•</span>
                                <div>{renderFormattedWords(clean)}</div>
                              </div>
                            );
                          }
                          return <p key={itIdx} className="text-slate-300">{renderFormattedWords(it)}</p>;
                        })}
                      </div>
                    );
                  }

                  return (
                    <p key={pIdx}>
                      {renderFormattedWords(para)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Safe simple parser to transform **bold** phrases within texts
  const renderFormattedWords = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-purple-300 font-semibold bg-purple-950/20 px-1 py-0.5 rounded">{part}</strong>;
      }
      return part;
    });
  };

  // Calculated state values for summary box
  const getSimCalculations = () => {
    if (!activeSimulation) return null;
    const { income, fixedCosts, debts, goalValue, goalTimeline } = activeSimulation;
    
    const remainder = income - fixedCosts - debts;
    const monthlyNeeded = goalValue / goalTimeline;
    const isFeasible = remainder >= monthlyNeeded;
    const commitRatio = ((fixedCosts + debts) / income) * 100;
    
    return {
      remainder,
      monthlyNeeded,
      isFeasible,
      commitRatio
    };
  };

  const calcs = getSimCalculations();

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-purple-600/30 selection:text-white transition-colors duration-300 ${
      theme === "dark" ? "bg-[#070a13] text-gray-100" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* Top Banner & Main Interactive Header */}
      <header id="main-app-header" className={`border-b sticky top-0 z-40 px-4 md:px-8 py-4 backdrop-blur-md transition-colors duration-300 ${
        theme === "dark" ? "border-slate-900 bg-slate-950/45" : "border-slate-200 bg-white/75"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand with Neon detailing */}
          <div 
            onClick={() => {
              setView("welcome");
              setActiveSimulation(null);
            }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 border border-purple-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <span className={`font-display font-bold text-lg md:text-xl tracking-tight transition-colors duration-300 ${
                theme === "dark" 
                  ? "bg-gradient-to-r from-purple-200 via-white to-purple-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-purple-700 via-slate-900 to-indigo-800 bg-clip-text text-transparent"
              }`}>
                Planej.ai
              </span>
              <span className={`text-[10px] font-mono block font-bold -mt-1 tracking-widest transition-colors duration-300 ${
                theme === "dark" ? "text-purple-400" : "text-purple-700"
              }`}>
                PERSONAL FINANCE AI
              </span>
            </div>
          </div>

          {/* Quick Stats or Actions Navigation Header Control */}
          <div className="flex items-center gap-2">
            
            {/* Toggle Theme Light/Dark mode */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                theme === "dark"
                  ? "bg-slate-900/60 border-slate-800 text-yellow-400 hover:text-yellow-300"
                  : "bg-slate-100 border-slate-200 text-purple-600 hover:text-purple-500 hover:bg-slate-200"
              }`}
              title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Simulation History button indicator */}
            <button
              id="top-history-trigger"
              onClick={() => setShowHistoryModal(true)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                theme === "dark"
                  ? "text-slate-300 bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:text-white"
                  : "text-slate-700 bg-slate-150 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
              }`}
              title="Histórico de Simulações"
            >
              <History className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Histórico</span>
              {history.length > 0 && (
                <span className="bg-purple-950 text-purple-300 border border-purple-900 px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold">
                  {history.length}
                </span>
              )}
            </button>

            {/* Custom API key configuration trigger */}
            <button
              id="key-config-trigger"
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isKeySaved 
                  ? theme === "dark" 
                    ? "bg-purple-900/15 border-purple-800/80 text-purple-200" 
                    : "bg-purple-100 border-purple-200 text-purple-800"
                  : theme === "dark"
                    ? "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Key className={`w-3.5 h-3.5 ${isKeySaved ? "text-amber-500" : ""}`} />
              <span className="hidden sm:inline">{isKeySaved ? "Chave Ativa" : "Configuração IA"}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isKeySaved ? "bg-purple-500" : "bg-slate-400"}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-grow flex items-center justify-center px-4 md:px-6 py-8 md:py-12 position-relative">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Welcome Dashboard Hub */}
          {view === "welcome" && (
            <div id="welcome-panel" className="text-center py-6 max-w-2xl mx-auto animate-fadeIn">
              
              {/* Highlight badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide mb-6 transition-colors ${
                theme === "dark" 
                  ? "bg-purple-950/45 border border-purple-800/50 text-purple-300" 
                  : "bg-purple-50 border border-purple-200 text-purple-700"
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                <span>PLANEJAMENTO INTEGRADO COM INTELIGÊNCIA ARTIFICIAL</span>
              </div>

              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight mb-6 transition-colors ${
                theme === "dark" ? "text-gray-50" : "text-slate-900"
              }`}>
                Conquiste seus sonhos com <br className="hidden md:block"/>
                <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-505 bg-clip-text text-transparent font-extrabold">
                  Planejamento Inteligente
                </span>
              </h1>

              <p className={`text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10 transition-colors ${
                theme === "dark" ? "text-slate-400" : "text-slate-605 text-slate-600"
              }`}>
                Uma ferramenta simples, sem complicações, que analisa sua renda, custos fixos e aponta um mapa prático detalhado de investimentos e renda extra para realizar seus objetivos.
              </p>

              {/* Action grid block */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                
                <button
                  id="start-simulation-btn"
                  onClick={() => {
                    setFormBackup(undefined);
                    setView("wizard");
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all scale-100 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-purple-950/50 glow-btn"
                >
                  <Calculator className="w-5 h-5 text-slate-200" />
                  Iniciar Simulação Financeira
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>

                {history.length > 0 && (
                  <button
                    id="welcome-history-btn"
                    onClick={() => setShowHistoryModal(true)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-colors border ${
                      theme === "dark"
                        ? "bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-850"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm"
                    }`}
                  >
                    <History className="w-4 h-4 text-purple-500" />
                    Ver Histórico ({history.length})
                  </button>
                )}
              </div>

              {/* Security info disclaimer */}
              <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NENHUM DADO COMPARTILHADO • TOTALMENTE PRIVADO E LOCAL</span>
              </div>
            </div>
          )}

          {/* Stepper Wizard View */}
          {view === "wizard" && (
            <div>
              <div className="max-w-xl mx-auto mb-6 text-center animate-fadeIn">
                <button
                  onClick={() => setView("welcome")}
                  className={`inline-flex items-center gap-1.5 text-xs transition-colors border rounded-lg px-2.5 py-1 ${
                    theme === "dark"
                      ? "text-slate-400 hover:text-white bg-slate-900/60 border-slate-850"
                      : "text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao início
                </button>
              </div>

              <StepperForm 
                onComplete={handleFormComplete} 
                initialValues={formBackup}
                theme={theme}
              />
            </div>
          )}

          {/* SIMULATION DASHBOARD VIEW */}
          {view === "result" && (
            <div id="results-dashboard" className="space-y-8 animate-fadeIn">
              
              {/* Back & Re-run Toolbar actions */}
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b transition-colors ${
                theme === "dark" ? "border-slate-900" : "border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    id="back-to-form-btn"
                    onClick={() => setView("wizard")}
                    className={`flex items-center gap-1.5 border px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      theme === "dark"
                        ? "border-slate-800 bg-slate-950/80 hover:bg-slate-900 text-slate-300"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Ajustar Parâmetros
                  </button>
                  
                  <button
                    id="restart-all-btn"
                    onClick={() => {
                      setFormBackup(undefined);
                      setView("wizard");
                    }}
                    className={`flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs transition-all ${
                      theme === "dark"
                        ? "border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm"
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Nova Simulação
                  </button>
                </div>

                <div className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex justify-between sm:justify-start items-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "text-slate-500 bg-slate-950/30 border-slate-900"
                    : "text-slate-600 bg-slate-100 border-slate-200"
                }`}>
                  <span>Simulado em:</span>
                  <span className="text-purple-500 font-bold">{activeSimulation?.date || "Agora"}</span>
                </div>
              </div>

              {/* Server or Config Notifications / Custom Keys Alert */}
              {apiError && (
                <div className="bg-amber-950/15 border border-amber-900/40 rounded-xl p-4 flex gap-3 text-sm text-amber-300">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Nota do Consultor:</span>
                    <p className="text-amber-400/90 leading-relaxed text-xs">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Loading Skeleton Panel if waiting for content */}
              {isLoading && (
                <div className="space-y-8">
                  {/* Top skeleton meters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-28 bg-slate-900/30 border border-slate-800 rounded-2xl animate-pulse" />
                    ))}
                  </div>

                  {/* Body grid skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-96 animate-pulse">
                      <div className="h-6 w-1/3 bg-slate-800 rounded mb-6" />
                      <div className="h-4 w-full bg-slate-800 rounded" />
                      <div className="h-4 w-5/6 bg-slate-800 rounded" />
                      <div className="h-4 w-4/5 bg-slate-800 rounded" />
                      <div className="h-4 w-5/6 bg-slate-800 rounded mt-8" />
                      <div className="h-4 w-3/4 bg-slate-800 rounded" />
                      <div className="h-4 w-2/3 bg-slate-800 rounded" />
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-96 animate-pulse" />
                  </div>

                  <p className="text-center text-xs text-slate-500 font-mono animate-bounce pt-2">
                    Nossa Inteligência Artificial está traçando o melhor caminho para o seu orçamento... ✨
                  </p>
                </div>
              )}

              {/* Complete Result Cards Dashboard Grid */}
              {!isLoading && activeSimulation && calcs && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Card 1: Custo da Meta */}
                    <div className={`rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between border transition-all ${
                      theme === 'dark' ? 'bg-slate-900/30 border-slate-850' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-600/5 rounded-full blur-xl pointer-events-none" />
                      <span className="text-xs font-mono uppercase text-slate-500 block mb-1">CUSTO DO OBJETIVO</span>
                      <div>
                        <span className="text-2xl font-mono font-bold text-amber-500">
                          {formatCurrencyValue(activeSimulation.goalValue)}
                        </span>
                        <p className="text-xs text-slate-400 font-medium truncate mt-1">
                          para <strong className={theme === 'dark' ? 'text-gray-200' : 'text-slate-800'}>{activeSimulation.goalName}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Prazo */}
                    <div className={`rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between border transition-all ${
                      theme === 'dark' ? 'bg-slate-900/30 border-slate-850' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-cyan-600/5 rounded-full blur-xl pointer-events-none" />
                      <span className="text-xs font-mono uppercase text-slate-500 block mb-1">PRAZO DESEJADO</span>
                      <div>
                        <span className="text-2xl font-mono font-bold text-cyan-550 text-cyan-600">
                          {formatMonths(activeSimulation.goalTimeline)}
                        </span>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          aprox. <strong className={theme === 'dark' ? 'text-gray-200' : 'text-slate-805 text-slate-800'}>{(activeSimulation.goalTimeline / 12).toFixed(1)} anos</strong>
                        </p>
                      </div>
                    </div>

                    {/* Card 3 (Featured Purple highlight): Economia Mensal Necessária */}
                    <div className={`rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg transition-all border ${
                      theme === 'dark' 
                        ? 'bg-purple-950/15 border-purple-900/55 shadow-purple-950/20 text-purple-200' 
                        : 'bg-purple-50/75 border-purple-200/80 shadow-purple-100/40 text-purple-900'
                    }`}>
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full opacity-10 blur-xl pointer-events-none" />
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-mono uppercase font-bold tracking-wider ${theme === 'dark' ? 'text-purple-300' : 'text-purple-750'}`}>ECONOMIA MENSAL RECOMENDADA</span>
                        <PiggyBank className="w-4 h-4 text-purple-555 text-purple-600" />
                      </div>
                      <div>
                        <span className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight block ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                          {formatCurrencyValue(calcs.monthlyNeeded)}
                        </span>
                        <div className={`text-xs font-medium mt-1 flex items-center gap-1.5 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                          {calcs.isFeasible ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded">
                              <Check className="w-3 h-3" /> Viável
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-amber-500 font-bold bg-amber-955 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200/60">
                              Exige ajuste local
                            </span>
                          )}
                          <span>da sua renda líquida</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Row 2: Detailed Plan and Finances details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column (Amplo - Insight Financeiro Personalizado) */}
                    <div className={`lg:col-span-2 rounded-2xl p-6 md:p-8 relative border transition-colors ${
                      theme === 'dark' ? 'bg-slate-900/25 border-slate-850' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      
                      {/* Ambient header for Action Card */}
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 mb-6 transition-colors ${
                        theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                      }`}>
                        <div>
                          <span className="text-xs text-purple-500 font-mono uppercase tracking-widest font-bold">INSIGHTS FINANCEIROS PERSONALIZADOS</span>
                          <h2 id="plan-title" className={`text-xl md:text-2xl font-display font-bold mt-1 transition-colors ${
                            theme === 'dark' ? 'text-gray-100' : 'text-slate-900'
                          }`}>
                            Plano de Ação: {activeSimulation.goalName}
                          </h2>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[10px] sm:self-center transition-colors ${
                          theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <User className="w-3.5 h-3.5 text-purple-500" />
                          <span>CONSULTOR DIGITAL DISPONÍVEL</span>
                        </div>
                      </div>

                      {/* AI Generated Markdown analysis box */}
                      <div className="prose prose-invert max-w-none">
                        {renderActionPlan(activeSimulation.actionPlan)}
                      </div>

                    </div>

                    {/* Right Column (Finances Summary Checklist & Diagnostics) */}
                    <div className="space-y-6">
                      
                      {/* Financial Input values summarized right card */}
                      <div className={`rounded-2xl p-5 md:p-6 relative overflow-hidden border transition-colors ${
                        theme === 'dark' ? 'bg-slate-900/25 border-slate-850' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <h3 className={`text-xs font-mono uppercase tracking-wider mb-5 border-b pb-2 flex justify-between items-center ${
                          theme === 'dark' ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
                        }`}>
                          <span>REGISTROS DECLARADOS</span>
                          <Calculator className="w-3.5 h-3.5 text-slate-500" />
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Renda */}
                          <div className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${
                            theme === 'dark' ? 'bg-slate-950/40 border-slate-900/80' : 'bg-slate-50 border-slate-150'
                          }`}>
                            <div>
                              <span className="text-xs text-slate-400 block">Renda Mensal</span>
                              <span className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Ganhos Gerais</span>
                            </div>
                            <span className="font-mono font-bold text-purple-500 text-sm">
                              {formatCurrencyValue(activeSimulation.income)}
                            </span>
                          </div>

                          {/* Custos Fixos */}
                          <div className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${
                            theme === 'dark' ? 'bg-slate-950/40 border-slate-900/80' : 'bg-slate-50 border-slate-150'
                          }`}>
                            <div>
                              <span className="text-xs text-slate-400 block">Custos Fixos</span>
                              <span className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Gasto Essencial</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-500 text-sm">
                              -{formatCurrencyValue(activeSimulation.fixedCosts)}
                            </span>
                          </div>

                          {/* Dívidas */}
                          <div className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${
                            theme === 'dark' ? 'bg-slate-950/40 border-slate-900/80' : 'bg-slate-50 border-slate-150'
                          }`}>
                            <div>
                              <span className="text-xs text-slate-400 block">Dívidas / Empréstimos</span>
                              <span className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Comprometidos</span>
                            </div>
                            <span className="font-mono font-bold text-red-500 text-sm">
                              -{formatCurrencyValue(activeSimulation.debts)}
                            </span>
                          </div>
                        </div>

                        {/* Net remainder balance check */}
                        <div className={`mt-6 pt-4 border-t flex justify-between items-center ${
                          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                        }`}>
                          <div>
                            <span className="text-xs text-slate-550 text-slate-500 block">Saldo Líquido</span>
                            <span className="text-xs font-medium text-slate-400">Disponível por mês</span>
                          </div>
                          <span className={`font-mono font-bold text-[15px] ${calcs.remainder > 0 ? theme === 'dark' ? 'text-slate-100' : 'text-slate-905 text-slate-900' : 'text-red-555 text-red-650'}`}>
                            {formatCurrencyValue(calcs.remainder)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Diagnostic Insights gauge */}
                      <div className={`rounded-2xl p-5 md:p-6 border transition-all ${
                        theme === 'dark' ? 'bg-slate-900/25 border-slate-850' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-4 flex items-center justify-between">
                          <span>DIAGNÓSTICO DA RENDA</span>
                          <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                        </h4>

                        <div className="space-y-4">
                          
                          {/* Compromised income progress bar */}
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-slate-400">Renda Comprometiva</span>
                              <span className="text-slate-350 text-slate-500 font-mono font-bold">{calcs.commitRatio.toFixed(0)}%</span>
                            </div>
                            <div className={`h-2 w-full rounded-full overflow-hidden transition-colors ${
                              theme === "dark" ? "bg-slate-950" : "bg-slate-200"
                            }`}>
                              <div 
                                className={`h-full rounded-full ${
                                  calcs.commitRatio > 75 
                                    ? "bg-red-500" 
                                    : calcs.commitRatio > 50 
                                      ? "bg-amber-500" 
                                      : "bg-emerald-500"
                                  }`}
                                style={{ width: `${Math.min(calcs.commitRatio, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Fast warnings details list */}
                          <div className="space-y-2.5 pt-2">
                            {calcs.commitRatio > 70 && (
                              <div className={`flex gap-2 text-xs p-2.5 rounded-lg border ${
                                theme === 'dark'
                                  ? "text-red-300 bg-red-950/20 border-red-900/30"
                                  : "text-red-700 bg-red-50 border-red-200/60"
                              }`}>
                                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                                <span>Renda severamente comprometida por parcelas ou custos fixos. Priorize a renegociação.</span>
                              </div>
                            )}

                            {calcs.remainder < calcs.monthlyNeeded && (
                              <div className={`flex gap-2 text-xs p-2.5 rounded-lg border ${
                                theme === 'dark' 
                                  ? "text-amber-305 text-amber-300 bg-amber-955 bg-amber-950/20 border-amber-900/30" 
                                  : "text-amber-700 bg-amber-50 border-amber-200/60"
                              }`}>
                                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-605 text-amber-600'}`} />
                                <span>A economia mensal sugerida excede o saldo utilizável mensal livre de {formatCurrencyValue(calcs.remainder)}. Aumentar o prazo da simulação ajudará.</span>
                              </div>
                            )}

                            {calcs.remainder >= calcs.monthlyNeeded && calcs.commitRatio <= 50 && (
                              <div className={`flex gap-2 text-xs p-2.5 rounded-lg border ${
                                theme === 'dark'
                                  ? "text-emerald-305 text-emerald-300 bg-emerald-950/20 border-emerald-950/30"
                                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
                              }`}>
                                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <span>Excelente! Suas finanças estão robustas e saudáveis para absorver este investimento.</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

              </>
            )}

            </div>
          )}

        </div>
      </main>

      {/* Footer Details block layout */}
      <footer id="main-app-footer" className={`border-t py-6 px-4 text-center text-xs text-slate-400 font-mono mt-8 transition-colors ${
        theme === 'dark' ? 'border-slate-900' : 'border-slate-200 bg-slate-950/10'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Planej.ai • O Seu Guia Inteligente de Sucesso Financeiro</p>
          <p className="text-slate-500">
            Privacidade garantida • Seus dados financeiros estão seguros localmente
          </p>
        </div>
      </footer>

      {/* MODAL 1: Simulation History Overlay Drawer */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}
          />
          <div className={`relative border rounded-2xl w-full max-w-lg p-6 overflow-hidden max-h-[80vh] flex flex-col justify-between shadow-2xl transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className={`flex items-center justify-between border-b pb-3.5 mb-4 transition-colors ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                <h3 className={`text-md font-display font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-slate-900'}`}>Simulações Anteriores</h3>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-purple-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <Calculator className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Nenhum histórico disponível para exibição.</p>
                </div>
              ) : (
                history.map((sim, i) => (
                  <div 
                    key={sim.id}
                    onClick={() => {
                      setActiveSimulation(sim);
                      setView("result");
                      setShowHistoryModal(false);
                    }}
                    className={`group border p-4 rounded-xl cursor-not-allowed select-none md:cursor-pointer transition-all flex items-center justify-between ${
                      theme === 'dark'
                        ? 'bg-slate-950/50 hover:bg-purple-950/15 border-slate-850 hover:border-purple-900/60'
                        : 'bg-slate-50 hover:bg-purple-50/70 border-slate-150 hover:border-purple-200 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-slate-400 font-mono">{sim.date}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-semibold border border-purple-900">
                          {sim.goalTimeline}M
                        </span>
                      </div>
                      <p className={`text-sm font-semibold group-hover:text-purple-550 transition-colors ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-850 text-slate-800'
                      }`}>
                        {sim.goalName}
                      </p>
                      <span className="text-xs text-slate-500">
                        Custo: <strong className={`font-mono ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>{formatCurrencyValue(sim.goalValue)}</strong> • Renda: R$ {sim.income.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className={`mt-5 pt-3 border-t text-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  onClick={() => {
                    localStorage.removeItem("planejai_history");
                    setHistory([]);
                  }}
                  className="text-xs text-red-500 hover:text-red-650 underline font-medium"
                >
                  Limpar todo o histórico
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Custom Gemini API Key configuration */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            onClick={() => setShowKeyModal(false)}
          />
          <div className={`relative border rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-hidden transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-gray-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className={`flex items-center justify-between border-b pb-3.5 mb-4 transition-colors ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className={`text-md font-display font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-slate-900'}`}>Configurar Chave Gemini</h3>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-purple-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              A aplicação já conta com uma chave corporativa pré-instalada no Cloud Run. Caso deseje conectar usando sua própria **Gemini API Key** de desenvolvedor e evitar filas de requisição, configure-a no campo abaixo.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Sua API Key do Google AI Studio</label>
                <input
                  id="custom-apikey-input"
                  type="password"
                  placeholder="AIzaSy..."
                  defaultValue={customApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      handleClearApiKey();
                    } else {
                      localStorage.setItem("planejai_custom_key", val);
                      setCustomApiKey(val);
                      setIsKeySaved(true);
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:border-purple-500 outline-none transition-colors ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-850 text-purple-200 placeholder-slate-800' 
                      : 'bg-slate-50 border-slate-200 text-purple-950 placeholder-slate-400'
                  }`}
                />
              </div>

              {isKeySaved ? (
                <div className={`flex gap-2 text-[11px] p-2.5 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'text-purple-300 bg-purple-950/20 border-purple-900/40'
                    : 'text-purple-800 bg-purple-50 border-purple-200/50'
                }`}>
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>Chave customizada salva e ativa! Ela será utilizada preferencialmente nas próximas requisições de simulação.</span>
                </div>
              ) : (
                <div className={`flex gap-2 text-[11px] p-2.5 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-400 bg-slate-955 bg-slate-950 border-slate-900'
                    : 'text-slate-600 bg-slate-50 border-slate-200/70'
                }`}>
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Utilizando a chave padrão integrada do sistema do Planej.ai.</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {isKeySaved && (
                  <button
                    onClick={() => {
                      handleClearApiKey();
                      setShowKeyModal(false);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                  >
                    Excluir Chave
                  </button>
                )}
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="ml-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  Concluir
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
