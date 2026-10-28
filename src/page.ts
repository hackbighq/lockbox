export const page = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lockbox</title>
<style>
  body { font: 16px system-ui, sans-serif; background: #0d1117; color: #e6edf3; margin: 0; }
  main { max-width: 640px; margin: 0 auto; padding: 24px; }
  h1 { color: #ffb000; margin: 0 0 4px; } .sub { color: #8b949e; margin: 0 0 20px; }
  section { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .08em; color: #8b949e; margin: 0 0 12px; }
  input, button { font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3; }
  button { background: #ffb000; color: #111; border: 0; font-weight: 700; cursor: pointer; }
  form { display: flex; gap: 8px; flex-wrap: wrap; } li { margin: 6px 0; }
  .err { color: #f85149; min-height: 20px; } .who { color: #3fb950; }
  #app { display: none; }
</style></head>
<body><main>
<h1>Lockbox</h1><p class="sub">Your notes, locked to you.</p>
<section id="gate">
  <h2>Sign up or log in</h2>
  <form id="af"><input name="email" placeholder="email" required><input name="password" type="password" placeholder="password" required>
  <button id="signup">Sign up</button><button id="login">Log in</button></form>
  <p class="err" id="err"></p>
</section>
<section id="app">
  <h2>Your notes <span class="who" id="who"></span> <button id="out">Log out</button></h2>
  <form id="nf"><input name="body" placeholder="a private note" required><button>Add</button></form>
  <ul id="notes"></ul>
</section>
</main>
<script>
const $ = id => document.getElementById(id);
const post = (url, body) => fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
async function refresh() {
  const me = await fetch("/api/me");
  if (!me.ok) { $("gate").style.display = "block"; $("app").style.display = "none"; return; }
  $("who").textContent = (await me.json()).user.email;
  $("gate").style.display = "none"; $("app").style.display = "block";
  const { notes } = await (await fetch("/api/notes")).json();
  $("notes").innerHTML = notes.map(n => "<li>" + n.body + "</li>").join("");
}
$("af").onsubmit = async e => {
  e.preventDefault();
  const url = e.submitter.id === "signup" ? "/api/signup" : "/api/login";
  const r = await post(url, Object.fromEntries(new FormData(e.target)));
  $("err").textContent = r.ok ? "" : (await r.json()).error;
  if (r.ok) { e.target.reset(); refresh(); }
};
$("nf").onsubmit = async e => { e.preventDefault(); await post("/api/notes", Object.fromEntries(new FormData(e.target))); e.target.reset(); refresh(); };
$("out").onclick = async () => { await post("/api/logout", {}); refresh(); };
refresh();
</script></body></html>`;
