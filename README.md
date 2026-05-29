# Planej.ai

Planej.ai é uma plataforma de planejamento financeiro pessoal inteligente projetada para guiar usuários na realização de seus objetivos de forma realista e sustentável. Através de uma interface intuitiva e fluida, o sistema coleta dados orçamentários essenciais, analisa a capacidade de poupar do usuário e constrói um diagnóstico detalhado fundamentado em premissas financeiras consagradas, como a regra orçamentária 50-30-20.

---

## Objetivos

O Planej.ai visa democratizar o acesso ao planejamento orçamentário qualificado. Seus principais objetivos são:

* **Sistematizar o Diagnóstico Financeiro**: Fornecer ao usuário uma visão macro instantânea de sua saúde financeira dividida em custos fixos, parcelas de dívidas e renda livre.
* **Viabilizar Sonhos**: Transformar objetivos de curto, médio e longo prazo em números tangíveis, calculando o esforço de poupança mensal exato necessário para cada planejamento.
* **Projetar Rotas Realistas**: Gerar planos de ação personalizados que apontam atitudes práticas baseadas nos parâmetros de consumo informados.

---

## Funcionalidades

* **Assistente de Coleta Estruturado**: Formulário passo a passo (stepper) interativo e acessível, com validações de inputs e máscaras de moeda de alta fidelidade para o padrão brasileiro (BRL).
* **Análise de Viabilidade em Tempo Real**: Cálculo automático que confronta a renda disponível com a parcela mensal necessária para atingir a meta no tempo estipulado.
* **Indicadores de Saúde Financeira**: Dashboard visual contendo a relação percentual de custos sob a receita total, saldo livre estimado e o custo-meta ajustado.
* **Geração de Planos de Ação Inteligentes**: Integração completa com grandes modelos de linguagem (LLM) que geram de forma instantânea diagnósticos direcionados aos dados fornecidos.
* **Histórico Local de Simulações**: Salvamento automático das simulações no navegador do usuário para fins de monitoramento contínuo, sem necessidade de logins externos complexos.
* **Resiliência e Funcionamento Offline**: Mecanismo matemático de contingência embarcado no cliente para o caso de ausência de chaves de serviço ou falhas na rede, garantindo que a aplicação nunca pare de funcionar.
* **Suporte a Temas Visuais**: Sistema elegante em modo escuro e modo claro adaptável baseado no conforto ocular do usuário.

---

## Tecnologias Utilizadas

* **React 19**: Biblioteca para construção de interfaces dinâmicas e baseadas em componentes funcionais modernos.
* **TypeScript**: Tipagem estática em toda a base de código garantindo estabilidade estrutural e eliminação de erros comuns em tempo de execução.
* **Express**: Servidor web em Node.js para gestão segura de requisições de backend e provisionamento de ativos estáticos.
* **@google/genai**: SDK oficial do ecossistema Google para integração segura e otimizada de modelos generativos artificiais.
* **Tailwind CSS**: Motor de folha de estilo baseado em classes utilitárias para modelagem de layouts responsivos e de alta performance de renderização.
* **Motion (anteriormente Framer Motion)**: Gerenciamento refinado de transições de telas e animações de micro-interações do usuário nos formulários interativos.
* **Vite & Esbuild**: Ferramenta de build de nova geração que gera empacotamento super veloz e compilação do backend para o formato CommonJS (.cjs) para máxima robustez em produção.
* **Lucide React**: Biblioteca unificada de ícones SVG com design minimalista.

---

## Arquitetura da Aplicação

Como premissa das diretrizes modernas de segurança corporativa, o Planej.ai adota uma arquitetura full-stack integrada. 

O cliente se comunica exclusivamente com um servidor proxy Node/Express estruturado no backend. Essa abordagem garante que operações críticas — como requisições de Inteligência Artificial e o gerenciamento de credenciais — ocorram sob ambiente controlado do lado do servidor (Server-Side), impossibilitando o vazamento de chaves secretas para as ferramentas de desenvolvimento do navegador do usuário final.

