const http = require("http");
const server = http.createServer()
const path = require("path");
const fse = require("fs-extra");
const multiparty = require("multiparty");

const UPLOAD_DIR = path.resolve(__dirname, "./", "target"); // 大文件存储目录
const extractExt = filename => filename.slice(filename.lastIndexOf('.'), filename.length)
const fileHashPath = hash => path.resolve(UPLOAD_DIR, hash)
// 切片列表
const createUploadedList = async fileHash => {
    console.log("path", fileHashPath(fileHash))
    return fse.existsSync(fileHashPath(fileHash))
        ? fse.readdir(fileHashPath(fileHash))
        : []
}

// 处理接口数据
const resolvePost = req => {
    return new Promise(resolve => {
        let chunk = ''
        req.on('data', data => {
            chunk += data
        })
        req.on('end', () => {
            resolve(JSON.parse(chunk))
        })
    })
}
    
const pipeStream = (path, writeStream) => {
    return new Promise(resolve => {
        const readStream = fse.createReadStream(path)
        readStream.on('end', () => {
            fse.unlinkSync(path)
            resolve()
        })
        readStream.pipe(writeStream)
    })
}

// 合并切片
const mergeFileChunk = async (filePath, fileHash, size) => {
    const chunkDir = fileHashPath(fileHash)
    const chunkPaths = await fse.readdir(chunkDir)
    // 排序切片
    chunkPaths.sort((a, b) => a.split('-')[1] - b.split('-')[1])
    await Promise.all(
        chunkPaths.map((chunkPath, index) => {
            return pipeStream(
                path.resolve(chunkDir, chunkPath),
                fse.createWriteStream(filePath, {
                    start: index * size,
                    end: (index + 1)  * size
                })
            )
        })
    )
    // 删除切片目录
    fse.rmdirSync(chunkDir)
}

server.on("request", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
        res.status = 200;
        res.end();
        return;
    }
    const multipart = new multiparty.Form()

    multipart.parse(req, async (err, fields, files) => {
        if (err) {
            return
        }
        const [chunk] = files.chunk
        const [fileHash] = fields.fileHash
        const [hash] = fields.hash
        const [filename] = fields.filename
        const chunkDir = fileHashPath(fileHash)

        if (!fse.existsSync(chunkDir)) {
            await fse.mkdirs(chunkDir);
        }
        // 把缓存的文件移动到真实目录下
        await fse.move(chunk.path, `${chunkDir}/${hash}`)
        res.end("received file chunk")
    })

    if (req.url === '/merge') {
        const data = await resolvePost(req)
        const { filename, size, fileHash } = data
        const filePath = path.resolve(UPLOAD_DIR, `${filename}`)

        await mergeFileChunk(filePath, fileHash, size)
        res.end(
            JSON.stringify({
                code: 0,
                message: 'file merged success'
            })
        )
    }

    if (req.url === '/verify') {
        const data = await resolvePost(req)
        const { fileHash, filename } = data
        const ext = extractExt(filename)
        const filePath = path.resolve(UPLOAD_DIR, `${filename}`)
        if (fse.existsSync(filePath)) {
            res.end(
                JSON.stringify({
                    shouldUpload: false
                })
            )
        } else {
            res.end(
                JSON.stringify({
                    shouldUpload: true,
                    uploadedList: await createUploadedList(fileHash)
                })
            )
        }
    }
})

server.listen(8080, () => console.log("正在监听 8080 端口"));
