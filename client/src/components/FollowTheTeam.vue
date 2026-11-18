<template>
  <div class="game-stage">
    <h3>Mini-Game 4: Follow the Team</h3>
    <p class="subtitle">All the teams this driver has raced for:</p>
    <div class="teams-image-wrapper">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt="Teams this driver raced for"
        class="teams-image"
      />
      <p v-else class="no-image">No image available for this driver.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  imageUrl: { type: String, default: null }
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
.teams-image-wrapper { display: flex; justify-content: center; margin: 28px auto 8px; }
.teams-image { max-width: min(100%, 1000px); height: auto; border: 1px solid #45464a; border-radius: 8px; }
.no-image { color: #929399; }
</style>
