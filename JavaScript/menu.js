(function(){
  var t=document.getElementById('menu-toggle');
  var d=document.getElementById('dropdown-menu');
  if(!t||!d) return;
  function toggle(e){
    e && e.preventDefault();
    var isHidden = d.classList.toggle('hidden');
    d.setAttribute('aria-hidden', isHidden ? 'true' : 'false');
    t.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
  }
  t.addEventListener('click', toggle);
})();
