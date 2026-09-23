/* =========================================================
   AUTIVERSI — App Principal (SPA)
   ========================================================= */

(() => {
  'use strict';

  // =========================================================
  // 0. UTILITÁRIOS
  // =========================================================
  const $  = (sel, root = document) => root && root.querySelector ? root.querySelector(sel) : null;
  const $$ = (sel, root = document) => root && root.querySelectorAll ? [...root.querySelectorAll(sel)] : [];
  const getAppRoot = () => {
    let main = $('#app');
    if (!main) {
      main = document.createElement('main');
      main.id = 'app';
      main.className = 'app-main';
      document.body.appendChild(main);
    }
    return main;
  };
  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  };
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.cloneNode(true); };
  const ico = (name, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#${name}"/></svg>`;
  const rand = (n) => Math.floor(Math.random() * n);
  const pickRand = (arr) => arr[rand(arr.length)];
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  // =========================================================
  // 0b. AUDIO (Web Audio)
  // =========================================================
  let _audioCtx = null;
  const getAudioCtx = () => {
    if (!_audioCtx) {
      try {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { _audioCtx = null; }
    }
    return _audioCtx;
  };
  const currentSounds = new Map(); // id -> { source, gain, oscs }
  const stopAllSounds = () => {
    try {
      currentSounds.forEach(s => {
        try {
          if (s.source && s.source.stop) s.source.stop();
        } catch (_) {}
        if (s.oscs) s.oscs.forEach(o => { try { o.stop(); } catch (_) {} });
        if (s.gain && s.gain.disconnect) s.gain.disconnect();
      });
      currentSounds.clear();
    } catch (e) {}
  };

  // =========================================================
  // 1. STORAGE / STATE
  // =========================================================
  const LS = {
    get(key, fallback) {
      try { const v = localStorage.getItem('autiversi_' + key); return v == null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) { localStorage.setItem('autiversi_' + key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem('autiversi_' + key); }
  };

  const state = {
    page: 'home',
    sub: null,
    theme: LS.get('theme', 'light'),
    motion: LS.get('motion', 'on'),
    largeText: LS.get('largeText', false),
    contrast: LS.get('contrast', 'normal'),
    soundEnabled: LS.get('soundEnabled', false),
    profile: LS.get('profile', {
      name: 'Você',
      age: null,
      phone: null,
      sensory: {},
      role: null,
      supportLevel: null,
      careeName: null
    }),
    routine: LS.get('routine', [
      { id: 'r1', time: '08:00', place: 'Supermercado Bom', placeId: 'p5', note: 'Compras da semana' },
      { id: 'r2', time: '09:30', place: 'Consulta', placeId: null, note: 'Clínica perto de casa' }
    ]),
    diary: LS.get('diary', []),
    checklist: LS.get('checklist', {}),
    savedPlaces: LS.get('savedPlaces', ['p1', 'p3', 'p6']),
    emergencyContact: LS.get('emergencyContact', {
      name: 'Contato de emergência',
      number: '192'
    }),
    selectedFilter: 'baixo',
    selectedPlace: null,
    quizStep: 0,
    calmMode: null,
    lastVisited: LS.get('lastVisited', []),
    scenarioId: null,
    selectedAnswer: null,
    socialResult: null,
    caregiverSection: 'intro',
    subNav: 'hoje',
    searchQuery: '',
    cityFilter: 'all',
    childCategory: null,
    childMode: LS.get('childMode', false)
  };

  const sanitizePhone = (value = '') => {
    const digits = String(value || '').replace(/\D/g, '');
    return digits;
  };

  const formatPhone = (value = '') => {
    const digits = sanitizePhone(value);
    if (!digits) return '—';
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const getEmergencyContact = () => {
    const saved = LS.get('emergencyContact', null);
    if (saved && typeof saved === 'object') {
      const personalNumber = sanitizePhone(saved.personalNumber || saved.number || '192') || '192';
      return {
        name: String(saved.name || 'Contato de emergência').trim() || 'Contato de emergência',
        number: personalNumber,
        personalNumber,
        defaultNumber: '192'
      };
    }
    return { name: 'Contato de emergência', number: '192', personalNumber: '192', defaultNumber: '192' };
  };

  const saveState = () => {
    LS.set('profile', state.profile);
    LS.set('routine', state.routine);
    LS.set('diary', state.diary);
    LS.set('checklist', state.checklist);
    LS.set('savedPlaces', state.savedPlaces);
    LS.set('lastVisited', state.lastVisited.slice(0, 6));
    LS.set('childMode', !!state.childMode);
    const emergency = state.emergencyContact || getEmergencyContact();
    const personalNumber = sanitizePhone(emergency.personalNumber || emergency.number || '192') || '192';
    LS.set('emergencyContact', {
      name: emergency.name || 'Contato de emergência',
      number: personalNumber,
      personalNumber,
      defaultNumber: '192'
    });
  };

  const pushLastVisited = (page, label) => {
    state.lastVisited = state.lastVisited.filter(x => x.page !== page);
    state.lastVisited.unshift({ page, label, time: Date.now() });
    if (state.lastVisited.length > 6) state.lastVisited = state.lastVisited.slice(0, 6);
    saveState();
  };

  // =========================================================
  // 2. TOAST / WARM MESSAGES + KIDS HELPERS
  // =========================================================
  const isKids = () => !!state.childMode;

  const tNav = (key) => {
    if (!isKids()) return {
      home: { label: 'Início', hint: 'Tela principal' },
      mapa: { label: 'Mapa Sensorial', hint: 'Lugares organizados por estímulo' },
      desacelerar: { label: 'Desacelerar', hint: 'Ferramentas para crises e ansiedade' },
      rotina:   { label: 'Rotina', hint: 'Organize seu dia' },
      cuidadores:{ label: 'Apoio Familiar', hint: 'Dicas para pais e cuidadores' },
      perfil:   { label: 'Perfil', hint: 'Suas configurações pessoais' }
    }[key] || { label: key, hint: '' };
    return NAV_LABELS_KIDS[key] || { label: key, hint: '' };
  };

  let toastTimer = null;
  const toast = (msg, ms = 3200) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.classList.add('hidden'), 300);
    }, ms);
  };
  const toastWarm = () => toast(pickRand(isKids() ? WARM_MESSAGES_KIDS : WARM_MESSAGES), 2800);
  const toastKid = (msg) => toast('✨ ' + msg);

  // =========================================================
  // 3. THEME / ACCESSIBILITY
  // =========================================================
  const applyTheme = () => {
    const body = document.body;
    body.setAttribute('data-theme', state.theme);
    body.setAttribute('data-motion', state.motion);
    body.setAttribute('data-large-text', state.largeText);
    body.setAttribute('data-contrast', state.contrast);
    body.setAttribute('data-sound', state.soundEnabled);
    body.setAttribute('data-child-mode', !!state.childMode ? 'true' : 'false');
    LS.set('theme', state.theme);
    LS.set('motion', state.motion);
    LS.set('largeText', state.largeText);
    LS.set('contrast', state.contrast);
    LS.set('soundEnabled', state.soundEnabled);
    LS.set('childMode', !!state.childMode);
    const tgT = $('#toggle-theme'); if (tgT) tgT.checked = state.theme === 'dark';
    const tgM = $('#toggle-motion'); if (tgM) tgM.checked = state.motion === 'off';
    const tgL = $('#toggle-large-text'); if (tgL) tgL.checked = !!state.largeText;
    const tgC = $('#toggle-contrast'); if (tgC) tgC.checked = state.contrast === 'high';
    const tgChild = $('#toggle-child-global'); if (tgChild) tgChild.checked = !!state.childMode;
    const btnTheme = $('#btn-theme');
    if (btnTheme) btnTheme.classList.toggle('is-dark', state.theme === 'dark');
  };

  const bindAccessibility = () => {
    const themeBtn = $('#btn-theme');
    const accessBtn = $('#btn-accessibility');
    const closeBtn = $('#close-accessibility');
    const panel = $('#accessibility-panel');
    const toggleTheme = $('#toggle-theme');
    const toggleMotion = $('#toggle-motion');
    const toggleLargeText = $('#toggle-large-text');
    const toggleContrast = $('#toggle-contrast');

    if (themeBtn) themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme();
    });
    if (accessBtn) accessBtn.addEventListener('click', () => {
      if (panel) panel.classList.remove('hidden');
    });
    if (closeBtn) closeBtn.addEventListener('click', () => {
      if (panel) panel.classList.add('hidden');
    });
    if (toggleTheme) toggleTheme.addEventListener('change', (e) => {
      state.theme = e.target.checked ? 'dark' : 'light';
      applyTheme();
    });
    if (toggleMotion) toggleMotion.addEventListener('change', (e) => {
      state.motion = e.target.checked ? 'off' : 'on';
      applyTheme();
    });
    if (toggleLargeText) toggleLargeText.addEventListener('change', (e) => {
      state.largeText = e.target.checked;
      applyTheme();
    });
    if (toggleContrast) toggleContrast.addEventListener('change', (e) => {
      state.contrast = e.target.checked ? 'high' : 'normal';
      applyTheme();
    });
    const toggleChildGlobal = $('#toggle-child-global');
    if (toggleChildGlobal) toggleChildGlobal.addEventListener('change', (e) => {
      state.childMode = !!e.target.checked;
      applyTheme();
      setTimeout(() => { updateKidsText(); render(); }, 40);
      if (state.childMode) toast('🎈 Modo Criança ativado!');
      else toast('Modo normal ativado.');
    });
    const toggleSound = $('#toggle-sound');
    if (toggleSound) toggleSound.addEventListener('change', (e) => {
      state.soundEnabled = !!e.target.checked;
      applyTheme();
      if (!state.soundEnabled) stopAllSounds();
    });
    if (panel) panel.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'accessibility-panel') panel.classList.add('hidden');
    });
  };

  // =========================================================
  // 3b. PAINEL CRIANÇA + MODO INFANTIL
  // =========================================================
  const renderChildSub = (cat) => {
    state.childCategory = cat;
    const root = $('#child-sub-views');
    const intro = document.querySelector('.child-intro');
    const grid = document.querySelector('#child-panel .child-grid');
    if (!root) return;
    if (intro) intro.classList.add('view-hidden');
    if (grid) grid.classList.add('view-hidden');
    root.innerHTML = '';
    const def = CHILD_GAME_STEPS[cat];
    if (!def) { root.innerHTML = ''; if (intro) intro.classList.remove('view-hidden'); if (grid) grid.classList.remove('view-hidden'); return; }
    const stepsHtml = def.steps.map((s, i) => `
      <div class="ci-step">
        <span class="num">${i+1}</span>
        <p style="margin:0;">${s}</p>
      </div>`).join('');
    let musicasHtml = '';
    if (cat === 'musicas' && Array.isArray(CHILD_MUSICS) && CHILD_MUSICS.length) {
      const listagem = CHILD_MUSICS.map((m, i) => `
        <button type="button" class="ci-music-card" data-idx="${i}">
          <div class="ci-m-emoji">${m.emoji || '🎵'}</div>
          <div class="ci-m-info">
            <strong class="ci-m-title">${m.name}</strong>
            <small class="ci-m-desc">${m.desc || 'Clique para ouvir'}</small>
          </div>
          <div class="ci-m-play" aria-hidden="true">▶</div>
        </button>
      `).join('');
      musicasHtml = `
        <div class="ci-musicas-wrap mt-4">
          <h4 class="ci-m-title-h mt-4 mb-3">🎶 Todas as músicas (${CHILD_MUSICS.length})</h4>
          <div class="ci-musicas-grid">${listagem}</div>
          <button type="button" class="btn btn-secondary mt-5 ci-all-sounds-btn" style="width:100%;justify-content:center;">
            🔊 Ir para todos os sons e músicas
          </button>
        </div>
      `;
    }
    root.innerHTML = `
      <div class="child-sub-view active" data-child-cat="${cat}">
        <div class="ci-toolbar">
          <button class="ci-back-btn" aria-label="Voltar para lista">⬅️ Voltar</button>
          <button class="ci-done-btn" aria-label="Eu consegui!">✅ Fiz isso!</button>
        </div>
        <h3 class="ci-title">${def.emoji} ${def.title}</h3>
        <div class="ci-steps">${stepsHtml}</div>
        ${musicasHtml}
      </div>
    `;
    if (cat === 'musicas') {
      setTimeout(() => {
        const cards = root.querySelectorAll('.ci-music-card');
        cards.forEach(card => {
          card.addEventListener('click', () => {
            const idx = Number(card.getAttribute('data-idx'));
            const m = CHILD_MUSICS[idx];
            if (!m) return;
            const songMap = {
              'ninar': 'ninar', 'ciranda': 'ciranda', 'roda': 'roda',
              'chuva': 'rain', 'flauta': 'flute', 'lofi': 'lofi',
              'theta': 'theta', 'arvore': 'wind'
            };
            const key = Object.keys(m).find(k => songMap[k]);
            const target = key ? songMap[key] : null;
            if (target) {
              try {
                const ev = new CustomEvent('autiversi:play-song', { detail: { id: target, name: m.name } });
                window.dispatchEvent(ev);
              } catch(_) {}
            }
            toastKid('Tocando: ' + m.name + ' 🎶');
          });
        });
        const allBtn = root.querySelector('.ci-all-sounds-btn');
        if (allBtn) allBtn.addEventListener('click', () => setPage('desacelerar', { sub: 'sounds' }));
      }, 50);
    }
    // bind back & done
    const back = root.querySelector('.ci-back-btn');
    if (back) back.addEventListener('click', () => closeChildSub());
    const done = root.querySelector('.ci-done-btn');
    if (done) done.addEventListener('click', () => {
      const catObj = CHILD_CATEGORIES.find(c => c.cat === cat);
      toastKid('Uau! Você fez ' + (catObj?.title || 'isso') + '! 🌟');
      setTimeout(() => closeChildSub(), 600);
    });
    const body = document.querySelector('.child-body');
    if (body) body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeChildSub = () => {
    state.childCategory = null;
    const root = $('#child-sub-views');
    const intro = document.querySelector('.child-intro');
    const grid = document.querySelector('#child-panel .child-grid');
    if (root) root.innerHTML = '';
    if (intro) intro.classList.remove('view-hidden');
    if (grid) grid.classList.remove('view-hidden');
  };

  const bindChildPanel = () => {
    const openBtn = $('#btn-child-mode');
    const closeBtn = $('#close-child');
    const panel = $('#child-panel');
    if (openBtn) openBtn.addEventListener('click', () => {
      state.childMode = !state.childMode;
      applyTheme();
      if (panel) panel.classList.toggle('hidden', !state.childMode);
      if (state.childMode) {
        toast('🎈 Espaço Criança aberto!');
      } else {
        closeChildSub();
        toast('Voltando ao normal.');
      }
      setTimeout(() => { updateKidsText(); render(); }, 40);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => {
      if (panel) panel.classList.add('hidden');
      state.childMode = false;
      applyTheme();
      closeChildSub();
      setTimeout(() => { updateKidsText(); render(); }, 40);
    });
    if (panel) panel.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'child-panel') {
        panel.classList.add('hidden');
      }
    });
    // delegation for items
    if (panel) panel.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-child-cat]') : null;
      if (btn) {
        const cat = btn.getAttribute('data-child-cat');
        renderChildSub(cat);
      }
    });
  };

  const updateKidsText = () => {
    const kids = isKids();
    // desktop nav labels
    $$('.desktop-nav .nav-link').forEach(btn => {
      const nav = btn.getAttribute('data-nav');
      if (!nav) return;
      const t = tNav(nav);
      btn.textContent = t.label;
      if (kids) btn.title = t.hint;
    });
    // bottom nav
    $$('.bottom-nav .bn-item').forEach(btn => {
      const nav = btn.getAttribute('data-nav');
      if (!nav) return;
      const t = tNav(nav);
      const lbl = btn.querySelector('.bn-label');
      if (lbl) lbl.textContent = kids ? t.label : t.label;
      btn.title = t.hint;
    });
    // logo hint
    const logo = document.querySelector('.logo-btn');
    if (logo) logo.title = kids ? '🏠 Voltar para o começo' : 'Ir para o início';
  };

  // =========================================================
  // 4. ROUTER
  // =========================================================
  const setPage = (page, opts = {}) => {
    state.page = page;
    state.sub = opts.sub || null;
    if (opts.placeId != null) state.selectedPlace = PLACES.find(p => p.id === opts.placeId) || null;
    if (opts.scenarioId != null) { state.scenarioId = opts.scenarioId; state.selectedAnswer = null; }
    if (opts.calm != null) state.calmMode = opts.calm;
    if (opts.cgSection != null) state.caregiverSection = opts.cgSection;
    if (opts.subNav != null) state.subNav = opts.subNav;
    location.hash = page + (opts.sub ? ':' + opts.sub : '');
    render();
    window.scrollTo({ top: 0, behavior: state.motion === 'off' ? 'auto' : 'smooth' });
  };

  const parseHash = () => {
    const h = (location.hash || '#home').slice(1);
    const [page, extra] = h.split(':');
    return { page: page || 'home', extra: extra || null };
  };

  const labelOfPage = (page, sub) => {
    const map = {
      home: 'Início',
      mapa: 'Mapa Sensorial',
      desacelerar: 'Desacelerar',
      rotina: 'Rotina',
      cuidadores: 'Apoio Familiar',
      perfil: 'Perfil',
      sensorial: 'Perfil Sensorial',
      diario: 'Diário de bem-estar',
      salvos: 'Locais salvos',
      social: 'Situações Sociais',
      treinador: 'Treinar conversa',
      tradutor: 'Entender uma situação',
      privacidade: 'Privacidade',
      config: 'Configurações',
      preparar: 'Preparar para sair',
      crisis: 'Modo crise',
      breath: 'Respirar',
      ground: 'Me acalmar',
      sounds: 'Sons tranquilos',
      steps: 'Exercícios rápidos'
    };
    return map[sub] || map[page] || 'Autiversi';
  };

  const bindNav = () => {
    document.addEventListener('click', (e) => {
      const cgBtn = e.target.closest('[data-cg-section]');
      const navBtn = e.target.closest('[data-nav]');
      if (cgBtn && !navBtn) {
        e.preventDefault();
        const cgSection = cgBtn.getAttribute('data-cg-section');
        state.caregiverSection = cgSection;
        render();
        const target = document.querySelector('.cg-content[data-cg-panel="' + cgSection + '"]');
        if (target) {
          setTimeout(() => target.scrollIntoView({ behavior: state.motion === 'off' ? 'auto' : 'smooth', block: 'start' }), 60);
        } else {
          window.scrollTo({ top: 0, behavior: state.motion === 'off' ? 'auto' : 'smooth' });
        }
        return;
      }
      if (!navBtn) return;
      e.preventDefault();
      const page = navBtn.getAttribute('data-nav');
      const sub = navBtn.getAttribute('data-sub');
      const placeId = navBtn.getAttribute('data-place');
      const scenarioId = navBtn.getAttribute('data-scenario');
      const calm = navBtn.getAttribute('data-calm');
      const cgSection = navBtn.getAttribute('data-cg-section');
      const subNav = navBtn.getAttribute('data-subnav');
      toastWarm();
      pushLastVisited(page, labelOfPage(page, sub));
      setPage(page, {
        sub: sub || undefined,
        placeId: placeId || undefined,
        scenarioId: scenarioId || undefined,
        calm: calm || undefined,
        cgSection: cgSection || undefined,
        subNav: subNav || undefined
      });
    });
    window.addEventListener('hashchange', () => {
      const { page, extra } = parseHash();
      if (page !== state.page || extra !== state.sub) {
        state.page = page;
        state.sub = extra;
        render();
      }
    });
  };

  const updateNavActive = () => {
    const p = state.page;
    $$('.nav-link').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-nav') === p));
    $$('.bn-item').forEach(btn => {
      const bP = btn.getAttribute('data-nav');
      const map = {
        home: 'home', mapa: 'mapa', desacelerar: 'desacelerar', rotina: 'rotina', perfil: 'perfil', cuidadores: 'cuidadores'
      };
      btn.classList.toggle('active', map[p] === bP);
    });
  };

  // =========================================================
  // 5. RENDER — ESQUELETO
  // =========================================================
  const render = () => {
    updateNavActive();
    document.body.setAttribute('data-page', state.page);
    const main = getAppRoot();
    main.innerHTML = '';
    const page = el('div', { class: 'page' });

    const p = state.page;
    const s = state.sub;

    switch (p) {
      case 'home':         page.appendChild(renderHome()); break;
      case 'mapa':         page.appendChild(renderMapa()); break;
      case 'desacelerar':
        if (s === 'breath')       page.appendChild(renderBreath());
        else if (s === 'ground')  page.appendChild(renderGround());
        else if (s === 'sounds')  page.appendChild(renderSounds());
        else if (s === 'steps')   page.appendChild(renderSteps());
        else                      page.appendChild(renderDesacelerar());
        break;
      case 'rotina':       page.appendChild(renderRotina()); break;
      case 'cuidadores':   page.appendChild(renderCuidadores()); break;
      case 'perfil':
        if (s === 'sensorial')    page.appendChild(renderPerfilSensorial());
        else if (s === 'diario')  page.appendChild(renderDiario());
        else if (s === 'salvos')  page.appendChild(renderLocaisSalvos());
        else if (s === 'social')  page.appendChild(renderSocialHub());
        else if (s === 'treinador') page.appendChild(renderTreinador());
        else if (s === 'tradutor')  page.appendChild(renderTradutor());
        else if (s === 'cuidadores') page.appendChild(renderCuidadores());
        else if (s === 'privacidade') page.appendChild(renderPrivacidade());
        else if (s === 'config')  page.appendChild(renderConfig());
        else if (s === 'preparar') page.appendChild(renderPreparar());
        else if (s === 'crisis')  page.appendChild(renderCrisis());
        else                      page.appendChild(renderPerfilHub());
        break;
      default:             page.appendChild(renderHome());
    }

    main.appendChild(page);
    afterRender();
  };

  const afterRender = () => {
    switch (state.page) {
      case 'mapa': initMapaInteractions(); break;
      case 'rotina': initRotinaInteractions(); break;
      case 'cuidadores': initCuidadoresInteractions(); break;
      case 'perfil':
        if (state.sub === 'sensorial') initQuizInteractions();
        else if (state.sub === 'treinador') initTreinadorInteractions();
        else if (state.sub === 'tradutor') initTradutorInteractions();
        else if (state.sub === 'diario') initDiarioInteractions();
        else if (state.sub === 'desacelerar') initAcolhimentoInteractions();
        else if (state.sub === 'cuidadores') initCuidadoresInteractions();
        break;
      case 'desacelerar': initAcolhimentoInteractions(); break;
    }
    renderEmergencyFloatingButton();
    const caregiverTarget = document.querySelector('.cg-content[data-cg-panel="' + state.caregiverSection + '"]');
    if (state.page === 'cuidadores' && caregiverTarget) {
      setTimeout(() => caregiverTarget.scrollIntoView({ behavior: state.motion === 'off' ? 'auto' : 'smooth', block: 'start' }), 80);
    }
    updateKidsText();
  };

  // =========================================================
  // 6. COMPONENTES REUTILIZÁVEIS
  // =========================================================
  const renderEmergencyFloatingButton = () => {
    const contact = state.emergencyContact || getEmergencyContact();
    const emergencyNumber = '192';
    const customNumber = sanitizePhone(contact.personalNumber || contact.number || emergencyNumber) || emergencyNumber;
    let bar = document.getElementById('emergency-floating-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'emergency-floating-bar';
      document.body.appendChild(bar);
    }
    const displayName = (contact.name || 'Contato de emergência').trim() || 'Contato de emergência';
    const hasCustom = customNumber && customNumber !== emergencyNumber;
    const buttonsHtml = `
      <a class="emergency-floating-button emergency-call-main" href="tel:${emergencyNumber}" aria-label="Ligar para 192">
        <span class="emergency-floating-icon">${ico('i-calm')}</span>
        <span class="emergency-floating-copy">
          <strong>1 • Emergência</strong>
          <small>192 • SAMU</small>
        </span>
      </a>
      ${hasCustom ? `
        <a class="emergency-floating-button emergency-call-alt" href="tel:${customNumber}" aria-label="Ligar para ${displayName}">
          <span class="emergency-floating-icon">${ico('i-phone')}</span>
          <span class="emergency-floating-copy">
            <strong>2 • ${displayName}</strong>
            <small>${formatPhone(customNumber)}</small>
          </span>
        </a>
      ` : ''}
    `;
    bar.innerHTML = `<div class="emergency-floating-stack">${buttonsHtml}</div>`;
  };

  const pageHead = (title, subtitle, badgeIcon = '', badgeText = '') => h(`
    <div class="page-head fade-in">
      ${badgeText ? `<span class="chip chip-soft mb-3">${badgeIcon ? ico(badgeIcon) + ' ' : ''}${badgeText}</span>` : ''}
      <h1>${title}</h1>
      ${subtitle ? `<p class="mb-0">${subtitle}</p>` : ''}
    </div>
  `);

  const backBtn = (navPage, sub, label) => h(`
    <button class="back-btn fade-in" data-nav="${navPage}" ${sub ? `data-sub="${sub}"` : ''} aria-label="Voltar">
      ${ico('i-arrow')} <span>${label || 'Voltar'}</span>
    </button>
  `);

  const comfortBar = (value, size = '10') => h(`
    <div class="comfort-bar">
      <div class="bar"><div class="fill" style="width:${(clamp(value,0,10)/10)*100}%"></div></div>
      <span class="comfort-num">${value}/${size}</span>
    </div>
  `);

  const sensoryPill = (svgIcon, label, value, arr) => {
    const lbl = arr[clamp(value, 0, 5)];
    return `<div class="sens-pill">
      <span class="sens-ico">${ico(svgIcon)}</span>
      <div class="sens-val">${lbl}</div>
      <div class="small muted">${label}</div>
    </div>`;
  };

  // =========================================================
  // 7. PÁGINA: HOME (INÍCIO)
  // =========================================================
  function renderHome() {
    const root = document.createElement('div');
    const kids = isKids();
    const nome = state.profile?.name ? state.profile.name : '';
    const careeName = state.profile?.careeName;
    const careeMode = state.profile?.role === 'cuidador';

    let heroTitle, heroSub;
    if (kids) {
      heroTitle = nome ? `🌈 Olá, ${nome}! Vamos brincar?` : '🌈 Olá! Vamos brincar?';
      heroSub = 'Tem muitas coisas legais aqui. Escolha uma!';
    } else if (careeMode) {
      heroTitle = careeName
        ? `💙 Olá, ${nome || 'cuidador(a)'}! Pronto para apoiar ${careeName} hoje?`
        : `💙 Olá${nome ? ', ' + nome : ''}! Apoio para quem cuida.`;
      heroSub = 'Encontre lugares tranquilos, dicas práticas e recursos para organizar o dia.';
    } else {
      heroTitle = nome ? `💙 Olá, ${nome}! Como podemos ajudar hoje?` : '💙 Olá! Como podemos ajudar você hoje?';
      heroSub = 'Aqui você organiza sua rotina, encontra lugares confortáveis, acalma e entende situações sociais — no seu ritmo.';
    }

    const hero = h(`
      <section class="hero fade-in">
        <h1>${heroTitle}</h1>
        <p class="hero-sub">${heroSub}</p>
        <button class="hero-guide-btn" id="open-site-guide" type="button" aria-expanded="false">
          <span class="hero-guide-icon">${ico('i-book')}</span>
          Guia rápido do site
        </button>
        <div class="hero-guide-panel hidden" id="site-guide-panel" aria-live="polite">
          <div class="guide-step">
            <span>1</span>
            <div>
              <strong>Comece pela parte que você precisa</strong>
              <p>Na página inicial, escolha uma opção como “Mapa Sensorial”, “Rotina”, “Perfil” ou “Apoio Familiar”. Assim você entra direto na ferramenta que vai te ajudar naquele momento.</p>
            </div>
          </div>
          <div class="guide-step">
            <span>2</span>
            <div>
              <strong>Use o mapa para achar lugares mais confortáveis</strong>
              <p>O mapa mostra lugares com diferentes níveis de estímulo. Você pode ver quais são mais tranquilos, mais calmos e mais fáceis de visitar no seu dia a dia.</p>
            </div>
          </div>
          <div class="guide-step">
            <span>3</span>
            <div>
              <strong>Organize o dia e fique mais seguro</strong>
              <p>Na rotina você pode guardar compromissos e lembretes. No apoio familiar, você pode salvar um contato de emergência e ter o número 192 sempre à mão quando precisar.</p>
            </div>
          </div>
        </div>
      </section>
    `);
    root.appendChild(hero);

    const gs = el('section', { class: 'section gs-wrap fade-in delay-1' });
    gs.appendChild(h(`
      <div class="gs-box">
        <div class="gs-input">
          ${ico('i-search')}
          <input id="global-search-input" type="search" placeholder="${kids ? 'Procure algo divertido 🔎' : 'Buscar: lugares, dicas, rotina, crise, PECS...'}"/>
        </div>
        <div id="gs-results" class="gs-results">
          <div class="gs-empty"><p>${kids ? 'Comece a digitar para encontrar coisas legais!' : 'Digite algo para buscar — lugares, páginas, dicas...'}</p></div>
        </div>
      </div>
    `));
    root.appendChild(gs);

    setTimeout(() => {
      const inp = $('#global-search-input');
      if (inp) {
        let t;
        inp.addEventListener('input', (e) => {
          clearTimeout(t);
          const v = e.target.value;
          t = setTimeout(() => runGlobalSearch(v), 150);
        });
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { clearTimeout(t); runGlobalSearch(e.target.value); }
        });
      }
    }, 30);

    // 6 botões grandes — ordem: ajuda-agora primeiro
    const items = kids
      ? [
          { nav: 'desacelerar',icon: 'i-leaf',     label: '😌 Ficar tranquilo',  hint: 'Para ficar mais calmo', cls: 'ht-sage' },
          { nav: 'mapa',       icon: 'i-map',      label: '🗺️ Lugares legais',   hint: 'Lugares bons para ir',  cls: 'ht-sky' },
          { nav: 'rotina',     icon: 'i-calendar', label: '✅ Minha rotina',      hint: 'Coisas do dia a dia',   cls: 'ht-lilac' },
          { nav: 'perfil',     sub: 'sensorial',   icon: 'i-user',     label: '👦 Meu perfil',      hint: 'Sobre você',           cls: 'ht-cream' },
          { nav: 'perfil',     sub: 'social',      icon: 'i-people',   label: '🗣️ Conversar',        hint: 'Treino de fala',       cls: 'ht-sky' },
          { nav: 'cuidadores', icon: 'i-people',    label: '👨‍👩‍👧 Família',        hint: 'Área para adultos',    cls: 'ht-lilac' }
        ]
      : [
          { nav: 'desacelerar',icon: 'i-leaf',     label: 'Preciso de ajuda agora',  hint: 'Espaço de Acolhimento',    cls: 'ht-sage' },
          { nav: 'mapa',       icon: 'i-map',      label: 'Explorar lugares',         hint: 'Mapa Sensorial',           cls: 'ht-sky' },
          { nav: 'rotina',     icon: 'i-calendar', label: 'Organizar minha rotina',   hint: 'Compromissos do dia',      cls: 'ht-lilac' },
          { nav: 'perfil',     sub: 'sensorial',   icon: 'i-user',     label: careeMode ? 'Perfil sensorial da pessoa cuido' : 'Conhecer meu perfil', hint: careeMode ? 'Níveis e dicas' : 'Perfil Sensorial', cls: 'ht-cream' },
          { nav: 'cuidadores', icon: 'i-people',    label: 'Apoio Familiar',           hint: 'Dicas e orientações',      cls: careeMode ? 'ht-sage' : 'ht-lilac' },
          { nav: 'perfil',     sub: 'social',      icon: 'i-people',   label: 'Situações sociais',         hint: 'Treinar e entender',       cls: 'ht-sky' }
        ];
    const tiles = el('section', { class: 'home-tiles fade-in delay-1' });
    items.forEach(it => {
      tiles.appendChild(h(`
        <button class="ht-card ${it.cls}" data-nav="${it.nav}" ${it.sub ? `data-sub="${it.sub}"` : ''}>
          <span class="ht-icon">${ico(it.icon)}</span>
          <div class="ht-info">
            <h3>${it.label}</h3>
            <p class="muted mb-0">${it.hint}</p>
          </div>
          <span class="ht-arrow">${ico('i-arrow-right')}</span>
        </button>
      `));
    });
    root.appendChild(tiles);

    // Continue de onde parou
    if (state.lastVisited.length > 1) {
      const recent = el('section', { class: 'section fade-in delay-2' });
      const recentCards = state.lastVisited.slice(1, 4).map(v => {
        let cls = 'fi-sky-sm';
        if (v.page === 'desacelerar') cls = 'fi-sage-sm';
        else if (v.page === 'cuidadores' || v.sub === 'perfil') cls = 'fi-lilac-sm';
        else if (v.page === 'rotina') cls = 'fi-cream-sm';
        return `
          <button class="card" data-nav="${v.page}" ${v.page === 'perfil' && v.sub ? `data-sub="${v.sub}"` : ''} style="text-align:left;cursor:pointer;">
            <div class="feature-icon ${cls}">${ico('i-arrow-right')}</div>
            <div class="feature-text">
              <h3>${v.label}</h3>
              <p>${kids ? 'Toque para voltar!' : 'Toque para voltar rapidamente.'}</p>
            </div>
          </button>
        `;
      }).join('');
      recent.appendChild(h(`
        <div class="section-title">
          <h2>${kids ? '⭐ Últimas coisas legais' : 'Continue de onde parou'}</h2>
        </div>
        <div class="grid grid-3">
          ${recentCards}
        </div>
      `));
      root.appendChild(recent);
    }

    // Rodapé suave
    root.appendChild(h(`
      <section class="section fade-in delay-3">
        <div class="card card-soft">
          <div class="row-between wrap">
            <div style="max-width: 520px;">
              <h3 class="mb-2">${kids ? '💙 Nós estamos com você!' : '💙 Autiversi está aqui para você'}</h3>
              <p class="mb-0">${kids ? 'Tudo bem ser do seu jeito. Cada dia você aprende um pouco mais.' : 'O Autiversi é um guia — nunca substitui o acompanhamento de um profissional de saúde qualificado.'}</p>
            </div>
            <div style="margin-top:8px;">
              <button class="btn btn-primary" id="btn-warm">${kids ? 'Me dê um sorriso 😊' : 'Palavra de acolhimento'}</button>
            </div>
          </div>
        </div>
      </section>
    `));

    // Card de acessibilidade
    root.appendChild(h(`
      <section class="section fade-in delay-3">
        <div class="card card-lg access-home-card">
          <div class="row-between wrap align-start gap-4">
            <div style="max-width: 520px;">
              <h2>Personalize sua experiência</h2>
              <p class="muted mb-0">Você pode reduzir animações, aumentar texto, mudar o tema e mais — tudo no painel de acessibilidade, ali no canto superior.</p>
            </div>
            <button class="btn btn-primary btn-lg" id="open-access-home">Ajustar agora</button>
          </div>
        </div>
      </section>
    `));

    setTimeout(() => {
      const bw = $('#btn-warm'); if (bw) bw.addEventListener('click', toastWarm);
      const b = $('#open-access-home');
      if (b) b.addEventListener('click', () => $('#accessibility-panel').classList.remove('hidden'));

      const guideBtn = $('#open-site-guide');
      const guidePanel = $('#site-guide-panel');
      if (guideBtn && guidePanel) {
        guideBtn.addEventListener('click', () => {
          const isOpen = !guidePanel.classList.contains('hidden');
          guidePanel.classList.toggle('hidden', isOpen);
          guideBtn.setAttribute('aria-expanded', String(!isOpen));
        });
      }
    }, 30);

    return root;
  }

  // =========================================================
  // 8. PÁGINA: MAPA SENSORIAL
  // =========================================================
  function renderMapa() {
    const root = document.createElement('div');
    root.appendChild(pageHead('Encontre lugares que combinam com você',
      'Cada local traz informações sobre ruído, iluminação, movimento e cheiros — avaliados por pessoas como você.',
      'i-map', 'Mapa Sensorial'));

    const searchWrap = el('div', { class: 'map-search-wrap fade-in delay-1' });
    searchWrap.appendChild(h(`
      <div class="map-search">
        ${ico('i-search')}
        <input id="map-search-input" type="search" placeholder="Buscar nome do lugar..." value="${state.searchQuery.replace(/"/g,'&quot;')}"/>
      </div>
      <div class="map-city-filter">
        <button class="city-pill ${state.cityFilter === 'all' ? 'active' : ''}" data-city="all">
          ${ico('i-pin')} Todos
        </button>
        <button class="city-pill ${state.cityFilter === 'Cuiabá' ? 'active' : ''}" data-city="Cuiabá">
          ${ico('i-pin')} Cuiabá
        </button>
        <button class="city-pill ${state.cityFilter === 'Várzea Grande' ? 'active' : ''}" data-city="Várzea Grande">
          ${ico('i-pin')} Várzea Grande
        </button>
      </div>
    `));
    root.appendChild(searchWrap);

    const stimFilter = el('div', { class: 'stim-level fade-in delay-1' });
    stimFilter.appendChild(h(`
      <p class="stim-label">${ico('i-comfort')} Qual nível de estímulo você aguenta hoje?</p>
      <div class="stim-row">
        ${STIM_LEVEL.map(s => `
          <button class="stim-card ${state.selectedFilter === s.id ? 'active' : ''}" data-stim="${s.id}">
            <strong>${s.label}</strong>
            <small>${s.desc}</small>
          </button>
        `).join('')}
      </div>
    `));
    root.appendChild(stimFilter);

    const layout = el('div', { class: 'map-layout' });

    const mapView = el('div', { class: 'map-view fade-in delay-1' });
    mapView.appendChild(h(`<div class="map-graticule"></div>`));
    const filtered = filteredPlaces();
    const mapPlaces = filtered.length ? filtered.slice(0, 5) : PLACES.slice(0, 5);
    mapPlaces.forEach(p => {
      const isShown = filtered.some(x => x.id === p.id);
      const m = el('div', {
        class: 'map-marker' + (state.selectedPlace && state.selectedPlace.id === p.id ? ' selected' : '') + (isShown ? '' : ' dim'),
        style: `left:${p.pos.x}%;top:${p.pos.y}%;`,
        'data-mark': p.id
      });
      m.appendChild(h(`<div class="marker-pin">${ico(p.icon)}</div><div class="marker-label">${p.name}</div>`));
      mapView.appendChild(m);
    });

    const colLeft = el('div');
    colLeft.appendChild(mapView);
    layout.appendChild(colLeft);

    const colRight = el('div');
    if (state.selectedPlace) colRight.appendChild(placeCardLarge(state.selectedPlace));

    const listCard = el('div', { class: 'card fade-in delay-2 mt-5' });
    const filterLabel = state.cityFilter !== 'all' ? ` em ${state.cityFilter}` : '';
    const searchLabel = state.searchQuery ? ` — "${state.searchQuery}"` : '';
    listCard.appendChild(h(`<h3 style="margin-bottom: 12px;">${ico('i-search')} Locais com ${STIM_LEVEL.find(s=>s.id===state.selectedFilter).label.toLowerCase()}${filterLabel}${searchLabel}</h3>`));
    const list = el('div', { class: 'places-list' });
    filtered.forEach(p => {
      const c = el('button', {
        class: 'card place-card' + (state.selectedPlace && state.selectedPlace.id === p.id ? ' active' : ''),
        'data-place-btn': p.id
      });
      c.appendChild(h(`
        <div class="row-between mb-3">
          <div class="row align-center gap-2">
            <span class="fi-sky-sm">${ico(p.icon)}</span>
            <h4>${p.name}</h4>
          </div>
          <span class="chip chip-soft small">Conforto ${p.comfort}/10</span>
        </div>
        <p class="muted mb-3">${p.type} • ${p.address}${p.city ? ' • ' + p.city : ''}</p>
        ${comfortBar(p.comfort, 10).querySelector('.comfort-bar').outerHTML}
      `));
      list.appendChild(c);
    });
    if (filtered.length === 0) list.appendChild(h(`<div class="empty"><div class="ico">${ico('i-map')}</div><p>Nenhum lugar encontrado. Tente outra busca ou outro filtro.</p></div>`));
    listCard.appendChild(list);
    colRight.appendChild(listCard);

    layout.appendChild(colRight);
    root.appendChild(layout);
    return root;
  }

  function filteredPlaces() {
    const s = state.selectedFilter;
    let list;
    if (s === 'baixo') list = PLACES.filter(p => p.comfort >= 8);
    else if (s === 'medio') list = PLACES.filter(p => p.comfort >= 5 && p.comfort <= 8);
    else list = PLACES.filter(p => p.comfort <= 6);

    if (state.cityFilter && state.cityFilter !== 'all') {
      list = list.filter(p => (p.city || 'Cuiabá') === state.cityFilter);
    }
    const q = (state.searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.tagline || '').toLowerCase().includes(q)
      );
    }
    return list
      .sort((a,b) => b.comfort - a.comfort)
      .slice(0, 5);
  }

  function filteredByStim() { return filteredPlaces(); }

  function placeCardLarge(p) {
    const saved = state.savedPlaces.includes(p.id);
    const card = el('div', { class: 'card card-raised fade-in delay-1 mb-4' });
    card.appendChild(h(`
      <div class="place-header">
        <div>
          <span class="chip chip-soft mb-3">${ico(p.icon)} ${p.type}</span>
          <h3>${p.name}</h3>
          <div class="place-meta muted">${p.address}</div>
        </div>
        <button class="btn-ghost icon-btn" data-save="${p.id}" aria-label="Salvar lugar" title="Salvar">
          ${saved ? ico('i-heart') : ico('i-heart')}
        </button>
      </div>
      <p class="mt-3">${p.tagline}</p>
    `));
    card.appendChild(h(`<h4 class="mt-5 mb-3">Nível de conforto sensorial</h4>`));
    card.appendChild(comfortBar(p.comfort));
    const grid = el('div', { class: 'sensory-grid mt-5' });
    grid.innerHTML =
      sensoryPill('i-waves', 'Ruído', p.noise, NOISE_LABEL) +
      sensoryPill('i-sun', 'Iluminação', p.light, LIGHT_LABEL) +
      sensoryPill('i-people', 'Movimento', p.crowd, CROWD_LABEL) +
      sensoryPill('i-leaf', 'Cheiros', p.smell, SMELL_LABEL) +
      `<div class="sens-pill"><span class="sens-ico">${ico('i-check')}</span><div class="sens-val">${p.quietSpot ? 'Tem' : 'Não tem'}</div><div class="small muted">Área de descanso</div></div>` +
      `<div class="sens-pill"><span class="sens-ico">${ico('i-bell')}</span><div class="sens-val small">${p.quietTime}</div><div class="small muted">Horário calmo</div></div>`;
    card.appendChild(grid);
    card.appendChild(h(`
      <div class="mt-5 note-box">
        ${ico('i-write')} <strong>Dica:</strong> ${p.note}
      </div>
      <div class="row-between wrap mt-5">
        <button class="btn btn-secondary" data-nav="rotina" data-sub="hoje" data-place="${p.id}">${ico('i-calendar')} Adicionar à rotina</button>
        <button class="btn btn-primary" data-review="${p.id}">${ico('i-check')} Avaliar este local</button>
      </div>
    `));
    return card;
  }

  function initMapaInteractions() {
    $$('[data-stim]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedFilter = btn.getAttribute('data-stim');
        $$('[data-stim]').forEach(b => b.classList.toggle('active', b === btn));
        render();
      });
    });
    const searchInput = $('#map-search-input');
    if (searchInput) {
      let t = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.searchQuery = searchInput.value;
          render();
        }, 180);
      });
    }
    $$('[data-city]').forEach(pill => {
      pill.addEventListener('click', () => {
        state.cityFilter = pill.getAttribute('data-city') || 'all';
        render();
      });
    });
    $$('[data-mark]').forEach(m => {
      m.addEventListener('click', () => {
        state.selectedPlace = PLACES.find(p => p.id === m.getAttribute('data-mark')) || null;
        render();
      });
    });
    $$('[data-place-btn]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedPlace = PLACES.find(p => p.id === b.getAttribute('data-place-btn')) || null;
        render();
      });
    });
    const saveBtn = $('[data-save]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const id = saveBtn.getAttribute('data-save');
        const idx = state.savedPlaces.indexOf(id);
        if (idx > -1) { state.savedPlaces.splice(idx, 1); toast('Removido dos seus lugares'); }
        else { state.savedPlaces.push(id); toast('Adicionado aos seus lugares'); }
        saveState(); render();
      });
    }
    const reviewBtn = $('[data-review]');
    if (reviewBtn) reviewBtn.addEventListener('click', () => toast('Obrigado por querer ajudar! (Versão de demonstração)'));
  }

  // =========================================================
  // 9. PÁGINA: DESACELERAR
  // =========================================================
  function renderDesacelerar() {
    const root = document.createElement('div');
    root.appendChild(pageHead('Um espaço para desacelerar',
      'Quando o mundo ficar rápido demais, use estas ferramentas. Sem pressa.',
      'i-leaf', 'Espaço de Acolhimento'));

    // Botão crise
    const crisis = el('section', { class: 'calm-hero fade-in delay-1' });
    crisis.appendChild(h(`
      <button class="crisis-btn" data-nav="perfil" data-sub="crisis">
        <span class="crisis-icon">${ico('i-calm')}</span>
        <span class="crisis-text">
          <strong>Estou me sentindo sobrecarregado</strong>
          <small>Toque aqui para ajuda rápida</small>
        </span>
      </button>
    `));
    root.appendChild(crisis);

    // Grid 2x3
    const grid = el('section', { class: 'calm-grid fade-in delay-2' });
    const items = [
      { calm: 'breath',  icon: 'i-breath',  title: 'Respirar',       hint: 'Respiração guiada 4-7-8' },
      { calm: 'ground',  icon: 'i-eye',     title: 'Me acalmar',     hint: 'Técnicas de grounding' },
      { calm: 'sounds',  icon: 'i-waves',   title: 'Sons tranquilos', hint: 'Áudio ambiente leve' },
      { calm: 'steps',   icon: 'i-checklist', title: 'Exercícios rápidos', hint: '5 passos para voltar' },
      { calm: 'write',   icon: 'i-write',   title: 'Escrever',       hint: 'Desabafar no seu diário' },
      { calm: 'crisis',  icon: 'i-calm',    title: 'Modo crise',     hint: 'Passos para momentos difíceis' }
    ];
    items.forEach(it => {
      grid.appendChild(h(`
        <button class="calm-card" data-nav="${it.calm === 'write' ? 'perfil' : (it.calm === 'crisis' ? 'perfil' : 'desacelerar')}" ${it.calm === 'crisis' ? 'data-sub="crisis"' : it.calm === 'write' ? 'data-sub="diario"' : `data-sub="${it.calm}"`}>
          <span class="calm-ico">${ico(it.icon)}</span>
          <h3>${it.title}</h3>
          <small class="muted">${it.hint}</small>
        </button>
      `));
    });
    root.appendChild(grid);

    // Cards rápidos de técnica
    root.appendChild(h(`
      <section class="section fade-in delay-3">
        <div class="card">
          <h3 class="mb-3">${ico('i-heart')} Estratégias para momentos difíceis</h3>
          <div class="calm-tips">
            <div class="tip-card"><strong>1.</strong> Feche os olhos por 10 segundos e conte devagar até 10.</div>
            <div class="tip-card"><strong>2.</strong> Coloque a mão no peito e sinta a respiração.</div>
            <div class="tip-card"><strong>3.</strong> Identifique 3 coisas que você vê, 2 que ouve e 1 que toca.</div>
            <div class="tip-card"><strong>4.</strong> Diga para si mesmo: “Isso vai passar. Eu sou seguro.”</div>
          </div>
        </div>
      </section>
    `));

    return root;
  }

  // Respirar — respiração guiada 4-7-8
  function renderBreath() {
    const root = document.createElement('div');
    root.appendChild(backBtn('desacelerar', null, 'Voltar para Desacelerar'));
    root.appendChild(pageHead('Respiração guiada 4-7-8',
      'Siga o círculo: inspire enquanto ele cresce, segure, depois expire.',
      'i-breath', 'Respirar'));

    const card = el('section', { class: 'card fade-in delay-1 breath-card' });
    card.appendChild(h(`
      <div class="breath-wrap">
        <div class="breath-circle" id="breath-circle"></div>
        <div class="breath-label" id="breath-label">Preparar</div>
        <div class="breath-count" id="breath-count">3</div>
      </div>
      <div class="row-between wrap mt-5">
        <button class="btn btn-secondary" id="breath-toggle">${ico('i-breath')} Começar</button>
        <div class="muted small">Dica: você pode fechar os olhos e só seguir o som do seu coração.</div>
      </div>
    `));
    root.appendChild(card);

    setTimeout(() => {
      const circle = $('#breath-circle');
      const label = $('#breath-label');
      const count = $('#breath-count');
      const btn = $('#breath-toggle');
      if (!circle || !label || !count || !btn) return;
      let running = false;
      let timer = null;
      const phases = [
        { name: 'Inspire',    dur: 4000, cls: 'inhale'  },
        { name: 'Segure',     dur: 7000, cls: 'hold'    },
        { name: 'Expire',     dur: 8000, cls: 'exhale'  }
      ];
      const runPhase = (i) => {
        if (!running) return;
        const ph = phases[i % phases.length];
        circle.className = 'breath-circle ' + ph.cls;
        label.textContent = ph.name;
        let secs = Math.ceil(ph.dur / 1000);
        count.textContent = secs;
        timer = setInterval(() => {
          secs -= 1;
          if (secs <= 0) {
            clearInterval(timer);
            runPhase(i + 1);
          } else {
            count.textContent = secs;
          }
        }, 1000);
      };
      btn.onclick = () => {
        running = !running;
        if (running) {
          btn.innerHTML = ico('i-calm') + ' Parar';
          runPhase(0);
        } else {
          btn.innerHTML = ico('i-breath') + ' Começar';
          if (timer) clearInterval(timer);
          circle.className = 'breath-circle';
          label.textContent = 'Preparar';
          count.textContent = '3';
        }
      };
    }, 30);
    return root;
  }

  // Grounding — 5-4-3-2-1
  function renderGround() {
    const root = document.createElement('div');
    root.appendChild(backBtn('desacelerar', null, 'Voltar para Desacelerar'));
    root.appendChild(pageHead('Técnica 5-4-3-2-1',
      'Nomeie as coisas ao seu redor para voltar para o aqui e agora.',
      'i-eye', 'Me acalmar'));

    const passos = [
      { n: 5, t: 'Coisas que você VÊ',    i: 'i-eye',   tips: ['Uma janela', 'Sua mão', 'Uma planta', 'Um objeto colorido', 'O chão'] },
      { n: 4, t: 'Coisas que você TOCA',  i: 'i-hands', tips: ['Textura da sua roupa', 'Cadeira que você senta', 'Pele do seu braço', 'Um objeto frio'] },
      { n: 3, t: 'Coisas que você OUVE',  i: 'i-waves', tips: ['Sua respiração', 'Um som distante', 'Passos'] },
      { n: 2, t: 'Coisas que você CHEIRA',i: 'i-leaf',  tips: ['Perfume da roupa', 'Café', 'Sabonete'] },
      { n: 1, t: '1 coisa que GOSTA de sentir', i: 'i-heart', tips: ['Um abraço', 'Seu objeto de conforto', 'Calor do sol'] }
    ];

    const grid = el('section', { class: 'fade-in delay-1' });
    passos.forEach(p => {
      grid.appendChild(h(`
        <div class="card mb-4 ground-step">
          <div class="row align-start gap-3">
            <div class="ground-num">${p.n}</div>
            <div style="flex:1;">
              <h3 class="mb-2">${ico(p.i)} ${p.t}</h3>
              <p class="muted mb-2">Tente nomear mentalmente cada uma delas.</p>
              <div class="ground-tips">
                ${p.tips.map(t => `<span class="chip chip-soft small">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `));
    });
    root.appendChild(grid);

    root.appendChild(h(`
      <section class="section fade-in delay-2">
        <div class="card card-soft">
          <h3>${ico('i-heart')} Quando terminar</h3>
          <p class="muted mb-3">Respire fundo uma vez. Diga para si mesmo: “Estou aqui. Estou seguro.”</p>
          <div class="row wrap">
            <button class="btn btn-primary" data-nav="desacelerar" data-sub="breath">${ico('i-breath')} Respirar junto</button>
            <button class="btn btn-secondary" data-nav="perfil" data-sub="diario">${ico('i-book')} Registrar no diário</button>
          </div>
        </div>
      </section>
    `));
    return root;
  }

  // Sons tranquilos + músicas calmas (terapêuticas)
  function renderSounds() {
    const root = document.createElement('div');
    root.appendChild(backBtn('desacelerar', null, 'Voltar para Desacelerar'));
    root.appendChild(pageHead('Sons e músicas calmas',
      'Escolha um som ambiente ou música. Use fones se preferir. Toque quando precisar acalmar.',
      'i-waves', 'Sons'));

    const sons = [
      { id: 'chuva',    icon: 'i-leaf',   title: 'Chuva na janela',    hint: 'Som de gotas caindo devagar', type: 'noise' },
      { id: 'mar',      icon: 'i-waves',  title: 'Ondas do mar',       hint: 'Sobe e desce com calma',       type: 'noise' },
      { id: 'passaros', icon: 'i-heart',  title: 'Pássaros pela manhã',hint: 'Canto leve e alegre',          type: 'noise' },
      { id: 'floresta', icon: 'i-leaf',   title: 'Floresta calma',     hint: 'Vento nas folhas',             type: 'noise' },
      { id: 'branco',   icon: 'i-calm',   title: 'Ruído branco',       hint: 'Fundo constante e neutro',     type: 'noise' },
      { id: 'fogo',     icon: 'i-heart',  title: 'Lareira crepitante', hint: 'Calor e aconchego',            type: 'noise' },
      { id: 'piano432', icon: 'i-heart',  title: 'Piano 432 Hz',       hint: 'Notas calmas em 432Hz',        type: 'music' },
      { id: 'brown',    icon: 'i-waves',  title: 'Ruído marrom',       hint: 'Muito grave e relaxante',      type: 'noise' },
      { id: 'theta',    icon: 'i-calm',   title: 'Ondas Theta 6Hz',    hint: 'Binaural para meditação',      type: 'music' },
      { id: 'penta',    icon: 'i-heart',  title: 'Escala pentatônica', hint: 'Notas suaves em loop',         type: 'music' },
      { id: 'lofi',     icon: 'i-leaf',   title: 'Acordes Lo-Fi',      hint: 'Progressão acolhedora',        type: 'music' },
      { id: 'flute',    icon: 'i-leaf',   title: 'Flauta doce',        hint: 'Respiração suave e melódica',  type: 'music' },
      { id: 'ninar',    icon: 'i-calm',   title: 'Canção de ninar',    hint: 'Melodia de colo, bem tranquila', type: 'music' },
      { id: 'ciranda',  icon: 'i-heart',  title: 'Ciranda musical',    hint: 'Notas circulares, bem leves',  type: 'music' },
      { id: 'roda',     icon: 'i-leaf',   title: 'Roda de amigos',     hint: 'Ritmo feliz mas acolhedor',    type: 'music' }
    ];

    const wrap = el('section', { class: 'grid grid-2 fade-in delay-1' });
    sons.forEach(s => {
      wrap.appendChild(h(`
        <button class="card sound-card" data-sound="${s.id}" style="cursor:pointer;text-align:left;">
          <div class="row align-center gap-3 mb-2">
            <span class="sound-ico">${ico(s.icon)}</span>
            <h3 class="mb-0">${s.title}</h3>
            <span class="chip chip-soft small sound-play" id="snd-${s.id}">▶</span>
          </div>
          <p class="muted mb-0">${s.hint}</p>
        </button>
      `));
    });
    root.appendChild(wrap);

    setTimeout(() => {
      let current = null;
      let audioCtx = null;
      const nodes = {};

      const ensureCtx = () => {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
        return audioCtx;
      };

      // ==== SONS (ruído filtrado) com gains/freqs CORRIGIDOS ====
      const createNoise = (type) => {
        const ctx = ensureCtx();
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const rnd = Math.random() * 2 - 1;
          if (type === 'brown') {
            lastOut = (lastOut + (0.02 * rnd)) / 1.02;
            output[i] = lastOut * 3.5;
          } else {
            output[i] = rnd * (type === 'branco' ? 0.15 : 0.25);
          }
        }
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0.18;
        const filter = ctx.createBiquadFilter();
        switch (type) {
          case 'chuva':    filter.type = 'lowpass';   filter.frequency.value = 1200; gain.gain.value = 0.18; break;
          case 'mar':      filter.type = 'lowpass';   filter.frequency.value = 700;  gain.gain.value = 0.20; break;
          case 'floresta': filter.type = 'bandpass';  filter.frequency.value = 1600; filter.Q.value = 0.7; gain.gain.value = 0.20; break;
          case 'passaros': filter.type = 'highpass';  filter.frequency.value = 1100; gain.gain.value = 0.22; break;
          case 'fogo':     filter.type = 'lowpass';   filter.frequency.value = 500;  gain.gain.value = 0.19; break;
          case 'brown':    filter.type = 'lowpass';   filter.frequency.value = 400;  gain.gain.value = 0.20; break;
          case 'branco':   filter.type = 'lowpass';   filter.frequency.value = 1800; gain.gain.value = 0.16; break;
          default:         filter.type = 'lowpass';   filter.frequency.value = 1500; gain.gain.value = 0.17;
        }
        src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        return { src, gain, oscs: null };
      };

      // ==== MÚSICAS (sintetizadas via Web Audio) ====
      const createMusic = (type) => {
        const ctx = ensureCtx();
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.16;
        masterGain.connect(ctx.destination);
        const oscs = [];
        let src = null;
        const now = () => ctx.currentTime;

        const adsr = (gainNode, peak, t0, attack=0.08, decay=0.12, sustain=0.5, release=0.6) => {
          const g = gainNode.gain;
          g.cancelScheduledValues(t0);
          g.setValueAtTime(0.0001, t0);
          g.exponentialRampToValueAtTime(peak, t0 + attack);
          g.exponentialRampToValueAtTime(peak * sustain, t0 + attack + decay);
        };
        const stopADSR = (gainNode, t1, release=0.5) => {
          const g = gainNode.gain;
          try {
            const cur = g.value;
            g.cancelScheduledValues(t1);
            g.setValueAtTime(Math.max(cur, 0.0001), t1);
            g.exponentialRampToValueAtTime(0.0001, t1 + release);
          } catch (_) {}
        };

        if (type === 'piano432') {
          // Notas em 432Hz: A4=432 → C4 ~ 256.87Hz, D4 ~ 288Hz, E4 ~ 323.6Hz, G4 ~ 384Hz
          const notes = [256.87, 288.0, 323.63, 384.0, 323.63, 288.0];
          const stepLen = 0.85;
          let t = now() + 0.02;
          const scheduler = setInterval(() => {
            if (!masterGain?.connect) { clearInterval(scheduler); return; }
            for (let n = 0; n < 2; n++) {
              const ni = (Math.floor(t / stepLen) + n) % notes.length;
              const freq = notes[ni];
              const startT = Math.max(t, now() + 0.01) + n * 0.02;
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.type = 'sine'; osc.frequency.value = freq;
              osc.connect(g); g.connect(masterGain);
              adsr(g, 0.24, startT, 0.05, 0.25, 0.35, 1.4);
              osc.start(startT);
              osc.stop(startT + 1.7);
              oscs.push(osc);
              setTimeout(() => { const i = oscs.indexOf(osc); if (i>=0) oscs.splice(i,1); }, 2000);
            }
            t += stepLen;
          }, 820);
          src = { stop: () => { clearInterval(scheduler); stopAllOSCs(); } };

        } else if (type === 'theta') {
          // Binaural Theta: 200Hz + 206Hz (diferença 6Hz = theta)
          const baseL = 200, baseR = 206;
          const merger = ctx.createChannelMerger(2);
          const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = baseL;
          const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = baseR;
          const gL = ctx.createGain(); gL.gain.value = 0.22;
          const gR = ctx.createGain(); gR.gain.value = 0.22;
          oscL.connect(gL); gL.connect(merger, 0, 0);
          oscR.connect(gR); gR.connect(merger, 0, 1);
          merger.connect(masterGain);
          masterGain.gain.value = 0.20;
          oscL.start(); oscR.start();
          oscs.push(oscL, oscR);
          src = { stop: () => { stopADSR(gL, now()); stopADSR(gR, now()); oscL.stop(now()+0.6); oscR.stop(now()+0.6); } };

        } else if (type === 'penta') {
          // Pentatônica C: C D E G A
          const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63];
          const stepLen = 0.55;
          let t = now() + 0.02;
          const scheduler = setInterval(() => {
            if (!masterGain?.connect) { clearInterval(scheduler); return; }
            const ni = Math.floor(t / stepLen) % notes.length;
            const freq = notes[ni];
            const startT = Math.max(t, now() + 0.01);
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle'; osc.frequency.value = freq;
            osc.connect(g); g.connect(masterGain);
            adsr(g, 0.22, startT, 0.04, 0.18, 0.4, 0.9);
            osc.start(startT); osc.stop(startT + 1.0);
            oscs.push(osc);
            setTimeout(() => { const i = oscs.indexOf(osc); if (i>=0) oscs.splice(i,1); }, 1200);
            t += stepLen;
          }, 540);
          src = { stop: () => { clearInterval(scheduler); stopAllOSCs(); } };

        } else if (type === 'lofi') {
          // Progressão I-V-vi-IV (C G Am F), acordes de 3 notas
          const chords = [
            [261.63, 329.63, 392.0],   // C
            [196.0,  246.94, 293.66],  // G
            [220.0,  261.63, 329.63],  // Am
            [174.61, 220.0,  261.63]   // F
          ];
          const stepLen = 2.4;
          let t = now() + 0.02;
          const scheduler = setInterval(() => {
            if (!masterGain?.connect) { clearInterval(scheduler); return; }
            const ci = Math.floor(t / stepLen) % chords.length;
            const startT = Math.max(t, now() + 0.02);
            chords[ci].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.type = 'sine'; osc.frequency.value = freq;
              osc.connect(g); g.connect(masterGain);
              adsr(g, 0.10, startT + i*0.04, 0.12, 0.4, 0.7, 1.2);
              osc.start(startT + i*0.04); osc.stop(startT + stepLen - 0.05);
              oscs.push(osc);
            });
            setTimeout(() => { oscs.splice(0, Math.min(3, oscs.length)); }, stepLen*1000 + 200);
            t += stepLen;
          }, stepLen*1000);
          src = { stop: () => { clearInterval(scheduler); stopAllOSCs(); } };
          masterGain.gain.value = 0.18;

        } else if (type === 'flute') {
          // Flauta: osc triangle + leve vibrato, nota longa G4
          const baseFreq = 392.0;
          const osc = ctx.createOscillator();
          osc.type = 'triangle'; osc.frequency.value = baseFreq;
          const vibratoOsc = ctx.createOscillator(); vibratoOsc.frequency.value = 5.2;
          const vibratoGain = ctx.createGain(); vibratoGain.gain.value = 1.8;
          vibratoOsc.connect(vibratoGain); vibratoGain.connect(osc.frequency);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass'; filter.frequency.value = 2600;
          const g = ctx.createGain();
          osc.connect(filter); filter.connect(g); g.connect(masterGain);
          adsr(g, 0.28, now() + 0.02, 0.25, 0.4, 0.85, 1.5);
          osc.start(); vibratoOsc.start();
          oscs.push(osc, vibratoOsc);
          src = { stop: () => { stopADSR(g, now(), 1.0); osc.stop(now()+1.1); vibratoOsc.stop(now()+1.1); } };
          masterGain.gain.value = 0.17;

        } else if (type === 'ninar') {
          // Canção de ninar: progressão Em - G - C - D (acordes suaves)
          const chords = [
            [164.81, 196.00, 246.94],  // Em (E3, G3, B3)
            [196.00, 246.94, 293.66],  // G  (G3, B3, D4)
            [130.81, 164.81, 196.00],  // C  (C3, E3, G3)
            [146.83, 185.00, 220.00]   // D  (D3, F#3, A3)
          ];
          const stepLen = 3.0;
          let t = now() + 0.02;
          const scheduler = setInterval(() => {
            if (!masterGain?.connect) { clearInterval(scheduler); return; }
            const ci = Math.floor(t / stepLen) % chords.length;
            const startT = Math.max(t, now() + 0.02);
            chords[ci].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.type = 'sine'; osc.frequency.value = freq;
              osc.connect(g); g.connect(masterGain);
              adsr(g, 0.09, startT + i*0.06, 0.18, 0.6, 0.82, 1.6);
              osc.start(startT + i*0.06); osc.stop(startT + stepLen - 0.08);
              oscs.push(osc);
            });
            setTimeout(() => { oscs.splice(0, Math.min(3, oscs.length)); }, stepLen*1000 + 300);
            t += stepLen;
          }, stepLen*1000);
          src = { stop: () => { clearInterval(scheduler); stopAllOSCs(); } };
          masterGain.gain.value = 0.18;

        } else if (type === 'ciranda') {
          // Ciranda: notas circulares C4 D4 E4 F4 G4 F4 E4 D4
          const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
          const stepLen = 0.65;
          let t = now() + 0.02;
          const scheduler = setInterval(() => {
            if (!masterGain?.connect) { clearInterval(scheduler); return; }
            const ni = Math.floor(t / stepLen) % notes.length;
            const freq = notes[ni];
            const startT = Math.max(t, now() + 0.01);
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle'; osc.frequency.value = freq;
            osc.connect(g); g.connect(masterGain);
            adsr(g, 0.22, startT, 0.06, 0.22, 0.55, 0.85);
            osc.start(startT); osc.stop(startT + 0.95);
            oscs.push(osc);
            setTimeout(() => { const i = oscs.indexOf(osc); if (i>=0) oscs.splice(i,1); }, 1100);
            t += stepLen;
          }, 640);
          src = { stop: () => { clearInterval(scheduler); stopAllOSCs(); } };
          masterGain.gain.value = 0.17;

        } else if (type === 'roda') {
          // Roda de amigos: melodia alegre mas suave, passo rápido
          const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66];
          const stepLen = 0.48;
          let t = now() + 0.02;
          const scheduler = setInterval(() => {
            if (!masterGain?.connect) { clearInterval(scheduler); return; }
            for (let n = 0; n < 2; n++) {
              const ni = (Math.floor(t / stepLen) + n) % notes.length;
              const freq = notes[ni];
              const startT = Math.max(t, now() + 0.01) + n * 0.018;
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.type = 'sine'; osc.frequency.value = freq;
              osc.connect(g); g.connect(masterGain);
              adsr(g, 0.20, startT, 0.04, 0.18, 0.5, 0.75);
              osc.start(startT); osc.stop(startT + 0.85);
              oscs.push(osc);
              setTimeout(() => { const i = oscs.indexOf(osc); if (i>=0) oscs.splice(i,1); }, 1000);
            }
            t += stepLen;
          }, 470);
          src = { stop: () => { clearInterval(scheduler); stopAllOSCs(); } };
          masterGain.gain.value = 0.17;
        }

        const stopAllOSCs = () => {
          const t1 = now();
          oscs.slice().forEach(o => {
            try {
              if (o.stop) o.stop(t1 + 0.4);
            } catch (_) {}
          });
          try { masterGain.gain.cancelScheduledValues(t1); masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value,0.0001),t1); masterGain.gain.exponentialRampToValueAtTime(0.0001, t1+0.45); } catch(_){}
        };

        return { src, gain: masterGain, oscs };
      };

      // Quando parar, parar todos
      const stopCurrent = () => {
        if (current && nodes[current]) {
          const n = nodes[current];
          try {
            if (n.oscs) n.oscs.forEach(o => { try { if (o.stop) o.stop(audioCtx?.currentTime||0); } catch(_){} });
            if (n.src && n.src.stop) n.src.stop();
          } catch (_) {}
          try { if (n.gain) n.gain.disconnect(); } catch(_){}
          delete nodes[current];
          const prev = document.getElementById('snd-' + current);
          if (prev) prev.textContent = '▶';
          current = null;
        }
      };

      $$('[data-sound]').forEach(c => c.onclick = () => {
        const id = c.getAttribute('data-sound');
        const chip = document.getElementById('snd-' + id);
        if (current === id) { stopCurrent(); return; }
        stopCurrent();
        if (!state.soundEnabled) {
          toast('Habilite o som nas configurações de acessibilidade.');
          return;
        }
        try {
          const def = sons.find(s => s.id === id);
          if (!def) return;
          nodes[id] = def.type === 'music' ? createMusic(id) : createNoise(id);
          if (nodes[id].src && nodes[id].src.start) nodes[id].src.start();
          current = id;
          if (chip) chip.textContent = '⏸';
          try { currentSounds.set(id, nodes[id]); } catch(_){}
        } catch(e) {
          console.error(e);
          toast('Não foi possível reproduzir. Tente outro ou habilite o som.');
        }
      });
    }, 30);

    root.appendChild(h(`
      <section class="card card-soft mt-5 fade-in delay-2">
        <h3>${ico('i-heart')} Dica</h3>
        <p class="muted mb-0">Ouça quando sentir que o ambiente está intenso, antes de dormir ou quando precisar de um minuto só seu. Use fones para maior imersão.</p>
      </section>
    `));
    return root;
  }

  // Exercícios rápidos — 5 passos
  function renderSteps() {
    const root = document.createElement('div');
    root.appendChild(backBtn('desacelerar', null, 'Voltar para Desacelerar'));
    root.appendChild(pageHead('5 passos para voltar',
      'Exercícios rápidos de corpo e mente. Faça cada um no seu tempo.',
      'i-checklist', 'Exercícios'));

    const steps = [
      { t: 'Pisque devagar 10 vezes',   i: 'i-eye',   d: 'Abra e feche os olhos devagar, contando cada piscada.' },
      { t: 'Gire os ombros 5 vezes',    i: 'i-hands', d: 'Para frente e depois para trás, sem pressa.' },
      { t: 'Abra e feche as mãos',      i: 'i-heart', d: 'Aperte bem os punhos por 3 segundos, depois solte. Repita 3 vezes.' },
      { t: 'Balançar suave o tronco',   i: 'i-breath',d: 'Incline devagar para um lado e para o outro, como se fosse um pé de vento.' },
      { t: 'Um sorriso de gratidão',    i: 'i-heart', d: 'Pense em uma coisa pequena que te deixou feliz hoje. Sorria para ela.' }
    ];

    const wrap = el('section', { class: 'fade-in delay-1' });
    steps.forEach((s, idx) => {
      wrap.appendChild(h(`
        <div class="card step-card mb-4" data-step="${idx}">
          <div class="row-between align-center mb-3">
            <div class="row align-center gap-3">
              <div class="step-num">${idx + 1}</div>
              <h3 class="mb-0">${ico(s.i)} ${s.t}</h3>
            </div>
            <button class="btn-ghost step-done" data-done="${idx}">${ico('i-check')} Feito</button>
          </div>
          <p class="muted mb-0">${s.d}</p>
        </div>
      `));
    });
    root.appendChild(wrap);

    setTimeout(() => {
      const done = new Set();
      $$('.step-done').forEach(b => b.onclick = () => {
        const i = Number(b.getAttribute('data-done'));
        done.add(i);
        const card = document.querySelector(`[data-step="${i}"]`);
        if (card) card.classList.add('done');
        if (done.size === steps.length) toast('Parabéns! Você completou todos os passos. 💙');
      });
    }, 30);

    return root;
  }

  function initAcolhimentoInteractions() {
    const mode = state.calmMode;
    if (!mode) return;
  }

  // =========================================================
  // 10. PÁGINA: ROTINA
  // =========================================================
  function renderRotina() {
    const root = document.createElement('div');
    root.appendChild(pageHead('Sua rotina, organizada com calma',
      'Monte seus compromissos, veja quais estímulos esperar e se prepare para sair.',
      'i-calendar', 'Rotina'));

    const subNav = el('div', { class: 'subnav simple-subnav fade-in delay-1' });
    const tabs = [
      { k: 'hoje',     label: 'Hoje',            icon: 'i-calendar' },
      { k: 'planejar', label: 'Planejar',        icon: 'i-write' },
      { k: 'preparar', label: 'Preparar saída',  icon: 'i-bag' }
    ];
    tabs.forEach(t => {
      subNav.appendChild(h(`
        <button class="sn-btn ${state.subNav === t.k ? 'active' : ''}" data-nav="rotina" data-subnav="${t.k}">
          ${ico(t.icon)} <span>${t.label}</span>
        </button>
      `));
    });
    root.appendChild(subNav);

    const view = state.subNav;

    if (view === 'hoje' || !view) {
      const tl = el('section', { class: 'routine-layout fade-in delay-2' });
      const today = el('div', { class: 'card today-card' });
      today.appendChild(h(`
        <div class="row-between align-center mb-4">
          <h3 class="mb-0">${ico('i-calendar')} Hoje</h3>
          <span class="chip chip-soft">${state.routine.length} atividade(s)</span>
        </div>
      `));
      const tlWrap = el('div', { class: 'routine-timeline' });
      if (state.routine.length === 0) {
        tlWrap.appendChild(h(`<div class="empty"><div class="ico">${ico('i-calendar')}</div><p>Nenhuma atividade para hoje. Planeje algo abaixo.</p></div>`));
      } else {
        state.routine.forEach(item => {
          const p = item.placeId ? PLACES.find(x => x.id === item.placeId) : null;
          const stimuli = [];
          if (p) {
            if (p.noise >= 4) stimuli.push(`<span class="chip chip-sun small">${ico('i-waves')} Ruído alto</span>`);
            if (p.crowd >= 4) stimuli.push(`<span class="chip chip-lilac small">${ico('i-people')} Multidão</span>`);
            if (p.light >= 4) stimuli.push(`<span class="chip chip-sky small">${ico('i-sun')} Luz forte</span>`);
            if (p.smell >= 4) stimuli.push(`<span class="chip chip-sage small">${ico('i-leaf')} Cheiros fortes</span>`);
            if (p.comfort <= 4) stimuli.push(`<span class="chip chip-warn small">${ico('i-calm')} Possível desconforto</span>`);
          }
          tlWrap.appendChild(h(`
            <div class="rt-item" data-rt="${item.id}">
              <div class="rt-time">${item.time}</div>
              <div class="rt-info">
                <div class="row align-center gap-2 mb-1">
                  ${p ? ico(p.icon) : ico('i-calendar')}
                  <h4>${p ? p.name : item.place}</h4>
                </div>
                ${item.note ? `<p class="muted mb-0">${item.note}</p>` : ''}
                ${stimuli.length ? `<div class="stimuli-chips mt-2">${stimuli.join('')}</div>` : ''}
              </div>
              <div class="rt-actions">
                <button class="btn-ghost icon-btn" data-up="${item.id}" aria-label="Mover para cima">↑</button>
                <button class="btn-ghost icon-btn" data-del="${item.id}" aria-label="Remover">✕</button>
              </div>
            </div>
          `));
        });
      }
      today.appendChild(tlWrap);
      tl.appendChild(today);
      tl.appendChild(renderPrepCard());
      root.appendChild(tl);
    } else if (view === 'planejar') {
      const card = el('section', { class: 'card fade-in delay-2 mt-5' });
      card.appendChild(h(`
        <h3 class="mb-4">${ico('i-write')} Adicionar compromisso</h3>
        <div class="add-rt">
          <div class="field">
            <label class="label">Horário</label>
            <input class="input" id="rt-time" type="time" value="10:00"/>
          </div>
          <div class="field">
            <label class="label">Local</label>
            <select class="input" id="rt-place">
              <option value="">Escolher ou digitar...</option>
              ${PLACES.map(p => `<option value="${p.id}">${p.name} (${p.city || 'Cuiabá'})</option>`).join('')}
              <option value="__custom">Outro (escrever observação)</option>
            </select>
          </div>
          <div class="field">
            <label class="label">Observação</label>
            <input class="input" id="rt-note" placeholder="Levar fone, documento, dinheiro..." />
          </div>
          <button class="btn btn-primary" id="rt-add">Adicionar</button>
        </div>
      `));
      root.appendChild(card);
    } else if (view === 'preparar') {
      root.appendChild(renderPreparar());
    }

    return root;
  }

  function renderPrepCard() {
    const card = el('div', { class: 'card prep-card fade-in delay-2' });
    card.appendChild(h(`<h3 class="mb-3">${ico('i-bell')} Como se preparar?</h3>`));
    if (state.routine.length === 0) {
      card.appendChild(h(`<p class="muted mb-0">Quando adicionar compromissos, dicas personalizadas aparecerão aqui.</p>`));
      return card;
    }
    const dicas = [];
    const lugares = state.routine.filter(r => r.placeId).map(r => ({r, p: PLACES.find(x => x.id === r.placeId)}));
    const pico = lugares.find(({p}) => p && p.crowd >= 4);
    if (pico) dicas.push(`<strong>${pico.p.name}</strong> pode ter movimento. Considere ir em: <strong>${pico.p.quietTime}</strong>.`);
    const ruido = lugares.find(({p}) => p && p.noise >= 4);
    if (ruido) dicas.push(`Leve <strong>protetores auriculares ou fones</strong> — o ruído no <strong>${ruido.p.name}</strong> costuma ser alto.`);
    const temLugarCalmo = lugares.some(({p}) => p && !p.quietSpot);
    if (temLugarCalmo) dicas.push(`Alguns locais não têm área de descanso. Combine um lugar calmo logo após, se puder.`);
    if ((state.profile.sensory.crowd || 0) >= 3) dicas.push(`Você relatou sensibilidade a multidões — horários alternativos fazem diferença.`);
    if ((state.profile.sensory.sound || 0) >= 3) dicas.push(`Se o som aumentar, não se culpe por procurar um canto mais silencioso.`);
    if (dicas.length === 0) dicas.push('Tudo certo para este planejamento. Reserve 10 minutos extras entre cada compromisso.');
    const ul = el('div', { style: 'display:flex;flex-direction:column;gap:12px;margin-top: 8px;' });
    dicas.forEach((d, i) => ul.appendChild(h(`
      <div class="tip-row"><span class="tip-num">${i+1}</span><p style="margin:0;">${d}</p></div>
    `)));
    card.appendChild(ul);
    return card;
  }

  function renderPreparar() {
    const wrap = el('div', { class: 'fade-in delay-2' });
    const card = el('div', { class: 'card mt-5' });
    card.appendChild(h(`
      <h3 class="mb-4">${ico('i-bag')} Preparar para sair</h3>
      <p class="muted mb-4">Marque os itens do seu kit conforto — isso ajuda a lembrar antes de sair.</p>
      <div class="grid grid-3 prep-grid">
        ${[
          { i: 'i-waves', t: 'Protetores auriculares / fones' },
          { i: 'i-sun',   t: 'Óculos de sol / lentes' },
          { i: 'i-heart', t: 'Objeto de conforto' },
          { i: 'i-checklist', t: 'Documentos / dinheiro' },
          { i: 'i-leaf',  t: 'Água e lanchinho' },
          { i: 'i-calendar', t: 'Horário e local salvos' }
        ].map(x => `
          <label class="prep-item">
            <span class="prep-ico">${ico(x.i)}</span>
            <span>${x.t}</span>
            <input type="checkbox" class="prep-check"/>
            <span class="prep-mark">${ico('i-check')}</span>
          </label>
        `).join('')}
      </div>
    `));
    wrap.appendChild(card);
    return wrap;
  }

  function renderSair() {
    const wrap = el('div', { class: 'fade-in delay-2' });
    const card = el('div', { class: 'card mt-5' });
    card.appendChild(h(`
      <h3 class="mb-4">${ico('i-checklist')} Checklist para sair</h3>
      <p class="muted mb-4">Marque cada item quando se sentir seguro.</p>
      <div class="checklist-list">
        ${LEAVE_CHECKLIST.map(it => `
          <label class="cl-item ${state.checklist[it.id] ? 'checked' : ''}">
            <span class="cl-check">${state.checklist[it.id] ? ico('i-check') : ''}</span>
            <span>${it.label}</span>
            <input type="checkbox" class="cl-input" data-cl="${it.id}" ${state.checklist[it.id] ? 'checked' : ''}/>
          </label>
        `).join('')}
      </div>
      <div class="mt-5 row-between wrap">
        <button class="btn btn-secondary" id="reset-cl">Limpar marcações</button>
        <button class="btn btn-primary" data-nav="desacelerar">${ico('i-leaf')} Se precisar, desacelere</button>
      </div>
    `));
    wrap.appendChild(card);
    return wrap;
  }

  function initCuidadoresInteractions() {
    // Placeholder para interações específicas da página de cuidadores
    // O bindNav global já lida com cliques em [data-cg-section] (sem data-nav).
    // Esta função existe para expandir com scroll suave, animações, etc.
  }

  function initRotinaInteractions() {
    const addBtn = $('#rt-add');
    if (addBtn) addBtn.addEventListener('click', () => {
      const time = $('#rt-time').value || '10:00';
      const placeV = $('#rt-place').value;
      const note = $('#rt-note').value.trim();
      let item;
      if (placeV && placeV !== '__custom') {
        const p = PLACES.find(x => x.id === placeV);
        item = { id: 'r' + Date.now(), time, place: p ? p.name : 'Local', placeId: placeV, note };
      } else {
        item = { id: 'r' + Date.now(), time, place: note || 'Compromisso', placeId: null, note };
      }
      state.routine.push(item);
      state.routine.sort((a,b) => a.time.localeCompare(b.time));
      saveState();
      toast('Adicionado à sua rotina');
      state.subNav = 'hoje';
      render();
    });
    $$('[data-del]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-del');
      state.routine = state.routine.filter(r => r.id !== id);
      saveState(); render();
    }));
    $$('[data-up]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-up');
      const i = state.routine.findIndex(r => r.id === id);
      if (i > 0) {
        [state.routine[i-1], state.routine[i]] = [state.routine[i], state.routine[i-1]];
        saveState(); render();
      }
    }));
  }

  function initChecklistInteractions() {
    $$('.cl-input').forEach(inp => inp.addEventListener('change', () => {
      state.checklist[inp.getAttribute('data-cl')] = inp.checked;
      saveState(); render();
    }));
    const r = $('#reset-cl');
    if (r) r.addEventListener('click', () => {
      state.checklist = {};
      saveState(); render();
      toast('Marcações limpas');
    });
  }

  // =========================================================
  // 11. PERFIL HUB + SUB PÁGINAS
  // =========================================================
  function renderPerfilHub() {
    const root = document.createElement('div');
    root.appendChild(pageHead('Seu espaço',
      'Aqui estão todas as ferramentas pessoais: perfil, diário, sociais, cuidadores e configurações.',
      'i-user', 'Perfil'));

    const hasRole = !!state.profile.role;
    const hasLevel = !!state.profile.supportLevel;
    const hasName = !!state.profile.name;
    const fullySetup = hasRole && hasLevel;
    const careeMode = state.profile.role === 'cuidador';
    const careeName = state.profile.careeName;

    if (!fullySetup || state._editProfile) {
      const setup = el('div', { class: 'profile-setup fade-in delay-1' });
      const emergency = state.emergencyContact || getEmergencyContact();
      setup.appendChild(h(`
        <h3 class="mb-3">${ico('i-user')} ${fullySetup ? 'Editar seu perfil' : 'Vamos começar'}</h3>
        <p class="muted mb-5">${fullySetup ? 'Atualize seus dados quando quiser.' : 'Isso ajuda a deixar o Autiversi com a sua cara. Pode mudar depois.'}</p>
      `));

      setup.appendChild(h(`
        <div class="ps-name-inputs">
          <div class="field">
            <label class="label">Como podemos chamar você?</label>
            <input class="input" id="ps-name" type="text" placeholder="Seu primeiro nome" value="${state.profile.name || ''}" maxlength="40"/>
          </div>
          <div class="field">
            <label class="label">Idade (opcional)</label>
            <input class="input" id="ps-age" type="number" min="1" max="120" placeholder="Ex: 15" value="${state.profile.age || ''}"/>
          </div>
        </div>
      `));

      setup.appendChild(h(`
        <div class="card-soft emergency-profile-card mt-4 mb-5">
          <h4 class="mb-3">${ico('i-phone')} Contato de emergência</h4>
          <div class="ps-name-inputs">
            <div class="field">
              <label class="label">Nome do contato</label>
              <input class="input" id="ps-emergency-name" type="text" placeholder="Ex: Maria" value="${emergency.name || 'Contato de emergência'}" maxlength="40"/>
            </div>
            <div class="field">
              <label class="label">Telefone do contato</label>
              <input class="input" id="ps-emergency-phone" type="tel" placeholder="Ex: 11999999999" value="${sanitizePhone(emergency.personalNumber || emergency.number || '192') || '192'}" maxlength="20"/>
            </div>
          </div>
        </div>
      `));

      setup.appendChild(h(`<h4 class="mb-3">Eu sou:</h4>`));
      const roleGrid = el('div', { class: 'role-grid mb-5' });
      PROFILE_ROLES.forEach(r => {
        roleGrid.appendChild(h(`
          <button class="role-card ${state.profile.role === r.id ? 'active' : ''}" data-role="${r.id}">
            <span class="role-ico">${ico(r.id === 'autista' ? 'i-heart' : 'i-hands')}</span>
            <h4>${r.label}</h4>
            <p class="muted mb-0">${r.hint}</p>
          </button>
        `));
      });
      setup.appendChild(roleGrid);

      if (careeMode) {
        setup.appendChild(h(`
          <div class="alert-caregiver mb-5">
            <div class="ac-ico">${ico('i-hands')}</div>
            <div class="ac-body">
              <h4>💙 Para você, pai, mãe ou cuidador(a)</h4>
              <p class="mb-3"><strong>Os campos abaixo (nível de suporte e perfil sensorial) se referem À PESSOA AUTISTA sob seus cuidados</strong>, não a você. Assim nós organizamos melhor o conteúdo e evitamos confusões.</p>
              <div class="field mb-0">
                <label class="label">Nome da pessoa autista que você cuida (opcional, mas ajuda muito)</label>
                <input class="input" id="ps-caree-name" type="text" placeholder="Ex: Pedro, minha filha Clara..." value="${careeName || ''}" maxlength="40"/>
              </div>
            </div>
          </div>
        `));
      }

      const levelTitle = careeMode
        ? `${ico('i-hands')} Nível de suporte necessário para a pessoa autista que você cuida`
        : `${ico('i-hands')} Nível de suporte necessário`;
      const levelDesc = careeMode
        ? 'Marque o nível de suporte que a pessoa autista precisa (CID-11). Pode mudar a qualquer momento.'
        : 'Esta é uma referência geral do CID-11 para organizar o conteúdo. Pode mudar a qualquer momento.';
      setup.appendChild(h(`
        <h4 class="mb-3" id="ps-level-title">${levelTitle}</h4>
        <p class="muted mb-4" id="ps-level-desc">${levelDesc}</p>
      `));
      const levelList = el('div', { class: 'level-list mb-5' });
      SUPPORT_LEVELS.forEach(l => {
        const descText = careeMode ? (l.descCaregiver || l.desc) : l.desc;
        levelList.appendChild(h(`
          <button class="level-card ${state.profile.supportLevel === l.value ? 'active' : ''}" data-level="${l.value}">
            <span class="level-num">${l.value}</span>
            <div>
              <h4 class="mb-0">${l.label}</h4>
              <small class="muted" data-level-desc>${descText}</small>
            </div>
          </button>
        `));
      });
      setup.appendChild(levelList);

      if (fullySetup) {
        setup.appendChild(h(`
          <div class="row wrap gap-2">
            <button class="btn btn-primary" id="ps-save">${ico('i-check')} Salvar alterações</button>
            <button class="btn btn-secondary" id="ps-cancel">Cancelar edição</button>
          </div>
        `));
      } else {
        setup.appendChild(h(`
          <small class="muted">💡 Selecione as opções acima para continuar. Seu perfil fica salvo apenas neste navegador.</small>
        `));
      }

      root.appendChild(setup);

      setTimeout(() => {
        let pickedRole = state.profile.role;
        let pickedLevel = state.profile.supportLevel;

        $$('[data-role]').forEach(btn => btn.addEventListener('click', () => {
          pickedRole = btn.getAttribute('data-role');
          $$('[data-role]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.profile.role = pickedRole;
          saveState();
          if (!fullySetup) {
            toast('Papel salvo');
            render();
          } else {
            toast('Perfil atualizado');
            state._editProfile = true;
            render();
          }
        }));
        $$('[data-level]').forEach(btn => btn.addEventListener('click', () => {
          pickedLevel = Number(btn.getAttribute('data-level'));
          $$('[data-level]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.profile.supportLevel = pickedLevel;
          saveState();
          if (!fullySetup) {
            toast('Perfil configurado. Obrigado!');
            render();
          }
        }));

        const nIn = $('#ps-name'); if (nIn) nIn.addEventListener('input', e => {
          state.profile.name = e.target.value.trim().slice(0,40);
          saveState();
        });
        const aIn = $('#ps-age'); if (aIn) aIn.addEventListener('input', e => {
          const v = parseInt(e.target.value, 10);
          state.profile.age = (v && v > 0 && v < 121) ? v : null;
          saveState();
        });
        const pIn = $('#ps-phone'); if (pIn) pIn.addEventListener('input', e => {
          const digits = sanitizePhone(e.target.value);
          state.profile.phone = digits || null;
          saveState();
        });
        const emName = $('#ps-emergency-name'); if (emName) emName.addEventListener('input', e => {
          const name = e.target.value.trim() || 'Contato de emergência';
          state.emergencyContact = {
            ...(state.emergencyContact || {}),
            name,
            personalNumber: sanitizePhone(state.emergencyContact?.personalNumber || state.emergencyContact?.number || '192') || '192',
            number: sanitizePhone(state.emergencyContact?.personalNumber || state.emergencyContact?.number || '192') || '192',
            defaultNumber: '192'
          };
          saveState();
          renderEmergencyFloatingButton();
        });
        const emPhone = $('#ps-emergency-phone'); if (emPhone) emPhone.addEventListener('input', e => {
          const digits = sanitizePhone(e.target.value) || '192';
          state.emergencyContact = {
            ...(state.emergencyContact || {}),
            name: state.emergencyContact?.name || 'Contato de emergência',
            personalNumber: digits,
            number: digits,
            defaultNumber: '192'
          };
          saveState();
          renderEmergencyFloatingButton();
        });
        const cIn = $('#ps-caree-name'); if (cIn) cIn.addEventListener('input', e => {
          state.profile.careeName = e.target.value.trim().slice(0,40) || null;
          saveState();
        });

        const save = $('#ps-save'); if (save) save.onclick = () => { saveState(); toast('Perfil atualizado!'); state._editProfile = false; render(); };
        const cancel = $('#ps-cancel'); if (cancel) cancel.onclick = () => { state._editProfile = false; render(); };
      }, 30);
    } else {
      const roleLabel = PROFILE_ROLES.find(r => r.id === state.profile.role)?.label || '-';
      const levelObj = SUPPORT_LEVELS.find(l => l.value === state.profile.supportLevel);
      const levelLabel = levelObj ? levelObj.label : '-';
      const summary = el('section', { class: 'card fade-in delay-1 mb-5' });
      if (careeMode) {
        summary.appendChild(h(`
          <div class="ps-summary">
            <h4>${ico('i-hands')} ${state.profile.name ? 'Olá, ' + state.profile.name + '!' : 'Seu perfil de cuidador(a)'}</h4>
            <div class="ps-row"><span class="ps-label">Você (cuidador)</span><span class="ps-value">${state.profile.name || '—'}</span></div>
            ${state.profile.age ? `<div class="ps-row"><span class="ps-label">Sua idade</span><span class="ps-value">${state.profile.age} anos</span></div>` : ''}
            <div class="ps-row"><span class="ps-label">Seu contato</span><span class="ps-value">${state.profile.phone ? formatPhone(state.profile.phone) : '—'}</span></div>
            <div class="ps-row"><span class="ps-label">Seu papel</span><span class="ps-badge caregiver-badge">${roleLabel}</span></div>
            <div class="ps-divider"></div>
            <div class="ps-row ps-row-caree">
              <span class="ps-label">Pessoa autista sob seus cuidados</span>
              <span class="ps-value">${careeName || '—'}</span>
            </div>
            <div class="ps-row">
              <span class="ps-label">Nível de suporte dela/ele</span>
              <span class="ps-value"><strong>${levelLabel}</strong></span>
            </div>
          </div>
          <div class="row-between wrap">
            <p class="muted mb-0" style="max-width:500px;">Essas informações ajudam a organizar o conteúdo para você e para quem você cuida. Pode mudar a qualquer momento.</p>
            <button class="btn btn-secondary" id="edit-profile-btn">${ico('i-config')} Editar perfil</button>
          </div>
        `));
      } else {
        summary.appendChild(h(`
          <div class="ps-summary">
            <h4>${ico('i-user')} ${state.profile.name ? 'Olá, ' + state.profile.name + '!' : 'Seu perfil'}</h4>
            <div class="ps-row"><span class="ps-label">Nome</span><span class="ps-value">${state.profile.name || '—'}</span></div>
            <div class="ps-row"><span class="ps-label">Idade</span><span class="ps-value">${state.profile.age ? state.profile.age + ' anos' : '—'}</span></div>
            <div class="ps-row"><span class="ps-label">Contato</span><span class="ps-value">${state.profile.phone ? formatPhone(state.profile.phone) : '—'}</span></div>
            <div class="ps-row"><span class="ps-label">Perfil</span><span class="ps-badge">${roleLabel}</span></div>
            <div class="ps-row"><span class="ps-label">Nível de suporte</span><span class="ps-value">${levelLabel}</span></div>
          </div>
          <div class="row-between wrap">
            <p class="muted mb-0" style="max-width:500px;">Estas informações ajudam a organizar o conteúdo. Você pode mudar a qualquer momento.</p>
            <button class="btn btn-secondary" id="edit-profile-btn">${ico('i-config')} Editar perfil</button>
          </div>
        `));
      }
      root.appendChild(summary);

      setTimeout(() => {
        const eb = $('#edit-profile-btn'); if (eb) eb.onclick = () => { state._editProfile = true; render(); };
      }, 30);
    }

    const grid = el('div', { class: 'hub-grid fade-in delay-1' });
    const items = [
      { sub: 'sensorial',  icon: 'i-eye',      label: 'Perfil Sensorial',   hint: 'Conheça o que te afeta',  cls: 'hb-sky' },
      { sub: 'diario',     icon: 'i-book',     label: 'Diário de bem-estar',hint: 'Registre seus dias',      cls: 'hb-lilac' },
      { sub: 'salvos',     icon: 'i-heart',    label: 'Locais salvos',      hint: 'Seus lugares favoritos',  cls: 'hb-sage' },
      { sub: 'social',     icon: 'i-people',   label: 'Situações Sociais',  hint: 'Treinador e Tradutor',   cls: 'hb-sky' },
      { sub: 'cuidadores', icon: 'i-people',    label: 'Apoio Familiar',    hint: 'Dicas e guia de apoio',  cls: 'hb-lilac' },
      { sub: 'config',     icon: 'i-config',   label: 'Configurações',      hint: 'Personalize tudo',       cls: 'hb-sage' },
      { sub: 'privacidade',icon: 'i-lock',     label: 'Privacidade',        hint: 'Controle seus dados',    cls: 'hb-cream' }
    ];
    items.forEach(it => {
      grid.appendChild(h(`
        <button class="hub-card ${it.cls}" data-nav="perfil" data-sub="${it.sub}">
          <span class="hb-icon">${ico(it.icon)}</span>
          <h3>${it.label}</h3>
          <p class="muted mb-0">${it.hint}</p>
          <span class="hb-arrow">${ico('i-arrow-right')}</span>
        </button>
      `));
    });
    root.appendChild(grid);

    return root;
  }

  // Perfil Sensorial
  function hasProfile() {
    return Object.keys(state.profile.sensory || {}).length === SENSORY_QUESTIONS.length;
  }

  function renderPerfilSensorial() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', null, 'Voltar para o Perfil'));
    if (!hasProfile() || state._showQuiz) return renderQuiz(root);
    return renderPerfilResultado(root);
  }

  function renderQuiz(root) {
    const careeMode = state.profile.role === 'cuidador';
    const careeName = state.profile.careeName;
    const title = careeMode
      ? (careeName ? `Como funciona para ${careeName}?` : 'Conheça o que funciona para a pessoa autista que você cuida')
      : 'Conheça o que funciona para você';
    const subtitle = careeMode
      ? 'As respostas ficam apenas neste navegador. Não é diagnóstico.'
      : 'Suas respostas ficam apenas neste navegador. Não é diagnóstico.';
    root.appendChild(pageHead(title, subtitle, 'i-eye', 'Perfil Sensorial'));
    const total = SENSORY_QUESTIONS.length;
    const step = clamp(state.quizStep, 0, total - 1);
    const q = SENSORY_QUESTIONS[step];
    const currentV = state.profile.sensory[q.id];
    const quiz = el('div', { class: 'profile-quiz card card-lg fade-in' });
    quiz.appendChild(h(`
      <div class="quiz-progress"><div class="progress-fill" style="width:${(((step+1)/total)*100)}%"></div></div>
      <div class="quiz-step">
        <div class="mb-4">
          <span class="chip chip-soft mb-3">${ico(q.icon)} ${q.title}</span>
          <div class="small muted">Pergunta ${step + 1} de ${total}</div>
        </div>
        <h3>${q.question}</h3>
        <p class="hint">${q.hint}</p>
        <div class="options-grid">
          ${SENS_OPTIONS.map(o => `
            <button class="opt-card ${currentV === o.value ? 'selected' : ''}" data-val="${o.value}">
              <div class="opt-mark"></div>
              <div class="opt-label">${o.label}</div>
              <div class="opt-sm">${o.sub}</div>
            </button>
          `).join('')}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-secondary" id="quiz-prev" ${step === 0 ? 'disabled' : ''}>${ico('i-arrow')} Anterior</button>
          <button class="btn btn-primary" id="quiz-next" ${!currentV ? 'disabled' : ''}>
            ${step === total - 1 ? 'Ver meu perfil ' + ico('i-arrow-right') : 'Próxima ' + ico('i-arrow-right')}
          </button>
        </div>
        <div class="center mt-5">
          <small class="muted">Importante: isso é autoconhecimento, não diagnóstico médico.</small>
        </div>
      </div>
    `));
    root.appendChild(quiz);
    return root;
  }

  function renderPerfilResultado(root) {
    const careeMode = state.profile.role === 'cuidador';
    const careeName = state.profile.careeName;
    const title = careeMode
      ? (careeName ? `Perfil sensorial de ${careeName}` : 'Perfil sensorial da pessoa autista que você cuida')
      : 'Seu perfil sensorial';
    root.appendChild(pageHead(title,
      careeMode ? 'Use isso para planejar os dias dela/ele. Não é diagnóstico.' : 'Use isso para planejar seus dias. Não é diagnóstico.',
      'i-user', 'Resultado'));
    const grid = el('div', { class: 'grid grid-2' });
    const card = el('div', { class: 'card profile-results fade-in delay-1' });
    card.appendChild(h(`<h3 class="mb-4">Sensibilidades</h3>`));
    SENSORY_QUESTIONS.forEach(q => {
      const val = state.profile.sensory[q.id] || 2;
      const level = SENS_LEVEL(val);
      const fillW = ((val / 4) * 100).toFixed(0);
      card.appendChild(h(`
        <div class="sens-bar-row">
          <div class="row align-center gap-2 label">${ico(q.icon)} ${q.title}</div>
          <div class="sens-bar"><div class="fill fill-${level.cls}" style="width:${fillW}%"></div></div>
          <div class="sens-level">${level.label}</div>
        </div>
      `));
    });
    grid.appendChild(card);
    const c2 = el('div', { class: 'card fade-in delay-2' });
    c2.appendChild(h(`<h3 class="mb-3">${ico('i-heart')} Recomendações personalizadas</h3>`));
    const tips = [];
    if ((state.profile.sensory.sound || 0) >= 3) tips.push(ico('i-waves') + ' Leve sempre fones ou protetores em locais novos.');
    if ((state.profile.sensory.crowd || 0) >= 3) tips.push(ico('i-people') + ' Prefira horários alternativos em lojas e transportes.');
    if ((state.profile.sensory.light || 0) >= 3) tips.push(ico('i-sun') + ' Óculos de sol ou de luz azul ajudam em ambientes claros.');
    if ((state.profile.sensory.touch || 0) >= 3) tips.push(ico('i-hands') + ' Vista-se com roupas de tecidos que você já conhece.');
    if ((state.profile.sensory.smell || 0) >= 3) tips.push(ico('i-leaf') + ' Evite corredores de perfumação em supermercados.');
    if ((state.profile.sensory.social || 0) >= 3) tips.push(ico('i-chat') + ' Não se culpe por responder depois ou fazer pausas.');
    if (tips.length === 0) tips.push(ico('i-heart') + ' Continue experimentando para conhecer o que funciona.');
    const listT = el('div', { style: 'display:flex;flex-direction:column;gap:8px;' });
    tips.forEach(t => listT.appendChild(h(`<div class="tip-row"><span class="tip-icon">${ico('i-check')}</span><p style="margin:0;">${t}</p></div>`)));
    c2.appendChild(listT);
    c2.appendChild(h(`
      <div class="divider"></div>
      <div class="row wrap">
        <button class="btn btn-secondary" id="retake-quiz">${ico('i-waves')} Refazer questionário</button>
      </div>
    `));
    grid.appendChild(c2);
    root.appendChild(grid);
    root.appendChild(h(`
      <div class="grid grid-3 mt-5">
        <button class="card" data-nav="mapa" style="text-align:left;cursor:pointer;">
          <div class="feature-icon fi-sky">${ico('i-map')}</div>
          <div class="feature-text"><h3>Lugares recomendados</h3><p>Locais com bom conforto para o seu perfil.</p></div>
        </button>
        <button class="card" data-nav="perfil" data-sub="social" style="text-align:left;cursor:pointer;">
          <div class="feature-icon fi-cream">${ico('i-people')}</div>
          <div class="feature-text"><h3>Situações sociais</h3><p>Treine e interprete conversas.</p></div>
        </button>
        <button class="card" data-nav="rotina" data-subnav="planejar" style="text-align:left;cursor:pointer;">
          <div class="feature-icon fi-lilac">${ico('i-calendar')}</div>
          <div class="feature-text"><h3>Planejar rotina</h3><p>Organize seu dia com estímulos previsíveis.</p></div>
        </button>
      </div>
    `));
    return root;
  }

  function initQuizInteractions() {
    $$('.opt-card').forEach(c => c.addEventListener('click', () => {
      const q = SENSORY_QUESTIONS[state.quizStep];
      state.profile.sensory[q.id] = Number(c.getAttribute('data-val'));
      saveState(); render();
    }));
    const prev = $('#quiz-prev');
    const next = $('#quiz-next');
    if (prev) prev.addEventListener('click', () => { state.quizStep = Math.max(0, state.quizStep - 1); render(); });
    if (next) next.addEventListener('click', () => {
      const total = SENSORY_QUESTIONS.length;
      if (state.quizStep < total - 1) { state.quizStep++; render(); }
      else {
        state._showQuiz = false;
        toast('Seu perfil está pronto');
        render();
      }
    });
    const retake = $('#retake-quiz');
    if (retake) retake.addEventListener('click', () => { state.quizStep = 0; state._showQuiz = true; render(); });
  }

  // Diário
  function renderDiario() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', null, 'Voltar'));
    root.appendChild(pageHead('Diário de bem-estar',
      'Escreva, marque como foi o dia e encontre padrões com calma.',
      'i-book', 'Diário'));

    const today = new Date().toISOString().slice(0, 10);
    const card = el('div', { class: 'card fade-in delay-1' });
    card.appendChild(h(`
      <h3 class="mb-4">${ico('i-write')} Registrar agora</h3>
      <div class="field mb-4">
        <label class="label">Como você está se sentindo?</label>
        <div class="moods">
          ${MOOD_OPTIONS.map(m => `
            <button class="mood-btn" data-mood="${m.id}" data-value="${m.value}">
              <span class="mood-mark"></span>
              <span>${m.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="field mb-4">
        <label class="label">O que aconteceu hoje? (opcional)</label>
        <textarea class="textarea" id="diary-text" placeholder="Escreva no seu ritmo..."></textarea>
      </div>
      <div class="field mb-5">
        <label class="label">Marcadores</label>
        <div class="tag-wrap">
          ${TAG_OPTIONS.map(t => `
            <label class="tag-chip">
              <input type="checkbox" data-tag="${t.id}"/>
              <span>${ico(t.icon)} ${t.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <button class="btn btn-primary" id="diary-add">${ico('i-check')} Salvar no diário</button>
    `));
    root.appendChild(card);

    // Lista
    const list = el('div', { class: 'card fade-in delay-2 mt-5' });
    list.appendChild(h(`<h3 class="mb-4">${ico('i-book')} Histórico</h3>`));
    const wrap = el('div', { class: 'diary-list' });
    if (state.diary.length === 0) wrap.appendChild(h(`<div class="empty"><div class="ico">${ico('i-book')}</div><p>Nenhum registro ainda. O primeiro está acima.</p></div>`));
    else state.diary.slice().reverse().forEach(d => {
      const mood = MOOD_OPTIONS.find(m => m.id === d.mood) || MOOD_OPTIONS[2];
      const tags = (d.tags || []).map(tId => {
        const t = TAG_OPTIONS.find(x => x.id === tId);
        return t ? `<span class="chip chip-soft small">${ico(t.icon)} ${t.label}</span>` : '';
      }).join('');
      wrap.appendChild(h(`
        <div class="diary-item">
          <div class="row-between mb-2">
            <div class="row align-center gap-2">
              <span class="chip chip-sky small">${mood.label}</span>
              <small class="muted">${new Date(d.date).toLocaleDateString('pt-BR')} • ${new Date(d.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small>
            </div>
            <button class="btn-ghost icon-btn" data-diary-del="${d.id}" aria-label="Excluir">✕</button>
          </div>
          ${tags ? `<div class="mb-2">${tags}</div>` : ''}
          ${d.text ? `<p class="muted mb-0">${d.text}</p>` : ''}
        </div>
      `));
    });
    list.appendChild(wrap);
    root.appendChild(list);
    return root;
  }

  function initDiarioInteractions() {
    let selectedMood = null;
    $$('[data-mood]').forEach(b => b.addEventListener('click', () => {
      selectedMood = b.getAttribute('data-mood');
      $$('[data-mood]').forEach(x => x.classList.toggle('active', x === b));
    }));
    const add = $('#diary-add');
    if (add) add.addEventListener('click', () => {
      const txt = $('#diary-text').value.trim();
      if (!selectedMood && !txt) { toast('Marque um humor ou escreva algo.'); return; }
      const tags = $$('[data-tag]:checked').map(x => x.getAttribute('data-tag'));
      state.diary.push({ id: 'd'+Date.now(), date: new Date().toISOString(), mood: selectedMood || 'neutro', text: txt, tags });
      saveState();
      toast('Salvo no seu diário');
      render();
    });
    $$('[data-diary-del]').forEach(b => b.addEventListener('click', () => {
      state.diary = state.diary.filter(d => d.id !== b.getAttribute('data-diary-del'));
      saveState(); render();
    }));
  }

  // Locais salvos
  function renderLocaisSalvos() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', null, 'Voltar'));
    root.appendChild(pageHead('Locais salvos',
      'Seus lugares favoritos, salvos para acessar rápido.',
      'i-heart', 'Favoritos'));
    const list = el('div', { class: 'grid grid-3 fade-in delay-1' });
    const saved = PLACES.filter(p => state.savedPlaces.includes(p.id));
    if (saved.length === 0) list.appendChild(h(`<div class="empty"><div class="ico">${ico('i-heart')}</div><p>Você ainda não salvou nenhum lugar.</p><button class="btn btn-primary mt-3" data-nav="mapa">Explorar lugares</button></div>`));
    saved.forEach(p => {
      list.appendChild(h(`
        <button class="card" data-nav="mapa" data-place="${p.id}" style="text-align:left;cursor:pointer;">
          <div class="feature-icon fi-sky">${ico(p.icon)}</div>
          <div class="feature-text">
            <h3>${p.name}</h3>
            <p class="muted mb-2">${p.type} • ${p.address}</p>
            ${comfortBar(p.comfort).querySelector('.comfort-bar').outerHTML}
          </div>
        </button>
      `));
    });
    root.appendChild(list);
    return root;
  }

  // Radar
  function calcMatchScore(p) {
    if (!hasProfile()) return p.comfort;
    const s = state.profile.sensory;
    let score = p.comfort * 2;
    if (s.sound >= 3) score += (5 - p.noise) * 2;
    if (s.crowd >= 3) score += (5 - p.crowd) * 2;
    if (s.light >= 3) score += (5 - p.light) * 1.5;
    if (s.smell >= 3) score += (5 - p.smell) * 1.5;
    return score;
  }

  function renderRadar() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', null, 'Voltar'));
    root.appendChild(pageHead('Lugares recomendados',
      hasProfile() ? 'Lugares que combinam com o seu perfil.' : 'Faça seu perfil sensorial para ativar as recomendações.',
      'i-map', 'Recomendações'));
    const ranked = [...PLACES].sort((a,b) => calcMatchScore(b) - calcMatchScore(a));
    const grid = el('div', { class: 'grid grid-2 mt-5' });
    ranked.slice(0, 4).forEach((p, idx) => {
      grid.appendChild(h(`
        <div class="card match-card fade-in delay-${idx+1}">
          <div class="row-between align-start">
            <div class="row align-center gap-2 mb-3">
              <span class="fi-sky-sm">${ico(p.icon)}</span>
              <h3 class="mb-0">${p.name}</h3>
            </div>
            <span class="match-badge">${p.comfort}/10</span>
          </div>
          <p class="muted mb-3">${p.type} • ${p.address}</p>
          ${comfortBar(p.comfort).querySelector('.comfort-bar').outerHTML}
          <div class="row wrap mt-4">
            <button class="btn btn-secondary btn-sm" data-nav="mapa" data-place="${p.id}">${ico('i-pin')} Ver no mapa</button>
            <button class="btn btn-primary btn-sm" data-nav="rotina" data-subnav="planejar" data-place="${p.id}">${ico('i-calendar')} Na rotina</button>
          </div>
        </div>
      `));
    });
    root.appendChild(grid);
    if (!hasProfile()) root.appendChild(h(`
      <div class="card card-soft mt-5">
        <div class="row-between wrap">
          <div style="max-width:520px;">
            <h3>Ative as recomendações pessoais</h3>
            <p class="muted mb-0">São 6 perguntas rápidas. As recomendações cruzam seu perfil com os dados dos locais.</p>
          </div>
          <button class="btn btn-primary" data-nav="perfil" data-sub="sensorial">${ico('i-user')} Fazer meu perfil</button>
        </div>
      </div>
    `));
    return root;
  }

  // Situações Sociais (hub)
  function renderSocialHub() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', null, 'Voltar'));
    root.appendChild(pageHead('Situações Sociais',
      'Um lugar para entender, praticar e pedir ajuda com conversas e interações.',
      'i-people', 'Sociais'));
    const grid = el('div', { class: 'grid grid-2 mt-5' });
    grid.appendChild(h(`
      <button class="card scenario-card" data-nav="perfil" data-sub="treinador" style="text-align:left;cursor:pointer;">
        <div class="scenario-ico ico-sky">${ico('i-play')}</div>
        <div>
          <h3>Treinar uma conversa</h3>
          <p class="muted mb-0">Cenários reais: entrevista, loja, chamada telefônica. Sem punição.</p>
        </div>
      </button>
      <button class="card scenario-card" data-nav="perfil" data-sub="tradutor" style="text-align:left;cursor:pointer;">
        <div class="scenario-ico ico-lilac">${ico('i-chat')}</div>
        <div>
          <h3>Entender uma situação</h3>
          <p class="muted mb-0">Descreva o que aconteceu e veja possíveis interpretações + respostas.</p>
        </div>
      </button>
    `));
    root.appendChild(grid);

    root.appendChild(h(`
      <section class="section fade-in delay-2">
        <div class="card">
          <h3 class="mb-3">${ico('i-heart')} Lembretes gentis</h3>
          <div class="calm-tips">
            <div class="tip-card">Você não precisa entender tudo de primeira. Comunicação é duas vias.</div>
            <div class="tip-card">Silêncio não é vazio. Pode ser processamento.</div>
            <div class="tip-card">Se preferir, comunique-se por escrito — também é válido.</div>
            <div class="tip-card">Pedir ajuda para responder depois é um superpoder, não uma falha.</div>
          </div>
        </div>
      </section>
    `));
    return root;
  }

  // Treinador
  function renderTreinador() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', 'social', 'Voltar para Sociais'));
    root.appendChild(pageHead('Pratique situações do dia a dia',
      'Não existem erros graves aqui. O objetivo é experimentar.',
      'i-play', 'Treinador'));
    const scenarioId = state.scenarioId;
    if (!scenarioId) {
      const grid = el('div', { class: 'scenario-grid fade-in delay-1' });
      TRAINING_SCENARIOS.forEach(s => grid.appendChild(h(`
        <button class="card scenario-card" data-nav="perfil" data-sub="treinador" data-scenario="${s.id}">
          <div class="scenario-ico">${ico(s.icon)}</div>
          <div>
            <h4>${s.title}</h4>
            <p class="muted mb-0">${s.desc}</p>
          </div>
        </button>
      `)));
      root.appendChild(grid);
      return root;
    }
    const s = TRAINING_SCENARIOS.find(x => x.id === scenarioId);
    if (!s) { state.scenarioId = null; return renderTreinador(); }
    root.appendChild(h(`
      <div class="inter-scene fade-in delay-1">
        <span class="scene-tag">${ico(s.icon)} ${s.title}</span>
        <p>${s.scene}</p>
      </div>
    `));
    const card2 = el('div', { class: 'card fade-in delay-2' });
    card2.appendChild(h(`<h3 class="mb-4">${ico('i-chat')} Como você responde?</h3>`));
    const ans = el('div', { class: 'answers' });
    s.answers.forEach((a, i) => {
      const cls = state.selectedAnswer != null ? (a.type === 'correct' ? 'correct' : a.type === 'alt' ? 'alt' : 'avoid') : '';
      const active = state.selectedAnswer === i;
      ans.appendChild(h(`
        <div class="ans-card ${cls} ${active ? 'answered' : ''}" data-ans="${i}">
          ${active ? `<div class="ans-mark">${a.type === 'correct' ? ico('i-check') : ''}</div>` : ''}
          ${a.text}
        </div>
      `));
    });
    card2.appendChild(ans);
    if (state.selectedAnswer != null) {
      const picked = s.answers[state.selectedAnswer];
      card2.appendChild(h(`
        <div class="ans-feedback">
          <p class="mb-2"><strong style="color:var(--sage-700);">${ico('i-check')} O que funcionou:</strong> ${picked.worked}</p>
          ${picked.type !== 'correct' ? `<p class="mb-2"><strong style="color:var(--blue-400);">${ico('i-chat')} Outra possibilidade:</strong> experimente a resposta em destaque acima.</p>` : ''}
          <p class="mb-0"><strong style="color:var(--lilac-400);">${ico('i-heart')} Dica:</strong> ${picked.tip}</p>
        </div>
      `));
    }
    card2.appendChild(h(`
      <div class="row-between wrap mt-5">
        <button class="btn btn-secondary" id="back-scenarios">${ico('i-arrow')} Voltar aos cenários</button>
        <div class="row wrap">
          ${state.selectedAnswer != null ? `<button class="btn btn-secondary" id="reset-scene">${ico('i-waves')} Tentar de novo</button>` : ''}
          <button class="btn btn-primary" id="next-scene">Próxima situação ${ico('i-arrow-right')}</button>
        </div>
      </div>
    `));
    root.appendChild(card2);
    return root;
  }

  function initTreinadorInteractions() {
    $$('[data-ans]').forEach(c => c.addEventListener('click', () => {
      if (state.selectedAnswer != null) return;
      state.selectedAnswer = Number(c.getAttribute('data-ans'));
      render();
    }));
    const back = $('#back-scenarios');
    if (back) back.addEventListener('click', () => { state.scenarioId = null; state.selectedAnswer = null; render(); });
    const reset = $('#reset-scene');
    if (reset) reset.addEventListener('click', () => { state.selectedAnswer = null; render(); });
    const next = $('#next-scene');
    if (next) next.addEventListener('click', () => {
      const idx = TRAINING_SCENARIOS.findIndex(x => x.id === state.scenarioId);
      const nxt = TRAINING_SCENARIOS[(idx + 1) % TRAINING_SCENARIOS.length];
      state.scenarioId = nxt.id;
      state.selectedAnswer = null;
      render();
    });
  }

  // Tradutor Social
  function renderTradutor() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', 'social', 'Voltar para Sociais'));
    root.appendChild(pageHead('O que isso quis dizer?',
      'Descreva a situação — veremos possibilidades, sem certezas.',
      'i-chat', 'Tradutor Social'));
    const layout = el('div', { class: 'grid grid-2' });
    const inCard = el('div', { class: 'card fade-in delay-1' });
    inCard.appendChild(h(`
      <h3 class="mb-2">${ico('i-write')} Descreva a situação</h3>
      <p class="small muted mb-4">Exemplo: “Alguém me disse 'tá bom então' e saiu.”</p>
      <div class="field mb-4">
        <textarea class="textarea" id="social-input" placeholder="O que aconteceu? O que a pessoa disse? Em que contexto?">Uma pessoa respondeu "tá bom então" e saiu.</textarea>
      </div>
      <div class="row wrap mb-4">
        <button class="chip chip-sky" data-preset='{"q":"Uma pessoa respondeu “tá bom então” e saiu."}'>Ex: "tá bom então"</button>
        <button class="chip chip-lilac" data-preset='{"q":"Um amigo não respondeu minha mensagem há 2 dias."}'>Ex: sem resposta</button>
        <button class="chip chip-sage" data-preset='{"q":"Meu chefe mandou “precisamos conversar”."}'>Ex: "precisamos conversar"</button>
      </div>
      <button class="btn btn-primary btn-block" id="social-analyze">${ico('i-chat')} Analisar possibilidades</button>
      <div class="disc mt-4">Importante: nunca podemos saber exatamente o que outra pessoa pensa. Use como possibilidades; prefira comunicação direta sempre que puder.</div>
    `));
    layout.appendChild(inCard);

    const outCard = el('div', { class: 'card fade-in delay-2' });
    outCard.appendChild(h(`<h3 class="mb-4">${ico('i-eye')} Possibilidades</h3>`));
    if (state.socialResult) {
      const res = state.socialResult;
      const interpDiv = el('div', { class: 'social-interp mb-5' });
      res.interps.forEach((i, idx) => interpDiv.appendChild(h(`
        <div class="interp-card p${idx+1}">
          <strong>${ico(idx === 0 ? 'i-check' : 'i-eye')} ${i.t}</strong>
          <p style="margin:4px 0 0;">${i.c}</p>
        </div>
      `)));
      outCard.appendChild(interpDiv);
      outCard.appendChild(h(`<h4 class="mb-3">${ico('i-chat')} Como posso responder?</h4>`));
      const replyDiv = el('div', { class: 'reply-suggest' });
      res.replies.forEach((r, i) => replyDiv.appendChild(h(`
        <div class="reply-card">
          <strong>Opção ${i+1}</strong>
          <p style="margin:4px 0 0;">${r}</p>
        </div>
      `)));
      outCard.appendChild(replyDiv);
    } else {
      outCard.appendChild(h(`
        <div class="empty">
          <div class="ico">${ico('i-chat')}</div>
          <p>Descreva uma situação ao lado para ver possibilidades.</p>
        </div>
      `));
    }
    layout.appendChild(outCard);
    root.appendChild(layout);
    return root;
  }

  function analyzeSocial(q) {
    const txt = (q || '').toLowerCase();
    const genInterps = (c1, c2, c3) => [
      { t: 'Possibilidade 1', c: c1 },
      { t: 'Possibilidade 2', c: c2 },
      { t: 'Possibilidade 3', c: c3 }
    ];
    let interps, replies;
    if (txt.includes('tá bom então') || txt.includes('ta bom entao') || txt.includes('tudo bem então')) {
      interps = genInterps(
        'A pessoa pode ter encerrado a conversa de forma natural — tinha algo para fazer ou achou que o assunto acabou.',
        'Pode ter ficado levemente frustrada ou desconfortável com algo e preferido se afastar no momento.',
        'Pode estar com muita pressa ou cansada, sem energia para continuar a conversa.'
      );
      replies = [
        'Se ficar com dúvida: “Tudo bem? Se precisar de algo, é só chamar.”',
        'Se for alguém próximo, depois pode mandar: “Você estava com pressa mais cedo? Só queria entender se está tudo bem.”',
        'Se preferir não seguir agora, está tudo certo — pode retomar quando vocês dois estiverem mais tranquilos.'
      ];
    } else if (txt.includes('não respondeu') || txt.includes('nao respondeu') || txt.includes('sem resposta')) {
      interps = genInterps(
        'A pessoa pode ter ficado ocupada — trabalho, saúde, ou algo inesperado.',
        'Ela pode ter visto a mensagem, mas não teve energia para responder, e depois esqueceu.',
        'Em alguns casos, não sabe como responder ou está pensando em uma resposta melhor.'
      );
      replies = [
        'Depois de alguns dias: “Só passando para ver se está tudo bem. Se precisar de espaço, sem pressão.”',
        'Se não for urgente, esperar está tudo certo. Não significa que a pessoa não se importa.',
        'Se for importante para você: “Quando você não responde, eu fico com dúvida se está tudo bem.”'
      ];
    } else if (txt.includes('precisamos conversar') || txt.includes('preciso falar com você')) {
      interps = genInterps(
        'Pode ser uma conversa comum — ajuste de rotina, feedback, ou combinado.',
        'Pode ser algo importante, mas não necessariamente negativo: promoção, projeto novo.',
        'Em alguns contextos, feedback mais sério. Acompanhe outras pistas de contexto.'
      );
      replies = [
        '“Claro, pode me dizer de que lado se trata? Assim eu me preparo melhor.”',
        '“Tudo bem, podemos falar amanhã às 14h, por exemplo?”',
        'Respire antes de ir. Mesmo que seja difícil, você pode digerir e responder depois.'
      ];
    } else if (txt.includes('iron') || txt.includes('sarcas')) {
      interps = genInterps(
        'Pode ser uma brincadeira leve entre pessoas que já têm intimidade.',
        'Pode ser uma forma de expressar descontentamento sem falar diretamente.',
        'Pode não ter sido sarcasmo — o tom escrito deixa muita coisa ambígua.'
      );
      replies = [
        '“Foi brincadeira ou falou sério? Quis entender direito.”',
        'Se preferir, responda por cima no tom leve, sem criar tensão.',
        'Se te deixou desconfortável, não se obrigue a rir.'
      ];
    } else {
      interps = genInterps(
        'Pode ter agido por um motivo prático — pressa, cansaço, distração.',
        'Pode ter sentimentos envolvidos: desconforto, animação, frustração, ou outra emoção.',
        'Talvez não tenha percebido o efeito que a atitude teve em você.'
      );
      replies = [
        '“Eu fiquei com dúvida sobre tal situação. Você pode me explicar como foi do seu lado?”',
        'Se não for o momento, anote o que sentiu e converse depois.',
        'Não se culpe por não entender. Comunicação é duas vias.'
      ];
    }
    state.socialResult = { interps, replies };
  }

  function initTradutorInteractions() {
    $('#social-analyze')?.addEventListener('click', () => {
      const txt = $('#social-input').value.trim();
      if (!txt) { toast('Escreva a situação primeiro.'); return; }
      analyzeSocial(txt);
      render();
    });
    $$('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      try { $('#social-input').value = JSON.parse(btn.getAttribute('data-preset')).q; } catch {}
    }));
  }

  // Cuidadores
  function renderCuidadores() {
    const root = document.createElement('div');
    const isSubPage = state.page === 'perfil';
    if (isSubPage) {
      root.appendChild(backBtn('perfil', null, 'Voltar'));
    }
    const heading = pageHead(
      isSubPage ? 'Para pessoas cuidadoras' : 'Apoio Familiar',
      'Um guia prático, humano e acolhedor para apoiar pessoas autistas.',
      'i-people',
      'Apoio Familiar'
    );
    root.appendChild(heading);

    const layout = el('div', { class: 'cg-page-layout fade-in delay-1' });
    const leftCol = el('div', { class: 'cg-left-col' });
    const tabs = el('div', { class: 'cg-tabs cg-tabs-nav' });
    CAREGIVER_SECTIONS.forEach((sec, i) => {
      tabs.appendChild(h(`
        <button class="cg-tab ${state.caregiverSection === sec.id ? 'active' : ''}" data-cg-section="${sec.id}" data-cg-panel="${sec.id}" aria-label="${sec.title}">
          ${ico(sec.icon || 'i-user')}
          <div>
            <strong>${sec.title}</strong>
            <small class="muted">${sec.desc.split('.')[0]}.</small>
          </div>
        </button>
      `));
    });
    leftCol.appendChild(tabs);
    layout.appendChild(leftCol);

    const rightCol = el('div', { class: 'cg-right-col' });
    if (!isSubPage) {
      rightCol.appendChild(h(`
        <section class="cg-hero card fade-in delay-1">
          <div class="cg-hero-ico">${ico('i-user')}</div>
          <div>
            <h3>Você não está sozinho(a)</h3>
            <p class="muted mb-0">Cuidar de uma pessoa autista é um aprendizado diário. Este espaço reúne dicas práticas, orientações de psicólogos, telefones de apoio e informações úteis para construir um dia a dia mais tranquilo e acolhedor.</p>
          </div>
        </section>
      `));

      const emergencyPhones = SUPPORT_PHONES.filter(s => s.group === 'emergency');
      const generalPhones   = SUPPORT_PHONES.filter(s => s.group === 'general');

      const phonesCard = el('section', { class: 'fade-in delay-2 mt-5' });
      phonesCard.appendChild(h(`
        <h3 class="mb-4">${ico('i-phone')} Telefones de Apoio</h3>
        <p class="muted mb-5">Se precisar de ajuda, ligue. Estes serviços são gratuitos e muitos funcionam 24 horas.</p>
        <div class="phones-wrapper">
          <div class="sc-group emg-group">
            <h4 class="sc-group-title emg">${ico('i-bell')} Emergências 24h</h4>
            <div class="support-list">
              ${emergencyPhones.map(s => `
                <div class="support-card sc-emergency">
                  <span class="sc-ico">${ico(s.ico || 'i-phone')}</span>
                  <div class="sc-info">
                    <strong>${s.name}</strong>
                    <small class="muted">${s.desc}</small>
                  </div>
                  <div class="sc-actions">
                    <a class="sc-phone" href="tel:${s.number.replace(/\D/g,'')}" aria-label="Ligar para ${s.name}">${ico('i-phone')} ${s.number}</a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="sc-group gen-group">
            <h4 class="sc-group-title gen">${ico('i-hands')} Apoio e orientação</h4>
            <div class="support-list">
              ${generalPhones.map(s => `
                <div class="support-card">
                  <span class="sc-ico">${ico(s.ico || 'i-phone')}</span>
                  <div class="sc-info">
                    <strong>${s.name}</strong>
                    <small class="muted">${s.desc}</small>
                  </div>
                  <div class="sc-actions">
                    <a class="sc-phone" href="tel:${s.number.replace(/\D/g,'')}" aria-label="Ligar para ${s.name}">${ico('i-phone')} ${s.number}</a>
                    ${s.copyable ? `<button type="button" class="sc-copy-btn" data-copy-number="${s.number.replace(/\D/g,'')}" aria-label="Copiar número ${s.number}">${ico('i-check')} Copiar</button>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `));
      rightCol.appendChild(phonesCard);

      setTimeout(() => {
        const copyBtns = phonesCard.querySelectorAll('.sc-copy-btn');
        copyBtns.forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const num = btn.getAttribute('data-copy-number');
            const originalHTML = btn.innerHTML;
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(num);
              } else {
                const ta = document.createElement('textarea');
                ta.value = num; ta.style.position='fixed'; ta.style.opacity='0';
                document.body.appendChild(ta); ta.select();
                document.execCommand('copy'); document.body.removeChild(ta);
              }
              btn.classList.add('copied');
              btn.innerHTML = `${ico('i-check')} Copiado!`;
              setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalHTML;
              }, 2000);
            } catch (_) {
              btn.classList.add('copied');
              btn.innerHTML = `${ico('i-check')} ${num}`;
              setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = originalHTML; }, 2000);
            }
          });
        });
      }, 50);

      rightCol.appendChild(h(`
        <section class="cg-feature-grid fade-in delay-2 mt-5">
          ${CAREGIVER_SECTIONS.slice(0, 8).map(sec => `
            <button class="cg-feature-card" data-cg-section="${sec.id}" data-cg-panel="${sec.id}">
              <span class="cg-feature-ico">${ico(sec.icon || 'i-user')}</span>
              <div>
                <strong>${sec.title}</strong>
                <small class="muted">${sec.desc.split('.')[0]}.</small>
              </div>
            </button>
          `).join('')}
        </section>
      `));
    }

    const current = CAREGIVER_SECTIONS.find(s => s.id === state.caregiverSection) || CAREGIVER_SECTIONS[0];
    const card = el('div', { class: 'card cg-content fade-in delay-2 mt-5', 'data-cg-panel': current.id });
    card.appendChild(h(`
      <div class="mb-4">
        <span class="chip chip-soft mb-3">${ico(current.icon || 'i-user')} ${current.title}</span>
        <p class="muted mb-0">${current.desc}</p>
      </div>
    `));
    const body = el('div');
    if (current.content) {
      current.content.forEach(p => body.appendChild(h(`
        <div class="cg-block">
          <h4>${ico('i-check')} ${p.t}</h4>
          <p class="mb-0">${p.c}</p>
        </div>
      `)));
    } else if (current.steps) {
      const grid = el('div', { class: 'cg-steps' });
      current.steps.forEach((s, i) => grid.appendChild(h(`
        <div class="cg-step">
          <span class="cg-step-num">${i+1}</span>
          <p class="mb-0">${s}</p>
        </div>
      `)));
      body.appendChild(grid);
    } else if (current.tips) {
      const grid = el('div', { class: 'cg-steps' });
      current.tips.forEach(s => grid.appendChild(h(`
        <div class="cg-step">
          <span class="cg-step-ico">${ico('i-check')}</span>
          <p class="mb-0">${s}</p>
        </div>
      `)));
      body.appendChild(grid);
    } else if (current.list) {
      const grid = el('div', { class: 'cg-steps' });
      current.list.forEach(s => grid.appendChild(h(`
        <div class="cg-step">
          <span class="cg-step-ico">${ico('i-calendar')}</span>
          <p class="mb-0">${s}</p>
        </div>
      `)));
      body.appendChild(grid);
    } else if (current.pontos) {
      const grid = el('div', { class: 'cg-steps' });
      current.pontos.forEach(s => grid.appendChild(h(`
        <div class="cg-step">
          <span class="cg-step-ico">${ico('i-heart')}</span>
          <p class="mb-0">${s}</p>
        </div>
      `)));
      body.appendChild(grid);
    }
    card.appendChild(body);

    card.appendChild(h(`
      <div class="divider"></div>
      <div class="row-between wrap">
        <div class="muted small">Cada pessoa é única — adapte ao seu contexto.</div>
        <button class="btn btn-primary" id="cg-share">${ico('i-hands')} Compartilhar esta página</button>
      </div>
    `));
    rightCol.appendChild(card);
    layout.appendChild(rightCol);
    root.appendChild(layout);

    setTimeout(() => {
      const b = $('#cg-share');
      if (b) {
        b.addEventListener('click', async () => {
          const url = location.href;
          try {
            await navigator.clipboard.writeText(url);
            toast('Link copiado! Compartilhe com familiares.');
          } catch (err) {
            toast('Use o link da barra de endereço para compartilhar.');
          }
        });
      }

    }, 0);
    return root;
  }

  // Privacidade
  function renderPrivacidade() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', null, 'Voltar'));
    root.appendChild(pageHead('Privacidade e controle',
      'Você decide o que fica salvo — tudo apenas neste navegador.',
      'i-lock', 'Privacidade'));
    const card = el('div', { class: 'card fade-in delay-1' });
    card.appendChild(h(`
      <div class="cg-block">
        <h4>${ico('i-lock')} Dados locais</h4>
        <p>Todas as suas informações (perfil, rotina, diário, locais salvos) ficam salvas apenas no armazenamento local deste navegador. Não são enviadas para nenhum servidor.</p>
      </div>
      <div class="cg-block">
        <h4>${ico('i-check')} O que você pode controlar</h4>
        <ul class="mb-0">
          <li>Apagar seu perfil sensorial</li>
          <li>Limpar todo o diário</li>
          <li>Limpar rotina e locais salvos</li>
          <li>Apagar todos os dados do Autiversi neste navegador</li>
        </ul>
      </div>
      <div class="divider"></div>
      <div class="row wrap">
        <button class="btn btn-secondary" id="clear-sens">Apagar perfil sensorial</button>
        <button class="btn btn-secondary" id="clear-diary">Limpar diário</button>
        <button class="btn btn-secondary" id="clear-routine">Limpar rotina</button>
        <button class="btn btn-warn" id="clear-all">Apagar todos os dados</button>
      </div>
    `));
    root.appendChild(card);

    setTimeout(() => {
      const act = (msg, cb) => { if (confirm(msg)) { cb(); saveState(); toast('Feito.'); render(); } };
      const cs = $('#clear-sens'); if (cs) cs.onclick = () => act('Apagar seu perfil sensorial?', () => { state.profile.sensory = {}; });
      const cd = $('#clear-diary'); if (cd) cd.onclick = () => act('Limpar todo o diário?', () => { state.diary = []; });
      const cr = $('#clear-routine'); if (cr) cr.onclick = () => act('Limpar toda a rotina?', () => { state.routine = []; state.checklist = {}; });
      const ca = $('#clear-all'); if (ca) ca.onclick = () => {
        if (confirm('Tem certeza que quer apagar TODOS os dados do Autiversi aqui? Esta ação não pode ser desfeita.')) {
          ['profile','routine','diary','checklist','savedPlaces','lastVisited'].forEach(k => LS.remove(k));
          localStorage.clear();
          toast('Todos os dados foram apagados.');
          setTimeout(() => location.reload(), 800);
        }
      };
    }, 30);
    return root;
  }

  // Configurações
  function renderConfig() {
    const root = document.createElement('div');
    root.appendChild(backBtn('perfil', null, 'Voltar'));
    root.appendChild(pageHead('Configurações',
      'Ajuste a aparência, sons e comportamento do Autiversi.',
      'i-config', 'Configurações'));
    const card = el('div', { class: 'card fade-in delay-1' });
    card.appendChild(h(`
      <div class="cg-block mb-5">
        <h4>${ico('i-user')} Seu perfil</h4>
        <p class="muted mb-4">Dizemos para organizar o conteúdo conforme o que você precisa.</p>
        <div class="role-grid mb-4">
          ${PROFILE_ROLES.map(r => `
            <button class="role-card ${state.profile.role === r.id ? 'active' : ''}" data-cfg-role="${r.id}">
              <span class="role-ico">${ico(r.id === 'autista' ? 'i-heart' : 'i-hands')}</span>
              <h4>${r.label}</h4>
              <p class="muted mb-0">${r.hint}</p>
            </button>
          `).join('')}
        </div>
        <div class="level-list">
          ${SUPPORT_LEVELS.map(l => `
            <button class="level-card ${state.profile.supportLevel === l.value ? 'active' : ''}" data-cfg-level="${l.value}">
              <span class="level-num">${l.value}</span>
              <div><h4 class="mb-0">${l.label}</h4></div>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="divider"></div>
      <label class="toggle-row">
        <div class="tr-info">
          ${ico('i-moon')}
          <div><strong>Modo escuro</strong><small>Menos luz e contraste suave.</small></div>
        </div>
        <div class="tr-right"><input type="checkbox" id="cfg-theme" ${state.theme === 'dark' ? 'checked' : ''}/><span class="toggle-slider" aria-hidden="true"></span></div>
      </label>
      <label class="toggle-row">
        <div class="tr-info">
          ${ico('i-breath')}
          <div><strong>Reduzir animações</strong><small>Transições mais calmas e sem movimentos.</small></div>
        </div>
        <div class="tr-right"><input type="checkbox" id="cfg-motion" ${state.motion === 'off' ? 'checked' : ''}/><span class="toggle-slider" aria-hidden="true"></span></div>
      </label>
      <label class="toggle-row">
        <div class="tr-info">
          ${ico('i-eye')}
          <div><strong>Texto maior</strong><small>Fonte maior para facilitar a leitura.</small></div>
        </div>
        <div class="tr-right"><input type="checkbox" id="cfg-text" ${state.largeText ? 'checked' : ''}/><span class="toggle-slider" aria-hidden="true"></span></div>
      </label>
      <label class="toggle-row">
        <div class="tr-info">
          ${ico('i-comfort')}
          <div><strong>Alto contraste</strong><small>Melhor visibilidade dos elementos.</small></div>
        </div>
        <div class="tr-right"><input type="checkbox" id="cfg-contrast" ${state.contrast === 'high' ? 'checked' : ''}/><span class="toggle-slider" aria-hidden="true"></span></div>
      </label>
      <label class="toggle-row">
        <div class="tr-info">
          ${ico('i-waves')}
          <div><strong>Ativar sons</strong><small>Sons leves para confirmações e sons ambiente.</small></div>
        </div>
        <div class="tr-right"><input type="checkbox" id="cfg-sound" ${state.soundEnabled ? 'checked' : ''}/><span class="toggle-slider" aria-hidden="true"></span></div>
      </label>
    `));
    root.appendChild(card);
    root.appendChild(h(`
      <div class="card card-soft mt-5">
        <div class="row-between wrap">
          <div style="max-width:520px;">
            <h3>${ico('i-hands')} Dica</h3>
            <p class="muted mb-0">Estas mesmas opções estão no painel de acessibilidade, no canto superior direito da tela — ícone de engrenagem.</p>
          </div>
          <button class="btn btn-primary" id="open-access-cfg">Abrir painel</button>
        </div>
      </div>
    `));

    setTimeout(() => {
      const bind = (id, onChange) => { const el = $('#'+id); if (el) el.onchange = (e) => { onChange(e.target.checked); applyTheme(); }; };
      bind('cfg-theme',   v => state.theme = v ? 'dark' : 'light');
      bind('cfg-motion',  v => state.motion = v ? 'off' : 'on');
      bind('cfg-text',    v => state.largeText = v);
      bind('cfg-contrast',v => state.contrast = v ? 'high' : 'normal');
      bind('cfg-sound',   v => state.soundEnabled = v);
      const oac = $('#open-access-cfg'); if (oac) oac.onclick = () => $('#accessibility-panel').classList.remove('hidden');
      $$('[data-cfg-role]').forEach(btn => btn.onclick = () => {
        state.profile.role = btn.getAttribute('data-cfg-role');
        saveState();
        toast('Papel atualizado');
        render();
      });
      $$('[data-cfg-level]').forEach(btn => btn.onclick = () => {
        state.profile.supportLevel = Number(btn.getAttribute('data-cfg-level'));
        saveState();
        toast('Nível atualizado');
        render();
      });
    }, 30);
    return root;
  }

  // Modo Crise
  function renderCrisis() {
    const root = document.createElement('div');
    root.appendChild(backBtn('desacelerar', null, 'Voltar'));
    root.appendChild(pageHead('Tudo vai passar. Estamos com você.',
      'Siga estes passos com calma, no seu tempo. Não precisa fazer tudo.',
      'i-calm', 'Modo crise'));

    const grid = el('div', { class: 'cg-steps crisis-steps fade-in delay-1' });
    const passos = [
      { i: 'i-waves', t: 'Encontre um lugar calmo', c: 'Se puder, vá para um local com menos barulho, luz e pessoas.' },
      { i: 'i-breath', t: 'Respire 4-7-8', c: 'Inspire por 4, segure por 7, expire por 8. Repita 3 vezes.' },
      { i: 'i-eye', t: 'Faça o 5-4-3-2-1', c: '5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que gosta.' },
      { i: 'i-heart', t: 'Aperte seu objeto de conforto', c: 'Segure firme por 10 segundos, depois solte devagar.' },
      { i: 'i-check', t: 'Diga para si mesmo', c: '“Isso é temporário. Eu sou seguro. O meu ritmo é válido.”' },
      { i: 'i-hands', t: 'Se precisar, peça ajuda', c: 'A uma pessoa de confiança, por escrito ou voz: “Preciso de um minuto.”' }
    ];
    passos.forEach((p, i) => grid.appendChild(h(`
      <div class="cg-step crisis-step">
        <span class="cg-step-num">${i+1}</span>
        <div>
          <h4 style="margin:0 0 6px;">${ico(p.i)} ${p.t}</h4>
          <p class="mb-0 muted">${p.c}</p>
        </div>
      </div>
    `)));
    root.appendChild(grid);

    root.appendChild(h(`
      <div class="section fade-in delay-2">
        <div class="card crisis-card-soft">
          <div class="row-between wrap">
            <div style="max-width:520px;">
              <h3>${ico('i-heart')} Quando isso passar</h3>
              <p class="muted mb-0">Registre o que você sentiu no diário — isso ajuda a conhecer seus padrões e a se preparar melhor da próxima vez. Não é falha; é informação.</p>
            </div>
            <button class="btn btn-primary" data-nav="perfil" data-sub="diario">${ico('i-book')} Ir para o diário</button>
          </div>
        </div>
      </div>
    `));

    return root;
  }

  // =========================================================
  // 12. PAINÉIS GLOBAIS: IA + MODO CRIANÇA
  // =========================================================
  function normalizeStr(s) {
    return (s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function getAIAnswer(rawMsg) {
    const msg = normalizeStr(rawMsg);
    if (!msg) return AI_FALLBACK;

    const scored = [];
    for (const entry of AI_RESPONSES) {
      let score = 0;
      (entry.keys || []).forEach(k => {
        const nk = normalizeStr(k);
        if (!nk) return;
        if (msg.includes(nk)) score += 5;
        nk.split(' ').forEach(word => {
          if (word && msg.includes(word)) score += 1;
        });
      });
      if (score > 0) scored.push({ entry, score });
    }

    if (scored.length) {
      const best = scored.sort((a, b) => b.score - a.score)[0];
      const answers = best.entry.answers || [best.entry.answer];
      return pickRand(answers.filter(Boolean)) || AI_FALLBACK;
    }

    const generalPatterns = [
      { match: /(ajuda|socorro|urgente|me ajuda|como fazer|dica|preciso)/, answer: 'Claro! 😊 Posso te ajudar com isso. Me diga o que está acontecendo: barulho, rotina, escola, conversa, ansiedade, ou um lugar que te deixa desconfortável. Assim eu te sugiro uma resposta mais simples e prática.' },
      { match: /(ansioso|nervoso|sobrecarregado|crise|estou mal|desesperado)/, answer: 'Parece que você está bem sobrecarregado(a). 💙 Vamos diminuir a intensidade. Tente respirar fundo: inspire 4, segure 4 e expire 6, 3 vezes. Se puder, vá para um lugar mais silencioso e use algo que te acalme.' },
      { match: /(rotina|organizar|horario|agenda|dia)/, answer: 'Uma rotina clara ajuda bastante a reduzir a ansiedade. 📅 Tente separar o dia em 3 passos: acordar, tarefa principal e pausa. O objetivo não é tudo perfeito; é deixar as coisas mais previsíveis.' },
      { match: /(barulho|som|alto|ruido|agitado|muito som)/, answer: 'Sons altos costumam ser muito intensos. 🔇 Tente usar fones, ir para um canto mais quieto ou levar algo que te acalma. Pequenas pausas também ajudam bastante.' },
      { match: /(amizade|social|conversa|falar com alguem|relacionamento)/, answer: 'Conversa social pode ser cansativa, mas dá para treinar com calma. 💬 Comece com uma frase curta, diga algo que você gosta e não precisa responder tudo de uma vez. É válido e você está fazendo o seu melhor.' },
      { match: /(escola|trabalho|professor|aula)/, answer: 'Na escola ou no trabalho, você pode pedir adaptações simples: silêncio, pausas, explicação escrita ou um lugar mais calmo. 🧩 Pedir ajuda não é fraqueza — é autocuidado.' }
    ];

    const found = generalPatterns.find(p => p.match.test(msg));
    if (found) return found.answer;

    return AI_FALLBACK;
  }

  function appendChatBubble(body, text, who) {
    if (!body) return;
    const wrap = el('div', { class: 'chat-msg ' + (who || 'bot') });
    const bubble = el('div', { class: 'chat-bubble' });
    bubble.textContent = text;
    if (who === 'bot') bubble.style.whiteSpace = 'pre-wrap';
    wrap.appendChild(bubble);
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function appendChatTyping(body) {
    if (!body) return;
    const t = el('div', { class: 'chat-msg bot' });
    t.innerHTML = `<div class="chat-bubble chat-typing" aria-hidden="true"><span></span><span></span><span></span></div>`;
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    return t;
  }

  function initAIHistory(body) {
    if (!body || body.childElementCount > 0) return;
    appendChatBubble(body, 'Olá! Sou a Ana, sua companheira do Autiversi.\nVocê pode me perguntar sobre:\n• Como se acalmar em momentos difíceis\n• Como pedir ajuda em lojas ou na rua\n• Dicas para rotina, escola, amizades\n• Explicação sobre stimming\n• Ou sobre os pais, família e cuidadores.\n\nEstou aqui para te ajudar, sem pressa.', 'bot');
  }

  function sendAI(userText) {
    const body = $('#ai-chat-body');
    const input = $('#ai-input');
    if (!body) return;
    const msg = (userText || (input ? input.value : '') || '').trim();
    if (!msg) return;
    appendChatBubble(body, msg, 'user');
    if (input) { input.value = ''; }
    const typing = appendChatTyping(body);
    setTimeout(() => {
      if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
      const answer = getAIAnswer(msg);
      appendChatBubble(body, answer, 'bot');
    }, 1100 + rand(400));
  }

  function renderChildDetail(catKey) {
    const body = document.querySelector('.child-body');
    if (!body) return;
    body.innerHTML = '';
    const header = el('div', { class: 'child-intro' });
    header.appendChild(h(`<button class="btn btn-secondary btn-sm mb-3" id="child-back">${ico('i-arrow')} Voltar</button>`));

    switch (catKey) {
      case 'ci-1': { // Desenhos SVG reais clicáveis
        header.appendChild(h(`
          <h3 style="margin:0 0 6px;">🎨 Desenhos para colorir</h3>
          <p class="muted mb-0">Clique em um desenho. Use como referência para colorir no papel!</p>
        `));
        body.appendChild(header);
        const grid = el('div', { class: 'draw-grid child-section mt-4' });
        const DRAWS = [
          { svg: 'd-sol',    title: 'Sol feliz',       desc: 'Desenhe um sol com carinha sorrindo e raios de luz.' },
          { svg: 'd-nuvem',  title: 'Nuvem fofa',      desc: 'Uma nuvem com sorriso. Você pode pintar de azul ou rosa!' },
          { svg: 'd-coelho', title: 'Coelhinho',       desc: 'Coelho branco com orelhas rosadas. Ele ama cenouras.' },
          { svg: 'd-tartaruga', title: 'Tartaruga',    desc: 'Tartaruga verde caminhando devagar, no seu ritmo.' },
          { svg: 'd-peixe',  title: 'Peixinho azul',   desc: 'Peixe nadando no mar azul com bolhinhas coloridas.' },
          { svg: 'd-arvore', title: 'Árvore com frutas', desc: 'Árvore verde com frutinhas vermelhas e amarelas.' },
          { svg: 'd-casa',   title: 'Casa aconchegante', desc: 'Casa com telhado vermelho, janela azul e fumaça saindo.' },
          { svg: 'd-coracao', title: 'Coração rosa',   desc: 'Coração grande com brilho. Para presentear quem você ama.' },
          { svg: 'd-estrela', title: 'Estrela dourada', desc: 'Estrela com 5 pontas. Ela brilha no céu de noite!' }
        ];
        DRAWS.forEach(d => {
          grid.appendChild(h(`
            <button class="draw-card" data-draw="${d.svg}" style="cursor:pointer;">
              <div class="draw-art"><svg><use href="#${d.svg}"/></svg></div>
              <div class="draw-title">${d.title}</div>
              <div class="draw-desc">${d.desc}</div>
            </button>
          `));
        });
        body.appendChild(grid);
        setTimeout(() => {
          $$('.draw-card').forEach(c => c.onclick = () => {
            const id = c.getAttribute('data-draw');
            toast('Desenho selecionado! 🎨 Abra um papel e colora igual.');
          });
          const b = $('#child-back'); if (b) b.onclick = renderChildHome;
        }, 30);
        break;
      }
      case 'ci-2': { // Jogos funcionais: memória, formas, sentidos
        header.appendChild(h(`
          <h3 style="margin:0 0 6px;">🧩 Jogos calmos</h3>
          <p class="muted mb-0">3 jogos para se divertir sem pressa. Pode pausar quando quiser!</p>
        `));
        body.appendChild(header);

        // ====== JOGO 1: MEMÓRIA ======
        const secMem = el('section', { class: 'child-section mt-5' });
        secMem.appendChild(h(`
          <div class="child-h"><span class="ch-ico">🧠</span><h3>1. Encontre os pares (Memória)</h3></div>
          <div class="game-wrap">
            <div class="game-title">
              <h4>${ico('i-heart')} Jogo da memória — animais</h4>
              <div class="game-meta">
                <span class="game-score" id="mem-score">Pares: 0 / 6</span>
                <button class="btn btn-secondary btn-sm" id="mem-reset">${ico('i-waves')} Reiniciar</button>
              </div>
            </div>
            <div class="mem-grid" id="mem-grid"></div>
          </div>
        `));
        body.appendChild(secMem);

        // ====== JOGO 2: FORMAS E CORES ======
        const secShp = el('section', { class: 'child-section' });
        secShp.appendChild(h(`
          <div class="child-h"><span class="ch-ico">🔴</span><h3>2. Ache a forma igual</h3></div>
          <div class="game-wrap shape-game">
            <div class="game-title">
              <h4>${ico('i-check')} Qual forma é igual?</h4>
              <div class="game-meta">
                <span class="game-score" id="shp-score">Acertos: 0</span>
                <button class="btn btn-secondary btn-sm" id="shp-next">${ico('i-arrow-right')} Próximo</button>
              </div>
            </div>
            <div class="shape-target" id="shp-target"><svg><use href="#s-circulo"/></svg></div>
            <div class="shape-target-label" id="shp-label">Encontre o CÍRCULO igual!</div>
            <div class="shape-options" id="shp-options"></div>
          </div>
        `));
        body.appendChild(secShp);

        // ====== JOGO 3: 5 SENTIDOS ======
        const secSn = el('section', { class: 'child-section' });
        secSn.appendChild(h(`
          <div class="child-h"><span class="ch-ico">👃</span><h3>3. Os 5 Sentidos</h3></div>
          <p class="muted mb-3">Clique nos itens que pertencem a cada sentido. Não tem erro, é para aprender!</p>
          <div class="senses-grid">
            <div class="sense-card" data-sense="visao">
              <span class="sense-emoji">👁️</span>
              <div class="sense-name">Visão</div>
              <div class="sense-items" data-sense-list="visao">
                <span class="sense-item">sol</span><span class="sense-item">cores</span><span class="sense-item">estrela</span><span class="sense-item">luz</span>
              </div>
            </div>
            <div class="sense-card" data-sense="audicao">
              <span class="sense-emoji">👂</span>
              <div class="sense-name">Audição</div>
              <div class="sense-items" data-sense-list="audicao">
                <span class="sense-item">música</span><span class="sense-item">pássaro</span><span class="sense-item">chuva</span><span class="sense-item">barulho</span>
              </div>
            </div>
            <div class="sense-card" data-sense="tato">
              <span class="sense-emoji">🤚</span>
              <div class="sense-name">Tato</div>
              <div class="sense-items" data-sense-list="tato">
                <span class="sense-item">macio</span><span class="sense-item">quente</span><span class="sense-item">frio</span><span class="sense-item">água</span>
              </div>
            </div>
            <div class="sense-card" data-sense="olfato">
              <span class="sense-emoji">👃</span>
              <div class="sense-name">Olfato</div>
              <div class="sense-items" data-sense-list="olfato">
                <span class="sense-item">flor</span><span class="sense-item">pão</span><span class="sense-item">perfume</span><span class="sense-item">fruta</span>
              </div>
            </div>
            <div class="sense-card" data-sense="paladar">
              <span class="sense-emoji">👅</span>
              <div class="sense-name">Paladar</div>
              <div class="sense-items" data-sense-list="paladar">
                <span class="sense-item">doce</span><span class="sense-item">salgado</span><span class="sense-item">azedo</span><span class="sense-item">chocolate</span>
              </div>
            </div>
          </div>
        `));
        body.appendChild(secSn);

        setTimeout(() => initChildGames(), 30);
        setTimeout(() => { const b = $('#child-back'); if (b) b.onclick = renderChildHome; }, 30);
        break;
      }
      case 'ci-3': { // Livros
        header.appendChild(h(`
          <h3 style="margin:0 0 6px;">📚 Livros infantis</h3>
          <p class="muted mb-0">Sugestões de histórias sobre autismo e diferenças. Pergunte na biblioteca da escola!</p>
        `));
        body.appendChild(header);
        const grid = el('div', { class: 'story-grid child-section mt-4' });
        CHILD_BOOKS.forEach(b => {
          grid.appendChild(h(`
            <div class="story-card">
              <span class="story-emoji">${b.emoji}</span>
              <div class="story-title">${b.title}</div>
              <div class="story-text">${b.desc}</div>
            </div>
          `));
        });
        body.appendChild(grid);
        setTimeout(() => { const bk = $('#child-back'); if (bk) bk.onclick = renderChildHome; }, 30);
        break;
      }
      case 'ci-4': { // Músicas
        header.appendChild(h(`
          <h3 style="margin:0 0 6px;">🎵 Músicas tranquilas</h3>
          <p class="muted mb-0">Sons calminhos para ouvir antes de dormir ou quando precisar descansar.</p>
        `));
        body.appendChild(header);
        const grid = el('div', { class: 'grid grid-2 child-section mt-4' });
        CHILD_MUSICS.forEach(m => {
          grid.appendChild(h(`
            <div class="card" style="background:#fff;border-radius:22px;padding:var(--space-4);border:3px dashed #b7ddff;box-shadow:0 5px 0 #d8ecff;">
              <div style="font-size:2.2rem;text-align:center;margin-bottom:8px;">${m.emoji}</div>
              <h4 style="text-align:center;margin:0 0 6px;">${m.title}</h4>
              <p class="muted mb-0" style="text-align:center;font-size:0.88rem;">${m.desc}</p>
              <div style="text-align:center;margin-top:var(--space-3);">
                <button class="btn btn-secondary btn-sm" data-nav="desacelerar" data-sub="sounds">${ico('i-waves')} Ouvir sons aqui</button>
              </div>
            </div>
          `));
        });
        body.appendChild(grid);
        setTimeout(() => { const bk = $('#child-back'); if (bk) bk.onclick = renderChildHome; }, 30);
        break;
      }
      case 'ci-5': { // Histórias
        header.appendChild(h(`
          <h3 style="margin:0 0 6px;">🐻 Histórias amigas</h3>
          <p class="muted mb-0">Contos curtos e calmos. Leia no seu tempo. Quando quiser, conte para alguém!</p>
        `));
        body.appendChild(header);
        const grid = el('div', { class: 'story-grid child-section mt-4' });
        CHILD_STORIES.forEach(s => {
          grid.appendChild(h(`
            <div class="story-card">
              <span class="story-emoji">${s.emoji}</span>
              <div class="story-title">${s.title}</div>
              <div class="story-text">${s.text}</div>
            </div>
          `));
        });
        body.appendChild(grid);
        setTimeout(() => { const bk = $('#child-back'); if (bk) bk.onclick = renderChildHome; }, 30);
        break;
      }
      case 'ci-6': { // Dicas para crescer
        header.appendChild(h(`
          <h3 style="margin:0 0 6px;">🌱 Dicas para crescer</h3>
          <p class="muted mb-0">Coisas simples que você pode fazer todo dia para se sentir bem!</p>
        `));
        body.appendChild(header);
        const tips = [
          { e: '😴', t: 'Dormir bem', d: 'Tente dormir no mesmo horário todos os dias. Sono faz bem para o cérebro.' },
          { e: '💧', t: 'Beber água', d: 'Beba água durante o dia. A água ajuda você a ficar calmo e com energia.' },
          { e: '🧘', t: 'Respirar fundo', d: 'Quando ficar nervoso, inspire 4 segundos, segure 7, expire 8. Funciona!' },
          { e: '🍎', t: 'Comer frutas', d: 'Uma fruta por dia (banana, maçã, uva) deixa o corpo forte e feliz.' },
          { e: '🤝', t: 'Compartilhar', d: 'Compartilhar seus brinquedos ou seu lanche faz bem para você e para o amigo.' },
          { e: '💬', t: 'Falar sobre sentimentos', d: 'Se ficar triste ou com raiva, fale com alguém que você confia.' }
        ];
        const grid = el('div', { class: 'story-grid child-section mt-4' });
        tips.forEach(t => {
          grid.appendChild(h(`
            <div class="story-card">
              <span class="story-emoji">${t.e}</span>
              <div class="story-title">${t.t}</div>
              <div class="story-text">${t.d}</div>
            </div>
          `));
        });
        body.appendChild(grid);
        setTimeout(() => { const bk = $('#child-back'); if (bk) bk.onclick = renderChildHome; }, 30);
        break;
      }
      default: return renderChildHome();
    }
  }

  // ============ JOGOS FUNCIONAIS DA CRIANÇA ============
  function initChildGames() {
    // ==== JOGO 1: MEMÓRIA ====
    const animais = [
      { e: '🐰', id: 'coelho' }, { e: '🐢', id: 'tartaruga' },
      { e: '🐠', id: 'peixe' },  { e: '🐻', id: 'urso' },
      { e: '🐶', id: 'cachorro' }, { e: '🐱', id: 'gato' }
    ];
    const cards = [...animais, ...animais]
      .sort(() => Math.random() - 0.5)
      .map((a, i) => ({ ...a, idx: i }));
    const grid = document.getElementById('mem-grid');
    if (grid) {
      grid.innerHTML = cards.map(c => `
        <div class="mem-card" data-idx="${c.idx}" data-id="${c.id}">
          <div class="mem-inner">
            <div class="mem-front">?</div>
            <div class="mem-back">${c.e}</div>
          </div>
        </div>
      `).join('');
    }
    let first = null, lock = false, matched = new Set(), tries = 0;
    $$('.mem-card').forEach(c => c.onclick = () => {
      if (lock) return;
      const id = c.getAttribute('data-id');
      if (matched.has(id + c.getAttribute('data-idx'))) return;
      if (first && first === c) return;
      c.classList.add('flipped');
      if (!first) { first = c; return; }
      tries++;
      if (first.getAttribute('data-id') === id && first !== c) {
        matched.add(first.getAttribute('data-id') + first.getAttribute('data-idx'));
        matched.add(id + c.getAttribute('data-idx'));
        first.classList.add('matched'); c.classList.add('matched');
        first = null;
        const pairs = Math.floor(matched.size / 2);
        const sc = document.getElementById('mem-score');
        if (sc) sc.textContent = `Pares: ${pairs} / 6`;
        if (pairs === 6) setTimeout(() => toast('🎉 Parabéns! Você encontrou todos os pares! Tentativas: ' + tries), 500);
      } else {
        lock = true;
        const f = first;
        setTimeout(() => { f.classList.remove('flipped'); c.classList.remove('flipped'); first = null; lock = false; }, 900);
      }
    });
    const mr = document.getElementById('mem-reset');
    if (mr) mr.onclick = () => initChildGames();

    // ==== JOGO 2: FORMAS E CORES ====
    const shapes = [
      { id: 's-circulo',       name: 'CÍRCULO ROSA' },
      { id: 's-quadrado',      name: 'QUADRADO AZUL' },
      { id: 's-triangulo',     name: 'TRIÂNGULO VERDE' },
      { id: 's-estrela-forma', name: 'ESTRELA AMARELA' },
      { id: 's-coracao-forma', name: 'CORAÇÃO LARANJA' },
      { id: 's-losango',       name: 'LOSANGO LILÁS' }
    ];
    let curShape = shapes[Math.floor(Math.random() * shapes.length)];
    let acertos = 0;
    const renderShape = () => {
      curShape = shapes[Math.floor(Math.random() * shapes.length)];
      const target = document.getElementById('shp-target');
      const label = document.getElementById('shp-label');
      const opts = document.getElementById('shp-options');
      if (target) target.innerHTML = `<svg><use href="#${curShape.id}"/></svg>`;
      if (label) label.textContent = `Encontre o ${curShape.name} IGUAL!`;
      const options = [...shapes].sort(() => Math.random() - 0.5);
      if (opts) opts.innerHTML = options.map(o => `
        <div class="shape-opt" data-shape="${o.id}">
          <svg><use href="${o.id === curShape.id ? '#' + o.id : '#' + o.id}"/></svg>
        </div>
      `).join('');
      $$('.shape-opt').forEach(el => {
        el.classList.remove('correct', 'wrong');
        el.onclick = () => {
          const correct = el.getAttribute('data-shape') === curShape.id;
          if (correct) {
            el.classList.add('correct');
            acertos++;
            const sc = document.getElementById('shp-score');
            if (sc) sc.textContent = `Acertos: ${acertos}`;
            if (acertos % 5 === 0) toast('🎉 Muito bem! 5 acertos! Continue assim.');
          } else {
            el.classList.add('wrong');
          }
        };
      });
    };
    renderShape();
    const nxt = document.getElementById('shp-next');
    if (nxt) nxt.onclick = renderShape;

    // ==== JOGO 3: 5 SENTIDOS (aprendizado sem erro) ====
    $$('.sense-item').forEach(it => it.onclick = () => {
      it.classList.toggle('picked');
      const count = document.querySelectorAll('.sense-item.picked').length;
      if (count === 20) setTimeout(() => toast('🌈 Você conheceu todos os sentidos! Muito bem!'), 400);
    });
  }

  function renderChildHome() {
    const body = document.querySelector('.child-body');
    if (!body) return;
    const childOn = document.body.getAttribute('data-child-mode') === 'true';
    body.innerHTML = '';
    body.appendChild(h(`
      <div class="child-intro">
        <div class="row-between wrap mb-3">
          <label class="toggle-row" style="padding:10px 14px;background:${childOn ? 'var(--primary-soft)' : 'var(--bg-alt)'};border-radius:16px;cursor:pointer;gap:10px;">
            <div class="tr-info">
              ${ico('i-kid')}
              <div><strong>Modo Criança no site todo</strong><small>Deixa o visual colorido e divertido.</small></div>
            </div>
            <div class="tr-right"><input type="checkbox" id="toggle-child-global" ${childOn ? 'checked' : ''}/><span class="toggle-slider" aria-hidden="true"></span></div>
          </label>
        </div>
        ${childOn ? `<div class="child-mode-badge mb-3">${ico('i-kid')} Modo Criança ATIVADO em todo o site!</div>` : ''}
        <h3 style="margin:0 0 6px;">🌈 Olá, amiguinho(a)!</h3>
        <p class="muted mb-0">Coisas divertidas, calmas e legais. Escolha o que você quer ver.</p>
      </div>
      <div class="child-grid mt-4">
        <button class="child-item ci-1" data-child="ci-1">
          <div style="font-size:40px;"><svg style="width:48px;height:48px;"><use href="#d-sol"/></svg></div>
          <h4>Desenhos</h4>
          <small>Ideias para desenhar e colorir</small>
        </button>
        <button class="child-item ci-2" data-child="ci-2">
          <div style="font-size:40px;"><svg style="width:48px;height:48px;"><use href="#d-estrela"/></svg></div>
          <h4>Jogos calmos</h4>
          <small>Brincadeiras sem pressa</small>
        </button>
        <button class="child-item ci-3" data-child="ci-3">
          <div style="font-size:40px;">📚</div>
          <h4>Livros</h4>
          <small>Histórias e livros legais</small>
        </button>
        <button class="child-item ci-4" data-child="ci-4">
          <div style="font-size:40px;">🎵</div>
          <h4>Músicas</h4>
          <small>Sons tranquilos para ouvir</small>
        </button>
        <button class="child-item ci-5" data-child="ci-5">
          <div style="font-size:40px;"><svg style="width:48px;height:48px;"><use href="#d-coelho"/></svg></div>
          <h4>Histórias</h4>
          <small>Contos com personagens amigos</small>
        </button>
        <button class="child-item ci-6" data-child="ci-6">
          <div style="font-size:40px;"><svg style="width:48px;height:48px;"><use href="#d-arvore"/></svg></div>
          <h4>Crescer</h4>
          <small>Dicas para o dia a dia</small>
        </button>
      </div>
    `));
    setTimeout(() => {
      const tgl = document.getElementById('toggle-child-global');
      if (tgl) tgl.onchange = (e) => toggleChildModeGlobal(e.target.checked);
      bindChildClicks();
    }, 30);
  }

  function toggleChildModeGlobal(on) {
    document.body.setAttribute('data-child-mode', on ? 'true' : 'false');
    state.childMode = !!on;
    saveState();
    toast(on ? '🌈 Modo Criança ativado! Visual divertido em todo o site.' : 'Modo Criança desativado. Visual normal.');
    renderChildHome();
  }

  function bindChildClicks() {
    $$('.child-item').forEach(btn => {
      if (btn.getAttribute('data-child-bound') === '1') return;
      btn.setAttribute('data-child-bound', '1');
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-child') || (Array.from(btn.classList).find(c => /^ci-\d+$/.test(c)));
        if (key) renderChildDetail(key);
      });
    });
  }

  function runGlobalSearch(q) {
    const out = $('#gs-results');
    if (!out) return;
    const query = (q || '').trim().toLowerCase();
    if (!query) {
      out.innerHTML = `<div class="gs-empty"><p>Digite algo para buscar — lugares, páginas, dicas...</p></div>`;
      return;
    }
    const results = [];
    PLACES.forEach(p => {
      const hay = (p.name + ' ' + p.city + ' ' + (p.tags || []).join(' ') + ' ' + p.desc).toLowerCase();
      if (hay.includes(query)) results.push({ kind: 'lugar', label: p.name, sub: p.city + ' · ' + p.desc, icon: 'i-pin', action: () => setPage('mapa', { placeId: p.id }) });
    });
    const pageMap = [
      { id: 'home', label: 'Início', sub: 'Página principal', icon: 'i-home' },
      { id: 'mapa', label: 'Mapa Sensorial', sub: 'Explorar lugares', icon: 'i-map' },
      { id: 'rotina', label: 'Minha Rotina', sub: 'Organizar compromissos', icon: 'i-calendar' },
      { id: 'desacelerar', label: 'Espaço de Acolhimento', sub: 'Acalmar e desacelerar', icon: 'i-leaf' },
      { id: 'perfil', subpage: 'sensorial', label: 'Perfil Sensorial', sub: 'Conhecer meu perfil', icon: 'i-user' },
      { id: 'perfil', subpage: 'social', label: 'Situações Sociais', sub: 'Treinar e entender', icon: 'i-people' },
      { id: 'cuidadores', label: 'Apoio Familiar', sub: 'Dicas para cuidadores', icon: 'i-people' }
    ];
    pageMap.forEach(p => {
      if ((p.label + ' ' + p.sub).toLowerCase().includes(query)) {
        results.push({ kind: 'página', ...p, action: () => setPage(p.id, p.subpage ? { sub: p.subpage } : {}) });
      }
    });
    CAREGIVER_SECTIONS.forEach(s => {
      const hay = (s.title + ' ' + (s.bullets || []).join(' ')).toLowerCase();
      if (hay.includes(query)) results.push({ kind: 'dica', label: s.title, sub: 'Apoio Familiar · ' + (s.bullets ? s.bullets[0] : 'Clique para ver'), icon: 'i-hands', action: () => setPage('cuidadores', { cgSection: s.id }) });
    });
    AI_RESPONSES.forEach(item => {
      const k = (item.keys || []).join(' ');
      const r = typeof item.answer === 'string' ? item.answer : '';
      if ((k + ' ' + r.substring(0, 180)).toLowerCase().includes(query)) {
        const labelFirst = (item.keys && item.keys[0]) || 'Dica';
        results.push({ kind: 'pergunta', label: labelFirst.substring(0, 60), sub: r.substring(0, 90) + '...', icon: 'i-chat', action: () => { $('#ai-chat-panel').classList.remove('hidden'); sendAI(labelFirst); } });
      }
    });
    if (results.length === 0) {
      out.innerHTML = `<div class="gs-empty"><p>Não encontramos nada com "${q}". Tente palavras como parque, crise, rotina ou PECS.</p></div>`;
      return;
    }
    out.innerHTML = `<div class="gs-count">${results.length} resultado${results.length === 1 ? '' : 's'}</div>` + results.slice(0, 12).map(r => `
      <button class="gs-result" data-gs="${r.kind}-${Math.random().toString(36).slice(2,7)}">
        <span class="gs-icon">${ico(r.icon || 'i-search')}</span>
        <div class="gs-text">
          <div class="gs-title"><strong>${r.label}</strong><span class="chip chip-soft">${r.kind}</span></div>
          <div class="gs-sub muted mb-0">${r.sub}</div>
        </div>
        <span class="gs-arrow">${ico('i-arrow-right')}</span>
      </button>
    `).join('');
    setTimeout(() => {
      $$('[data-gs]', out).forEach((btn, i) => {
        btn.addEventListener('click', () => { results[i].action && results[i].action(); $('#global-search-input') && ($('#global-search-input').value = ''); out.innerHTML = `<div class="gs-empty"><p>Digite algo para buscar — lugares, páginas, dicas...</p></div>`; });
      });
    }, 20);
  }

  function bindGlobalPanels() {
    const childBtn = $('#btn-child-mode');
    const childPanel = $('#child-panel');
    const closeChild = $('#close-child');
    if (childBtn && childPanel) {
      childBtn.addEventListener('click', () => {
        childPanel.classList.remove('hidden');
        renderChildHome();
      });
    }
    if (closeChild && childPanel) {
      closeChild.addEventListener('click', () => childPanel.classList.add('hidden'));
      childPanel.addEventListener('click', (e) => {
        if (e.target === childPanel) childPanel.classList.add('hidden');
      });
    }
    setTimeout(bindChildClicks, 150);

    const aiBtn = $('#btn-ai-chat');
    const aiPanel = $('#ai-chat-panel');
    const closeAI = $('#close-ai-chat');

    if (aiBtn && aiPanel) {
      aiBtn.addEventListener('click', () => {
        aiPanel.classList.remove('hidden');
        initAIHistory($('#ai-chat-body'));
      });
    }
    if (closeAI && aiPanel) {
      closeAI.addEventListener('click', () => aiPanel.classList.add('hidden'));
      aiPanel.addEventListener('click', (e) => {
        if (e.target === aiPanel) aiPanel.classList.add('hidden');
      });
    }
    const aiSend = $('#ai-send');
    if (aiSend) aiSend.addEventListener('click', () => sendAI());
    const aiInput = $('#ai-input');
    if (aiInput) {
      aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); sendAI(); }
      });
    }
    $$('[data-ai-quick]').forEach(chip => {
      chip.addEventListener('click', () => sendAI(chip.getAttribute('data-ai-quick')));
    });
  }
  function init() {
    const { page, extra } = parseHash();
    state.page = page || 'home';
    state.sub = extra || null;

    if (!document.body) return;
    applyTheme();
    bindAccessibility();
    bindNav();
    bindGlobalPanels();
    bindChildPanel();
    setTimeout(() => { updateKidsText(); }, 30);

    window.addEventListener('autiversi:play-song', (ev) => {
      try {
        const id = (ev && ev.detail && ev.detail.id) || null;
        if (!id) return;
        if (!state.soundEnabled) {
          toast('Habilite o som nas configurações de acessibilidade.');
          return;
        }
        stopAllSounds();
        if (typeof playSongById === 'function') {
          playSongById(id);
          return;
        }
        state.page = 'desacelerar';
        state.sub = 'sounds';
        location.hash = 'desacelerar:sounds';
        render();
        setTimeout(() => {
          const btn = document.querySelector(`[data-sound="${id}"]`);
          if (btn) btn.click();
          else setTimeout(() => { const b = document.querySelector(`[data-sound="${id}"]`); if(b) b.click(); }, 250);
        }, 280);
      } catch (_) {}
    });

    setTimeout(() => {
      const l = $('#loading');
      if (l) {
        l.classList.add('fade-out');
        setTimeout(() => l.remove(), 600);
      }
      render();
      setTimeout(() => updateKidsText(), 60);
    }, 900);
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
})();
