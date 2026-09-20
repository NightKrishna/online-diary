const prompts = [
  "What made you smile today?",
  "What tiny win are you proud of today?",
  "Who or what brought you calm today?",
  "What is one kind thing someone did for you?",
  "What moment would you relive from today?",
  "What are you grateful for right now?",
  "What made you laugh today?",
  "What beautiful thing did you notice today?"
];

const todayKey = () => new Date().toISOString().slice(0,10);
const storageKey = "positivityPocketEntries";

const els = {
  date: document.getElementById('todayDate'),
  streak: document.getElementById('streak'),
  prompt: document.getElementById('prompt'),
  input: document.getElementById('entryInput'),
  char: document.getElementById('charCount'),
  save: document.getElementById('saveBtn'),
  already: document.getElementById('alreadyLogged'),
  list: document.getElementById('entriesList'),
  empty: document.getElementById('emptyState'),
  clear: document.getElementById('clearBtn'),
  theme: document.getElementById('themeToggle')
};

function loadEntries(){
  try{ return JSON.parse(localStorage.getItem(storageKey)) || []; }
  catch{ return []; }
}
function saveEntries(entries){
  localStorage.setItem(storageKey, JSON.stringify(entries));
}
function getDailyPrompt(){
  const day = new Date().getDate();
  return prompts[day % prompts.length];
}
function render(){
  const entries = loadEntries().sort((a,b)=> new Date(b.date) - new Date(a.date));
  const hasToday = entries.some(e => e.date === todayKey());
  
  els.prompt.textContent = getDailyPrompt();
  els.date.textContent = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
  els.input.disabled = hasToday;
  els.save.disabled = hasToday || !els.input.value.trim();
  els.already.classList.toggle('hidden', !hasToday);
  if(hasToday) els.input.placeholder = "See you tomorrow";

  els.streak.textContent = entries.length ? `• ${entries.length} moments saved` : '';

  els.list.innerHTML = '';
  if(!entries.length){
    els.empty.style.display = 'block';
    return;
  }
  els.empty.style.display = 'none';
  entries.forEach(e=>{
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <div class="entry-top"><span>${formatDate(e.date)}</span><span>${e.time}</span></div>
      <div class="entry-prompt">${e.prompt}</div>
      <div class="entry-text">${escapeHtml(e.text)}</div>
      <div class="entry-actions"><button class="delete-btn" data-id="${e.id}">delete</button></div>
    `;
    els.list.appendChild(div);
  });
}
function formatDate(iso){
  const d = new Date(iso+'T00:00:00');
  return d.toLocaleDateString('en-US',{month:'short', day:'numeric', year:'numeric'});
}
function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
els.input.addEventListener('input', ()=>{
  els.char.textContent = els.input.value.length;
  const hasToday = loadEntries().some(e=> e.date===todayKey());
  els.save.disabled = hasToday || !els.input.value.trim();
});
els.save.addEventListener('click', ()=>{
  const text = els.input.value.trim();
  if(!text) return;
  if(loadEntries().some(e=> e.date===todayKey())) return;
  const entry = {
    id: Date.now(),
    date: todayKey(),
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    prompt: els.prompt.textContent,
    text
  };
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  els.input.value = '';
  els.char.textContent = '0';
  render();
});
els.list.addEventListener('click', (e)=>{
  if(!e.target.classList.contains('delete-btn')) return;
  const id = Number(e.target.dataset.id);
  const filtered = loadEntries().filter(en=> en.id!==id);
  saveEntries(filtered);
  render();
});
els.clear.addEventListener('click', ()=>{
  if(confirm('Clear all moments? This cannot be undone.')){
    localStorage.removeItem(storageKey);
    render();
  }
});
const themeKey = "positivityTheme";
function applyTheme(t){
  document.body.classList.toggle('dark', t==='dark');
  els.theme.textContent = t==='dark' ? '☀️' : '🌙';
}
applyTheme(localStorage.getItem(themeKey) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
els.theme.addEventListener('click', ()=>{
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem(themeKey, next);
  applyTheme(next);
});
render();