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