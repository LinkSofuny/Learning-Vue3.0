
<template>
    <h1>文件上传</h1>
    <input type="file" @change="handleFileChange">
    <input >
    <el-button type="primary" @click="handleUpload">Upload</el-button>
    <el-button type="info" @click="handleStop">stop Upload</el-button>
    <el-button type="success" @click="handlerResume" disabled>Resume</el-button>
</template>

<script setup>
import { reactive, ref } from 'vue'
import request from '../utils/request.js'
import createChunkUploadTask from '../../../frag-upload/src/main.js'

const SIZE = 10 * 1024 * 1024
let container = reactive({ file: null, hash: '', worker: null })
let requsetListNow = reactive([])

const log = v => console.log(v)

// 文件处理
function handleFileChange(e) {
    const [file] = e.target.files
    if (!file) return
    container.file = file
}


// todo 此时还没有hash值
async function handlerResume() {
    const { uploadedList } = await verifyUpload(
        container.file.name,
        container.hash
    )
    // await upLoadChunks(uploadedList)
}


// 上传
async function handleUpload() {
    if (!container.file) return
    await createChunkUploadTask({
        chunkRequset: chunkRequset, 
        mergeRequest, 
        file: container.file, 
        checkUploaded: verifyUpload,
        allCal: false
    })
}

// 切片上传
async function chunkRequset(data, onProgress) {
    return await request({
        url: 'http://localhost:8080',
        data,
        onProgress
    })
}

// 通知合并
async function mergeRequest(filename, size, fileHash) {
    await request({
        url: "http://localhost:8080/merge",
        headers: {
            "content-type": "application/json"
        },
        data: JSON.stringify({
            filename,
            size: SIZE,
            fileHash,
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


</script>

<style>

</style>