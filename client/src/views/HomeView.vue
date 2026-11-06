<template>
    <div class="home-container">
        <h1>Welcome to GRIDdle</h1>
        <router-link to="/game" class="btn-play">Start daily game</router-link>
    </div>
</template>

<style scoped>
.home-container{
    text-align: center;
    padding: 3rem 1rem;
}

.btn-play{
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.8rem 1.5rem;
    background-color: #e10600;
    color:white;
    text-decoration: none;
    font-weight: bold;
    border-radius: 4px;
}
</style>
