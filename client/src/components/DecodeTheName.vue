<template>
  <div class="game-stage">
    <h3>Mini-Game 2: Decode the Name</h3>
    <p class="subtitle">Combine the elements below to reveal the driver's name!</p>
    <div class="rebus-container">
      <p v-if="content" class="rebus-text">{{ content }}</p>
      <p v-else class="no-rebus">No rebus available for this driver.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: { type: String, default: '' }
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
.rebus-container {
  display: flex;
  min-height: 230px;
  align-items: center;
  justify-content: center;
  margin: 28px auto 8px;
  padding: 30px;
  border: 1px dashed #45464a;
  border-radius: 8px;
  background: #141517;
}
.rebus-text { margin: 0; color: #f4f4f1; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.35; text-align: center; word-break: break-word; }
.no-rebus { color: #929399; }
@media (max-width: 600px) { .rebus-container { min-height: 170px; padding: 18px; } }
</style>