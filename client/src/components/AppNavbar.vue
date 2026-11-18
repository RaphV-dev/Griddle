<template>
    <nav class="navbar">
        <div class="logo">
            <router-link to="/">
            <strong>GRID IQ</strong>
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
.navbar {
    position: sticky;
    z-index: 20;
    top: 0;
    display: flex;
    min-height: 58px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0  max(24px, calc((100vw - 1320px) / 2));
    border-bottom: 1px solid #292a2d;
    background: rgba(16, 17, 19, 0.96);
    backdrop-filter: blur(14px);
}

.logo a {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #f4f4f1;
    text-decoration: none;
}

.logo a::before {
    width: 5px;
    height: 22px;
    background: var(--color-red);
    content: '';
    transform: skew(-16deg);
}

.logo strong {
    font-family: var(--font-display);
    font-size: 1.55rem;
    font-style: italic;
    font-weight: 900;
    letter-spacing: -0.02em;
}

.nav_links {
    display: flex;
    align-items: center;
    gap: 8px;
}

.navbar a,
.btn-logout {
    display: inline-flex;
    min-height: 58px;
    align-items: center;
    justify-content: center;
    padding: 0 13px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #929399;
    font-size: 0.78rem;
    text-decoration: none;
    transition: color 160ms ease, border-color 160ms ease;
}

.navbar a:hover,
.navbar a.router-link-active {
    border-bottom-color: var(--color-red);
    color: #f4f4f1;
}

.navbar a.btn-register {
    min-height: 34px;
    padding: 0 15px;
    border: 1px solid var(--color-red);
    border-radius: 5px;
    background: var(--color-red);
    color: white;
}

.btn-logout {
    min-height: 34px;
    padding: 0 14px;
    border: 1px solid #45464a;
    border-radius: 5px;
    cursor: pointer;
}

.btn-logout:hover {
    border-color: var(--color-red);
    color: white;
}

@media (max-width: 640px) {
    .navbar {
        min-height: 56px;
        padding: 0 16px;
    }

    .logo strong {
        font-size: 1.35rem;
    }

    .nav_links {
        gap: 0;
    }

    .navbar a,
    .btn-logout {
        min-height: 56px;
        padding: 0 8px;
        font-size: 0.7rem;
    }

    .navbar a.btn-register,
    .btn-logout {
        min-height: 32px;
    }
}
</style>