# Перенос макетов на Angular

Макеты `new-design/*.html` — статичная разметка с теми же классами и токенами, которые пойдут в приложение. Ниже — как разложить их на компоненты. Версия Angular — 21 (сверено через context7): standalone по умолчанию, zoneless по умолчанию, signals, новый control flow `@if / @for`.

## Стили
| Макет | Angular |
|---|---|
| `assets/tokens.css` | `src/styles/_tokens.scss` — подключается глобально, CSS-переменные как есть |
| `assets/app.css` | глобальные утилиты (`.btn`, `.badge`, `.field`, `.table`) — `src/styles/_ui.scss`; блоки с заголовком `=== Имя ===` переезжают в стили своих компонентов |
| `<style>` в страницах | стили компонента страницы |
| Тема | `ThemeService` (signal `theme`), ставит `data-theme` на `<html>`; в тёмной теме меняются только токены |
| Иконки | `lucide-angular` (та же библиотека, что в макетах) |
| Шрифты | Onest (заголовки), Golos Text (текст) — self-host через `@fontsource` |

## Каркас и навигация
- `AppShellComponent` — `.app`: `<bi-sidebar>`, `<bi-topbar>`, `<router-outlet>`, `<bi-drawer-host>`, `<bi-tabbar>` (мобильный).
- `SidebarComponent` — пункты из конфига (в макете массив `NAV` в `app.js`), активный пункт через `routerLinkActive`, свёрнутый режим — signal в `LayoutService`.
- `TopbarComponent` — хлебные крошки из `data` маршрутов, `Ctrl K`, чат, уведомления, тема.
- Маршруты: `/today`, `/schedule/:placeId`, `/orders`, `/clients`, `/tasks`, `/objects`, `/objects/:id`, `/objects/:id/cashbox/:cashboxId`, `/checklists`, `/reports`, `/settings/:tab`, `/login`.

## Боковые панели — главный паттерн
Замена текущих `useModal`, вложенных `<Modal>`, `useSnackActionsDialog` и `confirm()`.

```ts
@Injectable({ providedIn: 'root' })
export class DrawerService {
  readonly stack = signal<DrawerRef[]>([]);
  open<T>(component: Type<T>, data?: unknown, opts?: { stack?: boolean; wide?: boolean }): DrawerRef<T>;
  close(ref?: DrawerRef, result?: unknown): void; // результат → afterClosed() для обновления списка
}
```
- `DrawerHostComponent` рисует стек (`.drawer`, `.is-stacked`), backdrop на <1280 px, Esc, фокус-ловушку (`@angular/cdk/a11y`). На ≥1280 px ставит `has-drawer` на shell → контент сдвигается.
- Состояние панели в URL: `?booking=245992`, `?order=120461`, `?client=…` — открытие из поиска, уведомлений, по ссылке.
- `afterClosed()` заменяет событие `modal-close`: страница перечитывает данные.
- Подтверждения — `ToastService.show(text, { action: 'Вернуть' })` с отложенным запросом либо inline-блок внутри панели (удаление позиции заказа с «вернуть деньги»).

| Панель (id в макете) | Компонент | Заменяет в текущем коде |
|---|---|---|
| `drawer-booking` | `BookingPanelComponent` | `BookingCard`, `BookingEdit`, `BookingStatusChange` |
| `drawer-new` | `BookingCreatePanelComponent` | `AddBooking`, `SearchContact`→`NewContactCardModal` |
| `drawer-pay` / `drawer-order-pay` | `PaymentPanelComponent` | `BookingPay` |
| `drawer-order-link` | `PaymentLinkPanelComponent` | `BookingPay(createLink)` + `PaymentLink` |
| `drawer-order` | `OrderPanelComponent` | `OrderProducts`, `OrderEdit`, snack S1–S5 |
| `drawer-order-payments` | `OrderTransactionsPanelComponent` | `OrderTransactions`, snack S6 |
| `drawer-events`, `drawer-order-events` | `EventsPanelComponent` | `BusinessEvents` |
| `drawer-client`, `drawer-client-edit`, `drawer-client-new` | `ClientPanelComponent` (режимы view/edit/new) | `NewContactCardModal`, `ContactEdit` |
| `drawer-legal` | `LegalPanelComponent` | `LegalContactForm` |
| `drawer-income` / `drawer-expense` / `drawer-cash-op` | `CashOperationPanelComponent` | `Encash` |
| `drawer-tx` | `CashTransactionPanelComponent` | `confirm()` в кассе |
| `drawer-task`, `drawer-task-new` | `TaskPanelComponent` | — (новое) |
| `drawer-result` | `ChecklistResultPanelComponent` | широкая таблица без деталей |
| `drawer-object-edit`, `drawer-place-edit` | `ObjectSettingsPanelComponent`, `PlacePanelComponent` | — (новое, API есть) |
| `drawer-tariff`, `drawer-rule`, `drawer-worksched`, `drawer-access` | панели раздела «Настройки» | — (новое, API есть) |

