# Карта компонентов

Как превратить классы макетов в компоненты фреймворка. Имена компонентов даны в Angular-стиле (`bi-*`); для React/Vue — те же сущности с PascalCase.

## 1. Из `assets/app.css` (общее)

| Блок в app.css | Компонент | Входы / заметки |
|---|---|---|
| AppShell (`.app`, `.main`, `.content`) | `bi-app-shell` | ставит `has-drawer` при открытой панели на ≥1280 px, `is-collapsed`, `side-open` |
| Sidebar (`.sidebar`, `.brand`, `.ws-switch`, `.nav-item`, `.nav-count`, `.side-foot`) | `bi-sidebar` | пункты из конфига навигации (в макете — `NAV` в app.js), счётчики из сторов, свёрнутый режим |
| Topbar (`.topbar`, `.crumbs`, `.search-trigger`, `.icon-btn .dot`) | `bi-topbar` | крошки из данных маршрута, точка непрочитанного |
| Mobile tab bar (`.tabbar`) | `bi-tabbar` | 5 пунктов (`TABBAR` в app.js), видим < 768 px |
| PageHeader (`.page-head`, `.page-sub`, `.actions`, `.toolbar`, `.section-head`) | `bi-page-header` + слоты; `bi-toolbar` | `.toolbar .grow` — поиск, `.spacer` — распорка |
| Button (`.btn`, `-primary/-dark/-ghost/-danger`, `-sm`, `-icon`, `-block`) | директива `biBtn` | одна `primary` на шапку и одна на футер панели |
| Form controls (`.field`, `.input`, `.select`, `.textarea`, `.input-wrap`, `.suffix`, `.form-grid`, `.span-2`, `.check`, `.switch`, `.is-invalid`, `.hint`, `.error-text`) | `bi-field` (label + control + hint/error), обычные инпуты с классами | ошибки из валидаторов формы |
| Segmented (`.seg`) | `bi-segmented` | ControlValueAccessor / v-model; 2–5 вариантов |
| Chips (`.chip`, `data-chip-group`) | `bi-chip-group` | `single | multi`, счётчик в чипе |
| Badge (`.badge-*`), `.tag` | `bi-badge [code] [entity]` | маппинг кода статуса → тон в одном месте (см. 02-design-system.md) |
| Money (`.money`, `.amount-plus/minus`) | pipe `money` | `6 750 ₽`, неразрывные пробелы, знак U+2212 |
| Card (`.card`, `.card-head`, `.card-link`), `.grid-2/3/4` | `bi-card` | `.card-link` — вся карточка кликабельна |
| Stat (`.stat`, `.stat-label/value/delta.up|down`), `.hero-money` | `bi-stat`, `bi-hero-money` | KPI-плитки, чёрный блок с крупной суммой |
| Table (`.table-wrap`, `.table`, `.ta-r`, `.cell-main/sub`, `.stack-mobile`, `.hide-mobile`, `.table-foot`, `.pager`) | `bi-table` или CDK table + стили | на мобиле строки → карточки-сетка 2 колонки без заголовков; второстепенное скрыть `hide-mobile` |
| List (`.list`, `.list-row`, `.kv`, `.avatar`) | `bi-list-row`, `bi-kv` | `.list-row[data-drawer]` — кликабельная строка с hover |
| Tabs (`.tabs`, `data-tab`, `data-tab-panel`) | `bi-tabs` | в панели — свой scope |
| Drawer (`.drawer`, `-wide`, `.drawer-head/body/foot`, `.drawer-actions`, `.drawer-money`, `.summary-box`, `.danger-zone`, `.drawer-backdrop`) | `DrawerService` + `bi-drawer-host` + `bi-drawer` (слоты head/body/foot) | см. 03-ux-patterns.md §1 |
| Timeline (`.timeline`, `.tl-item`) | `bi-timeline` | история событий (`business-events`) |
| Kanban (`.kanban`, `.kanban-col`, `.kanban-card`, `.kanban-add`) | `bi-kanban` | CDK drag-drop / dnd-kit / vuedraggable |
| Schedule (`.sched*`, `.ev-*`, `.sched-slot-free`, `.now-line`, `.legend`) | `bi-schedule` | позиция события: `top = (час − начало) × --hour-h`, высота = длительность × `--hour-h` |
| `.slot-pick` | `bi-slot-picker` | слоты из `booking-slots`, занятые `disabled` |
| Toast | `ToastService` | текст + действие «Вернуть», таймер |
| Command palette (`.cmdk`) | `bi-command-palette` | `Ctrl K`, `GET /search` |
| Menu (`.menu`, `data-menu`) | CDK overlay / Popover | выпадающее меню «⋯» |
| Empty state (`.empty`, `.empty-ico`) | `bi-empty` | иконка, заголовок, текст, действие |

