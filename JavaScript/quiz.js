
// quiz.js - feedback por questão + destaque visual + refazer + ícones
(()=>{
  const dataScript = document.getElementById('quiz-data');
  const mount = document.getElementById('quiz');
  const openBtn = document.querySelector('[data-quiz-open]');
  // Se botão/área existem mas não há dataScript, criaremos perguntas com base no conteúdo da página
  let data = null;
  if (!mount || !openBtn) return;
  if (dataScript) {
    try { data = JSON.parse(dataScript.textContent); } catch(e){ console.error('Quiz JSON inválido', e); }
  }
if (!data) {
  // Fallback "real" baseado no conteúdo da página
  const text = (document.querySelector('main')?.innerText || document.body.innerText || '').replace(/\s+/g,' ').trim();
  const words = Array.from(new Set(text.toLowerCase().match(/[a-zà-ú]{5,}/g) || []));
  const common = new Set(['metodologia','livre','conteudo','conteúdo','pagina','página','aprendizado','aluno','materia','matéria','curso','tema','secao','seção','capitulo','capítulo','exemplo','introducao','introdução','conceitos','pratica','prática','teoria','questao','questão','resposta']);
  const keywords = words.filter(w=>!common.has(w)).slice(0,8);
  function pickFalseWord(){
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    let w='';
    for(let i=0;i<7;i++) w += alpha[Math.floor(Math.random()*alpha.length)];
    return w;
  }
const qs = [];
const baseCount = Math.max(3, Math.min(6, keywords.length));
for (let i=0; i<baseCount; i++){
  const kw = keywords[i] || pickFalseWord();
  const present = text.toLowerCase().includes(kw);
  const correct = present ? 'Verdadeiro' : 'Falso';
  const options = ['Verdadeiro','Falso'];
  qs.push({
    id: 'auto-'+i,
    title: `A página aborda o termo “${kw}”.`,
    options,
    answerIndex: options.indexOf(correct),
    explain: present ? `O termo “${kw}” aparece no conteúdo.` : `O termo “${kw}” não aparece no conteúdo.`
  });
}
data = { questions: qs };
}


function render(){
  mount.innerHTML = '';
  const form = document.createElement('form');
  form.className = 'quiz-form';

  // manter referências para explicações por questão
  const qNodes = [];

  data.questions.forEach((q, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'quiz-q';

    const title = document.createElement('h3');
    title.className = 'quiz-title';
    // ícone por pergunta (preenchido após correção)
    const ico = document.createElement('span');
    ico.className = 'q-ico';
    ico.setAttribute('aria-hidden', 'true');
    title.appendChild(ico);
    const tspan = document.createElement('span');
    tspan.textContent = `${idx+1}. ${q.question}`;
    title.appendChild(tspan);
    wrap.appendChild(title);

    const options = document.createElement('div');
    options.className = 'quiz-options';
    wrap.appendChild(options);

    q.options.forEach((opt, j) => {
      const id = `q${idx}_opt${j}`;
      const label = document.createElement('label');
      label.className = 'quiz-opt';
      label.setAttribute('for', id);
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${idx}`;
      input.id = id;
      input.value = String(j);
      if (j === 0) input.required = true; // força seleção de uma alternativa
      label.appendChild(input);
      const span = document.createElement('span');
      span.textContent = ' ' + opt;
      label.appendChild(span);
      options.appendChild(label);
    });

  const explain = document.createElement('div');
  explain.className = 'quiz-explain hidden';
  wrap.appendChild(explain);

  form.appendChild(wrap);
  qNodes.push({ wrap, explain, ico });
});

const actions = document.createElement('div');
actions.className = 'quiz-actions';
const submit = document.createElement('button');
submit.type = 'submit';
submit.className = 'btn';
submit.textContent = 'Enviar respostas';
const reset = document.createElement('button');
reset.type = 'button';
reset.className = 'btn-secondary';
reset.textContent = 'Refazer questionário';
actions.appendChild(submit);
actions.appendChild(reset);
form.appendChild(actions);

const summary = document.createElement('div');
summary.id = 'quiz-result';
summary.className = 'quiz-result hidden';
mount.appendChild(form);
mount.appendChild(summary);

function doReset(){
  // limpar seleções, destaques, explicações e ícones
  qNodes.forEach(({wrap, explain, ico}, idx) => {
    wrap.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = false; });
    wrap.querySelectorAll('.quiz-opt').forEach(l => l.classList.remove('is-correct','is-wrong'));
    explain.classList.add('hidden');
    explain.innerHTML = '';
    ico.textContent = '';
    ico.classList.remove('ok','err');
  });
summary.classList.add('hidden');
summary.textContent = '';
// foco no topo do quiz
form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let score = 0;

  data.questions.forEach((q, idx) => {
    const { wrap, explain, ico } = qNodes[idx];
    const chosen = wrap.querySelector(`input[name="q${idx}"]:checked`);
    const chosenIdx = chosen ? Number(chosen.value) : -1;

    // limpar estado anterior
    wrap.querySelectorAll('.quiz-opt').forEach(l => l.classList.remove('is-correct','is-wrong'));

    const correctLabel = wrap.querySelector(`#q${idx}_opt${q.answerIndex}`)?.parentElement;
    if (chosenIdx === q.answerIndex){
      score += 1;
      if (correctLabel) correctLabel.classList.add('is-correct');
      ico.textContent = '✅';
      ico.classList.remove('err'); ico.classList.add('ok');
      explain.innerHTML = `<div class="q-msg ok">Correto.</div>${q.explain ? `<div class="q-exp">${q.explain}</div>` : ''}`;
    }else{
    const chosenLabel = chosen ? chosen.parentElement : null;
    if (chosenLabel) chosenLabel.classList.add('is-wrong');
    if (correctLabel) correctLabel.classList.add('is-correct');
    ico.textContent = '❌';
    ico.classList.remove('ok'); ico.classList.add('err');
    const chosenTxt = chosenIdx >= 0 ? q.options[chosenIdx] : '—';
    const correctTxt = q.options[q.answerIndex];
    explain.innerHTML = `
    <div class="q-msg warn">Resposta incorreta.</div>
    <div class="q-detail">Sua resposta: <em>${chosenTxt}</em></div>
    <div class="q-detail">Correta: <strong>${correctTxt}</strong></div>
    ${q.explain ? `<div class="q-exp">${q.explain}</div>` : ''}
    `;
  }
explain.classList.remove('hidden');
});

const total = data.questions.length;
summary.textContent = `Resultado: ${score} de ${total} (${Math.round(score/total*100)}%).`;
summary.classList.remove('hidden');
summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

reset.addEventListener('click', doReset);
}

openBtn.addEventListener('click', () => {
  mount.classList.toggle('hidden');
  if (!mount.dataset.rendered){
    render();
    mount.dataset.rendered = '1';
  }
});
})();
