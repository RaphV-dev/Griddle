<template>
    <div class="profile">
        <h1>Profile</h1>

        <p v-if="loading" class="info">Loading...</p>
        <p v-else-if="error" class="error-msg">{{ error }}</p>

        <template v-else-if="dashboard">
            <!-- Today's game -->
            <section class="card">
                <h2>Today's game</h2>

                <div v-if="dashboard.today.played">
                    <p class="status status-played">Played</p>
                    <ul class="scores">
                        <li><span>Read the driver</span><strong>{{ dashboard.today.scores.read }}</strong></li>
                        <li><span>Decode the name</span><strong>{{ dashboard.today.scores.rebus }}</strong></li>
                        <li><span>Find the face</span><strong>{{ dashboard.today.scores.zoom }}</strong></li>
                        <li><span>Follow the team</span><strong>{{ dashboard.today.scores.team }}</strong></li>
                        <li class="total"><span>Total</span><strong>{{ dashboard.today.scores.total }} / 400</strong></li>
                    </ul>
                </div>

                <div v-else>
                    <p class="status status-unplayed">Not played yet</p>
                    <router-link to="/game" class="btn-primary">Play today's game</router-link>
                </div>
            </section>

            <!-- Stats -->
            <section class="card">
                <h2>Stats</h2>
                <div class="stats-grid">
                    <div class="stat">
                        <span class="stat-value">{{ dashboard.stats.currentStreak }}</span>
                        <span class="stat-label">Current streak</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">{{ dashboard.stats.bestStreak }}</span>
                        <span class="stat-label">Best streak</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">{{ dashboard.stats.bestScore }}</span>
                        <span class="stat-label">Best score</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">{{ dashboard.stats.averageScore }}</span>
                        <span class="stat-label">Average score</span>
                    </div>
                </div>
            </section>

            <!-- Account -->
            <section class="card">
                <h2>Account</h2>
                <ul class="account-info">
                    <li><span>Username</span><strong>{{ dashboard.account.username }}</strong></li>
                    <li><span>Email</span><strong>{{ dashboard.account.email }}</strong></li>
                </ul>

                <p v-if="pwSuccess" class="success-msg">{{ pwSuccess }}</p>

                <button v-if="!showPwForm" class="btn-secondary" @click="openPwForm">
                    Change password
                </button>

                <form v-else class="pw-form" @submit.prevent="submitPassword">
                    <div class="form-group">
                        <label>Current password</label>
                        <input v-model="pwForm.currentPassword" type="password" required autocomplete="current-password">
                    </div>
                    <div class="form-group">
                        <label>New password (8 characters min.)</label>
                        <input v-model="pwForm.newPassword" type="password" required autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label>Confirm new password</label>
                        <input v-model="pwForm.confirmPassword" type="password" required autocomplete="new-password">
                    </div>

                    <p v-if="pwError" class="error-msg">{{ pwError }}</p>

                    <div class="pw-actions">
                        <button type="submit" class="btn-primary" :disabled="pwLoading">
                            {{ pwLoading ? 'Saving...' : 'Save' }}
                        </button>
                        <button type="button" class="btn-secondary" @click="closePwForm">Cancel</button>
                    </div>
                </form>

                <button class="btn-logout" @click="logout">Log Out</button>
            </section>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDashboard, changePassword } from '../services/api';

const MIN_PASSWORD_LENGTH = 8;

const router = useRouter();
const dashboard = ref(null);
const loading = ref(true);
const error = ref('');

const showPwForm = ref(false);
const pwForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const pwError = ref('');
const pwSuccess = ref('');
const pwLoading = ref(false);

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
};

const loadDashboard = async () => {
    loading.value = true;
    error.value = '';
    try {
        const response = await getDashboard();
        dashboard.value = response.data;
    } catch (err) {
        const status = err.response?.status;
        // Token expiré ou invalide : on déconnecte
        if (status === 401 || status === 403) {
            logout();
            return;
        }
        error.value = err.response?.data?.message || 'Could not load your profile.';
    } finally {
        loading.value = false;
    }
};

const resetPwForm = () => {
    pwForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    pwError.value = '';
};

const openPwForm = () => {
    pwSuccess.value = '';
    resetPwForm();
    showPwForm.value = true;
};

const closePwForm = () => {
    resetPwForm();
    showPwForm.value = false;
};

