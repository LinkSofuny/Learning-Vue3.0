
<template>
    <div>
        <h1 @click="add1">这是num1{{ counter.num1 }}</h1>
        <h1 @click="add2">这是num2{{ counter.num2 }}</h1>
    </div>
</template>

<script setup>
import { reactive, effect } from "vue";
let counter = reactive({ num1: 1, num2: 2 })

effect(() => {
    // effect 只响应自己订阅的数值变化
    let dummy = counter.num1
    console.log('dummy', dummy)
})

function add1 () {
    counter.num1++
}
function add2 () {
    counter.num2++
}
</script>

<style>

</style>