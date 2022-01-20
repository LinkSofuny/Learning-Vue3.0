
<template>
    <h1>文件上传</h1>
    <input type="file" @change="handleFileChange">
    <el-button type="primary" @click="handleUpload">Upload</el-button>
</template>

<script setup>
import { reactive, ref } from 'vue'
import request from '../utils/request.js'
import createFileChunk from '../utils/createFIleChunk.js'

const SIZE = 10 * 1024 * 1024
let container = reactive({ file: null, hash: '', worker: null })
let data = reactive([])
let hashPercentage = ref(0)

const log = v => console.log(v)

function handleFileChange(e) {
    const [file] = e.target.files
    if (!file) return
    container.file = file
}

function calculateHash(fileChunkList) {
    return new Promise(resolve => {
        container.worker = new Worker('src/utils/hash.js')
        container.worker.postMessage({ fileChunkList })
        container.worker.onmessage = e => {
            const { percentage, hash } = e.data
            hashPercentage = percentage
            if (hash) {
                resolve(hash)
            }
        }
    })
}

async function handleUpload() {
    if (!container.file) return
    const fileChunkList = createFileChunk(container.file)

    container.hash = await calculateHash(fileChunkList)

    data = fileChunkList.map(({ file }, index) => ({
        fileHash: container.hash,
        chunk: file, // 切块
        hash: container.hash + '-' + index, // hash值
        percentage: 0
    }))
    await upLoadChunks()
}

async function upLoadChunks () {
    const requsetList = data.map(({ chunk, hash, fileHash }) => {
        const formData = new FormData()
        formData.append('fileHash', fileHash)
        formData.append('chunk', chunk)
        formData.append('hash', hash)
        formData.append('filename', container.file.name)
        return formData
    })
    .map(formData => {
        return request({
            url: 'http://localhost:8080',
            data: formData
        })
    })
    await Promise.all(requsetList)
    await mergeRequest()
}

async function mergeRequest() {
    await request({
        url: "http://localhost:8080/merge",
        headers: {
            "content-type": "application/json"
        },
        data: JSON.stringify({
            filename: container.file.name,
            size: SIZE,
            fileHash: container.hash 
        })
    })
}
</script>

<style>

</style>