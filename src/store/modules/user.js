import { login } from '@/api/login'
import { getToken, setToken, removeToken, getUsername, setUsername } from '@/utils/auth'
import {getAccountInfo} from '@/api/account'

const user = {
    state: {
        username: '',
        email: '',
        avatar: '',
        registerTime: 0,
        jwtToken: getToken()
    },
    mutations: {
        SET_USERNAME: (state, username) => {
            state.username = username
        },
        SET_EMAIL: (state, email) => {
            state.email = email
        },
        SET_AVATAR: (state, avatar) => {
            state.avatar = avatar
        },
        SET_REGISTER_TIME: (state, registerTime) => {
            state.registerTime = registerTime
        },
        SET_JWT_TOKEN: (state, jwtToken) => {
            state.jwtToken = jwtToken
        }
    },
    actions: {
        Login({ commit }, loginData) {
            return new Promise((resolve, reject) => {
                let username = ''
                let email = ''
                if (loginData.name.indexOf('@') == -1) {
                    username = loginData.name
                } else {
                    email = loginData.name
                }
                login(username, email, loginData.password).then(response => {
                    const data = response.data
                    commit('SET_JWT_TOKEN', data.token)
                    setToken(data.token)
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        GetUserInfo({commit}) {
            return new Promise((resolve, reject) => {
                getAccountInfo().then(response => {
                    const data = response.data
                    console.log(data)
                    commit("SET_USERNAME", data.name)
                    commit("SET_EMAIL", data.email)
                    commit("SET_AVATAR", data.avatar)
                    setUsername(data.name)
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
            })
        }
    }
}

export default user