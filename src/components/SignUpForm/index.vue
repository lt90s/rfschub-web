<template>
    <div :style="styleObject">
        <div class="sign-up-title-wrapper">
            <h2>Sign up to RFSCHub</h2>
        </div>

        <el-form ref="signData" :model="signData" :rules="loginRules" label-position="left">
            <el-form-item prop="name">
                <el-input v-model="signData.name" placeholder="username" name="name" type="text">
                    <template slot="prepend"><svg-icon icon-class="login_user"></svg-icon></template>
                </el-input>
            </el-form-item>
            <el-form-item prop="email">
                <el-input v-model="signData.email" placeholder="email" name="email" type="email">
                    <template slot="prepend"><svg-icon icon-class="email"></svg-icon></template>
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="signData.password" placeholder="password" name="password" type="password" @keyup.enter.native="doLoginUser">
                    <template slot="prepend"><svg-icon icon-class="login_password"></svg-icon></template>
                </el-input>
            </el-form-item>
        </el-form>
        <el-button :loading="loading" type="primary" style="width:100%" @click="doSignUp">Sign up</el-button>
    </div>
</template>

<script>
import {isValidUsername, isValidEmail, isValidPassword} from '@/utils/validate'
import { accountSignUp } from '@/api/account'
import {getToken} from '@/utils/auth'

export default {
    name: "SignUpForm",
    props: {
        styleObject: {
            type: Object,
            required: false
        }
    },
    
    data() {
        const validateName = (rule, value, callback) => {
            if (!isValidUsername(value)) {
                return callback(new Error('Please enter the correct user name'))
            }
            callback()
        }
        const validatePassword = (rule, value, callback) => {
            if (!isValidPassword(value)) {
                callback(new Error('The password can not be less than 8'))
            }
            callback()
        }
        const validateEmail = (rule, value, callback) => {
            if (!isValidEmail(value)) {
                return callback(new Error('Please enter the correct email'))
            }
            callback()
        }
        return {
            signData: {
                name: '',
                email: '',
                password: ''
            },
            loginRules: {
                name: [{ required: true, trigger: 'blur', validator: validateName }],
                email: [{ required: true, trigger: 'blur', validator: validateEmail }], 
                password: [{ required: true, trigger: 'blur', validator: validatePassword }]
            },
            loading: false,
        }
    },
    methods: {
        doSignUp: function() {
            this.$refs.signData.validate(valid => {
                console.log(valid)
                if (valid) {
                    this.loading = true
                    accountSignUp(this.signData.name, this.signData.email, this.signData.password).then(response => {
                        console.log(response.data)
                        this.loading = false
                        // TODO: account should be activated
                        this.$router.push({path: "/sign-in", replace: true})
                        // this.$router.push({path: "/activate", replace: true})
                    }).catch(error => {
                        this.loading = false
                        //TODO: error hint
                    })
                }
            })
        }
    }
}
</script>

<style>

.sign-up-title-wrapper {
    text-align: center;
}
</style>