## Общие компоненты
`ButtonDirective` (`biBtn="primary|dark|ghost|danger"`), `BadgeComponent` (вход — код статуса заказа/задачи → класс и текст), `MoneyPipe` (`6 750 ₽`, неразрывные пробелы), `SegmentedComponent`, `ChipGroupComponent` (single/multi, ControlValueAccessor), `TabsComponent`, `KvListComponent`, `StatComponent`, `TimelineComponent`, `EmptyStateComponent`, `CommandPaletteComponent` (поиск — `GET /search?types=…&q=…`), `ToastService`.

`ScheduleComponent` — сетка `.sched`: входы `days`, `places` (режим «Площадки» — колонки площадок одного дня), `bookings`, `slots` (`GET /places/{id}/booking-slots` → свободные слоты с ценой); выходы `slotClick`, `bookingClick`. Позиция брони: `top = (час − начало дня) × --hour-h`. Склейку запросов по диапазону дат (`withQueueRequests` в текущем коде) переносим в `BookingsStore`.

`KanbanComponent` — колонки из `order-states` (сортировка по `sort`), перетаскивание через `@angular/cdk/drag-drop` → `PUT /manager/orders/{id}/state/{state_id}`.

## Данные
- HTTP-слой: функциональный interceptor с `Authorization` и одним повтором на 401 через `token/refresh` (как `HttpClient` в `src/lib/http/client.ts`).
- Сторы — signals (`signal`/`computed`/`resource`), по сущностям: `OrdersStore`, `BookingsStore`, `ClientsStore`, `CashboxStore`, `DictionariesStore` (статусы, активности, типы оплат, источники).
- Права (`Permission` из API) — структурная директива `*biCan="'ORDER_TRAN_BASE_CREATE'"` скрывает кнопки.
- Формы — reactive forms (или signal forms, когда стабилизируются); подписи полей постоянные, ошибки под полем.

## Порядок переноса (предложение)
1. Токены, шрифты, shell, `DrawerService`, `ToastService`, тема.
2. Расписание + панели брони/оплаты (главный сценарий администратора).
3. Заказы (канбан + панель заказа).
4. Клиенты, касса.
5. Задачи, чек-листы (заполнение SurveyJS — отдельная полноэкранная страница), объекты.
6. Настройки (тарифы, графики, доступ) — новое, бэкенд готов.

## Другие фреймворки
Паттерны не завязаны на Angular. Соответствие:

| Что | Angular 21 | React 19 | Vue 3 | Svelte 5 |
|---|---|---|---|---|
| Стек панелей | `DrawerService` (signal) + `DrawerHost` | контекст/Zustand-стор + портал | Pinia-стор + `<Teleport>` | `$state` в модуле + портал |
| Состояние панели в URL | query params Router | `useSearchParams` | `route.query` | `$page.url.searchParams` |
| Drag-n-drop канбана | `@angular/cdk/drag-drop` | `@dnd-kit/core` | `vuedraggable` | `svelte-dnd-action` |
| Focus trap, a11y | `@angular/cdk/a11y` | `focus-trap-react` | `focus-trap` | `focus-trap` |
| Иконки | `lucide-angular` | `lucide-react` | `lucide-vue-next` | `lucide-svelte` |
| Формы | reactive / signal forms | react-hook-form + zod | vee-validate | superforms |
| Данные | signals + `resource` | TanStack Query | TanStack Query / Pinia | runes + load |

Во всех вариантах `tokens.css` подключается как есть, `app.css` разбирается по компонентам (см. 07-components.md), `app.js` не переносится.
