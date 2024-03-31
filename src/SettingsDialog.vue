<template>
  <div>
    <h1>Settings</h1>
    <form action="">
      <label for="user">User</label>
      <input id="user" v-model="user" type="text" />
      <label for="email">Password</label>
      <input id="password" v-model="password" type="password" />
      <label for="url">Server Url</label>
      <input id="url" v-model="serverUrl" type="text" />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { user, password, serverUrl } from "./store";
</script>
