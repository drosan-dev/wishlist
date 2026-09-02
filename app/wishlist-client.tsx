'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ExternalLink,
  Gift,
  Gamepad2,
  Home,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Undo2,
} from 'lucide-react';

type Wish = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  details?: string;
  priority?: string;
  category: 'Книги' | 'Творчество' | 'Для дома' | 'Техника';
  link?: string;
  image?: string;
};

type DeviceReservation = {
  giftId: string;
  title: string;
  token: string;
};

const reservationStorageKey = 'anton-wishlist-reservations-v1';

const wishes: Wish[] = [
  {
    id: 'dragonlance-legends',
    title: 'DragonLance',
    eyebrow: 'Фэнтези · книги',
    description: 'Что угодно из цикла — можно искать хорошие варианты с рук и смотреть на состояние.',
    details: '«Драконы осенних сумерек» и «Драконы зимней ночи» уже прочитаны электронно, поэтому менее приоритетны.',
    priority: 'В приоритете: «Час близнецов», «Битва близнецов», «Испытание близнецов»',
    category: 'Книги',
  },
  {
    id: 'dark-elf',
    title: 'Сага о тёмном эльфе',
    eyebrow: 'Роберт Сальваторе',
    description: 'Хочу начать вникать в историю Дзирта и этот мир.',
    priority: 'Хороший старт: «Отступник», «Изгнанник», «Странствие»',
    category: 'Книги',
  },
  {
    id: 'perelman',
    title: 'Яков Перельман',
    eyebrow: 'Научпоп',
    description: 'Подойдёт что угодно от Перельмана — его книг у меня пока нет.',
    details: 'С другим хорошим научпопом есть риск попасть в книгу, которая у меня уже есть.',
    category: 'Книги',
  },
  {
    id: 'lord-of-the-rings',
    title: 'Властелин колец',
    eyebrow: 'Особенное издание',
    description: 'Хочется по-настоящему красивое издание, можно б/у и недорого. Обычная версия для такой великой книги кажется скучной.',
    priority: 'По переводу и конкретному изданию лучше посоветоваться с Павлом',
    category: 'Книги',
  },
  {
    id: 'wild-cards',
    title: 'Дикие карты',
    eyebrow: 'Антология · цикл',
    description: 'Что-нибудь из цикла «Дикие карты». Конкретный том можно выбрать самостоятельно.',
    category: 'Книги',
  },
  {
    id: 'lich-rpg',
    title: 'Пополнение НРИ-библиотеки',
    eyebrow: 'Настольные ролевые игры',
    description: '«Как воскресить лича», «Как поженить лича» или другая хорошая книга для настольных ролевых игр.',
    category: 'Книги',
  },
  {
    id: 'marvel-spines',
    title: 'Коллекция Marvel',
    eyebrow: 'Комиксы',
    description: 'Красивые издания, которые складываются в общую картинку на корешках. Несколько томов могут стать стартом коллекции.',
    category: 'Книги',
  },
  {
    id: 'retro-handheld',
    title: 'Портативная ретроконсоль',
    eyebrow: 'Техника · ретроигры',
    description: 'Хочу небольшую портативную консоль, на которой приятно перепроходить старые игры — кинул в рюкзак и играешь где угодно.',
    details: 'Не обязательно дорогую, но проверенную: хороший экран, удобные кнопки, нормальная сборка и прошивка без постоянной возни.',
    priority: 'Главное — не безымянная китайская игрушка с маркетплейса, а действительно качественная модель. Заодно можно закинуть туда несколько любимых ретроигр, в которые вам хочется, чтобы я сыграл.',
    category: 'Техника',
  },
  {
    id: 'craft-kit',
    title: 'Что-то сделать руками',
    eyebrow: 'Творчество',
    description: 'Хороший крафтовый набор или занятие, в котором можно собрать, нарисовать или сделать настоящую вещь.',
    details: 'Здесь особенно ценна ваша личная идея: выберите то, что, как вам кажется, меня увлечёт.',
    category: 'Творчество',
  },
  {
    id: 'cozy-home',
    title: 'Милое и уютное для дома',
    eyebrow: 'Атмосфера',
    description: 'Небольшая вещь, которая сделает дом уютнее и которой действительно захочется пользоваться.',
    details: 'Лучше что-то живое и личное, а не сувенир, который существует только ради шутки.',
    category: 'Для дома',
  },
];

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

function NativeModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="gift-dialog" onCancel={onClose} onClose={onClose}>{children}</dialog>;
}

export function WishlistExperience() {
  const [category, setCategory] = useState('Все');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Wish | null>(null);
  const [reserved, setReserved] = useState<Set<string>>(new Set());
  const [reserveState, setReserveState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cancelCode, setCancelCode] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelInput, setCancelInput] = useState('');
  const [cancelState, setCancelState] = useState<'idle' | 'loading' | 'success' | 'invalid' | 'error'>('idle');
  const [deviceReservations, setDeviceReservations] = useState<DeviceReservation[]>([]);
  const [activeCancelToken, setActiveCancelToken] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(reservationStorageKey) ?? '[]') as DeviceReservation[];
      if (Array.isArray(saved)) setDeviceReservations(saved.filter((item) => item?.giftId && item?.title && item?.token));
    } catch {
      try { localStorage.removeItem(reservationStorageKey); } catch { /* Storage can be disabled by the browser. */ }
    }
  }, []);

  function saveDeviceReservations(items: DeviceReservation[]) {
    setDeviceReservations(items);
    try { localStorage.setItem(reservationStorageKey, JSON.stringify(items)); } catch { /* The code is still shown for manual saving. */ }
  }

  useEffect(() => {
    if (!apiBase) return;
    const ids = wishes.map((wish) => wish.id).join(',');
    fetch(`${apiBase}/api/gifts?ids=${encodeURIComponent(ids)}`)
      .then((response) => response.ok ? response.json() as Promise<Array<{ id: string; availability: string }>> : Promise.reject())
      .then((items: Array<{ id: string; availability: string }>) => {
        setReserved(new Set(items.filter((item) => item.availability === 'reserved').map((item) => item.id)));
      })
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => wishes.filter((wish) => {
    const matchesCategory = category === 'Все' || wish.category === category;
    const haystack = `${wish.title} ${wish.eyebrow} ${wish.description} ${wish.details ?? ''}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  }), [category, query]);

  async function reserveWish() {
    if (!selected) return;
    setReserveState('loading');
    if (!apiBase) {
      setReserveState('error');
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/gifts/${selected.id}/reserve`, { method: 'POST' });
      if (!response.ok) throw new Error('reserve_failed');
      const result = await response.json() as { cancelToken: string };
      setCancelCode(result.cancelToken);
      saveDeviceReservations([
        ...deviceReservations.filter((item) => item.giftId !== selected.id),
        { giftId: selected.id, title: selected.title, token: result.cancelToken },
      ]);
      setReserved((current) => new Set(current).add(selected.id));
      setReserveState('success');
    } catch {
      setReserveState('error');
    }
  }

  async function cancelReservation(savedToken?: string) {
    const token = (savedToken ?? cancelInput).trim();
    if (!token) return;
    setActiveCancelToken(token);
    setCancelState('loading');
    if (!apiBase) {
      setCancelState('error');
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/reservations/cancel`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error('cancel_failed');
      const result = await response.json() as { cancelled: boolean };
      if (!result.cancelled) {
        if (savedToken) saveDeviceReservations(deviceReservations.filter((item) => item.token !== token));
        setCancelState('invalid');
        setActiveCancelToken('');
        return;
      }
      saveDeviceReservations(deviceReservations.filter((item) => item.token !== token));
      setCancelInput('');
      setActiveCancelToken('');
      setCancelState('success');
      const ids = wishes.map((wish) => wish.id).join(',');
      try {
        const availabilityResponse = await fetch(`${apiBase}/api/gifts?ids=${encodeURIComponent(ids)}`);
        if (availabilityResponse.ok) {
          const items = await availabilityResponse.json() as Array<{ id: string; availability: string }>;
          setReserved(new Set(items.filter((item) => item.availability === 'reserved').map((item) => item.id)));
        }
      } catch { /* Cancellation succeeded even if the status refresh did not. */ }
    } catch {
      setActiveCancelToken('');
      setCancelState('error');
    }
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_gift_reservation',
      title: 'Выбрать подарок',
      description: 'Открывает подтверждение анонимного бронирования выбранного подарка.',
      inputSchema: { type: 'object', properties: { giftId: { type: 'string' } }, required: ['giftId'], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input: unknown) {
        const id = typeof input === 'object' && input ? (input as { giftId?: unknown }).giftId : undefined;
        const wish = wishes.find((item) => item.id === id);
        if (!wish) throw new Error('Неизвестный подарок');
        setSelected(wish);
        setReserveState('idle');
        return { giftId: wish.id, status: 'confirmation_opened' };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <>
      <section className="wishlist-section" id="wishes" aria-labelledby="wishes-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><Sparkles size={15} /> Список желаний</p>
            <h2 id="wishes-title">То, чему я<br />правда обрадуюсь</h2>
          </div>
          <p>Это не список покупок и не обещание, что подойдёт любая версия вещи. Детали, качество и ваш собственный выбор по-прежнему важны.</p>
        </div>

        <div className="wishlist-tools">
          <div className="category-tabs" role="group" aria-label="Категории пожеланий">
            {['Все', 'Книги', 'Техника', 'Творчество', 'Для дома'].map((item) => (
              <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Поиск по пожеланиям</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти идею" />
          </label>
        </div>

        <div className="wishlist-meta">
          <p aria-live="polite">{filtered.length === 1 ? 'Найдена 1 идея' : `Найдено идей: ${filtered.length}`}</p>
          <button type="button" className="cancel-reservation-link" onClick={() => { setCancelOpen(true); setCancelState('idle'); }}>
            <Undo2 size={15} /> {deviceReservations.length ? `Мои брони: ${deviceReservations.length}` : 'Отменить бронь по коду'}
          </button>
        </div>

        {filtered.length ? (
          <div className="wish-grid">
            {filtered.map((wish, index) => {
              const isReserved = reserved.has(wish.id);
              const ownReservation = deviceReservations.find((item) => item.giftId === wish.id);
              return (
                <article className={`wish-card ${wish.image ? 'wish-card-featured' : ''} ${isReserved ? 'is-reserved' : ''} ${ownReservation ? 'is-own-reservation' : ''}`} key={wish.id}>
                  {wish.image ? (
                    <div className="wish-image"><img src={wish.image} alt="Пример нужного единого оформления серии «Песнь льда и пламени»" /></div>
                  ) : (
                    <div className={`wish-symbol symbol-${index % 4}`} aria-hidden="true">
                      {wish.category === 'Книги' ? <BookOpen /> : wish.category === 'Техника' ? <Gamepad2 /> : wish.category === 'Творчество' ? <Palette /> : <Home />}
                    </div>
                  )}
                  <div className="wish-card-body">
                    <div className="wish-status-row">
                      <p className="card-eyebrow">{wish.eyebrow}</p>
                      <span className={`availability ${isReserved ? 'reserved' : ''} ${ownReservation ? 'own' : ''}`}>{ownReservation ? <><Check size={13} /> Вы выбрали</> : isReserved ? <><Check size={13} /> Уже выбрали</> : 'Свободно'}</span>
                    </div>
                    <h3>{wish.title}</h3>
                    <p>{wish.description}</p>
                    {wish.priority && <p className="priority-note"><Sparkles size={14} /> {wish.priority}</p>}
                    {wish.details && <p className="wish-details">{wish.details}</p>}
                    <div className="card-actions">
                      <button type="button" disabled={isReserved && !ownReservation} className={`reserve-button ${ownReservation ? 'cancel-own-button' : ''}`} onClick={() => {
                        if (ownReservation) {
                          setCancelInput(ownReservation.token);
                          setCancelOpen(true);
                          setCancelState('idle');
                        } else {
                          setSelected(wish);
                          setReserveState('idle');
                          setCancelCode('');
                        }
                      }}>
                        {ownReservation ? 'Отменить мою бронь' : isReserved ? 'Подарок уже выбрали' : 'Я хочу это подарить'}
                      </button>
                      {wish.link && <a href={wish.link} target="_blank" rel="noopener noreferrer" className="example-link">Открыть пример <ExternalLink size={14} /></a>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="empty-state">По этому запросу ничего не нашлось. Попробуйте другую формулировку.</div>}
      </section>

      <section className="not-wanted-section" id="not-wanted" aria-labelledby="not-wanted-title">
        <div className="section-heading inverse">
          <div><p className="eyebrow">Что лучше не дарить</p><h2 id="not-wanted-title">Пусть вещь останется нужной</h2></div>
          <p>Хочется сохранить подарок и действительно им пользоваться, а не искать через некоторое время, куда его пристроить.</p>
        </div>
        <div className="not-grid">
          <article><span>01</span><h3>Подарки только ради шутки</h3><p>Если после первого смеха вещь становится ненужной, лучше выбрать что-нибудь другое.</p></article>
          <article><span>02</span><h3>Настолки наугад</h3><p>Только если вы на двести процентов уверены, что игра мне зайдёт и мы достанем её больше одного раза.</p></article>
          <article><span>03</span><h3>Книги «для прикола»</h3><p>Книгу не из списка стоит дарить, если вы правда хотите, чтобы я её прочитал, и думаете, что она мне подойдёт.</p></article>
        </div>
      </section>

      <NativeModal open={Boolean(selected)} onClose={() => setSelected(null)}>
          <div className="dialog-header">
            <p className="dialog-kicker"><ShieldCheck size={16} /> Анонимная бронь</p>
            <h2>{reserveState === 'success' ? 'Готово, подарок забронирован' : `Забронировать «${selected?.title ?? ''}»?`}</h2>
            <p>{reserveState === 'success' ? 'Другие посетители увидят, что идея уже выбрана, но не узнают кем. Код отмены сохранён в этом браузере.' : 'Другие увидят только статус — ваше имя и контакты не нужны.'}</p>
          </div>
          {reserveState === 'success' ? (
            <label className="form-field"><span>Секретный код для отмены</span><input value={cancelCode} readOnly onFocus={(event) => event.currentTarget.select()} /></label>
          ) : reserveState === 'error' ? (
            <p className="form-error" role="alert">Общее хранилище ещё не подключено. После настройки Cloudflare бронь заработает для всех посетителей.</p>
          ) : null}
          <div className="dialog-footer-custom">
            <button type="button" className="secondary-button" onClick={() => setSelected(null)}>Закрыть</button>
            {reserveState !== 'success' && <button type="button" className="primary-button" onClick={reserveWish} disabled={reserveState === 'loading'}>{reserveState === 'loading' ? 'Бронируем…' : 'Забронировать'}</button>}
          </div>
      </NativeModal>

      <NativeModal open={cancelOpen} onClose={() => setCancelOpen(false)}>
          <div className="dialog-header">
            <p className="dialog-kicker"><Undo2 size={16} /> Отмена брони</p>
            <h2>{cancelState === 'success' ? 'Бронь отменена' : 'Введите секретный код'}</h2>
            <p>{cancelState === 'success' ? 'Подарок снова отмечен как свободный — его смогут выбрать другие.' : 'Это тот код, который был показан сразу после бронирования. Он не раскрывает, какой подарок вы выбрали.'}</p>
          </div>
          {cancelState !== 'success' && (
            <>
              {deviceReservations.length > 0 && (
                <div className="saved-reservations">
                  <p>Сохранено на этом устройстве</p>
                  {deviceReservations.map((reservation) => (
                    <div className="saved-reservation" key={reservation.token}>
                      <span>{reservation.title}</span>
                      <button type="button" onClick={() => cancelReservation(reservation.token)} disabled={cancelState === 'loading'}>
                        {activeCancelToken === reservation.token ? 'Отменяем…' : 'Отменить'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="form-field">
                <span>{deviceReservations.length ? 'Или введите другой код' : 'Секретный код отмены'}</span>
                <input value={cancelInput} onChange={(event) => { setCancelInput(event.target.value); if (cancelState !== 'idle') setCancelState('idle'); }} autoComplete="off" spellCheck={false} placeholder="Вставьте сохранённый код" />
              </label>
            </>
          )}
          {cancelState === 'invalid' && <p className="form-error" role="alert">Бронь с таким кодом не найдена. Проверьте, что код скопирован полностью и без лишних символов.</p>}
          {cancelState === 'error' && <p className="form-error" role="alert">Не удалось связаться с хранилищем. Попробуйте ещё раз немного позже.</p>}
          {cancelState === 'success' && <p className="form-success" role="status"><Check size={16} /> Всё готово. Секретный код больше не действует.</p>}
          <div className="dialog-footer-custom">
            <button type="button" className="secondary-button" onClick={() => setCancelOpen(false)}>Закрыть</button>
            {cancelState !== 'success' && <button type="button" className="primary-button" onClick={() => cancelReservation()} disabled={!cancelInput.trim() || cancelState === 'loading'}>{cancelState === 'loading' ? 'Отменяем…' : 'Отменить бронь'}</button>}
          </div>
      </NativeModal>
    </>
  );
}
