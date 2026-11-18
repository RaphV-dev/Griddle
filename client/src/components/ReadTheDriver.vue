<template>
  <div class="game-stage">
    <h3>Mini-Game 1: Read the Driver</h3>
    <p class="subtitle">Guess the driver based on these 3 clues!</p>
    <div class="clues-list">
      <div
        v-for="(clue, idx) in clues"
        :key="idx"
        :class="['clue-card', { revealed: attempts > idx || completed }]"
      >
        <span class="clue-badge">Clue #{{ idx + 1 }}</span>
        <p v-if="attempts > idx || completed">{{ clue }}</p>
        <p v-else class="hidden-clue">Make {{ idx }} wrong guess(es) to unlock</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  clues: { type: Array, required: true },
  attempts: { type: Number, required: true },
  completed: { type: Boolean, default: false }
});
</script>

<style scoped>
.game-stage h3 {
  margin: 0 0 8px;
  color: #f4f4f1;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
}
.game-stage .subtitle { margin: 0; color: #929399; font-size: 0.95rem; }
.clues-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 30px 0 10px; }
.clue-card {
  display: flex;
  min-height: 150px;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  border: 1px dashed #45464a;
  border-radius: 7px;
  background: #151619;
  color: #777980;
}
.clue-card.revealed { border: 1px solid rgba(242,59,53,0.7); background: rgba(242,59,53,0.07); color: #f4f4f1; }
.clue-card p { margin: 18px 0 0; font-size: 1rem; line-height: 1.5; }
.clue-badge { color: var(--color-red, #f23b35); font-family: var(--font-mono, monospace); font-size: 0.66rem; font-weight: 600; text-transform: uppercase; }
.hidden-clue { color: #777980; font-style: italic; }
@media (max-width: 760px) { .clues-list { grid-template-columns: 1fr; gap: 9px; margin-top: 20px; } .clue-card { min-height: 0; padding: 14px; } .clue-card p { margin-top: 10px; } }
</style>