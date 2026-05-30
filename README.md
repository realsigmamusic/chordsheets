# ChordSheets

O **ChordSheets** é uma aplicação web (PWA) minimalista, de alta performance e direto ao ponto para gerenciamento, busca e visualização de cifras musicais no formato [**ChordPro**](https://github.com/ChordPro/chordpro). 

Projetado especificamente para músicos de palco e ministérios de louvor, o aplicativo elimina a necessidade de PDFs estáticos ou softwares pesados. Ele combina o poder do formato de colchetes com um ecossistema inteligente de armazenamento local, garantindo cifras dinâmicas, responsivas e que nunca deixam o músico na mão no meio do show.

**Acesse a aplicação rodando no GitHub Pages:** [realsigmamusic.github.io/chordsheets](https://realsigmamusic.github.io/chordsheets)

---

## Diferenciais

* **Alinhamento Perfeito de Fonte (Sem Quebras):** Ao contrário dos grandes portais de cifras que renderizam o texto de forma rígida em tags `<pre>`, o ChordSheets processa a cifra estruturalmente em blocos HTML fluidos (`.row`, `.chord`, `.lyrics`). Você pode aumentar ou diminuir a escala da fonte (`A+` / `A-`) e os acordes permanecem milimetricamente fixados sobre a sílaba correta.
* **Palco Blindado (Setlist Offline Real):** Políticas de cache de navegadores móveis costumam limpar dados repentinamente em inicializações frias (*Cold Starts*) para poupar bateria do celular. O ChordSheets blinda o repertório: ao adicionar músicas ao seu **Repertório (Setlist)**, o conteúdo textual bruto (`.cho`) é selado diretamente no `localStorage`. Se faltar internet no palco, o método `.catch()` da requisição assume e renderiza tudo instantaneamente da memória do dispositivo.
* **Transposer Resiliente com URL Viva:** Mude o tom da música instantaneamente através de um círculo de quintas em JavaScript. O tom selecionado é memorizado no dispositivo e anexado via parâmetros diretamente na URL (`?file=...&key=...`), facilitando o compartilhamento da cifra no tom exato com os outros integrantes da banda.
* **Navegação Contínua no Palco:** Ao abrir uma cifra a partir do seu Repertório, uma barra de navegação flutuante dedicada (`Anterior` / `Próxima`) surge no rodapé. Isso permite transicionar entre as músicas agendadas para aquela noite com um único toque, eliminando a necessidade de retornar à tela inicial.
* **Busca Avançada com Algoritmo Fuzzy:** Impulsionado pelo `Fuse.js`, a barra de pesquisa executa uma varredura instantânea e profunda cruzando dados de **Título**, **Artista** e trechos da **Letra da música** simultaneamente, ignorando acentos ou erros pequenos de digitação.
* **UI Dinâmica com DNA Bootstrap:** Interface limpa construída com variáveis CSS nativas (`:root`). Conta com suporte automático a **Modo Claro e Modo Escuro** via sistema (`prefers-color-scheme`), sincronizando inclusive a barra de status do sistema operacional do celular (`theme-color`).

---

## Tecnologias e Arquitetura

Focado em simplicidade de deploy, velocidade máxima de carregamento e zero dependência de servidores ativos (Serverless):

* **Vanilla JavaScript (ES6+)** - Sem frameworks complexos (React/Vue), garantindo que o app rode em celulares antigos sem travar.
* **HTML5 & CSS3 Custom Properties** - Layout responsivo, focado em legibilidade de alto contraste sob iluminação de palco.
* **ChordSheetJS** - Motor robusto encarregado de parsear e converter os arquivos `.cho` em HTML responsivo.
* **Fuse.js** - Mecanismo leve de busca fuzzy local.
* **Service Worker (Cache-First)** - Configurado para cachear instantaneamente a casca estrutural do app (HTML, CSS, JS e Vendors), permitindo inicialização offline imediata.

---

## Como o Catálogo é Alimentado

O acervo de músicas é armazenado em formato de texto puro `.cho` dentro da estrutura do projeto. Para manter a aplicação leve e estática, o índice de busca é centralizado em um arquivo único `songs.json` gerado via automação.

### O Fluxo de Trabalho:
**Build do Catálogo:** Execução do script gerador que varre a pasta de músicas, extrai as letras limpas para otimizar o tamanho do indexador do `Fuse.js`, carimba o timestamp de modificação (`mtime` para a seção de Recentes) e reconstrói o `songs.json`.

Sempre que o catálogo for atualizado, basta rodar o comando de compilação da sua esteira e realizar o `git push` para atualizar o GitHub Pages automaticamente.

---

## Organização do Projeto

* `index.html`: Ponto de entrada do aplicativo (SPA). Gerencia a Home, buscas, favoritos e listagem do Repertório.
* `song.html`: Tela de performance que carrega, transpõe e renderiza a cifra selecionada.
* `sw.js`: Service worker focado no isolamento e persistência dos assets da aplicação.
* `songs.json`: Índice estruturado de metadados de todo o acervo.
* `assets/js/app.js`: Inteligência da tela inicial, busca fuzzy e manipulação do armazenamento doméstico.
* `assets/js/song.js`: Motor de renderização da cifra, transposição, escala de fontes e navegação do repertório.
* `assets/css/`: Folhas de estilo divididas (`style.css` para a estrutura global e `song.css` para o comportamento e design visual dos acordes).

---

## Execução Local

Como o projeto faz requisições locais (`Fetch API`) para carregar o `songs.json` e os arquivos `.cho`, o navegador bloqueará o funcionamento se você abrir o `index.html` clicando duas vezes (Erro de CORS). É necessário rodar um servidor local simples:

### Usando Python
```bash
python -m http.server 8000

```

Acesse `http://localhost:8000`

### Usando o Node.js

```bash
npx http-server .

```

### Usando o VS Code / Code OSS

Instale a extensão **Live Server**, clique com o botão direito no `index.html` e selecione **"Open with Live Server"**.

---

## Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para usar, clonar e adaptar para a sua banda ou igreja.