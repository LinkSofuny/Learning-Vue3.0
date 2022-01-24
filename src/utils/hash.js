self.importScripts('./spark-md5.min.js')
const allFileHash = function (index) {
    const reader = new FileReader()
    reader.readAsArrayBuffer(fileChunkList[index].file)
    reader.onload = e => {
        count++
        spark.append(e.target.result)

        if (count === fileChunkList.length) {
            self.postMessage({
                percentage: 100,
                hash: spark.end()
            })
            self.close()
        } else {
            percentage += 100 / fileChunkList.length
            self.postMessage({
                percentage
            })
            // 计算下个切片
            allFileHash(count)
        }
    }
}
const partFileHash = function (file) {

}

function createHashComputer (fileChunkList) {
    // 如果是数组 证明文件被拆分过, 则是全量
    return Array.isArray(fileChunkList) ? allFileHash : partFileHash
}
self.onmessage = e => {
    debugger
    const { fileChunkList } = e.data
    const spark = new self.SparkMD5.ArrayBuffer()  // todo
    let percentage = 0
    let count = 0
    const loadNext = createHashComputer(fileChunkList)
    loadNext(0)
}