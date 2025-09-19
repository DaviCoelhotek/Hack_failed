// contato.js — abas + validação + sucesso (refactor robusto)
(function(){
  "use strict";

  // ===== Utilidades =====
  function normSpace(s){ return (s||"").replace(/\s+/g," ").trim(); }
  function onlyRepeatingChar(s){
    if(!s) return false;
    var t = s.replace(/\s/g,"");
    if(t.length < 6) return false;
    var first = t[0];
    for(var i=0;i<t.length;i++){ if(t[i] !== first) return false; }
    return true;
  }
  function tooManyRepeated(s){ return /(.)\1{6,}/i.test(s||""); }
  function hasEnoughLetters(s){ return ((s||"").match(/\p{L}/gu)||[]).length >= 2 }

  function ensureErrorBox(input){
    if(!input) return null;
    var holder = input.parentElement;
    if(!holder) return null;
    var box = holder.querySelector(".field-error");
    if(!box){
      box = document.createElement("div");
      box.className = "field-error";
      holder.appendChild(box);
    }
    return box;
  }
  function setError(input, msg){
    if(!input) return;
    var box = ensureErrorBox(input);
    if(box){
      box.textContent = msg || "";
      box.style.display = msg ? "block" : "none";
    }
    if(msg){ input.setAttribute("aria-invalid","true"); }
    else   { input.removeAttribute("aria-invalid"); }
  }

  // ===== Abas =====
  var btnSug  = document.getElementById("btn-sugestao");
  var btnRed  = document.getElementById("btn-redes");
  var secSug  = document.getElementById("sugestao");
  var secRed  = document.getElementById("redes");
  var doneBox = document.getElementById("sucesso-envio");

  function selectTab(which){
    var isRed = which === "redes";
    if(secSug) secSug.hidden = isRed;
    if(secRed) secRed.hidden = !isRed;
    if(btnSug){
      btnSug.setAttribute("aria-selected", String(!isRed));
      btnSug.classList.toggle("btn", !isRed);
      btnSug.classList.toggle("btn-secondary", isRed);
    }
    if(btnRed){
      btnRed.setAttribute("aria-selected", String(isRed));
      btnRed.classList.toggle("btn", isRed);
      btnRed.classList.toggle("btn-secondary", !isRed);
    }
  }

  if(btnSug){
    btnSug.addEventListener("click", function(e){
      e.preventDefault();
      selectTab("sugestao");
      history.replaceState(null, "", "#sugestao");
    });
  }
  if(btnRed){
    btnRed.addEventListener("click", function(e){
      e.preventDefault();
      selectTab("redes");
      history.replaceState(null, "", "#redes");
    });
  }

  var h = (location.hash||"").toLowerCase();
  selectTab(h.includes("redes") ? "redes" : "sugestao");

  // ===== Validação do Form =====
  var form     = document.getElementById("form-sugestao");
  var nome     = document.getElementById("nome");
  var email    = document.getElementById("email");
  var sugestao = document.getElementById("sugestao-texto");

  var minNome = 2, maxNome = 80;
  var minSug = 20, maxSug = 5000;

  var PLACEHOLDER_NAMES = ["nome", "name", "teste", "test", "exemplo", "qwerty", "asdf"];
  var COMMON_MAILS = ["gmail.com","hotmail.com","outlook.com","yahoo.com","icloud.com","live.com","bol.com.br","uol.com.br","terra.com.br","proton.me","protonmail.com","me.com","mac.com","msn.com","pm.me"];

  function validateNomeVal(n){
    n = normSpace(n);
    if(n.length < minNome) return "O nome precisa ter pelo menos " + minNome + " caracteres.";
    if(n.length > maxNome) return "O nome não pode ultrapassar " + maxNome + " caracteres.";
    if(/[0-9]/.test(n)) return "O nome não deve conter números.";
    if(!/^[\p{L}][\p{L}\s'’-]{1,}$/u.test(n)) return "Use apenas letras, espaços, apóstrofos ou hífens.";
    var base = n.toLowerCase();
    if(PLACEHOLDER_NAMES.indexOf(base) !== -1) return "Por favor, use seu nome real (evite termos genéricos).";
    if(!hasEnoughLetters(n)) return "Informe um nome válido.";
    if(onlyRepeatingChar(n) || tooManyRepeated(n)) return "O nome parece inválido (muitos caracteres repetidos).";
    return "";
  }

  function looksLikeEmailBasic(e){
    if(!e || e.indexOf("@") === -1) return false;
    if(/\s/.test(e)) return false;
    if(e.length < 6 || e.length > 254) return false;
    return true;
  }
  function deepEmailCheck(e){
    if(/\.\.|@@/.test(e)) return "E-mail inválido (pontos ou @ duplicados).";
    var parts = e.split("@");
    if(parts.length !== 2) return "E-mail inválido.";
    var local = parts[0], domain = parts[1];
    if(!local || !domain) return "E-mail inválido.";
    if(local.length > 64) return "E-mail inválido (parte local muito longa).";
    if(local[0] === "." || local[local.length-1] === ".") return "E-mail inválido (ponto indevido na parte local).";
    if(!/^[A-Za-z0-9._%+\-]+$/.test(local)) return "E-mail inválido (caracteres não permitidos).";
    if(/\.\./.test(local)) return "E-mail inválido (pontos consecutivos).";

    if(domain.length > 190) return "E-mail inválido (domínio muito longo).";
    if(domain.indexOf(".") === -1) return "Inclua um domínio com ponto (ex.: gmail.com).";
    if(/\.\./.test(domain)) return "E-mail inválido (pontos consecutivos no domínio).";
    var labels = domain.split(".");
    for(var i=0;i<labels.length;i++){
      var lab = labels[i];
      if(!lab) return "E-mail inválido (rótulo de domínio vazio).";
      if(lab.length > 63) return "E-mail inválido (rótulo de domínio muito longo).";
      if(lab[0] === "-" || lab[lab.length-1] === "-") return "E-mail inválido (hífen indevido no domínio).";
      if(!/^[A-Za-z0-9-]+$/.test(lab)) return "E-mail inválido (caractere inválido no domínio).";
    }
    var tld = labels[labels.length-1];
    if(!/^[A-Za-z]{2,24}$/.test(tld)) return "E-mail inválido (TLD incorreto).";
    return "";
  }
  function levenshtein(a,b){
    a = (a||"").toLowerCase();
    b = (b||"").toLowerCase();
    var m = Array(a.length+1).fill(0).map(function(){return Array(b.length+1).fill(0)});
    for(var i=0;i<=a.length;i++) m[i][0]=i;
    for(var j=0;j<=b.length;j++) m[0][j]=j;
    for(var i=1;i<=a.length;i++){
      for(var j=1;j<=b.length;j++){
        var cost = a[i-1] === b[j-1] ? 0 : 1;
        m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1, m[i-1][j-1] + cost);
      }
    }
    return m[a.length][b.length];
  }
  function suggestDomain(dom){
    var best = null, bestDist = 3;
    for(var i=0;i<COMMON_MAILS.length;i++){
      var d = COMMON_MAILS[i];
      var dist = levenshtein(dom, d);
      if(dist < bestDist){ best = d; bestDist = dist; }
    }
    return best;
  }
  function validateEmailVal(e){
    e = normSpace(e);
    if(!looksLikeEmailBasic(e)) return "Informe um e-mail válido (ex.: nome@dominio.com).";
    var err = deepEmailCheck(e);
    if(err) return err;
    var dom = e.split("@")[1].toLowerCase();
    var sug = suggestDomain(dom);
    if(sug && sug !== dom){
      return "Domínio suspeito, você quis dizer: " + e.split("@")[0] + "@" + sug + " ?";
    }
    return "";
  }

  function isLikelyURL(s){ return /\bhttps?:\/\//i.test(s||""); }
  function wordCount(s){ return (normSpace(s).match(/\S+/g)||[]).length; }
  function hasEnoughLettersMsg(s){ return ((s||"").match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g)||[]).length >= 5; }
  function validateSugestaoVal(s){
    s = normSpace(s);
    if(s.length < minSug) return "Descreva melhor sua ideia (mínimo " + minSug + " caracteres).";
    if(s.length > maxSug) return "Sua mensagem está muito longa (máximo " + maxSug + " caracteres).";
    if(onlyRepeatingChar(s) || tooManyRepeated(s)) return "Mensagem inválida (muitos caracteres repetidos).";
    if(wordCount(s) < 3 && !hasEnoughLettersMsg(s)) return "Adicione mais detalhes à sua sugestão.";
    if(isLikelyURL(s) && s.length < 40) return "Conte um pouco mais do contexto (não apenas um link).";
    return "";
  }

  function validate(){
    var ok = true;
    var n = nome && nome.value || "";
    var e = email && email.value || "";
    var s = sugestao && sugestao.value || "";

    var errN = validateNomeVal(n);
    var errE = validateEmailVal(e);
    var errS = validateSugestaoVal(s);

    setError(nome, errN); if(errN) ok = false;
    setError(email, errE); if(errE) ok = false;
    setError(sugestao, errS); if(errS) ok = false;

    return ok;
  }

  [nome, email, sugestao].forEach(function(el){
    if(!el) return;
    el.addEventListener("input", validate);
    el.addEventListener("blur", validate);
  });

  // ===== Envio =====
  if(form){
    form.addEventListener("submit", function(ev){
      ev.preventDefault();
      if(!validate()) return;

      // feedback do botão
      var btn = form.querySelector("button[type=submit], .btn-submit");
      if(btn){
        btn.disabled = true;
        var prev = btn.textContent;
        btn.textContent = "Enviando...";
        setTimeout(function(){
          btn.disabled = false;
          btn.textContent = prev;
        }, 1200);
      }

      // Mostrar painel de sucesso e resetar form
      if(doneBox){
        doneBox.hidden = false;
        doneBox.style.display = "block";
        doneBox.setAttribute("role","status");
      }
      try{ form.reset(); }catch(e){}
      selectTab("redes");
      location.hash = "#redes";
      // foco acessível
      if(doneBox){ doneBox.focus && doneBox.focus(); }
    });
  }

  // Links auxiliares (nova sugestão / ir para redes)
  document.addEventListener("click", function(ev){
    var nova = ev.target.closest && ev.target.closest("#nova-sugestao");
    var redes= ev.target.closest && ev.target.closest("#ir-redes");
    if(nova){
      ev.preventDefault();
      if(doneBox){ doneBox.hidden = true; doneBox.style.display="none"; }
      selectTab("sugestao");
      nome && nome.focus();
    }
    if(redes){
      ev.preventDefault();
      if(doneBox){ doneBox.hidden = true; doneBox.style.display="none"; }
      selectTab("redes");
    }
  });

})();