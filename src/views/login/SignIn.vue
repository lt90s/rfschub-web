
<template>
    <div class="sign-in-container">
        <div class="sign-in-title-wrapper">
            <h2>Sign in to RFSCHub</h2>
        </div>
        <div v-if="showLoginError" class="login-error-wrapper">
            <el-tag  type="danger" closable @close="showLoginError=false">Incorrect username or password</el-tag>
        </div>
        <el-form ref="loginData" :model="loginData" :rules="loginRules" auto-complete="on" label-position="left" class="sign-in-form">
            <el-form-item prop="name">
                <el-input v-model="loginData.name" placeholder="username or email" name="name" type="text" autocomplete="on">
                    <template slot="prepend"><svg-icon icon-class="login_user"></svg-icon></template>
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginData.password" placeholder="password" name="password" type="password" @keyup.enter.native="doLoginUser">
                    <template slot="prepend"><svg-icon icon-class="login_password"></svg-icon></template>
                </el-input>
            </el-form-item>
        </el-form>
        <el-button :loading="loading" type="primary" style="width:100%" @click.native.prevent="doLoginUser">sign in</el-button>
    </div>
</template>

<script>
import {isValidUsername, isValidEmail, isValidPassword} from '@/utils/validate'
import {getToken} from '@/utils/auth'

export default {
    name: "SignIn",
    
    data() {
        const validateName = (rule, value, callback) => {
            if (value.indexOf('@') != -1) {
                if (!isValidEmail(value)) {
                    callback(new Error('Please enter the correct email'))
                }
            } else if (!isValidUsername(value)) {
                callback(new Error('Please enter the correct user name'))
            } else {
                callback()
            }
        }
        const validatePassword = (rule, value, callback) => {
            if (!isValidPassword(value)) {
                callback(new Error('The password can not be less than 6'))
            } else {
                callback()
            }
        }
        return {
            loginData: {
                name: 'lt90s',
                password: '12345678'
            },
            loginRules: {
                name: [{ required: true, trigger: 'blur', validator: validateName }],
                password: [{ required: true, trigger: 'blur', validator: validatePassword }]
            },
            loading: false,
            showLoginError: false
        }
    },
    methods: {
        doLoginUser: function() {
            this.$refs.loginData.validate(valid => {
                if (valid) {
                    this.loading = true
                    this.$store.dispatch('Login', this.loginData).then((response) => {
                        this.loading = false
                        this.$store.dispatch("GetUserInfo").then(response => {
                            console.log(response.data)
                            this.$router.push({ path: '/' + response.data.name })
                        })
                    }).catch(error => {
                        console.log(error)
                        this.showLoginError = true
                        this.loading = false
                    })
                }
            })
        }
    }
}
</script>

<style>
.sign-in-container {
    margin: 120px auto;
    max-width: 360px;
}

.login-error-wrapper {
    text-align: center;
    margin-top: -12px;
    margin-bottom: 12px;
}

.sign-in-title-wrapper {
    text-align: center;
}
</style>