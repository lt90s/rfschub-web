import router from '@/router'
import store from '@/store'

import {getToken, getUsername} from '@/utils/auth'

router.beforeEach((to, from, next) => {
    if (getToken()) {
        if (!store.getters.username) { // refreshed
            console.log("get user info")
            store.dispatch("GetUserInfo").then(()=>{})
        }
        if (to.path === '/') {
            next({path: '/' + getUsername(), replace: true})
        }
        if (to.path === '/sign-in') {
            next({path: '/' + getUsername(), replace: true})
        }
    } else if (to.meta.login) {
        next({ path: '/sign-in', replace: true })
    }
    next()
})