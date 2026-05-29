import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wallet, 
  ShieldCheck, 
  CreditCard, 
  Target, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Info
} from "lucide-react";
import { parseBRLInput, formatCurrencyValue } from "../utils";

interface StepperFormProps {
  onComplete: (data: {
    income: number;
    fixedCosts: number;
    debts: number;
    goalName: string;
    goalValue: number;
    goalTimeline: number;
  }) => void;
  initialValues?: {
    income: number;
    fixedCosts: number;
    debts: number;
    goalName: string;
    goalValue: number;
    goalTimeline: number;
  };
  theme?: "light" | "dark";
}

export default function StepperForm({ onComplete, initialValues, theme = "dark" }: StepperFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form field states
  const [incomeInput, setIncomeInput] = useState("");
  const [incomeVal, setIncomeVal] = useState(0);

  const [fixedCostsInput, setFixedCostsInput] = useState("");
  const [fixedCostsVal, setFixedCostsVal] = useState(0);

  const [debtsInput, setDebtsInput] = useState("");
  const [debtsVal, setDebtsVal] = useState(0);

  const [goalName, setGoalName] = useState("");

  const [goalValueInput, setGoalValueInput] = useState("");
  const [goalValueVal, setGoalValueVal] = useState(0);

  const [goalTimeline, setGoalTimeline] = useState<number | "">("");

  const [errorMsg, setErrorMsg] = useState("");

  // Input ref to auto focus on mount and steps
  const inputRef = useRef<HTMLInputElement>(null);

  // Set initial values if editing/modifying
  useEffect(() => {
    if (initialValues) {
      setIncomeVal(initialValues.income);
      setIncomeInput(formatCurrencyValue(initialValues.income));

      setFixedCostsVal(initialValues.fixedCosts);
      setFixedCostsInput(formatCurrencyValue(initialValues.fixedCosts));

      setDebtsVal(initialValues.debts);
      setDebtsInput(formatCurrencyValue(initialValues.debts));

      setGoalName(initialValues.goalName);

      setGoalValueVal(initialValues.goalValue);
      setGoalValueInput(formatCurrencyValue(initialValues.goalValue));

      setGoalTimeline(initialValues.goalTimeline);
    }
  }, [initialValues]);

  // Autofocus input when step changes
  useEffect(() => {
    setErrorMsg("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [currentStep]);

  // Key press listener for ENTER to submit step
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  // Currency handler
  const handleCurrencyChange = (stepNum: number, value: string) => {
    const { numericValue, formattedString } = parseBRLInput(value);
    
    if (stepNum === 1) {
      setIncomeVal(numericValue);
      setIncomeInput(formattedString);
    } else if (stepNum === 2) {
      setFixedCostsVal(numericValue);
      setFixedCostsInput(formattedString);
    } else if (stepNum === 3) {
      setDebtsVal(numericValue);
      setDebtsInput(formattedString);
    } else if (stepNum === 5) {
      setGoalValueVal(numericValue);
      setGoalValueInput(formattedString);
    }
    setErrorMsg("");
  };

  // Step Validation & Logic
  const handleNext = () => {
    if (currentStep === 1) {
      if (incomeVal <= 0) {
        setErrorMsg("Por favor, informe uma renda mensal maior que R$ 0,00.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (fixedCostsVal < 0) {
        setErrorMsg("O valor de custos fixos não pode ser negativo.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (debtsVal < 0) {
        setErrorMsg("O valor de parcelas não pode ser negativo.");
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!goalName.trim()) {
        setErrorMsg("Por favor, digite qual é a sua meta ou sonho.");
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (goalValueVal <= 0) {
        setErrorMsg("Insira o custo estimado da sua meta.");
        return;
      }
      setCurrentStep(6);
    } else if (currentStep === 6) {
      if (!goalTimeline || goalTimeline <= 0) {
        setErrorMsg("Insira um prazo válido em meses para simulação.");
        return;
      }
      // Submit complete form
      onComplete({
        income: incomeVal,
        fixedCosts: fixedCostsVal,
        debts: debtsVal,
        goalName: goalName.trim(),
        goalValue: goalValueVal,
        goalTimeline: Number(goalTimeline)
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Help details config for each step
  const stepMetadata = [
    {
      id: "step1-income",
      icon: <Wallet className="w-6 h-6 text-purple-400" />,
      tag: "Renda Mensal Bruta",
      question: "Quanto é depositado na sua conta todo mês (somando todas as fontes)?",
      placeholder: "R$ 0,00",
      description: "Soma do seu salário CLT, pró-labore, faturamento PJ ou qualquer rendimento fixo ou extra recorrente."
    },
    {
      id: "step2-fixedCosts",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      tag: "Custos Fixos de Vida",
      question: "Quanto você gasta com o essencial (aluguel, contas, alimentação, etc.)?",
      placeholder: "R$ 0,00",
      description: "Gastos obrigatórios para sobrevivência ou contratos: moradia, condomínio, luz, água, feira, plano de saúde, transporte."
    },
    {
      id: "step3-debts",
      icon: <CreditCard className="w-6 h-6 text-red-400" />,
      tag: "Dívidas e Parcelas",
      question: "Você tem atualmente algum valor comprometido com parcelas ou empréstimos?",
      placeholder: "R$ 0,00",
      description: "Financiamentos, parcelas de cartão de crédito pendentes, empréstimos consignados ou carnês."
    },
    {
      id: "step4-goalName",
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      tag: "Nome da Meta",
      question: "Qual é o objetivo principal que você deseja alcançar?",
      placeholder: "Ex: Viagem para o Japão, Entrada de Carro...",
      description: "O sonho ou objetivo financeiro específico que motivará seu planejamento."
    },
    {
      id: "step5-goalValue",
      icon: <DollarSign className="w-6 h-6 text-amber-400" />,
      tag: "Custo da Meta",
      question: "Quanto custa realizar esse sonho?",
      placeholder: "R$ 0,00",
      description: "O valor total financeiro necessário para consumar ou comprar seu objetivo integralmente."
    },
    {
      id: "step6-timeline",
      icon: <Calendar className="w-6 h-6 text-fuchsia-400" />,
      tag: "Prazo Desejado",
      question: "Em quantos meses você planeja atingir esse objetivo?",
      placeholder: "Ex: 12",
      description: "O período em meses que você julga ideal para alcançar a meta planejada."
    }
  ];

  const activeMeta = stepMetadata[currentStep - 1];

  return (
    <div id="sim-wizard-card" className={`w-full max-w-xl mx-auto backdrop-blur-md rounded-2xl border p-6 md:p-8 transition-all relative overflow-hidden ${
      theme === 'dark' 
        ? 'bg-slate-900/40 border-slate-800/80 glow-purple' 
        : 'bg-white/85 border-slate-200 shadow-xl'
    }`}>
      
      {/* Background Neon Spot */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Stepper progress linear bar top */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
          <span className="text-purple-500 font-bold uppercase tracking-wider">{activeMeta.tag}</span>
          <span>Passo <strong className="text-fuchsia-505 text-fuchsia-500 font-mono text-sm">{currentStep}</strong> de 6</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className={`h-1.5 w-full rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-200'
        }`}>
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500"
            initial={{ width: "16.6%" }}
            animate={{ width: `${(currentStep / 6) * 100}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          />
        </div>
      </div>

      {/* Animate Card Interaction Content */}
      <div className="min-h-[290px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {/* Themed Icon Top Left inside Card */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl border inline-flex shadow-inner transition-colors ${
                theme === 'dark' 
                  ? 'bg-purple-950/40 border-slate-700/60' 
                  : 'bg-purple-50 border-purple-100'
              }`}>
                {activeMeta.icon}
              </div>
              <p className={`text-xs px-2 py-1 rounded border font-mono transition-colors ${
                theme === 'dark' 
                  ? 'text-slate-500 bg-slate-850 border-slate-800' 
                  : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}>
                Métrica #{currentStep}
              </p>
            </div>

            {/* Input Question */}
            <h2 id="question-title" className={`text-xl md:text-2xl font-display font-bold tracking-tight leading-tight mb-3 transition-colors ${
              theme === 'dark' ? 'text-gray-50' : 'text-slate-900'
            }`}>
              {activeMeta.question}
            </h2>

            {/* Dynamic Inputs Selection */}
            <div className="mt-6 mb-4">
              {currentStep === 1 && (
                <div className="relative">
                  <input
                    id="input-income"
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder={activeMeta.placeholder}
                    value={incomeInput}
                    onChange={(e) => handleCurrencyChange(1, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full border-2 rounded-xl px-4 py-3.5 text-2xl font-mono text-center transition-all focus:ring-1 focus:ring-purple-500 outline-none ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-800 text-purple-300 placeholder-slate-700 focus:border-purple-500' 
                        : 'bg-slate-50 border-slate-200 text-purple-850 text-purple-750 text-purple-800 placeholder-slate-400 focus:border-purple-400'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-purple-500/80 bg-purple-950/30 border border-purple-900/50 px-2 py-0.5 rounded">BRL</div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="relative">
                  <input
                    id="input-fixedCosts"
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder={activeMeta.placeholder}
                    value={fixedCostsInput}
                    onChange={(e) => handleCurrencyChange(2, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full border-2 rounded-xl px-4 py-3.5 text-2xl font-mono text-center transition-all focus:ring-1 focus:ring-purple-500 outline-none ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-800 text-emerald-300 placeholder-slate-700 focus:border-purple-500' 
                        : 'bg-slate-50 border-slate-200 text-emerald-800 placeholder-slate-400 focus:border-purple-400'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-555 text-emerald-550 bg-emerald-955/30 border border-emerald-950/50 border-emerald-950/50 border-emerald-900/50 px-2 py-0.5 rounded">BRL</div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="relative">
                  <input
                    id="input-debts"
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder={activeMeta.placeholder}
                    value={debtsInput}
                    onChange={(e) => handleCurrencyChange(3, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full border-2 rounded-xl px-4 py-3.5 text-2xl font-mono text-center transition-all focus:ring-1 focus:ring-purple-500 outline-none ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-800 text-red-300 placeholder-slate-700 focus:border-purple-500' 
                        : 'bg-slate-50 border-slate-200 text-red-800 placeholder-slate-400 focus:border-purple-400'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-red-500 bg-red-955/30 border border-red-900/50 px-2 py-0.5 rounded">BRL</div>
                </div>
              )}

              {currentStep === 4 && (
                <input
                  id="input-goalName"
                  ref={inputRef}
                  type="text"
                  maxLength={50}
                  placeholder={activeMeta.placeholder}
                  value={goalName}
                  onChange={(e) => {
                    setGoalName(e.target.value);
                    setErrorMsg("");
                  }}
                  onKeyDown={handleKeyDown}
                  className={`w-full border-2 rounded-xl px-4 py-3.5 text-xl font-sans text-center transition-all focus:ring-1 focus:ring-purple-500 outline-none ${
                    theme === 'dark' 
                      ? 'bg-slate-950/80 border-slate-800 text-gray-100 placeholder-slate-600 focus:border-purple-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-400'
                  }`}
                />
              )}

              {currentStep === 5 && (
                <div className="relative">
                  <input
                    id="input-goalValue"
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder={activeMeta.placeholder}
                    value={goalValueInput}
                    onChange={(e) => handleCurrencyChange(5, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full border-2 rounded-xl px-4 py-3.5 text-2xl font-mono text-center transition-all focus:ring-1 focus:ring-purple-500 outline-none ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-800 text-amber-300 placeholder-slate-700 focus:border-purple-500' 
                        : 'bg-slate-50 border-slate-200 text-amber-700 placeholder-slate-400 focus:border-purple-400'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-500 bg-amber-955/30 border border-amber-900/55 px-2 py-0.5 rounded">BRL</div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="relative">
                  <input
                    id="input-timeline"
                    ref={inputRef}
                    type="number"
                    min="1"
                    max="600"
                    placeholder={activeMeta.placeholder}
                    value={goalTimeline}
                    onChange={(e) => {
                      const v = e.target.value === "" ? "" : Number(e.target.value);
                      setGoalTimeline(v);
                      setErrorMsg("");
                    }}
                    onKeyDown={handleKeyDown}
                    className={`w-full border-2 rounded-xl px-4 py-3.5 text-2xl font-mono text-center transition-all focus:ring-1 focus:ring-purple-500 outline-none ${
                      theme === 'dark' 
                        ? 'bg-slate-950/80 border-slate-800 text-fuchsia-300 placeholder-slate-700 focus:border-purple-500' 
                        : 'bg-slate-50 border-slate-200 text-fuchsia-700 placeholder-slate-400 focus:border-purple-400'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans text-fuchsia-400 bg-fuchsia-950/30 border border-fuchsia-900/50 px-2 py-0.5 rounded">meses</div>
                </div>
              )}
            </div>

            {/* Hint / Descripive info panel */}
            <div className={`flex gap-2.5 items-start border rounded-lg p-3 text-xs transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-950/40 border-slate-800/80 text-slate-400' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <span>{activeMeta.description}</span>
            </div>
            
            {/* Error notifications */}
            {errorMsg && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`font-medium text-xs mt-3 text-center border py-1.5 px-3 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-red-400 bg-red-950/25 border-red-900/50'
                    : 'text-red-700 bg-red-50 border-red-200/60'
                }`}
              >
                {errorMsg}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stepper Wizard Controls Buttons */}
        <div className={`flex items-center gap-3 mt-8 pt-4 border-t justify-between transition-colors ${
          theme === 'dark' ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <button
            id="btn-back"
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              currentStep === 1 
                ? theme === 'dark'
                  ? "border-slate-800/40 text-slate-600 cursor-not-allowed opacity-50" 
                  : "border-slate-200 text-slate-300 cursor-not-allowed opacity-55"
                : theme === 'dark'
                  ? "border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-black shadow-sm"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>

          <button
            id="btn-next"
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98] glow-btn"
          >
            {currentStep === 6 ? (
              <>
                Gerar simulação
                <Sparkles className="w-4 h-4 text-amber-300" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
