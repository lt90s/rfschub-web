import axios from 'axios'
import store from '@/store'

import {getToken} from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 5000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // // Do something before request is sent
    // if (store.getters.token) {
    //   config.headers['AUTHORIZATION'] = "Bearer " + getToken()
    // }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// respone interceptor
service.interceptors.response.use(
  response => response,
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

export default service