const submitPassword = async () => {
    pwError.value = '';
    pwSuccess.value = '';

    if (pwForm.value.newPassword.length < MIN_PASSWORD_LENGTH) {
        pwError.value = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
        return;
    }
    if (pwForm.value.newPassword !== pwForm.value.confirmPassword) {
        pwError.value = 'Passwords do not match.';
        return;
    }

    pwLoading.value = true;
    try {
        const response = await changePassword({
            currentPassword: pwForm.value.currentPassword,
            newPassword: pwForm.value.newPassword
        });
        pwSuccess.value = response.data.message;
        closePwForm();
    } catch (err) {
        pwError.value = err.response?.data?.message || 'Could not change password.';
    } finally {
        pwLoading.value = false;
    }
};

onMounted(loadDashboard);
</script>

<style scoped>
.profile {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 8px 0 32px;
  color: var(--color-text, #f4f4f1);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}
.profile > h1 {
  grid-column: 1 / -1;
  margin: 0;
  color: #f4f4f1;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: clamp(2.8rem, 5vw, 4.4rem);
  font-weight: 800;
  line-height: .95;
  text-transform: uppercase;
}
.card {
  min-width: 0;
  margin: 0;
  padding: clamp(20px, 2.4vw, 32px);
  border: 1px solid var(--color-border, #303135);
  border-radius: 9px;
  background: linear-gradient(145deg, #1b1c1f, #151619);
}
.card:nth-of-type(3) { grid-column: 1 / -1; }
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
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-family: var(--font-mono, monospace);
  font-size: .72rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status-played { color: var(--color-acid, #d8f35a); }
.status-unplayed { color: #ffb45c; }
.scores, .account-info { list-style: none; padding: 0; margin: 0 0 20px; }
.scores li, .account-info li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid #303135;
  color: #aeb0b4;
}
.scores li strong, .account-info li strong { color: #f4f4f1; }
.scores .total {
  border-bottom: 0;
  color: var(--color-red, #f23b35);
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.3rem;
  text-transform: uppercase;
}
.scores .total strong { color: var(--color-acid, #d8f35a); }
.account-info strong { min-width: 0; overflow-wrap: anywhere; text-align: right; }
.stats-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.stat {
  min-width: 0;
  padding: 22px 14px;
  border: 1px solid #303135;
  border-radius: 7px;
  background: #121315;
  text-align: center;
}
.stat-value {
  display: block;
  color: var(--color-red, #f23b35);
  font-family: var(--font-display, Impact, sans-serif);
  font-size: clamp(2rem, 3vw, 2.8rem);
  font-weight: 800;
  line-height: 1;
}
.stat-label {
  display: block;
  margin-top: 9px;
  color: #929399;
  font-family: var(--font-mono, monospace);
  font-size: .65rem;
  text-transform: uppercase;
}
.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  margin-bottom: 7px;
  color: #bfc0c2;
  font-family: var(--font-mono, monospace);
  font-size: .68rem;
  text-transform: uppercase;
}
.form-group input {
  width: 100%;
  min-height: 46px;
  padding: 10px 13px;
  border: 1px solid #414247;
  border-radius: 5px;
  outline: none;
  background: #101113;
  color: #f4f4f1;
}
.form-group input:focus { border-color: var(--color-red, #f23b35); }
.pw-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.btn-primary, .btn-secondary, .btn-logout {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-family: var(--font-display, Impact, sans-serif);
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
  text-transform: uppercase;
  transition: background 160ms ease, transform 160ms ease;
}
.btn-primary {
  border: 1px solid var(--color-red, #f23b35);
  background: var(--color-red, #f23b35);
  color: white;
}
.btn-primary:hover { background: #ff4b44; transform: translateY(-1px); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary { border: 1px solid #55575d; background: transparent; color: #f4f4f1; }
.btn-secondary:hover { border-color: var(--color-red, #f23b35); }
.btn-logout {
  width: 100%;
  margin-top: 22px;
  border: 1px solid #6d3735;
  background: transparent;
  color: #ff7771;
}
.btn-logout:hover { border-color: var(--color-red, #f23b35); background: rgba(242,59,53,.08); }
.error-msg, .success-msg, .info { font-family: var(--font-mono, monospace); font-size: .78rem; }
.error-msg { color: #ff7771; }
.success-msg { color: var(--color-acid, #d8f35a); }
.info { color: #929399; }
@media (max-width: 760px) {
  .profile { grid-template-columns: 1fr; gap: 14px; }
  .profile > h1, .card:nth-of-type(3) { grid-column: auto; }
  .card { padding: 20px; }
}
@media (max-width: 480px) {
  .stats-grid { gap: 8px; }
  .stat { padding: 16px 8px; }
  .stat-label { font-size: .58rem; }
  .pw-actions { flex-direction: column; }
  .pw-actions button { width: 100%; }
}
</style>