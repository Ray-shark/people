// 封装请求模块-接口调用
import request from '@/utils/request'

export function login(data) {
  // request返回的是一个Promise对象 （axios是通过promise对ajax进行的封装）
  return request({
    url: '/sys/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/sys/profile',
    method: 'get'
  })
}

/**
 * 更新密码
 */
export function updatePassword(data) {
  return request({
    url: '/sys/user/updatePass',
    method: 'put',
    data
  })
}
