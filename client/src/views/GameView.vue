<template>
  <div class="game-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading daily challenge...</p>
    </div>
    <div v-else-if="error" class="error-card">
      <h2>Oops!</h2>
      <p>{{ error }}</p>
      <button @click="fetchDailyChallenge" class="btn-retry">Try Again</button>
    </div>
    <div v-else-if="alreadyPlayed" class="already-played-card">
      <div class="icon-flag"></div>
      <h2>Daily Challenge Completed!</h2>
      <p>You have already played today's GRIDdle challenge. Come back tomorrow at 00:00!</p>
      <div class="summary-box" v-if="todayResult">
        <h3>Today's Results</h3>
        <div class="scores-grid">
          <div class="score-item">
            <span>Read the driver:</span> <strong>{{ todayResult.read_score }} pts</strong>
          </div>
          <div class="score-item">
            <span>Decode the name:</span> <strong>{{ todayResult.rebus_score }} pts</strong>
          </div>
          <div class="score-item">
            <span>Find the face:</span> <strong>{{ todayResult.zoom_score }} pts</strong>
          </div>
          <div class="score-item">
            <span>Follow the team:</span> <strong>{{ todayResult.team_score }} pts</strong>
          </div>
        </div>
        <div class="total-score">
          Total Score: <span>{{ todayResult.total_score }} / 400</span>
        </div>
      </div>
    </div>
    <div v-else-if="challenge" class="active-game">
      <div class="game-stepper">
        <div
          v-for="(gameKey, index) in gameTypes"
          :key="gameKey"
          :class="['step-item', { active: currentGameIndex === index, completed: gameStates[gameKey].completed }]"
        >
          <span class="step-number">{{ index + 1 }}</span>
          <span class="step-name">{{ gameLabels[gameKey] }}</span>
        </div>
      </div>

      <!-- Main Game Stage Card -->
      <div class="stage-card">
        <ReadDriverGame
          v-if="currentGameKey === 'read'"
          :clues="challenge.games.read.clues"
          :attempts="gameStates.read.attempts"
          :completed="gameStates.read.completed"
        />

        <RebusGame
          v-else-if="currentGameKey === 'rebus'"
          :content="challenge.games.rebus.content"
        />

        <ZoomGame
          v-else-if="currentGameKey === 'zoom'"
          :image-url="challenge.games.zoom.imageUrl"
          :attempts="gameStates.zoom.attempts"
          :completed="gameStates.zoom.completed"
        />

        <TeamGame
          v-else-if="currentGameKey === 'team'"
          :image-url="challenge.games.team.imageUrl"
        />

        <!-- Feedback & Guesses History -->
        <div v-if="gameStates[currentGameKey].guesses.length > 0" class="guesses-history">
          <h4>Previous Attempts:</h4>
          <ul>
            <li v-for="(g, idx) in gameStates[currentGameKey].guesses" :key="idx" class="wrong-guess">
              ❌ {{ g.name }} ({{ g.code }})
            </li>
          </ul>
        </div>

        <!-- Search & Guess Form -->
        <div v-if="!gameStates[currentGameKey].completed" class="guess-section">
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search driver by name or code..."
              autocomplete="off"
              @focus="showDropdown = true"
              @blur="showDropdown = false"
            />
            <div v-if="showDropdown && filteredDrivers.length > 0" class="dropdown">
              <div
                v-for="driver in filteredDrivers"
                :key="driver.id"
                class="dropdown-item"
                @mousedown.prevent
                @click="selectDriver(driver)"
              >
                <strong>{{ driver.name }}</strong> ({{ driver.code }})
              </div>
            </div>
          </div>

          <div v-if="selectedDriver" class="selected-badge">
            Selected: <strong>{{ selectedDriver.name }}</strong>
            <button @click="submitGuess" :disabled="submitting" class="btn-submit">
              {{ submitting ? 'Checking...' : 'Submit Guess' }}
            </button>
          </div>
        </div>

        <!-- Stage Success Banner -->
        <div v-else class="stage-success">
          <h4>Solved! Driver: {{ gameStates[currentGameKey].targetDriver?.name }}</h4>
          <p>Score: <strong>{{ gameStates[currentGameKey].score }} pts</strong></p>
          <button @click="nextGame" class="btn-next">
            {{ currentGameIndex < 3 ? 'Next Game ➔' : 'Finish Daily Challenge 🏁' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Final Recap Modal / End Screen -->
    <ScoreRecap
      v-if="showSummaryModal"
      :scores="{
        read: gameStates.read.score,
        rebus: gameStates.rebus.score,
        zoom: gameStates.zoom.score,
        team: gameStates.team.score
      }"
      :summary="summaryData"
      @close="closeSummary"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ReadDriverGame from '../components/ReadTheDriver.vue';
import RebusGame from '../components/DecodeTheName.vue';
import ZoomGame from '../components/FindTheFace.vue';
import TeamGame from '../components/FollowTheTeam.vue';
import ScoreRecap from '../components/ScoreRecap.vue';

const gameTypes = ['read', 'rebus', 'zoom', 'team'];
const gameLabels = {
  read: '1. Read The Driver',
  rebus: '2. Decode The Name',
  zoom: '3. Find The Face',
  team: '4. Follow The Team'
};

const loading = ref(true);
const error = ref(null);
const challenge = ref(null);
const alreadyPlayed = ref(false);
const todayResult = ref(null);
const driversList = ref([]);

const currentGameIndex = ref(0);
const currentGameKey = computed(() => gameTypes[currentGameIndex.value]);

const searchQuery = ref('');
const showDropdown = ref(false);
const selectedDriver = ref(null);
const submitting = ref(false);
const showSummaryModal = ref(false);
const summaryData = ref(null);

// Game state tracking
const gameStates = ref({
  read: { attempts: 1, completed: false, score: 0, guesses: [], targetDriver: null },
  rebus: { attempts: 1, completed: false, score: 0, guesses: [], targetDriver: null },
  zoom: { attempts: 1, completed: false, score: 0, guesses: [], targetDriver: null },
  team: { attempts: 1, completed: false, score: 0, guesses: [], targetDriver: null }
});

// Autocomplete filtering
const filteredDrivers = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return driversList.value.filter(
    d => d.name.toLowerCase().includes(query) || d.code.toLowerCase().includes(query)
  ).slice(0, 5);
});

