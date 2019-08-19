import axios from 'axios';
import { baseURL } from'../api/requestUrl'
import router from '../router'

const service = axios.create({
    baseURL,
    timeout: 10000
})

service.interceptors.request.use( config => {
    const token = getCookie('fangjian_token')
    if (token && token !== undefined) {
        // config.headers['Authorization'] = 'Bearer ' + token
    }
    config.headers['Content-Type'] = 'text/plain' // yapi使用关键，跨域; easy-moke不需要
    return config;
}, error => {
    console.log(error);
    return Promise.reject();
})

service.interceptors.response.use(response => {
    if(response.status === 200){
        return response.data;
    }else{
        Promise.reject();
    }
}, error => {
    console.log(error);
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