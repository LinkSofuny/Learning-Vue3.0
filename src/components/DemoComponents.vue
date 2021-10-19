<template>
    <div>
        <div ref='root'>root</div>
    </div>
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
        const root = ref(null)
 
        watchEffect(() => {
            console.log('root', root.value)
        }, 
        {
            flush: 'post'
        })
        return {
            root
        }
        // return () => <div ref={ root } />
    }
}
</script>

<style>

</style>