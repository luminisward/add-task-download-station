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
      <label for="temp">temp</label>
      <input id="temp" v-model="temp" type="text" />
      <label for="move">move</label>
      <input id="move" v-model="move" type="text" />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { user, password, serverUrl, temp, move } from "./store";
</script>
