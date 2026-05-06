/* ---------------------------------------------------------------
 * Oxlahun Cauac - script principal
 * Lectura aleatoria de tarot + interacciones menores
 * --------------------------------------------------------------- */

const cartasTarot = [
  'El Mago: Poder creativo y habilidades manifestadas.',
  'La Papisa: Sabiduría intuitiva y misterio femenino.',
  'La Emperatriz: Fertilidad y abundancia.',
  'El Emperador: Autoridad y estructura.',
  'El Sumo Sacerdote: Espiritualidad y guía.',
  'Los Enamorados: Elección y amor.',
  'El Carro: Voluntad y dirección.',
  'La Justicia: Equilibrio y karma.',
  'El Ermitaño: Búsqueda interior y soledad.',
  'La Rueda de la Fortuna: Cambio y destino.',
  'La Fuerza: Coraje y dominio.',
  'El Colgado: Sacrificio y perspectiva.',
  'La Muerte: Transformación y renacimiento.',
  'La Templanza: Armonía y equilibrio.',
  'El Diablo: Tentación y pasión.',
  'La Torre: Crisis y revelación.',
  'La Estrella: Esperanza y inspiración.',
  'La Luna: Intuición y engaño.',
  'El Sol: Alegría y vitalidad.',
  'El Juicio: Renovación y evaluación.',
  'El Mundo: Logro y realización.',
  'El Loco: Viaje sin restricciones y espontaneidad.',
  'As de Bastos: Inicios creativos y pasión.',
  'Dos de Bastos: Planificación y elecciones.',
  'Tres de Bastos: Expansión y visión a futuro.',
  'Cuatro de Bastos: Celebración y logros.',
  'Cinco de Bastos: Competencia y desafíos.',
  'Seis de Bastos: Reconocimiento y victoria.',
  'Siete de Bastos: Determinación y resistencia.',
  'Ocho de Bastos: Movimiento rápido y comunicación.',
  'Nueve de Bastos: Persistencia y resistencia.',
  'Diez de Bastos: Responsabilidades y carga.',
  'Sota de Bastos: Iniciativa y juventud.',
  'Caballero de Bastos: Acción y aventura.',
  'Reina de Bastos: Pasión y liderazgo.',
  'Rey de Bastos: Carisma y autoridad.',
  'As de Copas: Potencial emocional y nuevas conexiones.',
  'Dos de Copas: Unión y armonía.',
  'Tres de Copas: Celebración y amistad.',
  'Cuatro de Copas: Reflexión y oportunidades desapercibidas.',
  'Cinco de Copas: Pérdida y desilusión.',
  'Seis de Copas: Nostalgia y recuerdos.',
  'Siete de Copas: Fantasía y elecciones.',
  'Ocho de Copas: Búsqueda interior y cambio.',
  'Nueve de Copas: Satisfacción y logros personales.',
  'Diez de Copas: Armonía familiar y felicidad.',
  'Sota de Copas: Sensibilidad y emociones.',
  'Caballero de Copas: Creatividad y romanticismo.',
  'Reina de Copas: Intuición y compasión.',
  'Rey de Copas: Empatía y equilibrio emocional.',
  'As de Espadas: Nueva claridad mental.',
  'Dos de Espadas: Decisiones difíciles.',
  'Tres de Espadas: Dolor y separación.',
  'Cuatro de Espadas: Descanso y recuperación.',
  'Cinco de Espadas: Conflictos y rivalidades.',
  'Seis de Espadas: Transición y superación.',
  'Siete de Espadas: Estrategia y astucia.',
  'Ocho de Espadas: Limitaciones y autoengaño.',
  'Nueve de Espadas: Preocupaciones y ansiedad.',
  'Diez de Espadas: Finalización y liberación.',
  'Sota de Espadas: Comunicación directa.',
  'Caballero de Espadas: Acción decisiva.',
  'Reina de Espadas: Lógica y discernimiento.',
  'Rey de Espadas: Poder mental y autoridad.',
  'As de Oros: Potencial material y nuevas oportunidades.',
  'Dos de Oros: Equilibrio y adaptabilidad.',
  'Tres de Oros: Colaboración y habilidades.',
  'Cuatro de Oros: Seguridad y posesiones.',
  'Cinco de Oros: Dificultades financieras.',
  'Seis de Oros: Generosidad y equilibrio.',
  'Siete de Oros: Evaluación y paciencia.',
  'Ocho de Oros: Habilidad y perfección.',
  'Nueve de Oros: Independencia y logros.',
  'Diez de Oros: Abundancia y logros familiares.',
  'Sota de Oros: Práctica y enfoque material.',
  'Caballero de Oros: Trabajo constante.',
  'Reina de Oros: Estabilidad y prosperidad.',
  'Rey de Oros: Liderazgo y éxito material.'
];

function elegirCartaAleatoria() {
  const indice = Math.floor(Math.random() * cartasTarot.length);
  return cartasTarot[indice];
}

function mostrarLugarAleatorio() {
  const resultado = document.getElementById('resultado');
  const pickACard = document.getElementById('pickacard');
  if (!resultado || !pickACard) return;
  resultado.textContent = elegirCartaAleatoria();
  pickACard.style.opacity = 1;
}

function shakeElement(element) {
  if (!element) return;
  element.classList.add('shake-active');
  setTimeout(() => element.classList.remove('shake-active'), 500);
}

// Expongo funciones usadas por onclick inline en el HTML
window.mostrarLugarAleatorio = mostrarLugarAleatorio;
window.shakeElement = shakeElement;

/* ---------------------------------------------------------------
 * Loader, Hints, Embed Mode & Fallback
 * --------------------------------------------------------------- */

(function () {
  'use strict';

  // ── Embed Mode ──────────────────────────────────────────────────
  // Si la URL tiene ?embed=true, activar modo lite (sin nav, footer, etc.)
  if (new URLSearchParams(window.location.search).get('embed') === 'true') {
    document.body.classList.add('embed-mode');
    return; // No mostrar loader ni hints en embed
  }

  // ── Loader ──────────────────────────────────────────────────────
  const loader = document.getElementById('site-loader');

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('hidden');
    // Remover del DOM después de la transición
    setTimeout(() => loader.remove(), 700);
    showHint();
  }

  // Ocultar loader cuando la página termine de cargar (o max 4s)
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 4000); // Fallback: max 4 segundos
  }

  // ── Interaction Hint ────────────────────────────────────────────
  function showHint() {
    const hint = document.getElementById('interaction-hint');
    if (!hint) return;

    // Mostrar después de un breve delay
    setTimeout(() => hint.classList.add('visible'), 800);

    // Ocultar al primer scroll o después de 6 segundos
    function dismissHint() {
      hint.classList.remove('visible');
      hint.classList.add('fade-out');
      window.removeEventListener('scroll', dismissHint);
      window.removeEventListener('touchstart', dismissHint);
    }

    window.addEventListener('scroll', dismissHint, { once: true });
    window.addEventListener('touchstart', dismissHint, { once: true });
    setTimeout(dismissHint, 6000);
  }

  // ── Fallback: scroll-timeline no soportado ──────────────────────
  // Si el navegador no soporta animation-timeline, las animaciones
  // ya se desactivan via @supports en CSS. Acá agregamos una clase
  // para poder hacer ajustes adicionales si se necesita.
  if (!CSS.supports('animation-timeline', 'view()')) {
    document.documentElement.classList.add('no-scroll-timeline');
  }

})();
