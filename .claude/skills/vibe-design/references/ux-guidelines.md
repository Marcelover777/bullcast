# UX Guidelines — 99 Regras por Nivel de Prioridade

## Sistema de Prioridade (10 niveis)
- **P1 CRITICO**: Viola se a experiencia quebra ou e inacessivel
- **P2 ESSENCIAL**: Core usability — usuarios nao conseguem completar tarefas
- **P3 IMPORTANTE**: Impacta significativamente satisfacao e conversao
- **P4 RECOMENDADO**: Melhora qualidade percebida e polimento
- **P5 DESEJAVEL**: Detalhe de craft que separa bom de excelente

---

## P1 — CRITICO (10 regras)
*Violar = produto quebrado. Sem excecoes.*

**P1-01** Toda acao destrutiva (deletar, cancelar, sair sem salvar) exige confirmacao explicita com descricao das consequencias.

**P1-02** Erros de formulario devem identificar QUAL campo falhou, PORQUE falhou, e COMO corrigir — nunca apenas "Erro".

**P1-03** Estados de loading devem ser visiveis dentro de 200ms para qualquer acao que demora mais de 1 segundo.

**P1-04** Contraste minimo de texto: 4.5:1 para texto normal, 3:1 para texto grande (WCAG AA). Nunca flexibilize.

**P1-05** Toda funcao acessivel por mouse deve ser acessivel por teclado (Tab, Enter, Space, Esc, setas).

**P1-06** Links e botoes devem ter area de toque minima de 44x44px em mobile (recomendado: 48x48px).

**P1-07** Formularios nao podem perder dados do usuario em caso de erro de validacao — preserve os campos preenchidos.

**P1-08** Acoes irreversiveis (delete permanente, logout com dados) nao podem ser ativadas por gestos acidentais (swipe, double-tap sem confirmacao).

**P1-09** Toda imagem informativa deve ter alt text descritivo. Imagens decorativas: alt="".

**P1-10** Animacoes que piscam mais de 3x/segundo violam WCAG 2.3.1. Jamais use isso.

---

## P2 — ESSENCIAL (15 regras)
*Violar = usuarios frustrados nao completam tarefas.*

**P2-01** O elemento mais importante da pagina deve ser visivel sem scroll em 90% dos viewports comuns (360px a 1920px wide).

**P2-02** Campos de formulario devem ter labels visiveis SEMPRE — nunca use apenas placeholder como label (desaparece no foco).

**P2-03** Focus states devem ser visiveis e com outline de pelo menos 2px. Nunca use `outline: none` sem substituir por alternativa.

**P2-04** Mensagens de sucesso/confirmacao devem aparecer em contexto (proximo ao elemento alterado), nao apenas no topo da pagina.

**P2-05** Paginas com mais de 3 secoes precisam de navegacao interna (anchor links, sticky nav, ou progress indicator).

**P2-06** Times de resposta: < 100ms = instantaneo, < 1s = fluido, < 10s = com feedback, > 10s = precisa de progresso detalhado.

**P2-07** Campos de senha: sempre oferecer toggle para mostrar/ocultar. Nunca pedir confirmacao em login — apenas em cadastro.

**P2-08** Botao de submit principal deve ter estado disabled+loading enquanto processa — previne double-submit.

**P2-09** Em mobile, campos numericos devem abrir teclado numerico (`inputmode="numeric"`), emails devem abrir teclado de email.

**P2-10** Scrollable containers devem ter indicador visual de que sao scrollaveis (shadow, fade, ou indicador explicito).

**P2-11** Modais devem fechar com Esc, click no backdrop, e botao explicito de fechar (X). Nunca apenas um desses.

**P2-12** Tabelas com mais de 5 colunas em mobile precisam de estrategia: scroll horizontal, cards colapsados, ou colunas prioritizadas.

**P2-13** Busca: resultados devem aparecer em < 300ms para queries locais; exibir estado vazio com sugestoes, nunca tela em branco.

**P2-14** CTAs principais devem ser reconheciveis como clicaveis — nao use apenas cor ou underline como unica diferenciacao.

**P2-15** Skip link ("Pular para conteudo principal") deve ser o primeiro elemento focavel em qualquer pagina.

---

## P3 — IMPORTANTE (20 regras)
*Violar = experiencia abaixo do padrao de mercado.*

**P3-01** Hierarquia visual deve seguir ordem de importancia — olho percorre de maior para menor, mais bold para mais suave.

**P3-02** Espaco negativo (whitespace) e design. Paginas densas sem respiro causam fadiga cognitiva. Min 32px entre secoes distintas.

**P3-03** Tipografia: nunca mais de 2 familias de fonte. Heading + Body. Mono e opcional para codigo.

**P3-04** Animacoes de transicao de pagina devem durar 200-400ms. Mais lento = lerdo. Mais rapido = nao percepcao.

**P3-05** Tooltips: aparecer apos 200-500ms de hover (nao imediatamente, nao apos 1s). Desaparecer imediatamente ao mover.

