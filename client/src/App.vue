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
body{
  margin:0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color:#0f0f14;
  color:#ffffff;
}
.main-content{
  padding:1rem;
}
</style>
