<template>
  <div class="game-stage">
    <h3>Mini-Game 3: Find the Face</h3>
    <p class="subtitle">The image unzooms with every incorrect attempt!</p>
    <div class="zoom-viewport">
      <img
        :src="imageUrl"
        alt="Zoomed driver"
        class="zoom-image"
        :style="zoomStyle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  imageUrl: { type: String, required: true },
  attempts: { type: Number, required: true },
  completed: { type: Boolean, default: false }
});


const zoomStyle = computed(() => {
  if (props.completed) {
    return { transform: 'scale(1)', transition: 'transform 0.5s ease' };
  }
  const scaleFactor = Math.max(1, 3.5 - (props.attempts - 1) * 0.6);
  return {
    transform: `scale(${scaleFactor})`,
    transition: 'transform 0.5s ease'
  };
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
.zoom-viewport {
  width: min(420px, 80vw);
  aspect-ratio: 1 / 1;
  margin: 28px auto 8px;
  overflow: hidden;
  border: 4px solid var(--color-red, #f23b35);
  border-radius: 9px;
  background: #101113;
  box-shadow: 0 12px 34px rgba(0,0,0,0.3);
}
.zoom-image { width: 100%; height: 100%; object-fit: cover; }
@media (max-width: 600px) { .zoom-viewport { width: min(300px, 78vw); } }
</style>