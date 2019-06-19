export function isValidUsername(str) {
    const name = /^[a-zA-Z][a-zA-Z0-9_]+$/
    return name.test(str)
}

export function isValidEmail(str) {
    const email =  /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/
    return email.test(str)
}

export function isValidPassword(str) {
    // const number = /[0-9]/
    if (str.length < 6) { // || !number.test(str)) {
        return false
    }
    return true
}