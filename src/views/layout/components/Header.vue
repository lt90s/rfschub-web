<template>
    <div class="header-container">
        <div class="header-left">
            <div class="rfschub-logo">
                <router-link :to="logoLink">
                    <span style="color:#2c3e50">RFSCHub</span>
                </router-link>
            </div>
            <div class="search-wrapper">
                <el-input placeholder="Search RFSCHub" v-model="searchText" disabled prefix-icon="el-icon-search" maxlength="64">
                </el-input>
            </div>
        </div>
        <div class="header-right">
            <div v-if="!logined" class="header-right-wrapper">
                <router-link to="/sign-in">
                    <span class="sign-item">Sign in</span>
                </router-link>
                <router-link to="/sign-up">
                    <span class="sign-item">Sign up</span>
                </router-link>
            </div>
            <div v-else class="header-right-wrapper">
                <span>Welcome {{ username }}!</span>
                <el-dropdown class="avatar-container" trigger="click">
                    <div class="avatar-wrapper">
                        <img :src="userAvatar" class="user-avatar">
                        <i class="el-icon-caret-bottom"/>
                    </div>
                    <el-dropdown-menu slot="dropdown">
                        <router-link :to="homepage">
                            <el-dropdown-item>Homepage</el-dropdown-item>
                        </router-link>
                        <el-dropdown-item divided>
                            <span style="display:block;" @click="signOut">Sign out</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>

<script>
import {getToken, removeToken } from '@/utils/auth'
import { genAvatar } from '@/utils/avatar'
import { mapGetters } from 'vuex'

export default {
    name: "Header",
    data() {
        return {
            searchText: "",
            logined: !!getToken()
        }
    },
    computed: {
        ...mapGetters(['username', 'avatar', 'username']),
        userAvatar() {
            if (this.avatar) {
                return this.avatar
            }
            return genAvatar(this.username, 40)
        },
        homepage() {
            return '/' + this.username
        },
        logoLink() {
            if (getToken()) {
                return this.homepage
            }
            return '/'
        }
    },
    watch: {
        '$route' (to, from) {
            this.logined = !!getToken()
        }
    },
    methods: {
        signOut() {
            removeToken()
            this.$router.push('/')
        }
    }
}
</script>

<style>
.header-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    background-color: #e4e9f1;
}

.header-left {
    display: flex;
    align-items: center;
    margin: 12px 24px;
}

.rfschub-logo {
    font-size: 24px;
}

.search-wrapper {
    margin-left: 12px;
}

.header-right {
    font-size: 18px;
}

.sign-item:hover {
    color: #1d8b74;
    border-color: #1d8b74;
    cursor: pointer;
    text-decoration: none;
}

.sign-item {
    /* margin-left: 24px; */
    border: 1px solid #cccccc;
    padding: 2px 4px;
    border-radius: 4px;
    color: #2c3e50;
}

.header-right-wrapper {
    display: flex;
    align-items: center;
}

.header-right-wrapper * {
    margin: 0 12px;
}

.avatar-wrapper {
    cursor: pointer;
    position: relative;
}

.user-avatar {
    border-radius: 8px;
}

.el-icon-caret-bottom {
    position: absolute;
    right: -20px;
    top: 25px;
    font-size: 12px;
}
</style>