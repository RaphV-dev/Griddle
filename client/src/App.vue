<template>
  <div id="app">
    <AppNavbar/>
    <main class="main-content">
      <router-view/>
    </main>
  </div>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue';
</script>

<style>
*, *::before, *::after{
  box-sizing: border-box;
}
body{
  margin:0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Tahoma, Geneva, Verdana, sans-serif;
  background-color:#0f0f14;
  color:#ffffff;
  -webkit-text-size-adjust: 100%;
  overflow-wrap: break-word;
}
img{
  max-width:100%;
}
/* Les champs héritent de la police du body : 16px évite le zoom auto d'iOS au focus */
input, button, select, textarea{
  font: inherit;
}
.main-content{
  padding:0.75rem;
}
@media (min-width: 600px){
  .main-content{
    padding:1rem;
  }
}

/* Styles partagés par les 4 mini-jeux */
.game-stage h3{
  margin:0 0 0.4rem;
  font-size:1.1rem;
}
.game-stage .subtitle{
  margin:0 0 0.75rem;
  color:#666;
  font-size:0.9rem;
}
</style>
