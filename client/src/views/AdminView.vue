<template>
  <div class="admin-container">
    <h1>Admin Dashboard</h1>
    <button 
        @click="refreshDashboard" 
        :disabled="isRefreshing" 
        class="btn-refresh"
      >
        <svg 
            :class="['refresh-icon', { 'spin': isRefreshing }]" 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
        {{ isRefreshing ? 'Actualisation...' : 'Refresh' }}
      </button>
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
        <div v-if="adminData.stats.top5Users.length > 0" class="table-wrapper">
        <table class="admin-table">
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
        </div>
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
const isRefreshing = ref(false);
const error = ref('');
const actionFeedback = ref('');
const busyUserId = ref(null);

const loadAdminData = async (isManualRefresh = false) => {
  if (isManualRefresh) {
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }
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
    isRefreshing.value = false;
  }
};

const refreshDashboard = async () => {
  actionFeedback.value = '';
  await loadAdminData(true);
};

const handleDeleteDailyTry = async (user) => {
  if (!confirm(`Reset today's daily try for ${user.username}?`)) return;
  busyUserId.value = user.id;
  actionFeedback.value = '';
  try {
    const { data } = await deleteUserDailyTry(user.id);
    actionFeedback.value = `${user.username}: ${data.message}`;
    await loadAdminData(true);
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
    await loadAdminData(true);
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not delete user.';
  } finally {
    busyUserId.value = null;
  }
};

onMounted(() => loadAdminData(false));
</script>

<style scoped>
.admin-container {
  width: 100%;
  max-width: 1760px;
  margin: 0 auto;
  padding: 8px 0 36px;
  color: var(--color-text, #f4f4f1);
}
.admin-container > h1 {
  margin: 0 0 22px;
  color: #f4f4f1;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: clamp(2.8rem, 5vw, 4.4rem);
  font-weight: 800;
  line-height: .95;
  text-transform: uppercase;
}
.card {
  min-width: 0;
  margin: 0 0 22px;
  padding: clamp(20px, 2.2vw, 32px);
  border: 1px solid var(--color-border, #303135);
  border-radius: 9px;
  background: linear-gradient(145deg, #1b1c1f, #151619);
}
.card h2 {
  margin: 0 0 20px;
  padding: 0 0 12px;
  border-bottom: 1px solid #38393e;
  border-left: 0;
  color: #f4f4f1;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.stats-grid, .answers-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.stat, .answer-item {
  min-width: 0;
  padding: 22px;
  border: 1px solid #303135;
  border-radius: 7px;
  background: #121315;
}
.stat { text-align: center; }
.stat-value {
  display: block;
  color: var(--color-red, #f23b35);
  font-family: var(--font-display, Impact, sans-serif);
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 800;
  line-height: 1.1;
}
.stat-label, .game-tag {
  display: block;
  margin: 8px 0 0;
  color: #929399;
  font-family: var(--font-mono, monospace);
  font-size: .66rem;
  text-transform: uppercase;
}
.answer-item strong { display: block; margin-top: 10px; color: #f4f4f1; font-size: 1.05rem; overflow-wrap: anywhere; }
.table-wrapper {
  overflow-x: auto;
  border: 1px solid #303135;
  border-radius: 7px;
  background: #121315;
  -webkit-overflow-scrolling: touch;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.admin-table th, .admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #303135;
  white-space: nowrap;
}
.admin-table th {
  background: #1e1f22;
  color: #929399;
  font-family: var(--font-mono, monospace);
  font-size: .65rem;
  font-weight: 500;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.admin-table td { color: #d4d4d1; font-size: .88rem; }
.admin-table tbody tr:last-child td { border-bottom: 0; }
.admin-table tbody tr:hover { background: rgba(255,255,255,.025); }
.admin-table td strong { color: #fff; }
.admin-table .highlight { color: var(--color-acid, #d8f35a); font-weight: 700; }
.muted { color: #85878d; }
.status-played { color: var(--color-acid, #d8f35a); font-weight: 600; }
.role-badge {
  display: inline-flex;
  padding: 5px 9px;
  border: 1px solid #45464a;
  border-radius: 4px;
  background: #242529;
  color: #c5c6c8;
  font-family: var(--font-mono, monospace);
  font-size: .63rem;
  text-transform: uppercase;
}
.role-badge.admin { border-color: rgba(242,59,53,.55); background: rgba(242,59,53,.14); color: #ff7771; }
.actions-cell { display: flex; flex-wrap: wrap; gap: 8px; }
.btn-warning, .btn-danger, .btn-refresh {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 13px;
  border-radius: 5px;
  cursor: pointer;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  transition: background 160ms ease, transform 160ms ease;
}
.btn-warning { border: 1px solid #9b7029; background: rgba(255,159,10,.12); color: #ffc56b; }
.btn-warning:hover:not(:disabled) { background: rgba(255,159,10,.24); }
.btn-danger { border: 1px solid var(--color-red, #f23b35); background: var(--color-red, #f23b35); color: white; }
.btn-danger:hover:not(:disabled) { background: #ff4b44; }
button:disabled { opacity: .35; cursor: not-allowed; }
.btn-refresh {
  min-height: 42px;
  margin: 0 0 22px;
  border: 1px solid #45464a;
  background: #1b1c1f;
  color: #f4f4f1;
}
.btn-refresh:hover:not(:disabled) { border-color: var(--color-red, #f23b35); background: rgba(242,59,53,.12); }
.refresh-icon { flex: 0 0 auto; }
.spin { animation: rotate 1s linear infinite; }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
.error-msg, .success-msg, .info { font-family: var(--font-mono, monospace); font-size: .78rem; }
.error-msg { color: #ff7771; }
.success-msg { color: var(--color-acid, #d8f35a); }
.info { color: #929399; }
@media (max-width: 760px) {
  .card { padding: 18px; margin-bottom: 14px; }
  .stats-grid, .answers-grid { grid-template-columns: 1fr 1fr; gap: 9px; }
  .stat, .answer-item { padding: 15px; }
  .admin-table th, .admin-table td { padding: 11px 12px; }
}
@media (max-width: 480px) {
  .stats-grid, .answers-grid { grid-template-columns: 1fr; }
  .admin-container > h1 { margin-bottom: 18px; }
  .admin-table { min-width: 760px; }
  .btn-refresh { margin-bottom: 16px; }
}
</style>