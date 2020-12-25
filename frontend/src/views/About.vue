<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="newGame">Neues Spiel erstellen</button>
  </div>
</template>

<script>
  import fetch from "../services/connector";

  export default {
    methods: {
      newGame: async function () {
        console.log(this);
        const response = await fetch(this, 'games', 'post', {});
        console.log(response);
      }
    }
  }
</script>