**P3-06** Campos de busca em mobile: focar automaticamente ao abrir overlay de busca, com teclado visivel.

**P3-07** Listas longas (>7 itens): usar paginacao, infinite scroll, ou "ver mais" — nunca dump de 100+ itens sem contexto.

**P3-08** Cores semanticas consistentes: vermelho = erro/perigo, verde = sucesso, amarelo = aviso, azul = informacao. Nunca inverta.

**P3-09** Estados vazios (empty states) devem ter: icone/ilustracao, titulo explicativo, descricao, e CTA de proxima acao.

**P3-10** Formularios longos: agrupar campos relacionados, mostrar progresso (step 1 de 3), salvar progresso quando possivel.

**P3-11** Cards clicaveis: a area clicavel deve ser o card inteiro, nao apenas o link dentro. Use `<a>` wrapping ou JS de propagacao.

**P3-12** Datas e numeros: use formato local do usuario. No Brasil: DD/MM/AAAA, R$ com virgula decimal.

**P3-13** Breadcrumbs sao obrigatorios para hierarquias com 3+ niveis. Devem ser clicaveis exceto o nivel atual.

**P3-14** Notificacoes/toasts: max 4 segundos para sucesso/info, persistente para erros. Posicao: bottom-right desktop, top-center mobile.

**P3-15** Sidebars em mobile devem ser overlay (nao push content), abrir por gesture ou botao hamburguer, fechar por swipe ou X.

**P3-16** Imagens: sempre definir width e height no HTML para prevenir layout shift (CLS). Usar aspect-ratio quando necessario.

**P3-17** Links externos devem ter indicacao visual (icone de external link) e abrir em nova aba com `rel="noopener noreferrer"`.

**P3-18** Campos com restricoes de formato devem informar o formato ANTES de o usuario errar (ex: "Formato: 000.000.000-00").

**P3-19** Dropdown com mais de 8 opcoes precisa de busca/filtro interno. Nunca force scroll em select nativo com 20+ opcoes.

**P3-20** Skeleton loaders devem mimetizar o layout real do conteudo — nao use spinners genericos para conteudo estruturado.

---

## P4 — RECOMENDADO (30 regras)
*Adotar = produto polido e profissional.*

**P4-01** Hover states devem ter transicao de 150-200ms. Nenhuma transicao = abrupto. Mais de 300ms = pesado.

**P4-02** Scroll suave (`scroll-behavior: smooth`) para anchor links internos. Desabilitar se `prefers-reduced-motion`.

**P4-03** Inputs de senha: mostrar criterios de forca em tempo real (comprimento, especiais, maiusculas) durante digitacao.

**P4-04** Autocompletar inputs de endereco usando API de CEP ou Google Places — nunca force usuario a preencher 5 campos.

**P4-05** Botoes de voltar: manter estado anterior (scroll position, filtros aplicados, campos preenchidos).

**P4-06** Tabelas ordenadas: indicar coluna ativa e direcao com icone claro (seta up/down, nao cor).

**P4-07** Campos de CPF/CNPJ, telefone, CEP: aplicar mascara automatica enquanto usuario digita.

**P4-08** Upload de arquivo: mostrar preview (imagens), nome do arquivo, tamanho, e progresso de upload.

**P4-09** Formulario de cadastro: validar email em tempo real (formato) mas so mostrar erro de "email ja cadastrado" apos submit.

**P4-10** Avatares: mostrar iniciais do nome como fallback quando imagem falha ou nao existe.

**P4-11** Modo escuro: sincronizar com `prefers-color-scheme` do sistema. Oferecer toggle manual. Persistir preferencia.

**P4-12** Cursor: `cursor: pointer` para elementos clicaveis, `cursor: not-allowed` para elementos desabilitados.

**P4-13** Texto truncado com reticencias deve mostrar tooltip com texto completo ao hover.

**P4-14** Barra de progresso: mostrar porcentagem numerica alem da barra visual (acessibilidade + clareza).

**P4-15** CTAs em formularios: usar verbo especifico ("Criar conta", "Fazer pedido") nao generico ("Enviar", "OK").

**P4-16** Datas relativas: "ha 2 horas" e mais amigavel que "11:32". Mas oferecer data absoluta no tooltip.

**P4-17** Infinite scroll: mostrar contador "X de Y itens carregados" e botao "Voltar ao topo" visivel apos scroll.

**P4-18** Modais: nao abrir modal dentro de modal. Maximo 1 nivel de profundidade.

**P4-19** Animacoes de entrada: fade-in + slide-up (8-16px). Nunca scale de 0 (causa layout shift percebido).

**P4-20** Notificacoes push: pedir permissao APENAS apos o usuario ter experienciado valor — nao no primeiro acesso.

**P4-21** Campos de busca: limpar campo com X visivel quando tem conteudo. X some quando campo esta vazio.

**P4-22** Cores de status em tabelas: usar badge/chip com cor + icone + texto — nunca apenas cor como unico indicador.

