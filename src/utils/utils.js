
import { urlList, baseFileURL } from '../api/requestUrl';
import { request } from '../api/index';
import crypto from 'crypto';
import sMD5 from './spark-md5'; // SparkMD5

export const dataURLtoBlob = imgurl => {
    let arr = imgurl.split(',')
    let mime = arr[0].match(/:(.*?);/)[1] // image || png
    let bstr = atob(arr[1].replace(/\s/g, ''))
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], {type: mime}) // 值，类型
}

export const checkMD5 = file => {
    return new Promise((resolve, reject) => {
        let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            chunkSize = 8097152, // Read in chunks of 2MB
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            fileReader = new FileReader();

        fileReader.onload = e => {
            spark.append(e.target.result) // Append array buffer
            currentChunk++
            if (currentChunk < chunks) {
                loadNext()
            } else {
                let md5 = spark.end()
                let formData = new FormData()
                formData.append("md5", md5)
                const headers = getHeaders()
                const upFileQuery = {
                    headers,
                    needChangeUrl: true,
                    url: baseFileURL + urlList.testMD5,
                }
                request(formData, urlList.testMD5, upFileQuery).then(res => {
                    resolve({ res, md5 })
                })
            }
        };
        fileReader.onerror = function() {
            console.warn('oops, something went wrong.')
        };
        function loadNext() {
            let start = currentChunk * chunkSize,
                end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
        }
        loadNext()
    })
}

export const uploadImage = (file, md5) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = e => {
            let formData = new FormData()
            const imgurl = e.target.result
            const blobBin = dataURLtoBlob(imgurl) // 二进制图片
            formData.append('file', blobBin)
            formData.append("md5", md5)
            const headers = getHeaders()
            const upFileQuery = {
                headers,
                needChangeUrl: true,
                url: baseFileURL + urlList.uploadImage,
            }
            request(formData, urlList.uploadImage, upFileQuery).then(res => {
                resolve(res)
            })
        }
        reader.readAsDataURL(file)
    })
}

const getHeaders = () => {
    const timestamp = Date.parse(new Date())/1000
    let md5 = crypto.createHash("md5")
    md5.update('key1=QINYUANMAO&timestamp=' + timestamp + '&key2=FILE_SERVER_2019')
    const sign = md5.digest('hex').toUpperCase()
    // 头部加签
    const headers = {
        timestamp,
        sign,
    }
    return headers
}