const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningAnimations = new Set();
document.documentElement.classList.add('js');

function animateOnce(element, frames, options) {
  if (motionPreference.matches || !element.animate) return;
  const animation = element.animate(frames, options);
  runningAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => runningAnimations.delete(animation));
  return animation;
}

motionPreference.addEventListener('change', (event) => {
  if (event.matches) runningAnimations.forEach((animation) => animation.cancel());
});

const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const updateHeader = () => siteHeader.classList.toggle('is-pinned', window.scrollY > 48);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      animateOnce(entry.target, [
        { opacity: 0.7, transform: 'translate3d(0,20px,0)' },
        { opacity: 1, transform: 'none' },
      ], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach((item) => revealObserver.observe(item));
}

const mobileMenu = document.querySelector('.mobile-menu');
function syncMobileActionAccessibility() {
  const bar = document.querySelector('.mobile-actions');
  if (!bar) return;
  const hidden = !bar.classList.contains('is-active') || Boolean(mobileMenu?.open);
  bar.inert = hidden;
  bar.setAttribute('aria-hidden', String(hidden));
}

if (mobileMenu) {
  const menuButton = mobileMenu.querySelector('summary');
  const panel = mobileMenu.querySelector('.mobile-menu__panel');
  const menuLinks = [...panel.querySelectorAll('a')];
  panel.querySelectorAll('nav > a').forEach((link, index) => link.style.setProperty('--menu-order', index));
  const background = [document.querySelector('main'), document.querySelector('footer'), document.querySelector('.brand'), document.querySelector('.mobile-actions')].filter(Boolean);
  let previousOverflow = '';
  let wasOpen = false;
  panel.id = 'mobile-navigation';
  menuButton.setAttribute('aria-controls', panel.id);
  menuButton.setAttribute('aria-expanded', 'false');

  const syncMenu = () => {
    const isOpen = mobileMenu.open;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Chiudi il menu' : 'Apri il menu');
    background.forEach((element) => { element.inert = isOpen; });
    document.body.classList.toggle('menu-is-open', isOpen);
    syncMobileActionAccessibility();
    if (isOpen && !wasOpen) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      menuLinks.find((link) => link.matches('nav > a'))?.focus({ preventScroll: true });
    } else if (!isOpen && wasOpen) {
      document.body.style.overflow = previousOverflow;
      if (panel.contains(document.activeElement)) menuButton.focus({ preventScroll: true });
    }
    wasOpen = isOpen;
  };
  mobileMenu.addEventListener('toggle', syncMenu);
  menuLinks.forEach((link) => link.addEventListener('click', () => {
    mobileMenu.open = false;
    syncMenu();
  }));
  document.addEventListener('keydown', (event) => {
    if (!mobileMenu.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      mobileMenu.open = false;
      syncMenu();
      menuButton.focus({ preventScroll: true });
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [menuButton, ...menuLinks];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.matchMedia('(min-width: 981px)').addEventListener('change', (event) => {
    if (event.matches && mobileMenu.open) {
      mobileMenu.open = false;
      syncMenu();
    }
  });
  syncMenu();
}

const mobileActions = document.querySelector('.mobile-actions');
if (mobileActions) {
  const isVenue = Boolean(document.querySelector('.venue-hero'));
  const initialAction = document.querySelector('.hero__actions .button, .page-hero .button, .venue-hero .button');
  const inlineChoices = document.querySelector('.studio-choices');
  const closingAction = document.querySelector(isVenue ? '.venue-cta .button' : '.footer-venues');
  const visibleActions = new Map();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibleActions.set(entry.target, entry.isIntersecting));
      mobileActions.classList.toggle('is-active', ![...visibleActions.values()].some(Boolean));
      syncMobileActionAccessibility();
    }, { threshold: 0.15, rootMargin: '-64px 0px -84px 0px' });
    [initialAction, inlineChoices, closingAction].filter(Boolean).forEach((action) => observer.observe(action));
  } else {
    mobileActions.classList.add('is-active');
  }
  syncMobileActionAccessibility();
}

const priceNav = document.querySelector('.price-location-nav');
if (priceNav) {
  const links = [...priceNav.querySelectorAll('a')];
  const setCurrent = (hash) => links.forEach((link) => {
    if (link.hash === hash) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  links.forEach((link) => link.addEventListener('click', () => setCurrent(link.hash)));
  setCurrent(window.location.hash === '#montebrina' ? '#montebrina' : '#pianvecchio');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => setCurrent(`#${entry.target.id}`));
    }, { rootMargin: '-140px 0px -55% 0px' });
    links.forEach((link) => {
      const target = document.querySelector(link.hash);
      if (target) observer.observe(target);
    });
  }
}

