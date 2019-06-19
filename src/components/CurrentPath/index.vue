<template>
    <div class="current-path-container">
        <el-breadcrumb separator-class="el-icon-arrow-right" style="font-size: 24px">
            <el-breadcrumb-item><svg-icon icon-class="github" class="repo-logo"></svg-icon>{{ repo }}</el-breadcrumb-item>
            <el-breadcrumb-item :to="rootLink">{{ commit }}</el-breadcrumb-item>
                <el-breadcrumb-item v-for="(part, index) in pathParts" :key="index" :to="{path: part.link}">
                    <span>{{ part.name  }}</span>
                </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="like-join-wrapper">
            <el-button-group>
                <el-button @click="likeButtonClicked">
                    <svg-icon icon-class="like"></svg-icon>
                    <span style="margin-left:5px">Like</span>
                </el-button>
                <el-button>
                    <span>{{ projectInfo.likedCounter ? projectInfo.likedCounter : 0 }}</span>
                </el-button>
            </el-button-group>

            <el-button-group>
                <el-button>
                    <svg-icon icon-class="handshake"></svg-icon>
                    <span style="margin-left:5px">Join</span>
                </el-button>
                <el-button>
                    <span>{{ projectInfo.joinedCounter ? projectInfo.joinedCounter : 0 }}</span>
                </el-button>
            </el-button-group>
        </div>
    </div>
</template>

<script>
import { likeProject } from '@/api/project'
import { getToken } from '@/utils/auth'

export default {
    name: "ProjectStatusTip",
    props: {
        user: {
            type: String,
            required: true
        },
        repo: {
            type: String,
            required: true
        },
        commit: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        tree: {
            type: Boolean,
            required: true
        },
        projectInfo: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            liked: false,
            joined: false
        }
    },
    created() {
    },
    computed: {
        rootLink: function() {
            return '/' + this.user + '/' + this.repo + '/tree/' + this.commit
        },
        pathParts: function() {
            if (this.path === ".") {
                return []
            }
            var parts = this.path.split("/")
            console.log("parts", parts)
        
            var rv = []
            var current = '/'
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === "") {
                    continue
                }
                var link
                if (!this.tree && i === parts.length - 1) {
                    link = '/' + this.user + '/' + this.repo + '/blob/' + this.commit
                }  else {
                    link = '/' + this.user + '/' + this.repo + '/tree/' + this.commit
                }
                link += current + parts[i]
                current += parts[i] + '/'
                rv.push({
                    name: parts[i],
                    link: link
                })
            }
            return rv
        }
    },
    methods: {
        likeButtonClicked() {
            if (!getToken()) {
                return
            }
            if (this.projectInfo.liked || this.liked) {
                return
            }
            likeProject(this.user, this.repo, this.commit).then(response => {
                console.log(response)
                this.liked = true
                this.$emit("liked")
            }).catch(error => {
                console.log(error)
                // TODO: error hint
            })
        }
    }
}
</script>

<style>
.current-path-container {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
}
.repo-logo {
    margin-right: 12px;
    color: skyblue;
}

.like-join-wrapper {
    margin-right: 32px;
    display: flex;
}


.el-button-group button {
    padding: 4px 8px;
}

.el-button > span {
    font-size: 18px;
}

.like-join-wrapper div {
    margin-left: 18px;
}

</style>