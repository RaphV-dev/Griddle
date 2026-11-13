import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

const routes = [
    {path: '/', name:'Home', component: HomeView},
    {path:'/login', name: 'Login', component: LoginView},
    {path: '/register', name: 'Register', component: RegisterView},
    {
        path: '/game',
        name: 'Game',
        component: () => import('../views/GameView.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('../views/AdminView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (to.meta.requiresAuth && !token) {
        return '/login';
    }
    if (to.meta.requiresAdmin && user?.role !== 'admin') {
        return '/';
    }
});

export default router;