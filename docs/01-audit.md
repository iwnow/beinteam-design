# Аудит текущего UI и карта экранов нового дизайна

Источник: `web/src` (SvelteKit) + `https://test.beinteam.ru/api/openapi.json`. Подготовлено для вёрстки макетов `new-design/` и последующего переноса на Angular.

## 1. Что не так сейчас

В приложении 4 механизма всплывающих окон, и они вкладываются друг в друга до трёх уровней:

| Механизм | Где | Проблема |
|---|---|---|
| `useModal()` — центральная модалка (svelte-simple-modal) | 19 мест: заказ, бронь, клиент, касса, новая бронь | Закрывает контекст: календарь/канбан не видно |
| Вложенная `<Modal>` внутри `BookingCard` / `OrderProducts` | 2-й уровень: смена статуса, оплата, события, ссылка на оплату, редактирование | Модалка в модалке |
| `useSnackActionsDialog()` — нижний диалог с формой | удаление позиции → «вернуть деньги?» → … | 3-й уровень, формы в «снэке» |
| Нативные `confirm()` / `alert()` | удаление операции кассы, выход, запрет чек-листа | Выбивается из UI |

Самые перегруженные компоненты: `OrderProducts.svelte` (заказ + состав + оплата + ссылка + 6 snack-диалогов), `BookingCard.svelte` (бронь + блок заказа + 8 вложенных модалок), `AddBooking.svelte` (создание брони, поиск клиента → модалка нового клиента 3-го уровня).

Также: канбан заказов без drag-n-drop (статус меняется только через модалку); у правой панели (`useRightDrawer`) уже есть режим push — он используется только для поиска/чата/уведомлений, его и делаем основным паттерном.

## 2. Решение
Единая правая панель (drawer) со стеком: Бронь → Оплата → Ссылка на оплату; Заказ → Бронь-позиция; Клиент → Юр. лицо. Подтверждения — inline внутри панели или тост «Вернуть». Deep-link `?order=ID`, `?booking=ID`, `?client=ID` открывают панель поверх текущей страницы.

## 3. Сущности API (★ — обязательное)

- **Order** — id★, object_id★, state_id★ + state{code,name}, customer, legal_id, source (CRM/сайт/виджет), comment, is_notifications_enabled, amount_total★, amount_paid★, created_at/by, order_products[].
  **Статусы заказа (OrderStateCode):** `DRAFT` Черновик, `NEW` Новый, `WAIT_CONF` Ожидает подтверждения, `WAIT_PREPAYM` Ожидает предоплаты, `CONF` Подтверждён, `PAID` Оплачен, `CANC` Отменён. На тесте есть пользовательский статус «Перезвонить». Смена — `PUT /manager/orders/{id}/state/{state_id}`.
