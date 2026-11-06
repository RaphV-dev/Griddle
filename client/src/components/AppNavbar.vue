<template>
    <div class="logo">
        <nav class="navbar">
            <router-link to="/">
                <strong>GRIDdle</strong>
            </router-link>
        </nav>
    </div>
    <div class="nav_links">
        <router-link to="/">Home</router-link>
        <router-link v-if="isLoggedIn" to="/game">Play</router-link>
        <router-link v-if="isLoggedIn" to="/profile">Profile</router-link>

        <template v-if="isLoggedIn">
            <router-link to="/login">Log In</router-link>
            <router-link to="/register" class="btn-register">Register</router-link>
        </template>

        <button v-else @click="logout" class="btn-logout">Log Out</button>
    </div>
</template>

<script setup>
    import {ref, watchEffect} from 'vue';
    import {useRouter} from 'vue-router';

    const router = useRouter();
    const isLoggedIn = ref(false);

    const checkAuth = () =>{
        isLoggedIn.value = !localStorage.getItem('token');
    };

    watchEffect(()=>{
        checkAuth();
    })

    const logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        isLoggedIn.value = false;
        router.push('/login');
    };
</script>
<style scoped>
.navbar{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #15151e;
    color: #ffffff;
}

.navbar a {
    color: #ffffff;
    text-decoration: none;
    margin-left: 1.5rem;
}

.btn-register{
    background-color: #e10600;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}

.btn-logout {
    background:transparent;
    border: 1px solid #e10600;
    color: #e10600;
    padding: 0.5rem 1rem;
    margin-left: 1.5rem;
    cursor: pointer;
    border-radius: 4px;
}
</style>