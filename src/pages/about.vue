
<template>
    <h1>文件上传</h1>
    <input type="file" @change="handleFileChange">
    <el-button type="primary" @click="handleUpload">Upload</el-button>
    <el-button type="info" @click="handleStop">stop Upload</el-button>
    <el-button type="success" @click="handlerResume" disabled>Resume</el-button>
</template>

<script setup>
import { reactive, ref } from 'vue'
import request from '../utils/request.js'
import createFileChunk from '../utils/createFIleChunk.js'

const SIZE = 10 * 1024 * 1024
let container = reactive({ file: null, hash: '', worker: null })
let data = reactive([])
let requsetListNow = reactive([])
let hashPercentage = ref(0)

const log = v => console.log(v)

// 文件处理
function handleFileChange(e) {
    const [file] = e.target.files
    if (!file) return
    container.file = file
}

// 计算hash
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
// todo 此时还没有hash值
async function handlerResume() {
    const { uploadedList } = await verifyUpload(
        container.file.name,
        container.hash
    )
    await upLoadChunks(uploadedList)
}

// 上传
async function handleUpload() {
    if (!container.file) return
    const fileChunkList = createFileChunk(container.file)
    container.hash = await calculateHash(fileChunkList)

    const { shouldUpload, uploadedList } = await verifyUpload(container.file.name, container.hash)
    if (!shouldUpload) {
        ElMessage('upload success')
        return
    }

    data = fileChunkList.map(({ file }, index) => ({
        fileHash: container.hash,
        chunk: file, // 切块
        hash: container.hash + '-' + index, // hash值
        percentage: 0
    }))
    await upLoadChunks(uploadedList)
}

async function upLoadChunks (uploadedList = []) {
    const requsetList = data
    .filter(({ hash }) => !uploadedList.includes(hash))
    .map(({ chunk, hash, fileHash, index }) => {
        const formData = new FormData()
        formData.append('fileHash', fileHash)
        formData.append('chunk', chunk)
        formData.append('hash', hash)
        formData.append('filename', container.file.name)
        return { formData, index }
    })
    .map(({ formData, index }) => {
        return request({
            url: 'http://localhost:8080',
            data: formData,
            requestList: requsetListNow,
            onProgress: this.createProgressHandler(data[index]),
        })
    })
    await Promise.all(requsetList)

    if (uploadedList.length + requsetList.length === data.length)
        await mergeRequest()
}

// 通知合并
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

// 文件秒传
async function verifyUpload(filename, fileHash) {
    const { data } = await request({
        url: "http://localhost:8080/verify",
        headers: {
            "content-type": "application/json"
        },
        data: JSON.stringify({
            filename,
            fileHash
        })
    })
    return JSON.parse(data)
}

// 暂停上传
async function handleStop() {
    requsetListNow.forEach(xhr => xhr?.abort());
    requsetListNow = []
}

// 进度条
function createProgressHandler(item) {
    return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100))
    }
}
</script>

<style>

</style>