---

## Estrutura de Diretórios

O fluxo de diretórios do repositório está subdividido para manter a segregação de responsabilidades entre infraestrutura de compilação, backend de consumo e interface reactiva frontend.

| Diretório / Arquivo | Tipo | Descrição |
| :--- | :--- | :--- |
| [src/](./src) | Pasta | Diretório contendo todo o ecossistema frontend da aplicação em React e TypeScript. |
| [src/components/](./src/components) | Pasta | Contém componentes isolados e modulares da aplicação, como o [StepperForm.tsx](./src/components/StepperForm.tsx). |
| [src/App.tsx](./src/App.tsx) | Arquivo | Componente de entrada principal da visualização da aplicação. Reúne o fluxo orçamentário e exibe o painel de métricas. |
| [src/types.ts](./src/types.ts) | Arquivo | Contrato de interfaces e tipagens obrigatórias globais utilizadas no sistema. |
| [src/utils.ts](./src/utils.ts) | Arquivo | Funções matemáticas utilitárias, máscaras de valores em BRL e geradores de hashes identificadores. |
| [src/index.css](./src/index.css) | Arquivo | Ponto central de estilo css e ancoragem de variáveis globais do Tailwind CSS. |
| [src/main.tsx](./src/main.tsx) | Arquivo | Ancorador da biblioteca React na árvore DOM principal do navegador indexado. |
| [server.ts](./server.ts) | Arquivo | Script do backend em ambiente Node/Express. Responsável pelas requisições Gemini e governança de arquivos estáticos. |
| [.env.example](./.env.example) | Arquivo | Modelo de variáveis de ambiente do sistema, contendo as instruções necessárias para inicialização de variáveis do sistema. |
| [tsconfig.json](./tsconfig.json) | Arquivo | Parâmetros e regras de compilação do ecossistema TypeScript. |
| [vite.config.ts](./vite.config.ts) | Arquivo | Arquivo de parametrização e Plugins de desenvolvimento e compilação do Vite. |
| [package.json](./package.json) | Arquivo | Gerenciador de dependências, manifesto do projeto e caminhos de scripts operacionais de build e execução. |

---

## Configuração da API

O Planej.ai conta com um módulo inteligente que gera relatórios direcionados a partir dos dados do usuário. O modelo parametrizado por padrão no backend do servidor é o **gemini-3.5-flash**, selecionado devido à sua extrema velocidade de análise e alta capacidade contextual.

### Para que serve a API?
Ao enviar os dados de entrada (Receitas, Custos, Dívidas e Informações do Sonho), o backend processa essas regras e aciona a Inteligência Artificial da Google para:
1. Validar a veracidade e sustentabilidade financeira do sonho face à saúde orçamentária do usuário.
2. Formular táticas específicas e operacionais (ex: auditar parcelas recorrentes, métodos de renegociação, estratégias de aporte) parametrizadas unicamente para a realidade econômica daquela pessoa.
3. Sugerir realocações saudáveis baseadas em referências nacionais de estabilidade (como limites percentuais ótimos).

### Alternância Inteligente de Chaves
Com o intuito de viabilizar a flexibilidade em ambientes sem variáveis globais configuradas, a interface gráfica do Planej.ai desenvolveu um recurso de **Configuração IA**.
Ao acessá-lo na lateral do cabeçalho da página, o usuário pode preencher uma chave primária própria e individual. Se presente, a requisição utilizará essa credencial local diretamente sob o SDK com total proteção, revertendo para a chave padrão do servidor caso o campo seja limpo.

---

## Configuração das Variáveis de Ambiente (.env)

No ambiente de produção ou antes de inicializar o servidor de desenvolvimento em sua máquina local, certifique-se de configurar suas chaves de acesso.

1. Na raiz do projeto, crie um arquivo com a nomenclatura `.env` baseando-se no exemplo abaixo:
```env
GEMINI_API_KEY=sua_chave_secreta_aqui_da_google_ai_studio
```

