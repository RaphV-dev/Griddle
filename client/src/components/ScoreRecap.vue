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
    required: true 
  },
  summary: {
    type: Object,
    default: null 
  }
});

defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  padding: 20px;
  overflow-y: auto;
  background: rgba(0,0,0,0.78);
  backdrop-filter: blur(8px);
}
.modal-card {
  width: 100%;
  max-width: 520px;
  margin: auto;
  padding: 32px;
  border: 1px solid #3a3b40;
  border-radius: 10px;
  background: #191a1d;
  color: #f4f4f1;
  text-align: center;
  box-shadow: 0 24px 80px rgba(0,0,0,0.45);
}
.modal-card h2 {
  margin: 0 0 10px;
  color: #f4f4f1;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 2.6rem;
  line-height: 1;
  text-transform: uppercase;
}
.modal-card > p { color: #929399; line-height: 1.5; }
.final-scores { display: grid; gap: 0; margin: 24px 0; text-align: left; }
.final-scores > div { padding: 13px 0; border-bottom: 1px solid #343539; color: #c2c3c5; }
.final-total { font-family: var(--font-display, Impact, sans-serif); font-size: 1.6rem; font-weight: 700; text-transform: uppercase; }
.final-total span { color: var(--color-acid, #d8f35a); }
.user-stats-summary { margin-top: 18px; padding: 14px; border: 1px solid #343539; border-radius: 6px; background: #141517; }
.user-stats-summary p { margin: 5px 0; color: #929399; }
.user-stats-summary strong { color: #f4f4f1; }
.btn-close {
  width: 100%;
  min-height: 48px;
  margin-top: 22px;
  padding: 12px 24px;
  border: 1px solid var(--color-red, #f23b35);
  border-radius: 5px;
  background: var(--color-red, #f23b35);
  color: white;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}
@media (max-width: 480px) { .modal-card { padding: 24px 18px; } }
</style>