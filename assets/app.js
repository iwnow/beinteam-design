/* ==========================================================================
   BeInTeam — поведение статичных макетов
   Только демонстрация UX: каркас (сайдбар/топбар/таббар), боковые панели,
   вкладки, сегменты, тосты, ⌘K, тема. В Angular каждый блок → сервис/компонент:
     renderShell   → AppShellComponent (sidebar, topbar, tabbar)
     drawer        → DrawerService + <bi-drawer> (стек панелей, Esc, backdrop)
     tabs / seg    → TabsComponent, SegmentedComponent
     toast         → ToastService
     cmdk          → CommandPaletteComponent
   ========================================================================== */
(function () {
  'use strict';

  const NAV = [
    { group: 'Работа' },
    { id: 'dashboard', href: 'dashboard.html', icon: 'layout-dashboard', label: 'Сегодня' },
    { id: 'schedule', href: 'schedule.html', icon: 'calendar-days', label: 'Расписание' },
    { id: 'orders', href: 'orders.html', icon: 'receipt-text', label: 'Заказы', count: 8 },
    { id: 'clients', href: 'clients.html', icon: 'users', label: 'Клиенты' },
    { id: 'tasks', href: 'tasks.html', icon: 'list-checks', label: 'Задачи', count: 3 },
    { group: 'Сеть' },
    { id: 'objects', href: 'objects.html', icon: 'layout-grid', label: 'Объекты' },
    { id: 'cashbox', href: 'cashbox.html', icon: 'wallet', label: 'Кассы' },
    { id: 'checklists', href: 'checklists.html', icon: 'clipboard-check', label: 'Чек-листы' },
    { id: 'reports', href: 'reports.html', icon: 'chart-column', label: 'Отчёты' },
    { group: 'Управление' },
    { id: 'settings', href: 'settings.html', icon: 'settings-2', label: 'Настройки' },
  ];
  const TABBAR = ['schedule', 'orders', 'clients', 'objects', 'dashboard'];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Тема ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* приватный режим */ } },
  };
  const savedTheme = store.get('bi-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
    store.set('bi-theme', root.dataset.theme);
    refreshIcons();
  }

  /* ---------- Каркас ---------- */
  function renderShell() {
    const page = document.body.dataset.page || '';
    const crumbs = (document.body.dataset.crumbs || '').split('|').filter(Boolean);

    const side = $('[data-shell="sidebar"]');
    if (side) {
      side.innerHTML = `
        <div class="brand">
          <span class="brand-name">BeInTeam</span>
        </div>
        <button class="ws-switch" type="button" title="Сменить компанию">
          <span class="ws-avatar">CS</span>
          <span class="ws-meta"><small>Компания</small><span>Campus Sport</span></span>
          <i data-lucide="chevrons-up-down" class="ico-sm"></i>
        </button>
        <nav class="nav">
          ${NAV.map((n) => n.group
            ? `<div class="nav-label">${n.group}</div>`
            : `<a class="nav-item ${n.id === page ? 'is-active' : ''}" href="${n.href}" title="${n.label}">
                 <i data-lucide="${n.icon}"></i><span>${n.label}</span>
                 ${n.count ? `<em class="nav-count">${n.count}</em>` : ''}
               </a>`).join('')}
        </nav>
        <div class="side-foot">
          <span class="avatar avatar-sm" style="background:#262626;color:#f7f5f0">ВА</span>
          <span class="who"><b>Вера Администратор</b><small>Авиамоторная · смена до 23:00</small></span>
          <a class="side-icon-btn" href="login.html" title="Выйти"><i data-lucide="log-out" class="ico-sm"></i></a>
        </div>`;
    }

    const top = $('[data-shell="topbar"]');
    if (top) {
      top.innerHTML = `
        <button class="icon-btn burger" type="button" data-action="side-open" aria-label="Меню"><i data-lucide="menu"></i></button>
        <button class="icon-btn hide-mobile" type="button" data-action="side-collapse" aria-label="Свернуть меню"><i data-lucide="panel-left"></i></button>
        <div class="crumbs">${crumbs.map((c, i) => i < crumbs.length - 1
          ? `<a href="#">${c}</a><span class="sep">/</span>` : `<span>${c}</span>`).join('')}</div>
        <div class="topbar-actions">
          <button class="search-trigger" type="button" data-action="cmdk"><i data-lucide="search" class="ico-sm"></i><span>Клиент, заказ, бронь…</span><kbd>Ctrl K</kbd></button>
          <button class="icon-btn" type="button" data-action="theme" aria-label="Тема"><i data-lucide="sun-moon"></i></button>
          <button class="icon-btn" type="button" aria-label="Чаты" data-toast="WhatsApp: 2 непрочитанных диалога"><i data-lucide="message-circle"></i><span class="dot"></span></button>
          <button class="icon-btn" type="button" aria-label="Уведомления" data-toast="Новый заказ #131799 с сайта"><i data-lucide="bell"></i><span class="dot"></span></button>
        </div>`;
      const collapse = $('[data-action="side-collapse"]', top);
      if (matchMedia('(max-width: 767px)').matches) collapse.style.display = 'none';
    }

    if (side && !$('.tabbar')) {
      const bar = document.createElement('nav');
      bar.className = 'tabbar';
      bar.innerHTML = TABBAR.map((id) => {
        const n = NAV.find((x) => x.id === id);
        return `<a href="${n.href}" class="${id === page ? 'is-active' : ''}"><i data-lucide="${n.icon}"></i>${n.label}</a>`;
      }).join('');
      document.body.appendChild(bar);
    }
  }

  /* ---------- Боковые панели ---------- */
  const stack = [];
  let backdrop;

  function syncDrawers() {
    stack.forEach((d, i) => d.classList.toggle('is-stacked', i < stack.length - 1));
    const app = $('.app');
    if (app) app.classList.toggle('has-drawer', stack.length > 0);
    backdrop.classList.toggle('is-open', stack.length > 0);
  }
  function openDrawer(id, opts = {}) {
    const el = document.getElementById(id);
    if (!el) return console.warn('drawer not found', id);
    if (!opts.stack) {
      // новая панель «с нуля» заменяет весь стек
      while (stack.length) stack.pop().classList.remove('is-open', 'is-stacked');
    } else {
      const at = stack.indexOf(el);
      if (at >= 0) stack.splice(at, 1);
    }
    stack.push(el);
    el.classList.add('is-open');
    syncDrawers();
    const focusable = $('[autofocus], .drawer-body input, .drawer-body select', el);
    if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 250);
  }
  function closeDrawer(el) {
    const target = el || stack[stack.length - 1];
    if (!target) return;
    const at = stack.indexOf(target);
    if (at >= 0) stack.splice(at, 1);
    target.classList.remove('is-open', 'is-stacked');
    syncDrawers();
    if (!stack.length) $$('.is-selected').forEach((n) => n.classList.remove('is-selected'));
  }
  function closeAll() { while (stack.length) closeDrawer(); }

  /* ---------- Тосты ---------- */
  function toast(text, action) {
    let host = $('.toasts');
    if (!host) { host = document.createElement('div'); host.className = 'toasts'; document.body.appendChild(host); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<i data-lucide="check" class="ico-sm"></i><span>${text}</span>${action ? `<button class="toast-action">${action}</button>` : ''}`;
    host.appendChild(t);
    refreshIcons();
    setTimeout(() => t.remove(), 3200);
  }

  /* ---------- ⌘K ---------- */
  function renderCmdk() {
    const b = document.createElement('div');
    b.className = 'cmdk-backdrop';
    b.innerHTML = `
      <div class="cmdk" role="dialog" aria-label="Поиск и команды">
        <div class="cmdk-input"><i data-lucide="search"></i><input placeholder="Поиск по клиентам, заказам, броням или команда…" /><kbd>Esc</kbd></div>
        <div class="cmdk-list">
          <div class="cmdk-group">Действия</div>
          <a class="cmdk-item" href="schedule.html#new"><i data-lucide="calendar-plus"></i>Новая бронь<span class="sub">N</span></a>
          <a class="cmdk-item" href="orders.html#new"><i data-lucide="file-plus-2"></i>Создать заказ<span class="sub">O</span></a>
          <a class="cmdk-item" href="clients.html#new"><i data-lucide="user-plus"></i>Добавить клиента<span class="sub">C</span></a>
          <a class="cmdk-item" href="cashbox.html#income"><i data-lucide="circle-plus"></i>Записать доход в кассу</a>
          <div class="cmdk-group">Клиенты</div>
          <a class="cmdk-item" href="clients.html#client"><span class="avatar avatar-sm">КВ</span>Команда «Вектор»<span class="sub">Юр. лицо · +7 (900) 000-11-22</span></a>
          <a class="cmdk-item" href="clients.html#client"><span class="avatar avatar-sm">АК</span>Анна К.<span class="sub">Частный клиент</span></a>
          <div class="cmdk-group">Заказы</div>
          <a class="cmdk-item" href="orders.html#order"><i data-lucide="receipt-text"></i>Заказ #120461 · Команда «Вектор»<span class="sub">802 500 ₽</span></a>
        </div>
      </div>`;
    document.body.appendChild(b);
    b.addEventListener('click', (e) => { if (e.target === b) b.classList.remove('is-open'); });
    return b;
  }

  function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }

  /* ---------- Делегирование кликов ---------- */
  function onClick(e) {
    const t = e.target;

    const opener = t.closest('[data-drawer]');
    // Ссылка или кнопка внутри кликабельной строки работает сама по себе, строку не открывает
    const inner = t.closest('a[href], button, input, select, label');
    const ownAction = inner && opener && opener !== inner && opener.contains(inner) && !inner.hasAttribute('data-drawer');
    if (opener && !ownAction) {
      e.preventDefault();
      const inDrawer = !!opener.closest('.drawer');
      const selectable = opener.closest('.ev, .kanban-card, tr, .card-link, .list-row');
      if (selectable && !inDrawer) {
        $$('.is-selected').forEach((n) => n.classList.remove('is-selected'));
        selectable.classList.add('is-selected');
      }
      openDrawer(opener.dataset.drawer, { stack: inDrawer || opener.hasAttribute('data-stack') });
      return;
    }
    if (t.closest('[data-drawer-close]')) { closeDrawer(t.closest('.drawer')); return; }
    if (t.closest('.drawer-backdrop')) { closeAll(); return; }

    const tabBtn = t.closest('[data-tab]');
    if (tabBtn) {
      // Панели ищем в ближайшем [data-tabs-scope] (панель/карточка), иначе на странице
      const scope = tabBtn.closest('[data-tabs-scope]');
      const name = tabBtn.dataset.tab;
      $$('[data-tab]', tabBtn.parentElement).forEach((b) => b.classList.toggle('is-active', b === tabBtn));
      $$('[data-tab-panel]', scope || document)
        .filter((p) => p.closest('[data-tabs-scope]') === scope)
        .forEach((p) => p.classList.toggle('is-active', p.dataset.tabPanel === name));
    }

    const segBtn = t.closest('.seg button');
    if (segBtn) $$('button', segBtn.parentElement).forEach((b) => b.classList.toggle('is-active', b === segBtn));

    const chip = t.closest('[data-chip-group] .chip');
    if (chip) {
      const group = chip.closest('[data-chip-group]');
      if (group.dataset.chipGroup === 'multi') chip.classList.toggle('is-active');
      else $$('.chip', group).forEach((c) => c.classList.toggle('is-active', c === chip));
    }

    const toaster = t.closest('[data-toast]');
    if (toaster) {
      toast(toaster.dataset.toast, toaster.dataset.toastAction);
      if (toaster.closest('.drawer') && toaster.hasAttribute('data-close-after')) closeDrawer(toaster.closest('.drawer'));
    }

    const menuBtn = t.closest('[data-menu]');
    $$('.menu.is-open').forEach((m) => { if (!menuBtn || m.id !== menuBtn.dataset.menu) m.classList.remove('is-open'); });
    if (menuBtn) { const m = document.getElementById(menuBtn.dataset.menu); if (m) m.classList.toggle('is-open'); }

    const act = t.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      const app = $('.app');
      if (a === 'theme') toggleTheme();
      if (a === 'cmdk') { cmdk.classList.add('is-open'); $('input', cmdk).focus(); }
      if (a === 'side-collapse' && app) app.classList.toggle('is-collapsed');
      if (a === 'side-open' && app) app.classList.toggle('side-open');
    }
  }

  let cmdk;
  function init() {
    renderShell();
    backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    document.body.appendChild(backdrop);
    cmdk = renderCmdk();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk.classList.add('is-open'); $('input', cmdk).focus(); }
      if (e.key === 'Escape') {
        if (cmdk.classList.contains('is-open')) cmdk.classList.remove('is-open');
        else closeDrawer();
      }
    });
    // Открыть панель по хэшу: orders.html#order → #drawer-order
    const hash = location.hash.slice(1);
    if (hash && document.getElementById('drawer-' + hash)) openDrawer('drawer-' + hash);
    refreshIcons();
  }

  window.BI = { openDrawer, closeDrawer, closeAll, toast, refreshIcons };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
