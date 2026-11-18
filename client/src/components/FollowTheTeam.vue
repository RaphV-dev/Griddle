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
.teams-image-wrapper {
  display: flex;
  justify-content: center;
  margin: 20px auto;
}

.teams-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 4px solid #e10600;
}

.no-image {
  color: #888;
}
</style>
