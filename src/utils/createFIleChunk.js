const SIZE = 10 * 1024 * 1024
/**
 * 
 * @param {*} file file data
 * @param {*} size size of file chunk
 * @returns 
 */
export default function createFileChunk(file, size = SIZE) {
    const fileChunkList = []
    let cur = 0
    while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) })
        cur += size
    }
    return fileChunkList
}