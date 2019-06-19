<template>
    <el-row :gutter="40" class="homepage-container">
        <el-col :span="4" :offset="4">
            <div class="user-info">
                <img :src="userAvatar()"/>
                <span> {{ userName }} </span>
                <!-- <span>Joined {{ relativeTime(userInfo.createdTime) }}</span> -->
                <div v-if="isSelf" style="margin-top:32px">
                    <el-button type="primary" @click="$router.push('/create')">Create project</el-button>
                </div>
            </div>
        </el-col>
        <el-col :span="12">
            <el-row v-if="projects && projects.length > 0" :gutter="40">
                <el-col v-for="(project, index) in projects" :key="index" :xs="24" :sm="12" :lg="12">
                    <div class="project-item-wrapper">
                        <div class="project-item-title">
                            <span class="project-repo">
                                <a :href="repoExternalLink(project)" target="_blank">
                                    <svg-icon icon-class="github" style="color:skyblue"/>
                                </a>
                                <router-link :to="repoInternalLink(project)">
                                    <span style="margin-left:8px">{{project.url.replace('https://github.com/', '')}}</span>
                                </router-link>
                            </span>
                            <span>
                                {{ relativeTime(project.createdAt)}}
                            </span>
                        </div>
                        <div class="project-item-commit">
                            <span class="project-commit">
                                <svg-icon icon-class="Commit"/>
                                <span style="margin-left:8px">{{project.name}}</span>
                            </span>
                            <el-tooltip :content="project.hash" placement="bottom" effect="light">
                                <span>{{project.hash.substr(0, 10)}}...</span>
                            </el-tooltip>
                        </div>
                        <div class="project-item-stats">
                            <div class="project-annotation">
                                <svg-icon icon-class="annotation"/>
                                <span style="margin-left: 8px">{{ project.like ? project.like : 0 }}</span>
                            </div>
                            <div class="project-like">
                                <svg-icon icon-class="like"/>
                                <span style="margin-left: 8px">{{ project.likedCounter ? project.likedCounter : 0 }}</span>
                            </div>
                            <div class="project-handshake">
                                <svg-icon icon-class="handshake"/>
                                <span style="margin-left: 8px">{{ project.joinedCounter ? project.joinedCounter : 0 }}</span>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <div v-else class="no-projects-container">
                <p>No annotation project created by {{ this.userName }} yet</p>
            </div>
        </el-col>
    </el-row>
</template>
<script>
import { getToken, getUsername } from '@/utils/auth'
import { getAccountInfo, getOtherAccountInfo } from '@/api/account'
import { getProjectInfos } from '@/api/project'
import { genAvatar } from '@/utils/avatar'

let moment = require("moment")
export default {
    name: "Homepage",
    data() {
        return {
            userInfo: null,
            projects: null,
        }
    },
    created() {
        if (!this.isSelf) {
            console.log(this.userName)
            getOtherAccountInfo(this.userName).then(response => {
                console.log(response.data)
                this.userInfo = response.data.info
            }).catch(error => {
                console.log(error.response)
                // TODO: error hint
                if (error.response.status === 404) {
                    this.$router.push("/not-found")
                }
            })
        } else {
            getAccountInfo().then(response => {
                console.log("self", response.data)
                this.userInfo = response.data.info
            }).catch(error => {
                console.log(error)
                // TODO: error hint
            })
        }
        getProjectInfos(this.userName).then(response => {
            console.log(response.data)
            this.projects = response.data.projects
        }).catch(error => {
            console.log(error)
            // TODO: error hint
        })
    },
    methods: {
        userAvatar() {
            if (!this.userInfo || !this.userInfo.avatar) {
                return genAvatar(this.userName, 180)
            }
            return this.userInfo.avatar
        },
        repoExternalLink(project) {
            return project.url + "/tree/" + project.name
        },
        repoInternalLink(project) {
            return "/" + this.userName + "/" + project.url.replace('https://', '') + "/tree/" + project.name
        },
        relativeTime(timestamp) {
            return moment.unix(timestamp).fromNow();
        }
    },
    computed: {
        userName() {
            return this.$route.params.user
        },
        isSelf() {
            if (getToken()) {
                if (getUsername() === this.userName) {
                    return true
                }
            }
            return false
        }
    }
}
</script>

<style>
.homepage-container {
    margin-top: 32px;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: center
}
.user-info * {
    margin-bottom: 8px;
}

.project-item-wrapper {
    padding: 12px 16px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    margin-bottom: 12px;
}

.project-item-title {
    margin-top: 12px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
}

.project-repo {
    font-size: 24px;
}

.project-item-commit {
    margin-top: 12px;
    margin-bottom: 12px;
    font-size: 18px;
    display: flex;
    justify-content: space-between;
}

.project-item-stats {
    margin-top: 12px;
    margin-bottom: 12px;
    font-size: 18px;
    display: flex;
    justify-content: space-between;
}

.no-projects-container {
    width: 100%;
    text-align: center;
}
</style>