**P4-23** Confirmar email: oferecer reenviar apos 60 segundos, nao imediatamente.

**P4-24** Paginas de erro (404, 500): incluir busca, link para home, e sugestoes de paginas relacionadas.

**P4-25** Filtros aplicados: mostrar tags/chips dos filtros ativos com botao X individual + "Limpar tudo".

**P4-26** Formularios multi-step: permitir voltar e editar steps anteriores sem perder progresso dos steps seguintes.

**P4-27** Primeiro foco da pagina: mover foco para o primeiro elemento interativo relevante, especialmente em SPAs com navegacao.

**P4-28** Nomes de arquivos para download devem ser descritivos: "relatorio-vendas-marco-2026.pdf", nao "export.pdf".

**P4-29** Carroseis/sliders: mostrar indicadores de posicao (dots), controles de navegacao sempre visiveis (nao apenas no hover).

**P4-30** Confirmar logout apenas se usuario tiver dados nao salvos. Logout sem dados nao precisa de confirmacao.

---

## P5 — DESEJAVEL (24 regras)
*Detalhes de craft que elevam o produto ao nivel Awwwards.*

**P5-01** Micro-animacoes de sucesso: checkmark que desenha, numero que conta, confetti sutil — celebre conquistas do usuario.

**P5-02** Drag and drop: ghost element segue o cursor com opacity reduzida. Drop zones com highlight visual claro.

**P5-03** Selecao de cor: usar color picker nativo + input hex/rgb. Mostrar preview em tempo real.

**P5-04** Comandos de teclado (Cmd+K, shortcuts): documentar e promover uso progressivo para usuarios avancados.

**P5-05** Ondas de foco (focus ring): animar suavemente com scale(1.05) alem do outline, para feedback sutil premium.

**P5-06** Numeros grandes: animar contagem de 0 ate o valor ao entrar no viewport (IntersectionObserver).

**P5-07** Cursor customizado: pode reforcar a identidade da marca em portfolios criativos, com animacao de estado.

**P5-08** Parallax sutil (5-15px max): adiciona profundidade sem causar enjoo. Desabilitar em `prefers-reduced-motion`.

**P5-09** Mensagens de erro com personalidade: "Hmm, esse email ja ta aqui. Esqueceu a senha?" e melhor que "Email ja cadastrado".

**P5-10** Loading com propósito: use skeleton que mimetiza o conteudo final — prepara o usuario para o que vira.

**P5-11** Reveal on scroll: elementos entram com fade + translate(0, 20px) → translate(0, 0). Stagger de 50-100ms entre filhos.

**P5-12** Hover em cards: elevacao suave (translateY(-4px) + shadow maior) ou scale(1.02) — escolha apenas um.

**P5-13** Transicoes entre paginas: fade out do conteudo, fade in do novo. Nunca blink abrupto.

**P5-14** Glassmorphism premium: blur(20px) + saturate(180%) + brightness(110%). Teste em multiplos backgrounds.

**P5-15** Gradientes de texto: `background-clip: text; -webkit-background-clip: text; color: transparent`. Use com moderacao.

**P5-16** Bordas animadas: gradient border com animation de posicao para efeito de luz rodando (shimmer border).

**P5-17** Sound design opcional (off por padrao): clique suave em botoes principais, swoosh em transicoes — identidade sonora.

**P5-18** Dark mode com transicao suave: `transition: background-color 300ms, color 300ms` no root ao alternar tema.

**P5-19** Magnetic buttons: elementos que "atraem" o cursor quando proximo (15-20px range). Efeito sofisticado sutil.

**P5-20** Cursor spotlight: circulo de luz que segue o cursor em dark mode (background radial gradient). Ver Linear.app.

**P5-21** Typing animation para headlines: efeito typewriter com cursor piscante. Usar APENAS para 1 elemento por pagina.

**P5-22** Stagger animation em listas: cada item entra com delay de 50-100ms apos o anterior. Max 5 items com stagger.

**P5-23** Scroll progress bar: linha fina no topo da pagina que mostra progresso de leitura. Opcional mas elegante.

**P5-24** Easter eggs sutis: interacao surpresa ao clicar no logo, konami code, ou combinacao de teclas. Humaniza o produto.

---

## Checklist Rapido por Entregavel

### Landing Page
- [ ] P1-04 Contraste AA
- [ ] P2-01 Hero visivel sem scroll
- [ ] P3-01 Hierarquia visual clara
- [ ] P4-19 Animacoes de entrada
- [ ] P5-11 Reveal on scroll

### Dashboard / App
- [ ] P1-03 Loading < 200ms
- [ ] P2-08 Submit com loading state
- [ ] P3-09 Empty states
- [ ] P4-22 Status com cor + texto
- [ ] P4-11 Dark mode

### Formulario
- [ ] P1-02 Erros descritivos
- [ ] P1-07 Preservar dados em erro
- [ ] P2-02 Labels sempre visiveis
- [ ] P3-18 Restricoes antes do erro
- [ ] P4-07 Mascaras automaticas
