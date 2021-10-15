<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import DemoComponentsVue from './components/DemoComponents.vue';
import { ref } from 'vue'

const demoTitle = ref('测试')
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <input type="text" v-model='demoTitle'>
  <DemoComponentsVue :title='demoTitle' />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
