<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script>
  import fetch from "../services/connector";

  export default {
    async mounted() {
      const res = await fetch(this, 'authorized', 'get', {});
      console.log(res);
    }
  }
</script>
