<template>
  <div id="app">
    <AppNavbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #f4f4f1;
  background: #101113;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --color-bg: #101113;
  --color-panel: #191a1d;
  --color-panel-soft: #202124;
  --color-border: #303135;
  --color-text: #f4f4f1;
  --color-muted: #929399;
  --color-red: #f23b35;
  --color-acid: #d8f35a;
  --font-display: 'Barlow Condensed', Impact, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--color-bg);
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-text-size-adjust: 100%;
  overflow-wrap: break-word;
}

button, input, select, textarea {
  font: inherit;
}

button, a {
  -webkit-tap-highlight-color: transparent;
}

img {
  display: block;
  max-width: 100%;
}

.main-content {
  width: min(100% - 48px, 1320px);
  margin: 0 auto;
  padding: 34px 0 56px;
}

.game-stage h3 {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
}

.game-stage .subtitle {
  margin: 0 0 0.75rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .main-content {
    width: min(100% - 32px, 1320px);
    padding: 24px 0 40px;
  }
}
</style>