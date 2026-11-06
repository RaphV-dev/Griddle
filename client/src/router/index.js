import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import { meta } from '@babel/eslint-parser';

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
    }
];

const router = createRouter({
    history: createWebHistory,
    routes
})

router.beforeEach((to,from,next) => {
    const token = localStorage.getItem('token');
    if (to.meta.requiresAuth && !token){
        next('/login');
    }else{
        next();
    }
});

export default router;