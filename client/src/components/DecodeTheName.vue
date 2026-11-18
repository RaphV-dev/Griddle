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
.rebus-container {
  display: flex;
  justify-content: center;
  margin: 20px auto;
}

.rebus-text {
  font-size: 2.5rem;
  line-height: 1.4;
  text-align: center;
  word-break: break-word;
}

.no-rebus {
  color: #888;
}
</style>