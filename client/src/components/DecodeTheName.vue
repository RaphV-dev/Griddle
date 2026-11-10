<template>
  <div class="game-stage">
    <h3>Mini-Game 2: Decode the Name</h3>
    <p class="subtitle">Combine the elements below to reveal the driver's name!</p>
    <div class="rebus-container">
      <div
        v-for="elem in elements"
        :key="elem.element_order"
        class="rebus-item"
      >
        <img v-if="elem.type === 'image'" :src="elem.content" alt="Rebus part" class="rebus-img" />
        <span v-else-if="elem.type === 'emoji'" class="rebus-emoji">{{ elem.content }}</span>
        <span v-else class="rebus-text">{{ elem.content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  elements: { type: Array, required: true }
});
</script>