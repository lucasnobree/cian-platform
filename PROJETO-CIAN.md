# CIAN — Plataforma de Gestao para Identidade Visual de Casamentos

## Visao Geral

Sistema completo para a agencia CIAN Art Studio gerenciar clientes, produzir e hospedar sites de casamentos com identidade visual propria, e processar pagamentos de lista de presentes com taxas reduzidas.

**Dominio:** (dominio existente da agencia)
**Marca:** CIAN — tematica oceanica, paleta ciano/teal
**Stack:** Next.js 14+ (App Router) · PostgreSQL · Prisma · NextAuth · Asaas + AbacatePay

---

## Identidade Visual do Sistema — CIAN Design System

### Referencia da Marca (Instagram @cian_artstudio)

**Logo:** "CIAN" em tipografia serif elegante (serifas finas, tracking largo) + "art studio" em
tamanho menor — aplicado dentro de circulo com fundo teal solido (#1A8C8C aprox.)
**Bio:** "mergulho no verde-agua, azul-piscina, natureza e arte · identidade visual & storymaker para casamentos"
**Estetica geral:** Organica, litoranea, sofisticada. Agua cristalina, areia, natureza tropical.
O feed alterna entre fotos de oceano/praia e artes de identidade visual de casamentos.
**Tom:** Natural, artesanal, premium mas acessivel. "Mergulho" como metafora central.

### Paleta de Cores (extraida da marca)

```
PRIMARIAS (Verde-agua / Teal Oceanico)
--cian-50:    #F0FDFD    (background sutil, quase branco azulado)
--cian-100:   #CCFBF1    (hover states, verde-agua clarissimo)
--cian-200:   #99F6E4    (borders leves)
--cian-300:   #5EEAD4    (acentos, agua transparente)
--cian-400:   #2DD4BF    (botoes secundarios, verde-agua vibrante)
--cian-500:   #14B8A6    (hover de primaria)
--cian-600:   #0D9488    (PRIMARIA PRINCIPAL — verde-agua do logo CIAN)
--cian-700:   #0F766E    (texto sobre fundo claro)
--cian-800:   #115E59    (headings escuros)
--cian-900:   #134E4A    (sidebar/nav)
--cian-950:   #042F2E    (backgrounds escuros profundos — oceano profundo)

AZUL-PISCINA (secundaria — tons mais azulados do feed)
--pool-400:   #22B8CF    (azul piscina claro)
--pool-500:   #0EA5C0    (azul piscina medio)
--pool-600:   #0891B2    (azul piscina profundo)

NEUTRAS (Areia / Coral / Natureza)
--sand-50:    #FEFDFB    (fundo principal — areia clara)
--sand-100:   #FAF8F5    (cards, superficies)
--sand-200:   #F0EBE3    (borders, divisores)
--sand-300:   #E0D6C8    (areia media)
--sand-400:   #C4B5A0    (texto desabilitado, areia escura)
--sand-500:   #8E7E6A    (texto secundario — madeira/tronco)
--sand-600:   #5C5040    (texto corpo)
--sand-700:   #3D3428    (texto forte)
--sand-800:   #262018    (headings escuros)
--sand-900:   #1A1610    (quase preto quente)

SEMANTICAS
--success:    #10B981    (verde esmeralda — vegetacao)
--warning:    #E8A838    (ambar dourado — por do sol)
--error:      #E5534B    (coral/vermelho — coral marinho)
--info:       #0D9488    (mesma primaria teal)

ACCENT (tons do feed da CIAN)
--coral:      #E07060    (coral natural — complemento do teal)
--gold:       #C8A855    (dourado — areia molhada ao sol)
--pearl:      #F5F0E8    (perola — espuma do mar)
--deep-ocean: #0C4A4E   (oceano profundo — contraste maximo)
```

### Tipografia

```
Logo/Brand:         Tipografia serif com serifas finas, tracking largo (similar ao logo CIAN)
                    → Sugestao: "Tenor Sans" ou "Cormorant Garamond" para elementos de marca
Display/Headings:   "Plus Jakarta Sans" (weight 600-700) — moderno e limpo
Body:               "Inter" (weight 400-500) — legibilidade no sistema
Monospace/Dados:    "JetBrains Mono" — tabelas, valores financeiros
Alternativa brand:  "Outfit" (weight 300-600) — se quiser algo mais suave e organico
```

### Principios Visuais

- **Sidebar escura** com gradiente oceano profundo (--cian-950 → --cian-900)
- **Fundo principal** claro e quente como areia (--sand-50 / --sand-100)
- **Cards** com fundo branco (--sand-100), borda sutil (--sand-200), radius: 12px, sombra difusa
- **Botoes primarios** em teal solido (--cian-600) com hover (--cian-700)
- **Acentos de destaque** usando o gradient teal (--cian-600 → --pool-500)
- **Glassmorphism** sutil em cards de estatisticas do dashboard
- **Icones:** Lucide React, outline, stroke-width 1.5, cor --cian-600 ou --sand-500
- **Espacamento generoso** — o design deve respirar como a brisa do mar
- **Micro-animacoes** com Framer Motion: transicoes de 200-300ms, easing ease-out
- **Graficos/Charts** usando a escala teal (--cian-300 a --cian-700) + coral como contraste
- **Elemento assinatura:** Ondas sutis como separadores ou backgrounds decorativos
  (SVG wave patterns nos headers de secao ou no footer)
- **Imagens placeholder:** Texturas de agua, areia, natureza — nunca cinza generico
- **Login page:** Fundo com foto de oceano (blur) + card glassmorphism centralizado com logo CIAN
- **Empty states:** Ilustracoes minimalistas com tematica maritima (ondas, conchas, horizonte)

---

# MAPEAMENTO DAS 3 FASES

---

## FASE 1 — MVP (Fundacao)
**Objetivo:** Sistema funcional com CRM basico, gerador de sites e lista de presentes com pagamento.
**Prazo estimado:** 6-8 semanas

### Modulos:
1. **Autenticacao e Seguranca**
2. **Dashboard Principal**
3. **CRM / Cadastro de Clientes**
4. **Integracao Trello**
5. **Gerador de Sites de Casamento (Template Dinamico)**
6. **Lista de Presentes + Pagamento PIX (AbacatePay)**
7. **Infraestrutura e Deploy**

---

## FASE 2 — Gestao Completa
**Objetivo:** Financeiro robusto, gestao de projetos com templates, fornecedores e calendario.
**Prazo estimado:** 6-8 semanas apos Fase 1

### Modulos:

### 2.1 Financeiro Completo (Integracao Asaas)
- Geracao de cobrancas (PIX, boleto, cartao)
- Parcelamento configuravel (3x, 6x, 12x)
- Planos de pagamento por cliente (entrada + parcelas)
- Envio automatico de link de pagamento (email/WhatsApp link)
- Status via webhook: Pendente → Pago → Vencido → Cancelado
- Lembretes automaticos de cobranca (D-7, D-3, D-1, vencido)
- Emissao de Nota Fiscal (NFS-e via Asaas)
- Split de pagamentos (taxa agencia + repasse noivos) na lista de presentes
- Dashboard financeiro: receita mensal, contas a receber, fluxo de caixa projetado

### 2.2 Orcamentos e Propostas
- Criar proposta com itens de linha (servico, qtd, valor unitario, subtotal)
- Pacotes base pre-configurados com add-ons opcionais
- Calculo automatico: custo real vs valor cobrado = margem por projeto
- Exportar proposta em PDF com identidade visual CIAN
- Controle de versoes da proposta (v1, v2, v3...)
- Status: Rascunho → Enviada → Aceita → Recusada

### 2.3 Gestao de Projetos / Producao
- Fases do projeto com template padrao (Briefing → Conceito → Producao → Aprovacao → Entrega)
- Templates reutilizaveis por tipo de pacote
- Tarefas com prazos relativos ao casamento (D-90, D-60, D-30, D-7)
- Status de tarefa: A Fazer → Em Andamento → Aguardando Aprovacao → Concluido
- Checklist dentro de cada tarefa
- Upload de arquivos por tarefa (arte, prova, arquivo final)
- Ciclos de aprovacao (1a prova → feedback → 2a prova → aprovado)
- Sync bidirecional com Trello (cards ↔ tarefas)

### 2.4 Cadastro de Fornecedores
- CRUD: nome, categoria, contato (WhatsApp, email, Instagram), regiao, faixa de preco
- Categorias: Grafica, Florista, Decoracao, Foto/Video, DJ, Buffet, Bolo, Local, Cerimonialista
- Avaliacao interna (1-5 estrelas + nota de texto)
- Vincular fornecedores a projetos especificos
- Rastrear entregas/pendencias por fornecedor
- Historico de casamentos em que participou
- Fornecedores preferidos (marcados como favoritos)

### 2.5 Calendario
- Vista mensal/semanal com datas de casamentos
- Deadlines de entregas e aprovacoes
- Reunioes agendadas com clientes
- Lembretes automaticos configuráveis (D-90, D-60, D-30, D-15, D-7, D-1)
- Cor por tipo de evento (casamento, deadline, reuniao, pagamento)
- Sync com Google Calendar (opcional)

---

## FASE 3 — Escala e Experiencia
**Objetivo:** Portal do cliente, comunicacao automatizada, relatorios avancados e inteligencia.
**Prazo estimado:** 4-6 semanas apos Fase 2

### Modulos:

### 3.1 Portal do Cliente (Area dos Noivos)
- Login proprio para o casal (email + senha ou magic link)
- Visualizar status do projeto e fase atual
- Aprovar artes diretamente (com comentarios de feedback)
- Visualizar e baixar arquivos finais
- Ver historico de pagamentos (parcelas pagas/pendentes)
- Acompanhar lista de presentes (quem presenteou, valor arrecadado)
- Gerenciar lista de convidados + RSVPs
- Visualizar site do casamento (preview antes de publicar)

### 3.2 Gestao de Convidados (dentro do portal)
- Importar lista de convidados (CSV/Excel)
- Status do convite: Enviado → Confirmado → Recusado → Sem Resposta
- Dados: nome, email, telefone, mesa, restricao alimentar, acompanhantes
- Envio de convite digital com link do site
- Contador de confirmados vs total

### 3.3 Templates de Comunicacao
- Email templates editaveis: boas-vindas, briefing, proposta, aprovacao, pagamento, agradecimento
- Variaveis dinamicas: {{nome_noiva}}, {{nome_noivo}}, {{data_casamento}}, {{link_site}}
- Envio automatizado por trigger (ex: contrato assinado → envia email de boas-vindas)
- Log de todos os envios por cliente

### 3.4 Relatorios e Analytics
- Receita mensal/trimestral/anual com grafico de evolucao
- Pipeline de vendas: leads por etapa, taxa de conversao
- Casamentos por status (ativo, concluido, cancelado)
- Tempo medio por fase do projeto (onde gasta mais tempo)
- Origem dos clientes (Instagram, indicacao, Google, feira) — grafico de pizza
- Top fornecedores (mais utilizados, melhor avaliados)
- Desempenho lista de presentes: valor total arrecadado, taxa gerada, media por casamento
- Projecao de receita (baseada em contratos assinados com parcelas futuras)

### 3.5 Integracao WhatsApp (Z-API ou WhatsApp Business API)
- Enviar mensagens template pelo sistema
- Log automatico de conversas
- Notificacoes de pagamento recebido
- Lembrete de reuniao
- Envio de link do site/lista de presentes

### 3.6 Upload de Site Custom (HTML)
- Para casamentos premium com design 100% personalizado
- Upload de pacote HTML/CSS/JS
- Sistema registra rota e serve os arquivos estaticos
- Preview no admin antes de publicar
- Coexiste com sites de template dinamico

---

# DETALHAMENTO COMPLETO — FASE 1

---

## 1.1 AUTENTICACAO E SEGURANCA

### Funcionalidades:
- Login com email + senha (NextAuth Credentials Provider)
- Sessao JWT com refresh token
- Protecao de rotas (middleware Next.js)
- Role unica: Admin (fase 1 e single-user, mas modelar com role para futuro)
- Pagina de login com identidade CIAN
- Logout com invalidacao de sessao
- Rate limiting em endpoints de auth (prevenir brute force)

### Seguranca (OWASP Top 10):
- **Senhas:** bcrypt com salt rounds >= 12
- **CSRF:** Token CSRF em todos os forms (NextAuth ja faz)
- **XSS:** Sanitizacao de inputs, CSP headers, escape de output
- **SQL Injection:** Prisma ORM (queries parametrizadas por padrao)
- **Rate Limiting:** next-rate-limit ou upstash/ratelimit no login e API
- **Headers:** Helmet.js ou next-secure-headers (X-Frame-Options, X-Content-Type, HSTS, etc)
- **CORS:** Configuracao restritiva (apenas dominio proprio)
- **Validacao:** Zod em todas as API routes (input validation server-side)
- **Secrets:** Variaveis de ambiente (.env.local), nunca no codigo
- **Audit Log:** Registrar acoes criticas (login, criacao de cliente, alteracao financeira)

### Tasks:

```
TASK-101: Setup projeto Next.js 14 App Router + TypeScript + Tailwind
TASK-102: Configurar Prisma + PostgreSQL (schema inicial: User, Session)
TASK-103: Implementar NextAuth com Credentials Provider + JWT
TASK-104: Criar pagina de login (UI CIAN design system)
TASK-105: Middleware de protecao de rotas (/admin/*)
TASK-106: Rate limiting no endpoint de login
TASK-107: Configurar security headers (CSP, HSTS, X-Frame, X-Content-Type)
TASK-108: Setup Zod para validacao de inputs em API routes
TASK-109: Criar modelo AuditLog e helper para registrar acoes
TASK-110: Seed do usuario admin inicial
```

---

## 1.2 DASHBOARD PRINCIPAL

### Funcionalidades:
- Card: Total de casamentos ativos
- Card: Proximo casamento (countdown "Faltam X dias — Noivos")
- Card: Pagamentos pendentes (quantidade + valor total)
- Card: Pagamentos recebidos no mes
- Lista: Proximos 5 prazos/entregas
- Lista: Ultimos 5 clientes cadastrados
- Mini pipeline visual (quantos leads em cada etapa)
- Acesso rapido: botao "Novo Cliente", "Novo Site"

### Visual:
- Layout com grid responsivo (2-4 colunas)
- Cards com icones Lucide, fundo branco, sombra sutil
- Cores semanticas nos cards (cian para info, verde para positivo, ambar para pendente)
- Sidebar fixa a esquerda (dark: --cian-950) com links de navegacao
- Topbar com nome do usuario, avatar, logout

### Tasks:

```
TASK-201: Criar layout base: Sidebar + Topbar + Content Area
TASK-202: Componente Sidebar com navegacao (Dashboard, Clientes, Sites, Presentes, Config)
TASK-203: Componente Topbar (usuario logado, logout)
TASK-204: Card componente reutilizavel (icon, titulo, valor, variacao)
TASK-205: Dashboard page com grid de cards estatisticos
TASK-206: API route: GET /api/dashboard/stats (queries agregadas)
TASK-207: Componente lista "Proximos Prazos"
TASK-208: Componente lista "Ultimos Clientes"
TASK-209: Mini pipeline visual (barras coloridas por etapa)
TASK-210: Responsividade mobile do dashboard
```

---

## 1.3 CRM / CADASTRO DE CLIENTES

### Schema do Banco:

```prisma
model Client {
  id              String    @id @default(cuid())
  // Dados do casal
  brideFullName   String
  groomFullName   String
  brideCpf        String?
  groomCpf        String?
  bridePhone      String    // WhatsApp principal
  groomPhone      String?
  brideEmail      String
  groomEmail      String?
  brideInstagram  String?
  groomInstagram  String?
  coupleHashtag   String?   // ex: #CarolEEder

  // Casamento
  weddingDate     DateTime
  ceremonyVenue   String?
  receptionVenue  String?
  city            String?
  state           String?
  estimatedGuests Int?
  ceremonyType    String?   // civil, religiosa, ambas

  // Comercial
  pipelineStage   String    @default("lead")
  // lead, contacted, proposal_sent, contract_signed, in_production, delivered, completed
  servicePackage  String?   // nome do pacote contratado
  leadSource      String?   // instagram, indicacao, google, feira, outro
  referredBy      String?   // quem indicou

  // Website
  websiteSlug     String?   @unique  // carol-e-eder
  websiteStatus   String?   @default("draft") // draft, published, archived

  // Trello
  trelloBoardId   String?
  trelloBoardUrl  String?

  // Sistema
  notes           String?   @db.Text
  tags            String[]  // ["destination", "luxo", "praia"]
  contractValue   Decimal?  @db.Decimal(10, 2)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relacoes
  documents       Document[]
  interactions    Interaction[]
  payments        Payment[]
  gifts           Gift[]
  websiteConfig   WebsiteConfig?
  auditLogs       AuditLog[]
}

model Document {
  id          String   @id @default(cuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  name        String
  type        String   // contrato, briefing, moodboard, arte, guia_marca
  url         String
  size        Int?
  createdAt   DateTime @default(now())
}

model Interaction {
  id          String   @id @default(cuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  type        String   // reuniao, call, whatsapp, email, nota
  title       String
  description String?  @db.Text
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
}
```

### Funcionalidades:
- Listar clientes com filtros (etapa pipeline, data casamento, tags, busca)
- Visualizacao Kanban do pipeline (drag & drop entre etapas)
- Visualizacao em tabela/lista
- Criar novo cliente (formulario completo)
- Editar cliente
- Detalhe do cliente: todas as infos + documentos + interacoes + pagamentos
- Upload de documentos (contrato PDF, briefing, moodboard)
- Adicionar interacao/nota
- Mover entre etapas do pipeline
- Busca global por nome, email, hashtag

### Seguranca:
- Validacao Zod no backend para todo input do formulario
- CPF validado (digito verificador)
- Sanitizacao de HTML em campos de texto livre
- Upload de documentos: validar tipo de arquivo (PDF, PNG, JPG, DOCX), limite de tamanho (10MB)
- Slug do website: validar caracteres permitidos (a-z, 0-9, hifen), checar unicidade

### Tasks:

```
TASK-301: Schema Prisma: Client, Document, Interaction + migration
TASK-302: API CRUD completo: POST/GET/PUT/DELETE /api/clients
TASK-303: Validacao Zod para Client (CPF validator, email, phone, slug)
TASK-304: Pagina de listagem de clientes (tabela com filtros e busca)
TASK-305: Pagina Kanban do pipeline (drag & drop com @dnd-kit)
TASK-306: Formulario de criacao de cliente (multi-step ou accordion)
TASK-307: Pagina de detalhe do cliente (tabs: Info, Documentos, Interacoes, Pagamentos, Site)
TASK-308: Componente upload de documentos (drag & drop, validacao tipo/tamanho)
TASK-309: Componente de interacoes/notas (timeline visual)
TASK-310: Acoes em lote: mover etapa, adicionar tag
TASK-311: Audit log em criacao, edicao e exclusao de clientes
```

---

## 1.4 INTEGRACAO TRELLO

### Funcionalidades:
- Configurar API Key + Token do Trello nas settings
- Ao assinar contrato (mover para "contract_signed"), criar board automaticamente
- Board criado com listas padrao: Briefing, Conceito, Producao, Aprovacao, Entrega, Concluido
- Cards iniciais criados a partir do template do pacote contratado
- Link do board salvo no registro do cliente
- Botao "Abrir no Trello" na pagina do cliente
- Webhook do Trello: quando card muda de lista, atualiza status no sistema (fase 2 aprofunda)

### Seguranca:
- API Key e Token armazenados encriptados no banco ou em env vars
- Webhook do Trello validado via assinatura
- Rate limiting respeitado (100 req/10s)

### Tasks:

```
TASK-401: Pagina de configuracao: input API Key + Token Trello
TASK-402: Service TrelloAPI: createBoard, createList, createCard, addWebhook
TASK-403: Template de board padrao (listas + cards iniciais por pacote)
TASK-404: Trigger automatico: ao mover cliente para "contract_signed", cria board
TASK-405: Salvar trelloBoardId e trelloBoardUrl no Client
TASK-406: Botao "Abrir no Trello" na pagina de detalhe do cliente
TASK-407: Endpoint webhook /api/webhooks/trello (receber eventos de mudanca)
TASK-408: Validacao de assinatura do webhook Trello
```

---

## 1.5 GERADOR DE SITES DE CASAMENTO

### Schema:

```prisma
model WebsiteConfig {
  id              String   @id @default(cuid())
  clientId        String   @unique
  client          Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

  // Identidade visual
  primaryColor    String   @default("#4A5D3A")   // ex: olive do template Carol&Eder
  secondaryColor  String   @default("#E8E0D0")
  accentColor     String   @default("#C4A265")
  backgroundColor String   @default("#EDE6DA")
  textColor       String   @default("#2E2E2A")
  fontHeading     String   @default("Pinyon Script")  // Google Font name
  fontBody        String   @default("Cormorant SC")
  monogram        String?  // ex: "C&E"

  // Conteudo
  heroTitle       String?  // "Carolina e Éder"
  heroDate        String?  // "15/08/2026"
  heroLocation    String?  // "Fernando de Noronha"
  welcomeTitle    String?  // "Bem vindos ao nosso site"
  welcomeText     String?  @db.Text
  eventTitle      String?
  eventText       String?  @db.Text
  eventVenue      String?
  eventTime       String?
  dressCodeWomen  String?  @db.Text
  dressCodeMen    String?  @db.Text

  // Secoes ativas
  showCountdown     Boolean @default(true)
  showWelcome       Boolean @default(true)
  showEvent         Boolean @default(true)
  showSchedule      Boolean @default(true)
  showLocation      Boolean @default(true)
  showDressCode     Boolean @default(true)
  showGifts         Boolean @default(true)
  showRsvp          Boolean @default(true)
  showTips          Boolean @default(false)
  showGallery       Boolean @default(false)

  // Programacao (JSON flexivel)
  schedule        Json?    // [{date, event, time, location}]
  tips            Json?    // {pousadas: [...], restaurantes: [...], ...}

  // Imagens
  heroImageUrl    String?
  couplePhotoUrl  String?
  galleryImages   String[] // array de URLs

  // SEO
  metaTitle       String?
  metaDescription String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Funcionalidades:
- Editor visual no admin: preview ao vivo enquanto edita cores, fontes, textos
- Seletor de cores com preview em tempo real
- Seletor de Google Fonts (lista curada de fontes elegantes)
- Editor de secoes: ativar/desativar, reordenar, editar conteudo
- Upload de imagens (hero, fotos do casal, galeria)
- Editor de programacao (adicionar/remover linhas da tabela)
- Editor de dicas (sub-paineis: pousadas, restaurantes, etc)
- Preview do site em iframe (mobile e desktop)
- Botoes: "Salvar Rascunho", "Publicar", "Despublicar"
- Rota publica: `dominio.com.br/[slug]` renderiza o site do casamento

### Pagina Publica (Template):
- Renderiza baseado no WebsiteConfig do banco
- SSR/ISR para performance
- SEO otimizado (meta tags, Open Graph)
- Responsivo (mobile-first)
- Design base: o HTML que ja criamos (Carol & Eder) como template de referencia
- Cores, fontes, textos, secoes — tudo dinamico vindo do banco
- Formulario RSVP salva no banco
- Lista de presentes integrada com pagamento

### Seguranca:
- Slug validado (a-z, 0-9, hifen, sem palavras reservadas como "admin", "api", "login")
- Textos sanitizados antes de renderizar (prevenir XSS)
- Imagens: validar tipo (JPG, PNG, WebP), comprimir antes de salvar, limite 5MB
- Rate limiting no RSVP form (prevenir spam)
- RSVP: honeypot field + rate limit por IP

### Tasks:

```
TASK-501: Schema Prisma: WebsiteConfig + migration
TASK-502: API CRUD: /api/websites/[clientId] (GET, PUT)
TASK-503: Pagina admin: Editor de site (layout split: config esquerda, preview direita)
TASK-504: Componente seletor de cores (color picker com preview)
TASK-505: Componente seletor de fontes (dropdown com preview ao vivo)
TASK-506: Componente editor de secoes (toggle on/off, reordenar)
TASK-507: Componente editor de conteudo por secao (rich text simples)
TASK-508: Componente editor de programacao (tabela editavel)
TASK-509: Upload de imagens com compress + preview
TASK-510: Pagina publica /[slug] — template SSR dinamico
TASK-511: Template engine: injetar cores/fontes/textos do banco no HTML
TASK-512: SEO: meta tags, Open Graph, favicon dinamico
TASK-513: Formulario RSVP publico + API + anti-spam (honeypot + rate limit)
TASK-514: Botao publicar/despublicar com confirmacao
TASK-515: Responsividade do template publico (testar mobile)
TASK-516: Pagina 404 customizada para slugs inexistentes
```

---

## 1.6 LISTA DE PRESENTES + PAGAMENTO PIX

### Schema:

```prisma
model GiftItem {
  id            String   @id @default(cuid())
  clientId      String
  client        Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  title         String
  description   String?
  targetAmount  Decimal  @db.Decimal(10, 2)   // valor sugerido
  imageUrl      String?
  category      String?  // "lua_de_mel", "casa", "experiencia"
  isActive      Boolean  @default(true)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  gifts         Gift[]
}

model Gift {
  id              String    @id @default(cuid())
  clientId        String
  client          Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  giftItemId      String?
  giftItem        GiftItem? @relation(fields: [giftItemId], references: [id])

  // Quem presenteou
  guestName       String
  guestEmail      String?
  guestPhone      String?
  guestMessage    String?   @db.Text

  // Pagamento
  amount          Decimal   @db.Decimal(10, 2)
  paymentMethod   String    @default("pix")
  paymentStatus   String    @default("pending")  // pending, paid, expired, refunded
  paymentId       String?   // ID externo (AbacatePay/Asaas)
  pixCode         String?   @db.Text // copia e cola
  pixQrCodeUrl    String?
  paidAt          DateTime?
  expiresAt       DateTime?

  // Taxa
  agencyFeePercent Decimal  @default(3.5) @db.Decimal(4, 2)
  agencyFeeAmount  Decimal? @db.Decimal(10, 2)
  netAmount        Decimal? @db.Decimal(10, 2) // valor liquido para os noivos

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Funcionalidades Admin:
- CRUD de itens da lista de presentes por casamento
- Categorias: Lua de Mel, Casa Nova, Experiencias, Valor Livre
- Definir valor sugerido por item (ou "valor livre")
- Ativar/desativar itens
- Ver todos os presentes recebidos com status de pagamento
- Filtrar: por casamento, status, data
- Dashboard: total arrecadado, taxa gerada, presentes pendentes
- Configurar % de taxa da agencia por casamento (padrao 3.5%)

### Pagina Publica (dentro do site do casamento):
- Lista de presentes com cards visuais
- Selecionar item → informar nome, email, mensagem → gerar PIX
- Tela de pagamento: QR Code + Codigo Copia e Cola + instrucoes
- Opcao "Valor Livre" (convidado define quanto quer dar)
- Apos pagamento confirmado: tela de agradecimento
- Convidado recebe confirmacao por email (opcional)

### Integracao AbacatePay:
- Criar cobranca PIX via API ao submeter presente
- Receber webhook de confirmacao de pagamento
- Atualizar status do Gift no banco
- Calcular taxa da agencia e valor liquido automaticamente

### Seguranca:
- Webhook AbacatePay: validar assinatura/IP de origem
- Rate limiting na criacao de cobrancas (prevenir abuso)
- Validacao de valor minimo (R$ 10,00) e maximo (R$ 50.000,00)
- Sanitizacao da mensagem do convidado
- Nao expor dados financeiros sensíveis na API publica
- PIX code expira em 30 minutos (configuravel)
- Endpoint publico de presentes: apenas GET lista + POST criar pagamento
- Dados do noivo (conta bancaria) nunca expostos no frontend

### Tasks:

```
TASK-601: Schema Prisma: GiftItem, Gift + migration
TASK-602: API admin: CRUD /api/admin/gifts/items (por cliente)
TASK-603: API admin: GET /api/admin/gifts (listagem com filtros)
TASK-604: Pagina admin: gerenciar lista de presentes por casamento
TASK-605: Pagina admin: dashboard de presentes (total arrecadado, taxa, pendentes)
TASK-606: Service AbacatePayAPI: createPixCharge, getChargeStatus
TASK-607: API publica: GET /api/public/[slug]/gifts (lista de itens ativos)
TASK-608: API publica: POST /api/public/[slug]/gifts/pay (criar cobranca PIX)
TASK-609: Webhook: POST /api/webhooks/abacatepay (confirmar pagamento)
TASK-610: Validacao de assinatura do webhook AbacatePay
TASK-611: Calculo automatico: taxa agencia + valor liquido ao confirmar
TASK-612: Pagina publica: lista de presentes (cards com imagem, titulo, valor)
TASK-613: Pagina publica: fluxo de pagamento (form → QR Code → aguardando → confirmado)
TASK-614: Componente QR Code PIX (com copia e cola e timer de expiracao)
TASK-615: Rate limiting nos endpoints publicos de pagamento
TASK-616: Email de confirmacao para convidado apos pagamento (opcional, Resend)
```

---

## 1.7 INFRAESTRUTURA E DEPLOY

### Stack de Deploy:
- **Hosting:** Vercel (Next.js nativo)
- **Banco:** Neon PostgreSQL (serverless, free tier generoso) ou Supabase
- **Storage de imagens:** Cloudflare R2 (S3-compatible, barato) ou Uploadthing
- **Email transacional:** Resend (free tier: 3k/mes)
- **Monitoramento:** Sentry (error tracking)
- **Analytics:** Vercel Analytics ou Plausible

### Seguranca de Infra:
- HTTPS obrigatorio (Vercel ja faz)
- Variaveis de ambiente no Vercel (nunca no codigo)
- Database connection via SSL
- Backups automaticos do banco (Neon faz)
- Dominio com DNSSEC se possivel
- Monitoramento de uptime

### Tasks:

```
TASK-701: Criar repositorio Git com .gitignore, .env.example
TASK-702: Setup Neon PostgreSQL (ou Supabase) + connection string
TASK-703: Setup Cloudflare R2 para storage de imagens
TASK-704: Setup Resend para emails transacionais
TASK-705: Deploy inicial na Vercel com env vars
TASK-706: Configurar dominio customizado na Vercel
TASK-707: Setup Sentry para error tracking
TASK-708: Testar fluxo completo em staging antes de producao
TASK-709: Documentar env vars necessarias no .env.example
```

---

## RESUMO DE TASKS — FASE 1

| Modulo | Tasks | Range |
|--------|-------|-------|
| Auth & Seguranca | 10 | TASK-101 a 110 |
| Dashboard | 10 | TASK-201 a 210 |
| CRM / Clientes | 11 | TASK-301 a 311 |
| Trello | 8 | TASK-401 a 408 |
| Sites de Casamento | 16 | TASK-501 a 516 |
| Lista de Presentes | 16 | TASK-601 a 616 |
| Infraestrutura | 9 | TASK-701 a 709 |
| **TOTAL** | **80 tasks** | |

### Ordem de Execucao Sugerida:

```
Semana 1-2: TASK-101→110 (Auth) + TASK-701→709 (Infra) + TASK-301→303 (Schema/API Clientes)
Semana 3:   TASK-201→210 (Dashboard) + TASK-304→311 (UI Clientes)
Semana 4:   TASK-401→408 (Trello) + TASK-501→503 (Schema/API Sites)
Semana 5:   TASK-504→516 (Editor + Template publico de sites)
Semana 6:   TASK-601→616 (Lista de Presentes + Pagamento)
Semana 7:   Testes integrados, ajustes, QA
Semana 8:   Deploy producao, configuracao dominio, go-live
```
