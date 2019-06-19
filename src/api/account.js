import request from "@/utils/request"

export function accountSignUp(name, email, password) {
    return request({
        url: "/account/register",
        method: "post",
        data: {
            name,
            email,
            password
        }
    })
}

export function activateAccount(code) {
    return request({
        url: "/account/activate",
        method: "post",
        data: {
            code
        }
    })
}

export function getAccountInfo() {
    return request({
        url: "/account/info",
        method: "get"
    })
}

export function getOtherAccountInfo(username) {
    return request({
        url: "/account/info/" + username,
        method: "get"
    })
}

export function getNameStatus(name) {
    return request({
        url: "/account/name_status",
        method: "get",
        params: {
            name
        }
    })
}

export function getEmailStatus(email) {
    return request({
        url: "/account/email_status",
        method: "get",
        params: {
            email
        }
    })
}