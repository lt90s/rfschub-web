import request from "@/utils/request"

export function login(username, email, password) {
    const data = {
        name: username,
        email: email,
        password: password
    }
    return request({
        url: "/account/login",
        method: "post",
        data
    })
}