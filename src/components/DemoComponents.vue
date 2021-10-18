<template>
  <div v-for="(item, index) in data.list" :ref=" (el: any) => { if (el) data.saveElement(el) }">this is a div element: {{ item }}</div>
</template>

<script lang='ts'>
import { 
    ref, 
    watchEffect, 
    reactive, 
    onBeforeUpdate } from "vue"

export default {
    props: {
        title: String
    },
    setup() {
        const data = reactive({
            list: [1, 2, 3],
            divs: [],
            saveElement(el: HTMLDivElement): void {
                divs[divs.length] = el
            },
        })
        onBeforeUpdate (() => {
            divs.value = []
        }) 
        watchEffect(() => {
            console.log(root.value)
        })
        return {
            data,
            divs,
            
        }
        // return () => <div ref={ root } />
    }
}
</script>

<style>

</style>