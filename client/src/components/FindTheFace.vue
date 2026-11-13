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

// Progressive CSS zoom: scales down from 3.5x to 1.0x over the attempts
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
.zoom-viewport {
  width: 250px;
  height: 250px;
  margin: 20px auto;
  overflow: hidden;
  border-radius: 50%;
  border: 4px solid #e10600;
}

.zoom-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>