// Fetch driver list and daily challenge on mount
onMounted(async () => {
  await Promise.all([fetchDrivers(), fetchDailyChallenge()]);
});

const fetchDrivers = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/game/drivers');
    const data = await res.json();
    if (res.ok) {
      driversList.value = data.drivers || [];
    }
  } catch (err) {
    console.error('Error fetching drivers:', err);
  }
};

const fetchDailyChallenge = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const res = await fetch('http://localhost:3000/api/game/today', { headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to load challenge');
    }

    challenge.value = data;

    if (data.userResult && data.userResult.completed) {
      alreadyPlayed.value = true;
      todayResult.value = data.userResult;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const selectDriver = (driver) => {
  selectedDriver.value = driver;
  searchQuery.value = `${driver.name} (${driver.code})`;
  showDropdown.value = false;
};

const submitGuess = async () => {
  if (!selectedDriver.value) return;

  submitting.value = true;
  const key = currentGameKey.value;
  const currentState = gameStates.value[key];

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/game/guess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        gameType: key,
        guessedDriverId: selectedDriver.value.id,
        attemptsCount: currentState.attempts
      })
    });

    const data = await res.json();

    if (data.isCorrect) {
      currentState.completed = true;
      currentState.score = data.score;
      currentState.targetDriver = data.targetDriver;
    } else {
      currentState.guesses.push(selectedDriver.value);
      currentState.attempts += 1;
    }

    // Reset selection input
    selectedDriver.value = null;
    searchQuery.value = '';
  } catch (err) {
    console.error('Error validating guess:', err);
  } finally {
    submitting.value = false;
  }
};

