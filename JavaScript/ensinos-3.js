// ensinos-3.js - alternar entre 3 conjuntos com persistência (hash + localStorage)
(() => {
  const buttons = document.querySelectorAll('.teach-controls [data-tab]');
  const sections = {
    sociedade: document.getElementById('grid-sociedade'),
    tecnologia: document.getElementById('grid-tecnologia'),
    agricola: document.getElementById('grid-agricola'),
  };

function activate(tab){
  if(!sections[tab]) tab = 'sociedade';
  Object.entries(sections).forEach(([k, el]) => el.classList.toggle('hidden', k !== tab));
  buttons.forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('btn', on);
    btn.classList.toggle('btn-secondary', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
// persist
try{
  localStorage.setItem('ensinosTab', tab);
}catch(e){}
if(location.hash.replace('#','') !== tab){
  history.replaceState(null, '', '#' + tab);
}
}

function initialTab(){
  const hash = location.hash.replace('#','');
  if(sections[hash]) return hash;
  try{
    const saved = localStorage.getItem('ensinosTab');
    if(sections[saved]) return saved;
  }catch(e){}
return 'sociedade';
}

buttons.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tab)));
window.addEventListener('hashchange', () => {
  const h = location.hash.replace('#','');
  if(sections[h]) activate(h);
});

activate(initialTab());
})();