- **OrderProduct** — product (`rent_place` = аренда площадки, прочие — товары: мячи, манишки…), quantity★, amount, amount_paid, is_paid, place_booking. Удаление с флагом `cancel_payments` («вернуть деньги на счёт клиента»).
- **PlaceBooking** — place_id★, section_id, date_from★, date_to★, activity_id, comment, order_id. **Своего статуса у брони нет** — цвет в расписании = статус заказа. Бронь без заказа = «блокировка» (техбронь).
- **Оплата** — `POST /manager/orders/{id}/transactions {payment_type, product_payments[{id, amount}]}`; способы: CASH Наличные, CARDTF Перевод на карту, TERM Терминал, QR, BNKACC Расчётный счёт, CUSTACC Счёт клиента, ACQ Онлайн-эквайринг.
- **Ссылка на оплату** — `POST .../payment-links {payments[]}` → link; статусы NEW, WAITCAPT, SUCCEEDED, CANCELED, REFUNDED; шаблоны сообщений с подстановкой ссылки/площадки/времени; отправка в WhatsApp.
- **Customer** — name★ (отображаемое), contact{first_name★, last_name★, email, phone, phone2}, comment, is_notifications_enabled, notification_channel (max / telegram / email / sms); баланс — `GET /customers/{id}/account-balance`.
- **Legal** — name★, customer_id, requisites{inn, kpp, ogrn, bik, account_number, corr_account_number, legal_address, physical_address}.
- **Object** — name★, address, city, metro[], enable_draft, payment_percent_default (предоплата, %), booking_freeze_interval (с/по — окно запрета онлайн-брони), yookassa{…}, places[].
- **Place** — name★, dimensions{length,width,height}, is_sectioned + sections[], activities[], cameras[{name,url}], cover, photo.
- **Cashbox** — payment_type{name, code}, account.balance, is_hidden, allow_manual_payment. **Операции** — тип (INC_ORDER оплата заказа, INC_OTHER прочий доход, INC_PAYM_ONLINE онлайн, INC_ORDER_RETURN возврат, EXP_ENCASH инкассация, EXP_OTHER прочий расход, EXP_ORDER), category, amount, comment★, order_id, автор, дата. Ручную операцию можно удалить, операцию по заказу — нет.
- **Task** — title★, description, object, process_id (2 — смена/обход, 3 — бар), state (NEW Новая, INPROGRESS В работе, CLOSED Завершена, REJECTED Отклонена), checklist (SurveyJS), checklist_result, ordered_at, автор.
- **Тарифы** — tariff{name, default_amount, periods[{start, end, amount}]}; правила тарифа {place, section, tariff, date_from, date_to, weekdays[]}; график работы {place, section, date_from, date_to, data[{day, start, end}]}. Расчёт цены — `GET /places/{id}/booking-calculate`; слоты — `GET /places/{id}/booking-slots` → {dt, is_available, amount}.
- **SlotOffer** (горящее предложение) — place, date_from/to, base_amount, offer_amount, discount_pct, status (ACTIVE, RESERVED, BOOKED, EXPIRED, CANCELLED), expires_at, публичная ссылка.
- **Права** — роли на объект: ADMIN, VIEWER, TASK_CREATOR, TASK_MODERATOR, TASK_VIEWER, ENCASHER; права-флаги (ORDER_*, PB_*, CASHBOX_OP_*, CUSTOMER_BALANCE_READ…) — для скрытия кнопок.
- **События** — `business-events` по orders / order_products / payment_links / place_bookings: create/update/delete, данные, пользователь, время.

## 4. Карта экранов и панелей

| Страница | Файл | Панели (drawer) |
|---|---|---|
| Вход | `login.html` | — (логин/пароль, Telegram) |
| Сегодня (новое) | `dashboard.html` | бронь, заказ — те же, что ниже |
| Расписание | `schedule.html` | новая бронь (Заказ / Блокировка, клиент-комбобокс с inline «Новый клиент», слоты с ценой, повтор по дням), бронь (данные брони + блок заказа со сменой статуса inline), оплата, изменить бронь, события, закрыть время |
| Заказы | `orders.html` | заказ (статус dropdown, клиент, состав по месяцам с чекбоксами, inline-редактирование позиции, inline-удаление с «вернуть деньги»), оплата, ссылка на оплату (2 шага), платежи по заказу, события, + бронь в заказ, + товар, новый заказ |
| Клиенты | `clients.html` | клиент (профиль, баланс, заказы, юр. лица), редактирование клиента, юр. лицо, новый клиент |
| Объекты | `objects.html` | настройки объекта, площадка (создать/изменить) |
| Объект | `object.html` | кассы, смены/чек-листы, площадки; панели — операция кассы, площадка |
| Касса | `cashbox.html` | доход / расход (с балансом после операции), операция (детали, удаление inline) |
| Задачи | `tasks.html` | задача (просмотр, смена статуса, результат чек-листа), новая задача |
| Чек-листы | `checklists.html` | результат чек-листа (ответы карточкой, фото-галерея) |
| Отчёты | `reports.html` | — (встроенные Superset-дашборды) |
| Настройки | `settings.html` | тариф, правило тарифа, график работы, доступ сотрудника |

Глобально (topbar): поиск `Ctrl K` (результат открывает панель поверх текущей страницы), чат WhatsApp, уведомления о новых заказах, переключение темы.

## 5. Адаптив
- ≥1280 px: панель толкает контент (push), календарь/канбан видны.
- 768–1279 px: панель поверх с затемнением.
- <768 px: панель на весь экран, снизу таббар, канбан листается колонками, таблицы → карточки.
