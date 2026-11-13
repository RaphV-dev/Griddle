<template>
  <div class="admin-container">
    <h1>Admin Dashboard</h1>

    <p v-if="loading" class="info">Loading admin data...</p>
    <p v-else-if="error" class="error-msg">{{ error }}</p>

    <template v-else-if="adminData">
      <!-- 1. Global Stats -->
      <section class="card">
        <h2>Global Statistics</h2>
        <div class="stats-grid">
          <div class="stat">
            <span class="stat-value">{{ adminData.stats.nbUsers }}</span>
            <span class="stat-label">Registered Users</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ adminData.stats.averageScore }} / 400</span>
            <span class="stat-label">Global Average Score</span>
          </div>
        </div>
      </section>

      <!-- 2. Today's Answers -->
      <section class="card">
        <h2>Today's Challenge Answers ({{ adminData.dailyAnswers?.date || 'N/A' }})</h2>
        <div v-if="adminData.dailyAnswers" class="answers-grid">
          <div class="answer-item">
            <span class="game-tag">1. Read the Driver</span>
            <strong>{{ adminData.dailyAnswers.read?.name }} ({{ adminData.dailyAnswers.read?.code }})</strong>
          </div>
          <div class="answer-item">
            <span class="game-tag">2. Decode the Name</span>
            <strong>{{ adminData.dailyAnswers.rebus?.name }} ({{ adminData.dailyAnswers.rebus?.code }})</strong>
          </div>
          <div class="answer-item">
            <span class="game-tag">3. Find the Face</span>
            <strong>{{ adminData.dailyAnswers.zoom?.name }} ({{ adminData.dailyAnswers.zoom?.code }})</strong>
          </div>
          <div class="answer-item">
            <span class="game-tag">4. Follow the Team</span>
            <strong>{{ adminData.dailyAnswers.team?.name }} ({{ adminData.dailyAnswers.team?.code }})</strong>
          </div>
        </div>
        <p v-else class="info">No challenge generated for today yet.</p>
      </section>

      <!-- 3. Top 5 Users -->
      <section class="card">
        <h2>Top 5 Players</h2>
        <table v-if="adminData.stats.top5Users.length > 0" class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Avg Score</th>
              <th>Best Score</th>
              <th>Games</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(player, index) in adminData.stats.top5Users" :key="player.id">
              <td><strong>{{ index + 1 }}</strong></td>
              <td>{{ player.username }}</td>
              <td class="highlight">{{ player.average_score }}</td>
              <td>{{ player.best_score }}</td>
              <td>{{ player.games_played }}</td>
              <td>{{ player.current_streak }} d</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="info">No completed games yet.</p>
      </section>

      <!-- 4. User Management & Controls -->
      <section class="card">
        <h2>User Controls</h2>
        <p v-if="actionFeedback" class="success-msg">{{ actionFeedback }}</p>

        <div class="table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Role</th>
                <th>Today's Try</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in adminData.users" :key="u.id">
                <td>{{ u.id }}</td>
                <td>
                  <strong>{{ u.username }}</strong><br />
                  <small class="muted">{{ u.email }}</small>
                </td>
                <td>
                  <span :class="['role-badge', u.role]">{{ u.role }}</span>
                </td>
                <td>
                  <span v-if="u.played_today" class="status-played">
                    Played ({{ u.today_score }} pts)
                  </span>
                  <span v-else class="muted">Not played</span>
                </td>
                <td class="actions-cell">
                  <button
                    class="btn-warning"
                    :disabled="!u.played_today || busyUserId === u.id"
                    @click="handleDeleteDailyTry(u)"
                    title="Reset today's attempt"
                  >
                    Delete Daily Try
                  </button>
                  <button
                    class="btn-danger"
                    :disabled="u.role === 'admin' || busyUserId === u.id"
                    @click="handleDeleteUser(u)"
                    title="Remove user permanently"
                  >
                    Remove User
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAdminDashboard, deleteUserAccount, deleteUserDailyTry } from '../services/api';

const router = useRouter();
const adminData = ref(null);
const loading = ref(true);
const error = ref('');
const actionFeedback = ref('');
const busyUserId = ref(null);

const loadAdminData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await getAdminDashboard();
    adminData.value = data;
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      router.push('/');
      return;
    }
    error.value = err.response?.data?.message || 'Failed to load admin panel.';
  } finally {
    loading.value = false;
  }
};

const handleDeleteDailyTry = async (user) => {
  if (!confirm(`Reset today's daily try for ${user.username}?`)) return;
  busyUserId.value = user.id;
  actionFeedback.value = '';
  try {
    const { data } = await deleteUserDailyTry(user.id);
    actionFeedback.value = `${user.username}: ${data.message}`;
    await loadAdminData();
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not delete daily try.';
  } finally {
    busyUserId.value = null;
  }
};

const handleDeleteUser = async (user) => {
  if (!confirm(`Permanently delete user "${user.username}" and all their scores?`)) return;
  busyUserId.value = user.id;
  actionFeedback.value = '';
  try {
    const { data } = await deleteUserAccount(user.id);
    actionFeedback.value = `${user.username}: ${data.message}`;
    await loadAdminData();
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not delete user.';
  } finally {
    busyUserId.value = null;
  }
};

onMounted(loadAdminData);
</script>

<style scoped>
.admin-container {
  max-width: 950px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #fff;
}

.card {
  background: #20202a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.15rem;
  border-left: 4px solid #e10600;
  padding-left: 0.6rem;
}

.stats-grid,
.answers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat,
.answer-item {
  background: #15151e;
  border-radius: 6px;
  padding: 1rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #e10600;
}

.stat-label,
.game-tag {
  display: block;
  font-size: 0.85rem;
  color: #aaa;
  margin-bottom: 0.3rem;
}

.table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th,
.admin-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #333;
}

.admin-table th {
  color: #aaa;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.highlight {
  color: #e10600;
  font-weight: bold;
}

.muted {
  color: #888;
}

.status-played {
  color: #4cd964;
  font-weight: bold;
}

.role-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  background: #333;
}

.role-badge.admin {
  background: #e10600;
  color: #fff;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-warning,
.btn-danger {
  padding: 0.45rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-warning {
  background: #ff9f0a;
  color: #15151e;
}

.btn-danger {
  background: #e10600;
  color: #fff;
}

button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.error-msg { color: #ff4d4d; margin-bottom: 1rem; }
.success-msg { color: #4cd964; margin-bottom: 1rem; }
.info { color: #aaa; }
</style>