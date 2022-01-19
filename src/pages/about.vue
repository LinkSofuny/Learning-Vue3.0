
<template>
    <h1>文件上传</h1>
    <input type="file" @change="handleFileChange">
    <el-button type="primary" @click="handleUpload">Upload</el-button>
</template>

<script setup>
import { reactive } from 'vue'
import request from '../utils/request.js'
import createFileChunk from '../utils/createFIleChunk.js'

let container = reactive({ file: null })
let data = reactive([])
function handleFileChange(e) {
    const [file] = e.target.files
    if (!file) returnl
    container.file = file
}
async function handleUpload() {
    if (!container.file) return
    const fileChunkList = createFileChunk(container.file)
    data = fileChunkList.map(({ file }, index) => ({
        chunk: file, // 切块
        hash: container.file.name + '-' + index // hash值
    }))
    await upLoadChunks()
}
async function upLoadChunks () {
    const requsetList = data.map(({ chunk, hash }) => {
        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('hash', hash)
        formData.append('filename', container.file.name)
        return formData
    })
    .map(formData => {
        request({
            url: 'http://localhost:8080',
            data: formData
        })
    })
    await Promise.all(requsetList)
    // await this.mergeRequest()
}
// async function mergeRequest() {
//     await request({
//         url: "http://localhost:8080/merge",
//         headers: {
//             "content-type": "application/json"
//         },
//         data: JSON.stringify({
//             filename: container.file.name
//         })
//     })
// }
</script>

<style>

</style>