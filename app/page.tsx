import { ArrowDown, Gift, MessageCircle, Sparkles } from 'lucide-react';
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
        <a className="quiet-action" href="#contact">
          <MessageCircle size={16} /> Написать анонимно
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy" id="about">
          <p className="eyebrow"><Sparkles size={15} /> Не инструкция, а источник вдохновения</p>
          <h1>Подарки — это<br /><em>немного магия</em></h1>
          <p className="lead">
            Иногда лучший подарок — тот, о котором человек даже не думал,
            но который неожиданно оказывается именно его вещью.
          </p>
          <p>
            Поэтому, даже если выбираешь что-то из этого списка, выбирай с душой.
            Хочется, чтобы именно ты был уверен: мне это понравится. Или чтобы у тебя
            была своя личная причина подарить именно это.
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
        <span>Без обязательных покупок</span><span>Без раскрытия сюрприза</span><span>С личным смыслом</span>
      </section>
      <WishlistExperience />
    </main>
  );
}
