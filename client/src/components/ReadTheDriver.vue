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
.clues-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 12px 0;
}

.clue-card {
  padding: 12px;
  border: 1px dashed #bbb;
  border-radius: 8px;
  background: #f5f5f5;
  color: #777;
}

.clue-card.revealed {
  border: 1px solid #e10600;
  background: #fff5f5;
  color: #111;
}

.clue-card p {
  margin: 6px 0 0;
}

.clue-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #e10600;
}

.hidden-clue {
  font-style: italic;
  color: #888;
}
</style>