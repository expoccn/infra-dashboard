export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Esta página não carregou</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      (function(){
        try {
          var saved = localStorage.getItem('claro-rjo-am-theme');
          var dark = saved ? saved === 'dark' : true;
          document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        } catch (e) {
          document.documentElement.dataset.theme = 'dark';
        }
      })();
    </script>
    <style>
      :root {
        --bg: #f7f9fc;
        --fg: #172033;
        --muted: #566174;
        --card: #ffffff;
        --border: #d7dde7;
        --primary: #176bc0;
        color-scheme: light;
      }
      :root[data-theme="dark"] {
        --bg: #151923;
        --fg: #f4f6fa;
        --muted: #a6afbf;
        --card: #1d2230;
        --border: #353d50;
        --primary: #5f9ee9;
        color-scheme: dark;
      }
      * { box-sizing: border-box; }
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--fg); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; padding: 2rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--card); }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: var(--muted); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.5rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: var(--primary); color: #fff; }
      .secondary { background: var(--card); color: var(--fg); border-color: var(--border); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Esta página não carregou</h1>
      <p>Ocorreu um erro inesperado. Você pode tentar novamente ou voltar para a página inicial.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
        <a class="secondary" href="/">Ir para o início</a>
      </div>
    </div>
  </body>
</html>`;
}
