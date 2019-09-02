import axios from 'axios';
import { baseURL } from'../api/requestUrl'
import router from '../router'

const service = axios.create({
    baseURL,
    timeout: 10000
})

service.interceptors.request.use( config => {
    const { upFileQuery } = config
    const { needChangeUrl, headers, url } = upFileQuery
    if (needChangeUrl) {
        // md5校验和文件上传接口的baseUrl不一样，url由页面中传递而来
        config.url = url
        config.headers['timestamp'] = headers.timestamp
        config.headers['sign'] = headers.sign
    }
    const token = getCookie('fangjian_token')
    if (token && token !== undefined) {
        config.headers['token'] = token
    }
    // config.headers['Content-Type'] = 'text/plain' // yapi使用关键，跨域; easy-moke不需要
    return config;
}, error => {
    console.log(error);
    return Promise.reject();
})

service.interceptors.response.use(response => {
    if(response.status === 200){
        if (response.data.code === 4) { // token失效
            window.alert('登录超时，请重新登录')
            router.push({ path: '/login'})
            return
        }
        return response.data;
    }else{
        Promise.reject();
    }
}, error => {
    console.log(error);
    // window.alert('登录失败，请重新登录')
    // 接口错误时，如果进入的页面需要权限，则直接返回登录页面
    if (router.history.current.meta.permission) {
        router.push({ path: '/login'})
    }
    return Promise.reject();
})

function getCookie(name){
    let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)")
    if(arr = document.cookie.match(reg)) {
        return unescape(arr[2])
    } else {
        console.log('无此token')
    }
}

export default service;