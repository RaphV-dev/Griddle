<template>
  <div class="home-page">
    <div class="eyebrow-row">
      <span class="eyebrow">THE F1 KNOWLEDGE QUIZ</span>
      <span class="eyebrow accent-copy">THE PADDOCK IS YOUR PLAYGROUND</span>
    </div>

    <section class="home-layout" aria-labelledby="hero-title">
      <div class="hero-panel">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <span class="hero-kicker">FOR THE FANS. BY INSTINCT.</span>
          <h1 id="hero-title">KNOW<br />YOUR GRID.</h1>
          <p>For the fans who know more<br class="desktop-break" /> than the finishing order.</p>
        </div>
        <div class="hero-mark" aria-hidden="true">01 / F1</div>
      </div>

      <aside class="daily-column">
        <div class="section-heading">
          <span class="eyebrow">CHOOSE YOUR MODE</span>
          <span class="eyebrow muted-copy">DAILY CHALLENGE</span>
        </div>

        <router-link to="/game" class="daily-card">
          <div class="daily-card-top">
            <span class="daily-title">THE DAILY GRID</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </div>
          <p>Four challenges. One shot at today's grid.</p>
          <div class="daily-meta">
            <span>01 EACH TYPE · RESETS AT 00:00 UTC</span>
            <span>PLAY NOW</span>
          </div>
        </router-link>

        <div class="daily-note">
          <span class="note-symbol" aria-hidden="true">✳</span>
          <div>
            <strong>ONE GRID. FOUR TESTS.</strong>
            <p>Put your Formula 1 knowledge to the test, one challenge at a time.</p>
          </div>
        </div>
      </aside>
    </section>

    <section class="games-section" aria-labelledby="games-title">
      <div class="games-heading">
        <h2 id="games-title" class="eyebrow">FOUR WAYS TO PROVE YOU KNOW THE GRID</h2>
        <span class="eyebrow muted-copy">01 — 04</span>
      </div>

      <div class="games-grid">
        <article class="game-feature">
          <div class="feature-top"><span>01 / CLUES</span><span class="feature-icon">◎</span></div>
          <h3>Read the driver</h3>
          <p>Connect three career clues.</p>
        </article>
        <article class="game-feature">
          <div class="feature-top"><span>02 / REBUS</span><span class="feature-icon">⌘</span></div>
          <h3>Decode the name</h3>
          <p>Say the picture puzzle out loud.</p>
        </article>
        <article class="game-feature">
          <div class="feature-top"><span>03 / ZOOM</span><span class="feature-icon">⛶</span></div>
          <h3>Find the face</h3>
          <p>Every miss reveals a wider crop.</p>
        </article>
        <article class="game-feature">
          <div class="feature-top"><span>04 / TEAMS</span><span class="feature-icon">⌁</span></div>
          <h3>Follow the teams</h3>
          <p>Trace a complete F1 race career.</p>
        </article>
      </div>
    </section>

    <footer class="home-footer">
      <span>GRID IQ / PLAY</span>
      <span>FOUR GAME TYPES. ONE GRID.</span>
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
}

.eyebrow,
.hero-kicker,
.daily-meta,
.feature-top,
.home-footer {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.eyebrow-row,
.section-heading,
.games-heading,
.home-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow-row {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0;
  color: #b7b8bb;
}

.accent-copy {
  color: var(--color-acid);
}

.muted-copy {
  color: #77797f;
}

.home-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(290px, 1fr);
  gap: 28px;
}

.hero-panel {
  position: relative;
  display: flex;
  min-height: 390px;
  align-items: center;
  overflow: hidden;
  isolation: isolate;
  padding: clamp(28px, 4vw, 58px);
  border: 1px solid #242528;
  border-radius: 10px;
  background:
    radial-gradient(ellipse at 78% 40%, rgba(102, 112, 115, 0.24), transparent 34%),
    radial-gradient(ellipse at 70% 90%, rgba(242, 59, 53, 0.12), transparent 34%),
    linear-gradient(115deg, #090a0b 0%, #151719 62%, #242629 100%);
}

.hero-panel::after {
  position: absolute;
  z-index: -1;
  right: -7%;
  bottom: -34%;
  width: 58%;
  height: 112%;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 48% 48% 0 0;
  background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.48));
  content: '';
  transform: rotate(-14deg);
}

