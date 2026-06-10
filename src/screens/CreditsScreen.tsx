import { Button } from '../components/Button';
import { BrandWordmark } from '../components/BrandWordmark';

interface CreditsScreenProps {
  onBack: () => void;
}

const AUDIO_CREDITS = [
  {
    role: 'Menu music',
    title: '빛의 세상으로(희망가) 가야금 버전',
    author: '서예지',
    sourceLabel: 'GongU Madang',
    sourceUrl: 'https://gongu.copyright.or.kr/gongu/wrt/wrt/view.do?menuNo=200020&wrtSn=13333656',
    license: '기증저작물 자유이용'
  },
  {
    role: 'Gameplay music',
    title: 'Tong tong(통통) 가야금',
    author: '서예지',
    sourceLabel: 'GongU Madang',
    sourceUrl: 'https://gongu.copyright.or.kr/gongu/wrt/wrt/view.do?menuNo=200020&wrtSn=13333653',
    license: '기증저작물 자유이용'
  }
] as const;

export function CreditsScreen({ onBack }: CreditsScreenProps) {
  return (
    <main className="screen shell">
      <div className="panel app-view app-view--panel">
        <div className="app-view__top app-view__top--settings">
          <BrandWordmark className="brand-wordmark--subpage" />
        </div>

        <div className="app-view__middle app-view__middle--scrollable app-view__middle--settings">
          <section className="section-block section-block--first">
            <div className="setting-card">
              <div className="setting-card__head">
                <h2>Author</h2>
              </div>

              <div className="credits-card">
                <div className="credits-card__row">
                  <span className="credits-card__label">Name</span>
                  <strong className="credits-card__value">Pan Panda</strong>
                </div>
                <div className="credits-card__row">
                  <span className="credits-card__label">Email</span>
                  <a className="credits-link" href="mailto:hello@panpanda.eu">hello@panpanda.eu</a>
                </div>
              </div>
            </div>
          </section>

          <section className="section-block">
            <div className="setting-card">
              <div className="setting-card__head">
                <h2>Audio Credits</h2>
              </div>

              <div className="credits-list">
                {AUDIO_CREDITS.map((credit) => (
                  <article key={credit.role} className="credits-card">
                    <div className="credits-card__row">
                      <span className="credits-card__label">Role</span>
                      <strong className="credits-card__value">{credit.role}</strong>
                    </div>
                    <div className="credits-card__row">
                      <span className="credits-card__label">Title</span>
                      <span className="credits-card__value">{credit.title}</span>
                    </div>
                    <div className="credits-card__row">
                      <span className="credits-card__label">Author</span>
                      <span className="credits-card__value">{credit.author}</span>
                    </div>
                    <div className="credits-card__row">
                      <span className="credits-card__label">Source</span>
                      <a className="credits-link" href={credit.sourceUrl} target="_blank" rel="noreferrer">
                        {credit.sourceLabel}
                      </a>
                    </div>
                    <div className="credits-card__row">
                      <span className="credits-card__label">License</span>
                      <span className="credits-card__value">{credit.license}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="app-view__bottom">
          <div className="stack-actions">
            <Button block tone="ghost" onClick={onBack}>Back</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
