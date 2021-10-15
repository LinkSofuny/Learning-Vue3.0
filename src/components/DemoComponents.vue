<template>
  <h1>{{ title }}</h1>
</template>

<script lang='ts'>
import { ref, reactive } from "vue"
export default {
    props: {
        title: String
    },
    setup(props: any, context: any) {
        // console.log('props', props.title)

        // Attribute (非响应式对象，等同于 $attrs)
        console.log('Attribute', context.attrs)

        // 插槽 (非响应式对象，等同于 $slots)
        console.log('插槽', context.slots)

        // 触发事件 (方法，等同于 $emit)
        console.log('触发事件', context.emit)

        // 暴露公共 property (函数)
        console.log('暴露公共', context.expose)
    }
}
</script>

<style>

</style>