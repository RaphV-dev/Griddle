<template>
    <nav class="navbar">
        <div class="logo">
            <router-link to="/">
            <strong>GRIDdle</strong>
        </router-link>
        </div>
        <div class="nav_links">
            <router-link to="/">Home</router-link>
            <router-link v-if="isLoggedIn" to="/game">Play</router-link>
            <router-link v-if="isLoggedIn" to="/profile">Profile</router-link>
            <router-link v-if="isLoggedIn && isAdmin" to="/admin">Admin</router-link>

            <template v-if="!isLoggedIn">
                <router-link to="/login">Log In</router-link>
                <router-link to="/register" class="btn-register">Register</router-link>
            </template>

            <button v-else @click="logout" class="btn-logout">Log Out</button>
        </div>
    </nav>

</template>

<script setup>
    import {ref,watch} from 'vue';
    import {useRouter,useRoute} from 'vue-router';
    const router = useRouter();
    const route = useRoute();
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);

    const checkAuth = () =>{
        isLoggedIn.value = !!localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        isAdmin.value = user?.role === 'admin';
    };

    checkAuth();

    watch(
        ()=>route.path,
        ()=>{
            checkAuth();
        }
    )

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
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem 1rem;
    padding: 0.5rem 1rem;
    background-color: #15151e;
    color: #ffffff;
}

.nav_links{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.5rem;
}

.navbar a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 0.75rem;
    color: #ffffff;
    text-decoration: none;
}

.navbar .logo a {
    padding: 0;
}

.navbar a.btn-register{
    background-color: #e10600;
    padding: 0 1rem;
    border-radius: 4px;
}

.btn-logout {
    min-height: 44px;
    background:transparent;
    border: 1px solid #e10600;
    color: #e10600;
    padding: 0 1rem;
    cursor: pointer;
    border-radius: 4px;
}

@media (min-width: 641px){
    .navbar{
        padding: 0.5rem 2rem;
    }
}

/* Mobile : le logo reste en haut, les liens passent sur toute la largeur en dessous */
@media (max-width: 640px){
    .nav_links{
        width: 100%;
    }
}
</style>
