<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <h2>Daily Challenge Complete!</h2>
      <p>Great job! Here is your breakdown for today:</p>

      <div class="final-scores">
        <div>Read the driver: {{ scores.read }} pts</div>
        <div>Decode the name: {{ scores.rebus }} pts</div>
        <div>Find the face: {{ scores.zoom }} pts</div>
        <div>Follow the team: {{ scores.team }} pts</div>
      </div>

      <div class="final-total">
        Total Score: <span>{{ summary?.totalScore }} / 400</span>
      </div>

      <div v-if="summary" class="user-stats-summary">
        <p>Current Streak: <strong>{{ summary.currentStreak }} days</strong></p>
        <p>Best Score: <strong>{{ summary.bestScore }} pts</strong></p>
      </div>

      <button @click="$emit('close')" class="btn-close">Close</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  scores: {
    type: Object,
    required: true // { read, rebus, zoom, team }
  },
  summary: {
    type: Object,
    default: null // { totalScore, currentStreak, bestScore }
  }
});

defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: white;
  color: black;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}
</style>