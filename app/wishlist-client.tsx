'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  Gift,
  Home,
  MessageCircle,
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
  category: 'Книги' | 'Творчество' | 'Для дома';
  link?: string;
  image?: string;
};

const publicBase = process.env.NODE_ENV === 'production' ? '/wishlist' : '';

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
    id: 'storm-of-swords',
    title: 'Буря мечей',
    eyebrow: 'Джордж Р. Р. Мартин · третий том',
    description: 'Продолжаю собирать «Песнь льда и пламени». Нужен именно этот том и обязательно в таком оформлении.',
    details: 'Ссылка ведёт на визуальный пример серии; покупать именно этот комплект не обязательно.',
    priority: 'Важно: единое оформление коллекции',
    category: 'Книги',
    link: 'https://share.google/lNq10dvHRdEKNPGSW',
    image: `${publicBase}/asoiaf-reference.jpg`,
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
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [replyCode, setReplyCode] = useState('');
  const [messageState, setMessageState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
      setReserved((current) => new Set(current).add(selected.id));
      setReserveState('success');
    } catch {
      setReserveState('error');
    }
  }

  async function sendMessage() {
    if (!message.trim()) return;
    setMessageState('loading');
    if (!apiBase) {
      setMessageState('error');
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body: message.trim() }),
      });
      if (!response.ok) throw new Error('message_failed');
      const result = await response.json() as { replyCode: string };
      setReplyCode(result.replyCode);
      setMessageState('success');
    } catch {
      setMessageState('error');
    }
  }

  async function cancelReservation() {
    const token = cancelInput.trim();
    if (!token) return;
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
        setCancelState('invalid');
        return;
      }
      const ids = wishes.map((wish) => wish.id).join(',');
      const availabilityResponse = await fetch(`${apiBase}/api/gifts?ids=${encodeURIComponent(ids)}`);
      if (availabilityResponse.ok) {
        const items = await availabilityResponse.json() as Array<{ id: string; availability: string }>;
        setReserved(new Set(items.filter((item) => item.availability === 'reserved').map((item) => item.id)));
      }
      setCancelInput('');
      setCancelState('success');
    } catch {
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
            <h2 id="wishes-title">Идеи, к которым<br />стоит присмотреться</h2>
          </div>
          <p>Здесь нет обязательных покупок — только идеи. Цена и магазин не так важны, как удачный выбор.</p>
        </div>

        <div className="wishlist-tools">
          <div className="category-tabs" role="group" aria-label="Категории пожеланий">
            {['Все', 'Книги', 'Творчество', 'Для дома'].map((item) => (
              <button key={item} type="button" className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Поиск по пожеланиям</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти идею" />
          </label>
        </div>

        <button type="button" className="cancel-reservation-link" onClick={() => { setCancelOpen(true); setCancelState('idle'); }}>
          <Undo2 size={15} /> Уже выбрали подарок? Отменить бронь по секретному коду
        </button>

        {filtered.length ? (
          <div className="wish-grid">
            {filtered.map((wish, index) => {
              const isReserved = reserved.has(wish.id);
              return (
                <article className={`wish-card ${wish.image ? 'wish-card-featured' : ''} ${isReserved ? 'is-reserved' : ''}`} key={wish.id}>
                  {wish.image ? (
                    <div className="wish-image"><img src={wish.image} alt="Пример нужного единого оформления серии «Песнь льда и пламени»" /></div>
                  ) : (
                    <div className={`wish-symbol symbol-${index % 4}`} aria-hidden="true">
                      {wish.category === 'Книги' ? <BookOpen /> : wish.category === 'Творчество' ? <Palette /> : <Home />}
                    </div>
                  )}
                  <div className="wish-card-body">
                    <div className="wish-status-row">
                      <p className="card-eyebrow">{wish.eyebrow}</p>
                      <span className={`availability ${isReserved ? 'reserved' : ''}`}>{isReserved ? <><Check size={13} /> Уже выбрали</> : 'Свободно'}</span>
                    </div>
                    <h3>{wish.title}</h3>
                    <p>{wish.description}</p>
                    {wish.priority && <p className="priority-note"><Sparkles size={14} /> {wish.priority}</p>}
                    {wish.details && <p className="wish-details">{wish.details}</p>}
                    <div className="card-actions">
                      <button type="button" disabled={isReserved} className="reserve-button" onClick={() => { setSelected(wish); setReserveState('idle'); setCancelCode(''); }}>
                        {isReserved ? 'Подарок уже выбрали' : 'Я хочу это подарить'}
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
          <div><p className="eyebrow">Что лучше не дарить</p><h2 id="not-wanted-title">Внимание важнее вещи</h2></div>
          <p>Хочется, чтобы подарок остался со мной и пригодился, а не стал вещью «для галочки».</p>
        </div>
        <div className="not-grid">
          <article><span>01</span><h3>Подарки ради шутки</h3><p>Если после первого смеха непонятно, что делать с вещью, лучше выбрать другую идею.</p></article>
          <article><span>02</span><h3>Случайные настолки</h3><p>Только если вы на двести процентов уверены, что мне зайдёт и мы сыграем больше одного раза.</p></article>
          <article><span>03</span><h3>Книги «для прикола»</h3><p>Книга не из списка — только если вы правда хотите, чтобы я её прочитал, и верите, что я это сделаю.</p></article>
        </div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow"><MessageCircle size={15} /> Можно спросить, не раскрывая себя</p>
          <h2 id="contact-title">Есть своя идея?</h2>
          <p>Уточните размер, цвет, модель или спросите, понравится ли мне ваш вариант. Имя, почта и аккаунт не нужны.</p>
        </div>
        <button type="button" className="contact-button" onClick={() => { setContactOpen(true); setMessageState('idle'); }}>
          Написать анонимно <ChevronRight />
        </button>
      </section>

      <NativeModal open={Boolean(selected)} onClose={() => setSelected(null)}>
          <div className="dialog-header">
            <p className="dialog-kicker"><ShieldCheck size={16} /> Анонимная бронь</p>
            <h2>{reserveState === 'success' ? 'Готово, подарок забронирован' : `Забронировать «${selected?.title ?? ''}»?`}</h2>
            <p>
              {reserveState === 'success' ? 'Другие посетители увидят, что идея уже выбрана, но не узнают кем.' : 'Другие увидят только статус — ваше имя и контакты не нужны.'}
            </p>
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

      <NativeModal open={contactOpen} onClose={() => setContactOpen(false)}>
          <div className="dialog-header">
            <p className="dialog-kicker"><MessageCircle size={16} /> Без имени и аккаунта</p>
            <h2>{messageState === 'success' ? 'Сообщение отправлено' : 'Спросить анонимно'}</h2>
            <p>{messageState === 'success' ? 'Сохраните код, чтобы позже проверить ответ.' : 'Я не увижу, кто отправил вопрос. Не указывайте личные данные в тексте.'}</p>
          </div>
          {messageState === 'success' ? (
            <label className="form-field"><span>Код ответа</span><input value={replyCode} readOnly onFocus={(event) => event.currentTarget.select()} /></label>
          ) : (
            <label className="form-field"><span>Ваш вопрос</span><textarea value={message} maxLength={1200} onChange={(event) => setMessage(event.target.value)} placeholder="Например: тебе понравился бы подарок такого цвета?" /><small>{message.length}/1200</small></label>
          )}
          {messageState === 'error' && <p className="form-error" role="alert">Форма готова, но общее хранилище ещё не подключено. Настроим его в Cloudflare.</p>}
          <div className="dialog-footer-custom">
            <button type="button" className="secondary-button" onClick={() => setContactOpen(false)}>Закрыть</button>
            {messageState !== 'success' && <button type="button" className="primary-button" onClick={sendMessage} disabled={!message.trim() || messageState === 'loading'}>{messageState === 'loading' ? 'Отправляем…' : 'Отправить анонимно'}</button>}
          </div>
      </NativeModal>

      <NativeModal open={cancelOpen} onClose={() => setCancelOpen(false)}>
          <div className="dialog-header">
            <p className="dialog-kicker"><Undo2 size={16} /> Отмена брони</p>
            <h2>{cancelState === 'success' ? 'Бронь отменена' : 'Введите секретный код'}</h2>
            <p>{cancelState === 'success' ? 'Подарок снова отмечен как свободный — его смогут выбрать другие.' : 'Это тот код, который был показан сразу после бронирования. Он не раскрывает, какой подарок вы выбрали.'}</p>
          </div>
          {cancelState !== 'success' && (
            <label className="form-field">
              <span>Секретный код отмены</span>
              <input value={cancelInput} onChange={(event) => { setCancelInput(event.target.value); if (cancelState !== 'idle') setCancelState('idle'); }} autoComplete="off" spellCheck={false} placeholder="Вставьте сохранённый код" />
            </label>
          )}
          {cancelState === 'invalid' && <p className="form-error" role="alert">Бронь с таким кодом не найдена. Проверьте, что код скопирован полностью и без лишних символов.</p>}
          {cancelState === 'error' && <p className="form-error" role="alert">Не удалось связаться с хранилищем. Попробуйте ещё раз немного позже.</p>}
          {cancelState === 'success' && <p className="form-success" role="status"><Check size={16} /> Всё готово. Секретный код больше не действует.</p>}
          <div className="dialog-footer-custom">
            <button type="button" className="secondary-button" onClick={() => setCancelOpen(false)}>Закрыть</button>
            {cancelState !== 'success' && <button type="button" className="primary-button" onClick={cancelReservation} disabled={!cancelInput.trim() || cancelState === 'loading'}>{cancelState === 'loading' ? 'Отменяем…' : 'Отменить бронь'}</button>}
          </div>
      </NativeModal>
    </>
  );
}