---

## Guia de Instalação e Execução

### Pré-requisitos
Para executar o Planej.ai localmente você precisará de:
* Node.js (versão 18.0.0 ou superior recomendada)
* Gerenciador de pacotes npm (pré-instalado nativamente no Node.js)

### Guia de Instalação
1. Clone este repositório para o seu ambiente local ou extraia o arquivo compactado:
```bash
git clone https://github.com/usuario/planej.ai.git
cd planej.ai
```

2. Instale todas as dependências requeridas utilizando as ferramentas do npm:
```bash
npm install
```

### Guia de Execução Local
Para iniciar o ecossistema de desenvolvimento integrado (Executando o servidor TSX e o cliente Vite simultaneamente sob a porta de rede local), utilize:
```bash
npm run dev
```
Após o carregamento bem-sucedido na tela do terminal, o servidor estará ativo para navegação no endereço:
👉 [http://localhost:3000](http://localhost:3000)

---

## Scripts Disponíveis

Dentro do arquivo [package.json](./package.json) estão mapeados comandos destinados a simplificar a manutenção do sistema:

* `npm run dev`: Inicializa o servidor Express sob suporte transparente TypeScript por meio da ferramenta `tsx` em tempo real.
* `npm run build`: Prepara a aplicação para implantação final. Esse script compila as páginas dinâmicas do frontend no diretório `/dist` corporativo e, logo na sequência, empacota o backend de forma unificada para CommonJS em `dist/server.cjs` por intermédio das diretivas de build rápido do Esbuild.
* `npm run start`: Ativa o modo de produção, executando o arquivo consolidado de alta velocidade direto do nó Node (`node dist/server.cjs`).
* `npm run lint`: Realiza varreduras estáticas de código para validar compatibilidade sintática e tipagem TypeScript.
* `npm run clean`: Remove históricos temporários e pastas de build prévias do projeto.

---

## Boas Práticas Adotadas

* **Segregação Arquitetural**: Lógica complexa de interface React e componentes visuais desacoplada de utilitários isolados reutilizáveis.
* **Componentização Semântica**: Componentes focados em tarefas únicas, auxiliando o entendimento e a facilidade de expansão do ecossistema.
* **Proteção de Segredos**: Ausência completa de armazenamento persistente ou em disco de dados bancários do usuário. Toda a informação trafega sem rastros permanentes ou vazamentos por canais não seguros de rede.
* **Interface Fluid Design**: Redução do desgaste cognitivo na preenchimento por meio de inputs amplos, tipografia sofisticada e feedback visual imediato de erros.

---

## Possíveis Melhorias Futuras

* **Persistência de dados descentralizada**: Implementação opcional de sincronização em nuvem segura através de serviços como Cloud Firestore da Google.
* **Mapeamento Gráfico de Evolução**: Exibição visual de barras e curvas de patrimônio projetados ao longo dos meses por meio de bibliotecas dedicadas como Recharts.
* **Exportação de Planejamentos**: Geração e download imediato de relatórios financeiros personalizados em formato PDF estruturado.
* **Interação por Voz**: Adição de entrada de dados e navegação acessível por comandos de voz suportados pela Speech Recognition API nativa de navegadores compatíveis.

---

## Considerações Finais

O Planej.ai é um ambiente completo para a reflexão orçamentária consciente de pessoas físicas. Ele une design de UI sofisticado com análise automatizada ágil para capacitar escolhas diárias e apoiar a concretização de grandes objetivos de vida.

---

## Informações Profissionais

Elaborado e assinado por **Patrícia Oliveira**

* **LinkedIn**: [https://www.linkedin.com/in/savarezi/](https://www.linkedin.com/in/savarezi/)
* **Portfólio**: [https://patricia-oliveira-portfolio.vercel.app/](https://patricia-oliveira-portfolio.vercel.app/)
