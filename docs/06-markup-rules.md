# Правила вёрстки статичных макетов (бриф для верстальщиков)

Цель — статичные HTML-страницы, по которым потом собирается Angular-приложение. Основа визуала — концепция из `Beinteam_PATI_Design.pdf` (тёплый Bone-фон, чёрный сайдбар, оранжевый — только действие, статус = цвет + слово).

## Главный UX-принцип
**Никаких модальных окон для работы с данными.** Создание, просмотр и редактирование — в правой боковой панели (`.drawer`). Контекст страницы (календарь, канбан, таблица) остаётся виден: на ширине ≥1280 px панель сдвигает контент, а не перекрывает. Из панели можно открыть вторую панель поверх (стек: бронь → оплата, заказ → бронь, клиент → редактирование). Подтверждение действия — тост с «Вернуть», а не диалог «Вы уверены?». Единственный оверлей — поиск/команды `Ctrl K`.

## Файлы
- `assets/tokens.css` — цвета, шрифты, размеры, тёмная тема. **Цвета только через `var(--…)`**, никаких hex в страницах.
- `assets/app.css` — все компоненты. Новые классы добавлять только в `<style>` своей страницы и только если в app.css нет подходящего.
- `assets/app.js` — каркас и поведение. Ничего своего на JS не писать, кроме крайней необходимости.
- `schedule.html` — **эталон**. Копировать из него `<head>`, каркас `.app`, разметку панелей.

## Каркас страницы (копировать как есть, менять data-page / data-crumbs / title)
```html
<body data-page="orders" data-crumbs="Campus Sport|Заказы">
<div class="app">
  <aside class="sidebar" data-shell="sidebar"></aside>
  <div class="main">
    <header class="topbar" data-shell="topbar"></header>
    <main class="content"> … </main>
  </div>
</div>
<!-- панели — после .app, прямыми детьми body -->
<aside class="drawer" id="drawer-xxx"> … </aside>
</body>
```
`data-page` ∈ dashboard, schedule, orders, clients, tasks, objects, cashbox, checklists, reports, settings.

## Поведение без JS — через атрибуты
| Атрибут | Что делает |
|---|---|
| `data-drawer="drawer-id"` | открывает панель; внутри панели — кладёт поверх (стек). На `.ev`, `.kanban-card`, `tr`, `.card-link`, `.list-row` ещё и подсвечивает выбранный элемент |
| `data-drawer-close` | закрывает свою панель |
| `data-tab="name"` + `data-tab-panel="name"` | вкладки; кнопки в `.tabs`, панели ищутся в ближайшем `[data-tabs-scope]` (или на странице). Активная — `.is-active` |
| `.seg > button` | сегментный переключатель, `.is-active` |
| `data-chip-group` (`="multi"` — мультивыбор) на контейнере `.chip` | фильтр-чипы |
| `data-toast="Текст"` (+ `data-toast-action="Вернуть"`, `data-close-after`) | тост; `data-close-after` закрывает панель |
| `data-menu="menu-id"` + `<div class="menu" id="menu-id">` | выпадающее меню |
| URL `page.html#name` | откроет `#drawer-name` при загрузке |

## Компоненты (app.css)
- Кнопки: `.btn`, `.btn-primary` (оранжевая, ОДНА главная на экране), `.btn-dark`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-icon`, `.btn-block`. Иконки — `<i data-lucide="name"></i>` (Lucide 0.460).
- Поля: `.field > label + .input|.select|.textarea` (+ `.hint`, `.error-text`, `.field.is-invalid`), `.input-wrap` (иконка слева / `.suffix` справа), `.form-grid` (2 колонки, `.span-2`), `.check`, `.switch`.
- Статусы: `.badge` + `.badge-paid` (оплачено/завершено), `.badge-confirmed`, `.badge-pending` (новая/ожидает/в работе), `.badge-error` (отмена/ошибка), `.badge-info` (перезвонить), без модификатора — нейтральный (черновик). `.tag` — нейтральная метка. Деньги: `.money`, `.amount-plus`, `.amount-minus`.
- Контейнеры: `.card`, `.card-link`, `.card-head`, `.grid .grid-2/3/4`, `.stat` (KPI: `.stat-label/.stat-value/.stat-delta.up|down`), `.hero-money` (чёрный блок с крупной суммой), `.divider`.
- Таблица: `.table-wrap > table.table` (`.ta-r`, `.cell-main`, `.cell-sub`, `tr.is-selected`), `.table-foot`; `.table-wrap.stack-mobile` — на мобиле строки в карточки, `td.hide-mobile`.
- Списки: `.list > .list-row` (`.grow .title .sub`), `.kv` (`<dl>` ключ-значение), `.avatar`, `.avatar-sm`.
- Шапка: `.page-head` (h1 + `.page-sub` + `.actions`), `.toolbar` (`.grow` для поиска, `.spacer`), `.section-head`, `.tabs`, `.seg`, `.chip`.
- Панель: `.drawer` (`.drawer-wide` — 640 px) → `.drawer-head` (`.overline`, `h2`, `.drawer-sub`, кнопка закрытия `.icon-btn[data-drawer-close]`) → `.drawer-body` (`.drawer-section > h3`, `.drawer-money`, `.summary-box > .row (.total)`) → `.drawer-foot` (Отмена слева, главная кнопка справа).
- Прочее: `.timeline > .tl-item`, `.kanban > .kanban-col > .kanban-card`, `.kanban-add`, `.empty`, `.legend`, `.overline`, `.muted`, `.subtle`, `.num`.

## Тексты и данные
- Весь UI по-русски, валюта «₽» после числа через неразрывный пробел (`6 750 ₽`), разряды — пробелом. Даты «21 сентября · 17:00–18:00», тире в диапазонах «–».
- Только демонстрационные данные: «Команда «Вектор»», «Анна К.», «Школа «Старт»», «Команда «Орбита»», «Алексей М.». Телефоны вида `+7 (900) 000-11-22`, e-mail `client@example.com`. Объекты: Авиамоторная, Авиамоторная 2, Белорусская, Беляево, Водный, Нагорная, Кутузовский, Синергия, Перово, Сокол.
- Компания — Campus Sport. Сезон — сентябрь 2026.

## Адаптив
Desktop-first, проверка на 1440 и 375. На мобиле сайдбар уезжает, снизу таббар (делает app.js), панели — на весь экран, канбан листается колонками. Не делать горизонтальный скролл страницы (кроме таблиц/канбана/расписания внутри своих контейнеров).

## Чек-лист перед сдачей
- [ ] страница открывается без ошибок в консоли, все `data-drawer` ведут на существующие `id`;
- [ ] нет `<dialog>`, модалок, `alert()`; нет hex-цветов в разметке;
- [ ] у каждой панели есть заголовок, кнопка закрытия и (для форм) футер «Отмена / Действие»;
- [ ] одна `.btn-primary` в шапке страницы и одна в футере панели;
- [ ] пустые/граничные состояния, где уместно (нет задач, нет операций).
