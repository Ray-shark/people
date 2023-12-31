import axios from 'axios'
import store from '@/store'
import { Message } from 'element-ui'
import router from '@/router'

// 二次封装axios
const service = axios.create({
  // 根据不同的生产环境取不同的api地址，process.evn.属性（.evn文件中）
  baseURL: process.env.VUE_APP_BASE_API, // 基础地址(url前缀)
  timeout: 10000 // 超时时间（单位毫秒）
}) // 创建一个axios实例
// 请求拦截器，成功执行第一个，失败执行第二个
service.interceptors.request.use((config) => {
  // 注入token,利用配置好的getters获取user的token
  // store.getters.token => 放入请求头里面
  // 存在token
  if (store.getters.token) {
    // 请求头中，Authorization字段一般用于发送身份验证凭据，值的格式一般采用 'Bearer token'
    config.headers.Authorization = `Bearer ${store.getters.token}`
  }
  return config
}, (error) => {
  // 失败执行promise
  return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use((response) => {
  // axios默认包裹了data
  // 判断是否为blob
  if (response.data instanceof Blob) {
    return response.data // 返回了blob对象
  }
  const { data, message, success } = response.data // 默认是json格式
  if (success) {
    return data
  } else {
    // 业务失败（密码用户不正确等返回的success为false）
    Message({ type: 'error', message: message })
    return Promise.reject(new Error(message))
  }
}, async(error) => { // token失效，与服务器不匹配，响应拦截器异常
  if (error.response.status === 401) {
    // 处理异常,删除token，用户信息
    await store.dispatch('user/logout')
    // 跳转到登录页
    router.push('/login')
  }
  // error.message是错误提示的消息
  // 可以用alert(error.message)
  // 这里用ElementUI中提供的Message方法
  Message({ type: 'error', message: error.message })
  return Promise.reject(error)
})

export default service