const nextGame = async () => {
  if (currentGameIndex.value < 3) {
    currentGameIndex.value += 1;
  } else {
    // Submit final scores to backend
    await submitFinalDailyScore();
  }
};

const submitFinalDailyScore = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/game/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        readScore: gameStates.value.read.score,
        rebusScore: gameStates.value.rebus.score,
        zoomScore: gameStates.value.zoom.score,
        teamScore: gameStates.value.team.score
      })
    });

    const data = await res.json();
    if (res.ok) {
      summaryData.value = data.summary;
      todayResult.value = {
        read_score: gameStates.value.read.score,
        rebus_score: gameStates.value.rebus.score,
        zoom_score: gameStates.value.zoom.score,
        team_score: gameStates.value.team.score,
        total_score: data.summary.totalScore
      }
      showSummaryModal.value = true;
    }
  } catch (err) {
    console.error('Error submitting daily score:', err);
  }
};

const closeSummary = () => {
  showSummaryModal.value = false;
  alreadyPlayed.value = true;
};
</script>

<style scoped>
.game-container {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 8px 0 28px;
  color: var(--color-text, #f4f4f1);
}
.active-game { width: 100%; }
.game-stepper {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.step-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border, #303135);
  border-radius: 8px;
  background: var(--color-panel, #191a1d);
  color: var(--color-muted, #929399);
  text-align: left;
  font-family: var(--font-mono, monospace);
  font-size: 0.76rem;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
}
.step-number {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  border: 1px solid #45464a;
  border-radius: 50%;
  color: #b7b8bb;
}
.step-name { overflow-wrap: anywhere; }
.step-item.active {
  border-color: var(--color-red, #f23b35);
  background: rgba(242, 59, 53, 0.1);
  color: #fff;
}
.step-item.active .step-number {
  border-color: var(--color-red, #f23b35);
  background: var(--color-red, #f23b35);
  color: white;
}
.step-item.completed {
  border-color: #687b2c;
  color: var(--color-acid, #d8f35a);
}
.step-item.completed .step-number {
  border-color: var(--color-acid, #d8f35a);
  color: var(--color-acid, #d8f35a);
}
.stage-card {
  min-height: 380px;
  padding: clamp(22px, 3vw, 42px);
  border: 1px solid var(--color-border, #303135);
  border-radius: 10px;
  background: linear-gradient(145deg, #1b1c1f, #151619);
  color: var(--color-text, #f4f4f1);
  box-shadow: 0 18px 50px rgba(0,0,0,0.18);
}
.search-box { position: relative; max-width: 760px; margin: 28px auto 0; }
.search-box input {
  width: 100%;
  min-height: 54px;
  padding: 0 18px;
  border: 1px solid #414247;
  border-radius: 6px;
  outline: none;
  background: #101113;
  color: #f4f4f1;
  font-size: 1rem;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.search-box input::placeholder { color: #777980; }
.search-box input:focus {
  border-color: var(--color-red, #f23b35);
  box-shadow: 0 0 0 3px rgba(242,59,53,0.12);
}
.dropdown {
  position: absolute;
  z-index: 10;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  overflow: hidden;
  border: 1px solid #414247;
  border-radius: 6px;
  background: #202124;
  box-shadow: 0 12px 28px rgba(0,0,0,0.35);
}
.dropdown-item {
  display: flex;
  min-height: 48px;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #303135;
  color: #e8e8e5;
  cursor: pointer;
}
.dropdown-item:last-child { border-bottom: 0; }
.dropdown-item:hover { background: #2a2b2f; }
.dropdown-item strong { margin-right: 5px; color: white; }
.btn-submit, .btn-next, .btn-retry {
  min-height: 46px;
  margin-top: 15px;
  padding: 11px 24px;
  border: 1px solid var(--color-red, #f23b35);
  border-radius: 5px;
  background: var(--color-red, #f23b35);
  color: white;
  cursor: pointer;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.15rem;
  font-weight: 700;
  text-transform: uppercase;
  transition: transform 160ms ease, background 160ms ease;
}
.btn-submit:hover, .btn-next:hover, .btn-retry:hover {
  background: #ff4b44;
  transform: translateY(-1px);
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.loading-state, .error-card, .already-played-card {
  padding: clamp(28px, 5vw, 56px);
  border: 1px solid var(--color-border, #303135);
  border-radius: 10px;
  background: var(--color-panel, #191a1d);
  color: var(--color-text, #f4f4f1);
  text-align: center;
}
.loading-state p, .error-card p, .already-played-card > p { color: var(--color-muted, #929399); line-height: 1.6; }
.error-card h2, .already-played-card h2 {
  margin-top: 0;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: clamp(2rem, 4vw, 3rem);
  text-transform: uppercase;
}
.error-card h2 { color: var(--color-red, #f23b35); }
.spinner {
  width: 38px;
  height: 38px;
  margin: 0 auto 14px;
  border: 3px solid #38393e;
  border-top-color: var(--color-red, #f23b35);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.summary-box {
  max-width: 850px;
  margin: 28px auto 0;
  padding: 24px;
  border: 1px solid var(--color-border, #303135);
  border-radius: 8px;
  background: #141517;
  text-align: left;
}
.summary-box h3 {
  margin: 0 0 14px;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.6rem;
  text-transform: uppercase;
}
.scores-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 28px; }
.score-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #303135;
  color: var(--color-muted, #929399);
}
.score-item strong { color: #f4f4f1; white-space: nowrap; }
.total-score {
  margin-top: 18px;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.5rem;
  font-weight: 700;
  text-align: right;
  text-transform: uppercase;
}
.total-score span { color: var(--color-acid, #d8f35a); }
.guesses-history {
  max-width: 760px;
  margin: 24px auto 0;
  padding: 16px 18px;
  border: 1px solid #37383c;
  border-radius: 6px;
  background: #151619;
}
.guesses-history h4 {
  margin: 0 0 8px;
  color: #bfc0c2;
  font-family: var(--font-mono, monospace);
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
}
.guesses-history ul { margin: 0; padding: 0; list-style: none; }
.wrong-guess { padding: 7px 0; color: #ff7771; font-size: 0.9rem; }
.selected-badge {
  display: flex;
  max-width: 760px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 14px auto 0;
  padding: 14px 16px;
  border: 1px solid #414247;
  border-radius: 6px;
  background: #202124;
  color: var(--color-muted, #929399);
}
.selected-badge strong { color: white; }
.selected-badge .btn-submit { flex: 0 0 auto; margin: 0; }
.stage-success {
  margin-top: 26px;
  padding: 24px;
  border: 1px solid #64772b;
  border-radius: 8px;
  background: rgba(216,243,90,0.07);
  color: #f4f4f1;
  text-align: center;
}
.stage-success h4 {
  margin: 0 0 8px;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.8rem;
  text-transform: uppercase;
}
.stage-success p { color: var(--color-muted, #929399); }
.stage-success p strong { color: var(--color-acid, #d8f35a); }
.stage-success .btn-next { min-width: 220px; }
@media (min-width: 1200px) {
  .game-container { padding-top: 12px; }
  .stage-card { min-height: 460px; }
}
@media (max-width: 760px) {
  .game-stepper { gap: 6px; }
  .step-item { flex-direction: column; justify-content: center; gap: 6px; padding: 10px 4px; text-align: center; font-size: 0.65rem; }
  .step-number { width: 24px; height: 24px; flex-basis: 24px; }
  .stage-card { min-height: 0; padding: 22px 16px; }
  .scores-grid { grid-template-columns: 1fr; }
}
@media (max-width: 599px) {
  .game-container { padding: 0 0 20px; }
  .game-stepper { margin-bottom: 12px; }
  .step-number { display: none; }
  .step-item { min-height: 42px; font-size: 0.62rem; }
  .selected-badge { align-items: stretch; flex-direction: column; }
  .selected-badge .btn-submit { width: 100%; }
  .stage-success .btn-next { width: 100%; }
  .dropdown { top: auto; bottom: calc(100% + 4px); }
  .summary-box { padding: 16px; }
}
</style>