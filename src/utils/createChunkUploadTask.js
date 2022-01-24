const SIZE = 10 * 1024 * 1024


export default async function createChunkUploadTask ({request, mergeRequest, file, checkUploaded, size = SIZE, allCal = true}) {
    const fileChunkList = []
    let fileChunkData = []
    // 创建切片和文件hash
    async function createFileChunk(file, size) {
        let cur = 0
        // 分片
        while (cur < file.size) {
            fileChunkList.push({ file: file.slice(cur, cur + size) })
            cur += size
        }
    }

    function createfileChunkData(hash) {
        fileChunkData = fileChunkList.map(({ file }, index) => ({
            fileHash: hash,
            chunk: file, // 切块
            hash: hash + '-' + index, // hash值
            percentage: 0,
            index
        }))
    }
    // 计算hash
    function calculateHash() {
        return new Promise(resolve => {
            const worker = new Worker('src/utils/hash.js')
            worker.postMessage({ fileChunkList: allCal ? fileChunkList : file })
            worker.onmessage = e => {
                const { percentage, hash } = e.data
                if (hash) {
                    resolve({ hash, percentage})
                }
            }
        })
    }

    async function createUploadRequest (uploadedList = [], hash) {
        const requsetList = fileChunkData
        .filter(({ hash }) => !uploadedList.includes(hash))
        .map(({ chunk, hash, fileHash, index }) => {
            const formData = new FormData()
            formData.append('fileHash', fileHash)
            formData.append('chunk', chunk)
            formData.append('hash', hash)
            formData.append('filename', file.name)
            return { formData, index }
        })
        .map(({ formData, index }) => {
            return request({
                url: 'http://localhost:8080',
                data: formData,
                onProgress: createProgressHandler(fileChunkData[index]),
            })
        })
        await Promise.all(requsetList)

        if (uploadedList.length + requsetList.length === fileChunkData.length) {
            await mergeRequest(file.name, size, hash)
        }
    }

    // 进度条
    function createProgressHandler(item) {
        return e => {
            item.percentage = parseInt(String((e.loaded / e.total) * 100))
        }
    }

    createFileChunk(file, size)
    const { hash, percentage } = await calculateHash()
    createfileChunkData(hash)
    const { shouldUpload, uploadedList } = await checkUploaded(file.name, hash)
    if (!shouldUpload) {
        // 不许要重新上传 todo
        console.log('上传过了')
        return
    }
    // 创建切片请求
    createUploadRequest(uploadedList, hash)
}