## 2. Кандидаты в общие компоненты из локальных стилей страниц

Страницы верстались параллельно, и часть повторяющихся решений осталась в `<style>` страниц. При переносе вынести их в общие компоненты, а не копировать по страницам.

| Паттерн | Где сейчас (классы) | Предлагаемый компонент |
|---|---|---|
| Inline-подтверждение удаления с последствием | `cashbox.html` `.confirm-box`, `.btn-solid-danger`; `orders.html` `.ord-row-danger` | `bi-inline-confirm` |
| Inline-редактирование строки списка | `orders.html` `.ord-row-open`, `.ord-edit`, `.ord-edit-actions` | `bi-editable-row` |
| Крупный ввод суммы с «₽» | `cashbox.html` `.amount-input`, `.amount-wrap` | `bi-money-input` |
| Степпер количества | `orders.html` `.qty` | `bi-stepper` |
| Прогресс (оплата заказа, заполнение чек-листа) | `orders.html` `.kc-bar`, `.kc-paid`; `tasks.html` `.prog`, `.prog-meta` | `bi-progress` |
| Полоса загрузки по часам | `dashboard.html` `.tl-*`, `.sw-free`; `objects.html` `.obj-load` | `bi-occupancy-bar` |
| Разделитель дня с итогом в таблице | `cashbox.html`, `checklists.html` `tr.day-sep` | строка-группа в `bi-table` |
| Закреплённая первая колонка широкой таблицы | `checklists.html` `.ck-table` | опция `stickyFirst` у `bi-table` |
| Миниатюры и галерея фото | `checklists.html` `.thumb`, `.photo-grid`, `.photo-tile` | `bi-photo-thumb`, `bi-photo-gallery` (+ просмотр в панели) |
| Карточка-ссылка с кнопками поверх | `objects.html`/`object.html` `.obj-card`, `.cash-card`, `.place-card` (растянутая ссылка `::after`, кнопки `z-index:1`) | модификатор `bi-card [link]` |
| Пунктирная карточка «+ Добавить» | `object.html` `.place-add` | `bi-add-card` |
| Дни недели кружками | `settings.html` `.wd`, `.wd-row` | `bi-weekday-picker` (и для повтора брони) |
| Шкала периодов тарифа | `settings.html` `.scale*` | `bi-tariff-scale` |
| Сотрудник (аватар + имя + роль) | `settings.html` `.person`; `tasks.html` `.who`; `clients.html` `.client-cell` | `bi-person` |
| Строка ближайшей брони | `dashboard.html` `.bk-time`, `.bk-sum`, `.list-row.is-now` | `bi-booking-row` |
| Сегмент на всю ширину | `.seg-full` (clients, dashboard, object) | вход `block` у `bi-segmented` |
| Вертикальный стек секций в панели | `.stack`, `.stack-head` (clients, object) | утилита `stack` |
| Контейнер чипов | `.chip-row` / `.chips` (несколько страниц) | часть `bi-chip-group` |
| Графики | `reports.html` `.chart-*`, `.bar`, `.hbars` | библиотека графиков с токенами темы (ECharts / Chart.js); правила — skill dataviz или 02-design-system.md |
| Зона загрузки файла | `object.html` `.dropzone` | `bi-file-drop` |
| Экран входа | `login.html` `.login*` | остаётся локальным |

## 3. Что точно не переносить

- `assets/app.js` целиком: делегирование кликов по `data-*`, ручной стек панелей, `localStorage` для темы, генерация сайдбара строками. Всё это переписывается на сервисы и компоненты фреймворка.
- Атрибуты `data-drawer`, `data-tab`, `data-chip-group`, `data-toast` — это способ оживить статичный HTML; в приложении их место занимают обработчики и состояние.
- Инлайновые `style="…"` в разметке (встречаются для одиночных отступов) — заменить классами-утилитами.
