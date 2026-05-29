import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Inicialização do cliente Gemini
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Rotas da API
app.post("/api/financial-plan", async (req, res) => {
  const { income, fixedCosts, debts, goalName, goalValue, goalTimeline, customApiKey } = req.body;

  if (!income || !goalName || !goalValue || !goalTimeline) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
  }

  // Verifica se o usuário enviou uma chave própria
  let activeAi = ai;
  if (customApiKey && customApiKey.trim().length > 0) {
    try {
      activeAi = new GoogleGenAI({
        apiKey: customApiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e: any) {
      console.warn("Falha ao inicializar com a chave customizada:", e);
    }
  }

  // Projeções e métricas básicas para análise
  const netIncome = income - fixedCosts - debts;
  const suggestedMonthly = goalValue / goalTimeline;
  const savingPercentage = (netIncome > 0 ? (suggestedMonthly / netIncome) * 100 : 999).toFixed(1);

  const prompt = `
Análise o seguinte perfil financeiro de forma detalhada:
Renda Mensal Bruta: R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Custos Fixos Atuais: R$ ${fixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Dívidas / Parcelas: R$ ${debts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Saldo Líquido Estimado: R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Meta Principal: ${goalName}
Custo da Meta: R$ ${goalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Prazo Desejado: ${goalTimeline} meses
Economia Mensal Necessária para a Meta: R$ ${suggestedMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${savingPercentage}% do saldo líquido estimado)

Escreva o plano de ação exatamente e obrigatoriamente sob os seguintes tópicos em Markdown, usando títulos H3 (###) elegantes para cada tópico, sem inverter nem pular nenhum:

### Viabilidade da Meta
Diga se a meta é realista no prazo de ${goalTimeline} meses sabendo que o usuário teria que poupar R$ ${suggestedMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês. Faça sugestões realistas de ajuste do prazo caso o saldo líquido (R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) seja insuficiente.

### Diagnóstico Financeiro
Analise a relação entre os Ganhos Brutos (R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}), Custos Fixos (R$ ${fixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) e Dívidas (R$ ${debts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Explique qual o percentual de comprometimento da renda e o nível de saúde financeira atual.

### Sugestão Prática
Forneça 3 passos imediatos e práticos para enxugar despesas cotidianas ou renegociar faturas para viabilizar e abrir espaço no orçamento para atingir a meta de ${goalName}.

### Como Aumentar a Renda
Sugira 2 alternativas criativas e de fácil aplicação de renda extra, consultoria, vendas, etc., ou evolução na carreira do usuário para acelerar a conquista de R$ ${goalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.

### Sugestões de Investimento
Explique de forma pedagógica, simples e amigável onde alocar o dinheiro poupado por mês (Ex: Tesouro Selic, CDB de liquidez diária rende 100% CDI) para render ao invés de ficar parado e ajudar a bater o objetivo mais rápido.

### Mensagem Final
Termine com uma frase muito calorosa, inspiradora e personalizada de incentivo focada especificamente no sonho: "${goalName}".
`;

  try {
    if (!activeAi) {
      throw new Error("GEMINI_API_KEY não está configurada no ambiente.");
    }

    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é o Planej.ai, o Educador Financeiro Inteligente mais atencioso, didático e motivador do Brasil. Sua missão é fornecer análises profundas, pragmáticas e muito bem estruturadas em português brasileiro para impulsionar a vida financeira dos usuários.",
        temperature: 0.7,
      }
    });

    const text = response.text || "Desculpe, não conseguimos gerar a simulação no momento.";
    res.json({ actionPlan: text });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    // Fallback estruturado com base nas regras de negócio financeiras em caso de indisponibilidade
    const defaultPlan = `
### Viabilidade da Meta
Análise automática: Para alcançar seu objetivo de **${goalName}** em **${goalTimeline} meses**, você precisa economizar **R$ ${suggestedMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** por mês. 
Dado o seu saldo líquido mensal estimado de **R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, guardá-lo integralmente pode ser desafiador. Se estender o prazo para **${Math.ceil(goalTimeline * 1.5)} meses**, a economia mensal cai para **R$ ${(goalValue / (goalTimeline * 1.5)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, o que trará muito mais oxigênio e segurança ao seu orçamento.

### Diagnóstico Financeiro
Sua renda líquida restante após despesas essenciais e parcelas de dívidas é de **R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. Seus custos fixos consomem aproximadamente **${((fixedCosts / income) * 105).toFixed(0)}%** do seu orçamento global (em relação ao ideal recomendado da relação 50-30-20).

### Sugestão Prática
1. **Audite assinaturas recorrentes**: Faça uma varredura nas suas faturas de cartões de crédito e cancele de imediato streamings e aplicativos de celular que você não utilizou no último mês.
2. **Negociação ativa**: Entre em contato com seus provedores de internet, telefonia e planos para renegociar descontos ou migrar para planos econômicos disponíveis.
3. **Limite de supérfluos**: Fixe um teto máximo semanal rígido para gastos discricionários como entregas e transporte individual.

### Como Aumentar a Renda
1. **Venda de Desapegos**: Realize um inventário de itens domésticos de alto valor, eletrônicos ou vestuário que não utiliza e anuncie-os em canais integrados como Enjoei ou Mercado Livre.
2. **Prestação de Serviços Remotos (Freelance)**: Monetize habilidades de escrita, design, formatação de textos ou suporte em plataformas como Workana e Fiverr.

### Sugestões de Investimento
Para objetivos de curto e médio prazo, o mais importante é conciliar **baixo risco** com **alta liquidez**. 
- **CDB de Liquidez Diária (100% do CDI)**: Uma opção excelente e protegida pelo Fundo Garantidor de Créditos (FGC), rendendo substancialmente mais do que a poupança tradicional.
- **Tesouro Selic**: Título público de máxima segurança nacional, ideal para aportar os recursos acumulados mensalmente até a realização do sonho.

### Mensagem Final
Não desista! O primeiro e mais importante passo para materializar a meta **${goalName}** você já deu hoje ao se planejar. Mantenha o foco absoluto e a determinação, pois grandes conquistas começam sempre com pequenas escolhas diárias de orçamento!
`;
    res.json({ actionPlan: defaultPlan, errorDetails: error.message });
  }
});

// Configuração do servidor estático e Vite para o frontend
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
