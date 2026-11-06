<template>
    <div class="auth-container">
        <h2>Log In</h2>
        <form @submit.prevent="handleLogin">
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
                {{ loading ? 'Loging In' : 'Log In' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import api from '../services/api';

const router = useRouter();
const form = ref({email:'',password:''});
const errorMessage = ref('');
const loading = ref(false);

const handleLogin = async ()=>{
    loading.value = true;
    errorMessage.value = '';
    try{
        const response = await api.post('/auth/login',form.value);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/game')
    }catch(error){
        errorMessage.value = error.response?.data?.message || 'Invalid credentials';
    }finally{
        loading.value = false;
    }
}
</script>

<style scoped>
.auth-container{
    max-width:400px;
    margin:3rem auto;
    padding: 2rem;
    background: #20202a;
    color:#fff;
    border-radius:8px;
}
.form-group{
    margin-bottom: 1.2rem;
}

.form-group label{
    display: block;
    margin-bottom: 0.4rem;
}

.form-group input{
    width:100%;
    padding: 0.6rem;
    border-radius:4px;
    border:1px solid #444;
    background: #15151e;
    color:#fff;
}

button{
    width:100%;
    padding:0.7rem;
    background: #e10600;
    color:white;
    border:none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.error-msg{
    color: #ff4d4d;
    margin-bottom: 1rem;
}    
</style>