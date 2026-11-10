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
          :elements="challenge.games.rebus.elements"
        />

        <ZoomGame
          v-else-if="currentGameKey === 'zoom'"
          :image-url="challenge.games.zoom.imageUrl"
          :attempts="gameStates.zoom.attempts"
          :completed="gameStates.zoom.completed"
        />

        <TeamGame
          v-else-if="currentGameKey === 'team'"
          :teams="challenge.games.team.teams"
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
              @focus="showDropdown = true"
            />
            <div v-if="showDropdown && filteredDrivers.length > 0" class="dropdown">
              <div
                v-for="driver in filteredDrivers"
                :key="driver.id"
                class="dropdown-item"
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
    <div v-if="showSummaryModal" class="modal-overlay">
      <div class="modal-card">
        <h2>Daily Challenge Complete!</h2>
        <p>Great job! Here is your breakdown for today:</p>

        <div class="final-scores">
          <div>Read the driver: {{ gameStates.read.score }} pts</div>
          <div>Decode the name: {{ gameStates.rebus.score }} pts</div>
          <div>Find the face: {{ gameStates.zoom.score }} pts</div>
          <div>Follow the team: {{ gameStates.team.score }} pts</div>
        </div>

        <div class="final-total">
          Total Score: <span>{{ summaryData?.totalScore }} / 400</span>
        </div>

        <div v-if="summaryData" class="user-stats-summary">
          <p>Current Streak: <strong>{{ summaryData.currentStreak }} days</strong></p>
          <p>Best Score: <strong>{{ summaryData.bestScore }} pts</strong></p>
        </div>

        <button @click="showSummaryModal = false" class="btn-close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ReadDriverGame from '../components/ReadTheDriver.vue';
import RebusGame from '../components/DecodeTheName.vue';
import ZoomGame from '../components/FindTheFace.vue';
import TeamGame from '../components/FollowTheTeam.vue';

const gameTypes = ['read', 'rebus', 'zoom', 'team'];
const gameLabels = {
  read: '1. Read',
  rebus: '2. Rebus',
  zoom: '3. Zoom',
  team: '4. Team'
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
      showSummaryModal.value = true;
    }
  } catch (err) {
    console.error('Error submitting daily score:', err);
  }
};
</script>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-stepper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.step-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-bottom: 3px solid #ccc;
  color: #777;
}

.step-item.active {
  border-color: #e10600; /* F1 Red */
  color: #e10600;
  font-weight: bold;
}

.step-item.completed {
  border-color: #2e7d32;
  color: #2e7d32;
}

.stage-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  color: black;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  margin-top: 20px;
}

.search-box input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  z-index: 10;
}

.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.btn-submit, .btn-next {
  background: #e10600;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
}

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
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}
</style>