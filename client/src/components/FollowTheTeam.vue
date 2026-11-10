<template>
  <div class="game-stage">
    <h3>Mini-Game 4: Follow the Team</h3>
    <p class="subtitle">Chronological order of teams this driver raced for:</p>
    <div class="teams-timeline">
      <div
        v-for="team in teams"
        :key="team.team_order"
        class="team-card"
      >
        <img v-if="team.logo_url" :src="team.logo_url" :alt="team.team_name" class="team-logo" />
        <span class="team-name">{{ team.team_name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  teams: { type: Array, required: true }
});
</script>