.hero-glow {
  position: absolute;
  z-index: -1;
  top: 12%;
  right: 13%;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(242, 59, 53, 0.12);
  filter: blur(65px);
}

.hero-content {
  max-width: 520px;
}

.hero-kicker {
  color: var(--color-acid);
}

.hero-content h1 {
  margin: 42px 0 14px;
  color: #f5f5f2;
  font-family: var(--font-display);
  font-size: clamp(4.2rem, 8vw, 6.5rem);
  font-weight: 900;
  line-height: 0.83;
  letter-spacing: -0.035em;
}

.hero-content p {
  margin: 24px 0 0;
  color: #d2d2d0;
  font-size: 1rem;
  line-height: 1.6;
}

.hero-mark {
  position: absolute;
  right: 24px;
  bottom: 22px;
  color: rgba(255,255,255,0.42);
  font-family: var(--font-mono);
  font-size: 0.6rem;
}

.daily-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-heading {
  min-height: 20px;
  margin-bottom: 0;
}

.daily-card {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px;
  border: 1px solid var(--color-red);
  border-radius: 9px;
  background: var(--color-red);
  color: #fff;
  text-decoration: none;
  transition: transform 180ms ease, background 180ms ease;
}

.daily-card:hover {
  background: #ff4942;
  transform: translateY(-3px);
}

.daily-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.daily-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  font-weight: 800;
  line-height: 0.95;
  text-transform: uppercase;
}

.arrow {
  font-size: 1.6rem;
  line-height: 1;
}

.daily-card p {
  margin: 18px 0;
  font-size: 0.9rem;
}

.daily-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: rgba(255,255,255,0.86);
  font-size: 0.53rem;
}

.daily-note {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-panel);
}

.note-symbol {
  color: var(--color-acid);
  font-size: 1.3rem;
}

.daily-note strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
}

.daily-note p {
  margin: 8px 0 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.games-section {
  margin-top: 36px;
}

.games-heading {
  margin-bottom: 14px;
}

.games-heading h2 {
  font-size: 0.62rem;
  font-weight: 400;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.game-feature {
  min-width: 0;
  padding: 16px 0 10px;
  border-top: 1px solid var(--color-border);
}

.feature-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-red);
}

.feature-icon {
  color: #8e9095;
  font-size: 1.15rem;
}

.game-feature h3 {
  margin: 12px 0 8px;
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
}

.game-feature p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.home-footer {
  margin-top: 36px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
  color: #85878d;
}

@media (max-width: 900px) {
  .home-layout {
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 1fr);
    gap: 18px;
  }

  .hero-panel {
    min-height: 360px;
  }

  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 14px;
  }
}

@media (max-width: 640px) {
  .eyebrow-row {
    margin-bottom: 16px;
  }

  .eyebrow-row .accent-copy {
    display: none;
  }

  .home-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .hero-panel {
    min-height: 300px;
    padding: 26px;
  }

  .hero-content h1 {
    margin-top: 34px;
    font-size: clamp(3.6rem, 16vw, 4.7rem);
  }

  .hero-content p {
    margin-top: 20px;
    font-size: 0.88rem;
  }

  .daily-column {
    gap: 12px;
  }

  .section-heading {
    margin-bottom: 2px;
  }

  .daily-card {
    min-height: 164px;
    padding: 19px;
  }

  .daily-title {
    font-size: 2rem;
  }

  .daily-note {
    display: none;
  }

  .games-section {
    margin-top: 32px;
  }

  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 18px;
  }

  .game-feature h3 {
    font-size: 1.3rem;
  }

  .game-feature p {
    font-size: 0.76rem;
  }

  .home-footer {
    margin-top: 28px;
    font-size: 0.52rem;
  }
}
</style>