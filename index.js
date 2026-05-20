// Interatividade leve para navegação e acessibilidade
(function(){
  'use strict'

  // Fechar o menu mobile ao clicar em um link
  document.addEventListener('click', function(e){
    const target = e.target;
    if(target.matches('.navbar-nav .nav-link')){
      const navbarCollapse = document.querySelector('.navbar-collapse');
      if(navbarCollapse && navbarCollapse.classList.contains('show')){
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, {toggle:false});
        bsCollapse.hide();
      }
    }
  }, false);

  // Smooth scroll para links internos
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length > 1){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el){
          el.scrollIntoView({behavior:'smooth', block:'start'});
          history.pushState(null,'',href);
        }
      }
    });
  });

  // Destaque do item de navegação conforme scroll
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  function onScroll(){
    const fromTop = window.scrollY + 120;
    sections.forEach(section => {
      if(section.offsetTop <= fromTop && (section.offsetTop + section.offsetHeight) > fromTop){
        const id = section.getAttribute('id');
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#'+id));
      }
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

})();
