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
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1rem;
    color: #fff;
}

.profile h1 {
    margin-bottom: 1.5rem;
}

.card {
    background: #20202a;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.card h2 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    border-left: 4px solid #e10600;
    padding-left: 0.6rem;
}

.status {
    font-weight: bold;
    margin-bottom: 1rem;
}
.status-played { color: #4cd964; }
.status-unplayed { color: #ff9f0a; }

.scores,
.account-info {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
}

.scores li,
.account-info li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #333;
}

.scores .total {
    border-bottom: none;
    color: #e10600;
    font-size: 1.1rem;
}

.account-info span { color: #aaa; }

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.stat {
    background: #15151e;
    border-radius: 6px;
    padding: 1rem;
    text-align: center;
}

.stat-value {
    display: block;
    font-size: 1.8rem;
    font-weight: bold;
    color: #e10600;
}

.stat-label {
    font-size: 0.85rem;
    color: #aaa;
}

.form-group { margin-bottom: 1rem; }

.form-group label {
    display: block;
    margin-bottom: 0.4rem;
}

.form-group input {
    width: 100%;
    padding: 0.6rem;
    border-radius: 4px;
    border: 1px solid #444;
    background: #15151e;
    color: #fff;
    box-sizing: border-box;
}

.pw-actions {
    display: flex;
    gap: 0.8rem;
}

.btn-primary,
.btn-secondary,
.btn-logout {
    display: inline-block;
    padding: 0.7rem 1.2rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    text-decoration: none;
    text-align: center;
    font-size: 1rem;
}

.btn-primary {
    background: #e10600;
    color: #fff;
    border: none;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
    background: transparent;
    color: #fff;
    border: 1px solid #666;
}

.btn-logout {
    display: block;
    width: 100%;
    margin-top: 1.5rem;
    background: transparent;
    color: #e10600;
    border: 1px solid #e10600;
}

.error-msg { color: #ff4d4d; margin-bottom: 1rem; }
.success-msg { color: #4cd964; margin-bottom: 1rem; }
.info { color: #aaa; }
</style>