import { ArrowDown, Gift, Sparkles } from 'lucide-react';
import { WishlistExperience } from './wishlist-client';

export const dynamic = 'force-static';

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="В начало страницы">
          <span className="brand-mark"><Gift size={18} strokeWidth={1.8} /></span>
          <span>Вишлист Антона</span>
        </a>
        <nav aria-label="Основная навигация">
          <a href="#about">О списке</a>
          <a href="#wishes">Пожелания</a>
          <a href="#not-wanted">Не дарить</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy" id="about">
          <p className="eyebrow"><Sparkles size={15} /> Не инструкция, а идеи для вдохновения</p>
          <h1>Подарок — это<br /><em>немного магии</em></h1>
          <p className="lead">
            Особенно здорово получить то, о чём сам ещё не успел подумать,
            но что неожиданно оказывается именно твоей вещью.
          </p>
          <p>
            Этот список не заменяет личный выбор, а только помогает сориентироваться.
            Даже если берёшь идею отсюда, выбирай её потому, что сам уверен: мне понравится.
            Или потому, что у тебя есть своя особенная причина подарить именно это.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#wishes">Посмотреть пожелания <ArrowDown size={17} /></a>
            <a className="text-action" href="#not-wanted">Что лучше не дарить</a>
          </div>
        </div>

        <div className="hero-object" aria-hidden="true">
          <div className="note note-one">выбрать<br />с душой</div>
          <div className="gift-box">
            <span className="gift-ribbon" />
            <span className="gift-lid" />
            <Gift size={58} strokeWidth={1.2} />
          </div>
          <div className="note note-two">оставить<br />сюрприз</div>
        </div>
      </section>

      <section className="promise-strip" aria-label="Принципы списка">
        <span>Список — только ориентир</span><span>Бронь сохраняет сюрприз</span><span>Личный смысл важнее цены</span>
      </section>
      <WishlistExperience />
    </main>
  );
}
