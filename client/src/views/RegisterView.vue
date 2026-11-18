<template>
    <div class="auth-container">
        <div class="auth-heading">
            <span class="auth-kicker">JOIN THE PADDOCK / GRID IQ</span>
            <h1>CLAIM YOUR GRID.</h1>
            <p>Create your account and put your Formula 1 knowledge to the test.</p>
        </div>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label>Username</label>
                <input v-model="form.username" type="text" required placeholder="Ex: Hamilton44">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input v-model="form.email" type="email" required placeholder="driver@f1.com">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input v-model="form.password" type="password" required>
            </div>

            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

            <button type="submit" :disabled="loading">
                {{ loading ? 'Account creation...' : 'Register' }}
            </button>
        </form>
        <p class="auth-switch">Already have an account? <router-link to="/login">Log in ↗</router-link></p>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import api from '../services/api';

const router = useRouter();
const form = ref({username:'', email:'',password:''});
const errorMessage =ref('');
const loading = ref(false);

const handleRegister = async() =>{
    loading.value = true;
    errorMessage.value='';
    try{
        await api.post('/auth/register', form.value);
        router.push('/login')
    }catch(error){
        errorMessage.value = error.response?.data?.message || 'Error while registering.';
    }finally{
        loading.value = false;
    }
};
</script>

<style scoped>
.auth-container {
  width: min(100%, 520px); margin: clamp(24px, 6vh, 64px) auto; padding: clamp(24px, 4vw, 42px);
  border: 1px solid #303135; border-radius: 10px;
  background: linear-gradient(145deg, #1b1c1f, #141517); color: #f4f4f1;
  box-shadow: 0 24px 70px rgba(0,0,0,.22);
}
.auth-heading { margin-bottom: 30px; padding-bottom: 24px; border-bottom: 1px solid #38393e; }
.auth-kicker { color: var(--color-acid, #d8f35a); font-family: var(--font-mono, monospace); font-size: .65rem; letter-spacing: .04em; }
.auth-heading h1 {
  margin: 22px 0 10px; color: #f4f4f1; font-family: var(--font-display, Impact, sans-serif);
  font-size: clamp(2.6rem, 7vw, 3.8rem); font-weight: 800; line-height: .92; text-transform: uppercase;
}
.auth-heading p { margin: 0; color: #a4a5aa; font-size: .9rem; line-height: 1.6; }
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block; margin-bottom: 8px; color: #bfc0c2;
  font-family: var(--font-mono, monospace); font-size: .68rem; text-transform: uppercase;
}
.form-group input {
  width: 100%; min-height: 50px; padding: 12px 14px; border: 1px solid #414247;
  border-radius: 5px; outline: none; background: #101113; color: #f4f4f1; font-size: .95rem;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.form-group input::placeholder { color: #696b71; }
.form-group input:focus { border-color: var(--color-red, #f23b35); box-shadow: 0 0 0 3px rgba(242,59,53,.12); }
.auth-container form > button {
  display: flex; width: 100%; min-height: 50px; align-items: center; justify-content: center;
  margin-top: 8px; padding: 12px 18px; border: 1px solid var(--color-red, #f23b35);
  border-radius: 5px; background: var(--color-red, #f23b35); color: white; cursor: pointer;
  font-family: var(--font-display, Impact, sans-serif); font-size: 1.25rem; font-weight: 700;
  text-transform: uppercase; transition: background 160ms ease, transform 160ms ease;
}
.auth-container form > button:hover:not(:disabled) { background: #ff4b44; transform: translateY(-1px); }
.auth-container form > button:disabled { opacity: .6; cursor: not-allowed; }
.error-msg { margin: 0 0 14px; color: #ff7771; font-family: var(--font-mono, monospace); font-size: .76rem; line-height: 1.5; }
.auth-switch { margin: 24px 0 0; color: #929399; font-size: .82rem; text-align: center; }
.auth-switch a { color: #f4f4f1; text-decoration-color: var(--color-red, #f23b35); text-underline-offset: 4px; }
.auth-switch a:hover { color: var(--color-acid, #d8f35a); }
@media (max-width: 600px) { .auth-container { margin: 12px auto 28px; padding: 24px 20px; } }
</style>