document.querySelectorAll('[data-training-selector]').forEach((section) => {
  const tabs = [...section.querySelectorAll('[data-training-tab]')];
  const panels = [...section.querySelectorAll('[data-training-panel]')];
  section.classList.add('training-enhanced');
  section.querySelector('.training-tabs').setAttribute('role', 'tablist');
  const mobileLayout = window.matchMedia('(max-width: 720px)');
  const updateOrientation = () => section.querySelector('.training-tabs').setAttribute('aria-orientation', mobileLayout.matches ? 'horizontal' : 'vertical');
  mobileLayout.addEventListener('change', updateOrientation);
  updateOrientation();
  let activeIndex = -1;
  let panelAnimations = [];

  function selectTab(index, shouldFocus = false) {
    if (activeIndex === index) {
      if (shouldFocus) tabs[index].focus({ preventScroll: true });
      return;
    }
    const shouldAnimate = activeIndex !== -1;
    panelAnimations.forEach((animation) => animation.cancel());
    panelAnimations = [];
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('aria-controls', panels[tabIndex].id);
      tab.tabIndex = active ? 0 : -1;
      panels[tabIndex].hidden = !active;
      panels[tabIndex].setAttribute('role', 'tabpanel');
      panels[tabIndex].setAttribute('aria-labelledby', tab.id);
    });
    if (shouldFocus) tabs[index].focus({ preventScroll: true });
    if (shouldAnimate) {
      const photo = panels[index].querySelector('picture');
      const caption = panels[index].querySelector('.training-panel__caption');
      panelAnimations = [
        animateOnce(photo, [{ clipPath: 'inset(0 9% 0 0)', transform: 'translate3d(12px,0,0) scale(1.035)' }, { clipPath: 'inset(0)', transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' }),
        animateOnce(caption, [{ opacity: .65, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 70, easing: 'cubic-bezier(.16,1,.3,1)' }),
      ].filter(Boolean);
    }
    activeIndex = index;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(next, true);
    });
  });
  selectTab(0);
});

const visitedPickers = new WeakSet();
const pickerAnimations = new WeakMap();
function enterVenuePicker(picker, force = false) {
  if (!force && visitedPickers.has(picker)) return;
  visitedPickers.add(picker);
  pickerAnimations.get(picker)?.forEach((animation) => animation.cancel());
  const animations = [];
  picker.querySelectorAll('.studio-choice').forEach((choice, index) => {
    animations.push(animateOnce(choice, [
      { opacity: .75, transform: `translate3d(${index ? 18 : -18}px,12px,0)` },
      { opacity: 1, transform: 'none' },
    ], { duration: 480, delay: index * 80, easing: 'cubic-bezier(.16,1,.3,1)' }));
    animations.push(animateOnce(choice.querySelector('img'), [
      { clipPath: 'inset(0 0 10% 0)', transform: 'scale(1.05)' },
      { clipPath: 'inset(0)', transform: 'none' },
    ], { duration: 650, delay: index * 80, easing: 'cubic-bezier(.16,1,.3,1)' }));
  });
  pickerAnimations.set(picker, animations.filter(Boolean));
}

document.querySelectorAll('[data-venue-picker]').forEach((picker) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      enterVenuePicker(picker);
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(picker);
  }
});

document.querySelectorAll('[data-choose-venue]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const destination = new URL(link.href);
    if (destination.origin !== location.origin || destination.pathname !== location.pathname) return;
    const picker = document.querySelector(destination.hash);
    if (!picker) return;
    event.preventDefault();
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    const top = picker.getBoundingClientRect().top + window.scrollY - (siteHeader?.getBoundingClientRect().height || 0) - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    root.style.scrollBehavior = previousBehavior;
    if (location.hash !== destination.hash) history.pushState(null, '', destination.hash);
    picker.querySelector('#venue-picker-title')?.focus({ preventScroll: true });
    mobileActions?.classList.remove('is-active');
    syncMobileActionAccessibility();
    enterVenuePicker(picker, true);
  });
});

const steps = document.querySelector('.method-mini');
if (steps && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    steps.querySelectorAll('li').forEach((step, index) => animateOnce(step, [
      { opacity: .65, transform: 'translateX(-16px)' },
      { opacity: 1, transform: 'none' },
    ], { duration: 440, delay: index * 70, easing: 'cubic-bezier(.16,1,.3,1)' }));
    observer.disconnect();
  }, { threshold: .35 });
  observer.observe(steps);
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

// Demo booking: validates the form and shows a summary. Nothing is sent anywhere.
document.querySelectorAll('[data-booking]').forEach((form) => {
  const status = form.querySelector('[data-booking-status]');
  const day = form.querySelector('[name="giorno"]');
  const today = new Date();
  day.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.nome.value.trim();
    if (!day.value || day.value < day.min) { status.textContent = 'Scegli un giorno, da oggi in avanti.'; day.focus(); return; }
    if (!name) { status.textContent = 'Scrivi il tuo nome.'; form.nome.focus(); return; }
    const when = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${day.value}T12:00:00`));
    status.textContent = `Fatto, ${name}: prova a ${form.sede.value}, ${when}, ${form.fascia.value.toLowerCase()}. Demo: nessuna prenotazione reale e nessun dato inviato.`;
  });
});
