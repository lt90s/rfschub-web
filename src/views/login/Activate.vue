<template>
    <div class="activate-container">
         <h2 style="text-align: center">Activate account</h2>
         <div style="margin-top:-12px; margin-bottom:12px; text-align: center">
            <span>Login to your email to get the activate code</span>
         </div>
         <el-form ref="activateData" :model="activateData" :rules="rules" label-position="left">
             <el-form-item prop="code" :error="errorMsg">
                    <el-input v-model="activateData.code" placeholder="activate code" name="code" type="text">
                        <template slot="prepend"><svg-icon icon-class="activate_code"></svg-icon></template>
                    </el-input>
             </el-form-item>
             <el-button type="primary" style="width:100%" @click="doActivate">activate</el-button>
         </el-form>
    </div>
</template>
<script>
import { activateAccount } from '@/api/account'
export default {
    name: 'Activate',
    data() {
        const checkCode = (rule, value, callback) => {
            this.errorMsg = ''
            console.log('check')
            if (value.length === 0) {
                callback(new Error("Activate code cannot be empty"))
            } else {
                callback()
            }
        }
        return {
            activateData: {
                code: ''
            },
            errorMsg: '',
            rules: {
                "code":[{required: true, trigger: 'blur', validator: checkCode}]
            }
        }
    },
    created() {
        if (this.$route.query.code !== undefined && this.$route.query.code.length > 0) {
            this.activateData.code = this.$route.query.code
            this.activateAccount()
        }
    },
    methods: {
        doActivate() {
            this.$refs.activateData.validate(valid => {
                if (valid) {
                    this.activateAccount()
                }
            })
        },
        activateAccount() {
            activateAccount(this.activateData.code).then(response => {
                this.$router.push({path: "/sign-in", replace: true})
            }).catch(error => {
                console.log(error)
                this.errorMsg = error.response.data.error
                // TODO: error hint
            })
        }
    }
}
</script>

<style>
.activate-container {
    width: 420px;
    margin: 160px auto;
}
</style>
