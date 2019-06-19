<template>
    <div class="file-container">
        <div class="current-path-wrapper">
            <current-path
            :user="userName"
            :repo="repo"
            :commit="commit"
            :path="path"
            :tree="true"
            :project-info="projectInfo"
            @liked="projectInfo.likedCounter += 1"/>
        </div>
        <div class="tree-view-wrapper">
            <el-table :loading="loading" :data="entries" :show-header="false">
                <el-table-column>
                    <template slot-scope="scope">
                        <svg-icon v-if="scope.row.dir" icon-class="directory"/>
                        <svg-icon v-else icon-class="file"/>
                        <router-link :to="entryLink(scope.row)" style="margin-left:4px">
                            <span>{{ scope.row.file }}</span>
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope">
                        <span v-if="scope.row.annotation === undefined">No annotation</span>
                        <span v-else>
                            <span >{{ fileName(scope.row.annotation.file)}}#{{ scope.row.annotation.lineNumber }}: </span>
                            <router-link :to="buildAnnotationLink(scope.row)">
                                <span>{{ scope.row.annotation.brief }} </span>
                            </router-link>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column align="center" width="240">
                    <template slot-scope="scope">
                        <span v-if="scope.row.annotation !== undefined">
                            {{ relativeTime(scope.row.annotation.timestamp) }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-tag v-if="projectInfo.indexed" type="warning" class="fixed-status-tip">
          <span>Project is indexed</span>
        </el-tag>
    </div>
</template>

<script>
import { getProjectDirectory } from "@/api/project"
import { getToken } from '@/utils/auth'

import CurrentPath from "@/components/CurrentPath"

let moment = require("moment");

export default {
    name: "RepositoryTreeView",
    components: { CurrentPath },
    data() {
        return {
            typeDirectory: 0,
            entries: null,
            loading: false,
            retryCount: 0,
            latestAnnotation: null,
            projectInfo: {}
        }
    },
    created() {
        console.log(moment)
        this.loadData()
    },
    computed: {
        userName() { 
            return this.$route.params.user
        },
        repo() {
            return this.$route.params.repo
        },
        commit() {
            return this.$route.params.commit
        },
        path() {
            let p = this.$route.params.path
            if (p === undefined) {
                return "."
            } else {
                return p
            }
        }
    },
    methods: {
        loadData: function() {
            this.loading = true
            getProjectDirectory(this.userName, this.repo, this.commit, this.path).then(response => {
                console.log(response.data)
                this.projectInfo = response.data.info
                this.entries = response.data.directory
                let path = this.path
                if (path === '.') {
                    path = ''
                }
                this.entries = this.entries.map(entry => {
                    entry.file = entry.file.replace(path, "").replace("/", "")
                    return entry
                })
                this.entries.sort((a, b) => {
                    if ((a.dir && b.dir) || (!a.dir && !b.dir))  {
                        if (a.path < b.path) {
                            return-1
                        }
                        return 1
                    }

                    if (a.dir) {
                        return -1
                    }

                    if (b.dir) {
                        return 1
                    }
                })
                console.log(response.data.annotations)
                const latest = response.data.annotations
                if (!latest) {
                    return
                }
                for (let i = 0; i < latest.length; i++) {
                    for (let j = 0; j < this.entries.length; j++) {
                        console.log(latest[i].sub, this.entries[j].file)
                        if (latest[i].sub === this.entries[j].file) {
                            this.$set(this.entries[j], 'annotation', latest[i])
                            break
                        }
                    }
                }
            }).catch(error => {
                console.log(error)
                this.loading = false

                if (error.response.data.code === 200001) {
                    if (this.retryCount < 3) {
                        setTimeout(this.loadData, 1000)
                    } else {
                        // TODO: handle failure
                    }
                    this.retryCount += 1
                } else {
                    // TODO: handle failure
                }
            })
        },
        entryLink(entry) {
            let fileType = "blob"
            if (entry.dir) {
                fileType = "tree"
            }
            let path = this.path
            if (path === ".") {
                path = entry.file
            } else {
                path = path + '/' + entry.file
            }
            return "/" + [this.userName, this.repo, fileType, this.commit].join("/") + '/' +  path
        },
        buildAnnotationLink(row) {
            const parts = [this.userName, this.repo, 'blob', this.commit]
            return '/' + parts.join('/') + '/' +  row.annotation.file + "#line-number-" + row.annotation.lineNumber
        },
        fileName(path) {
            const parts = path.split('/')
            return parts[parts.length - 1]
        },
        relativeTime(timestamp) {
            return moment.unix(timestamp).fromNow();
        },
    },
    watch: {
        $route(to, from) {
            console.log(to)
            this.loadData()
        }
    }
}
</script>

<style>

.current-path-wrapper {
    margin: 24px 32px;
}

.tree-view-wrapper {
    margin: 16px 24px;
    /* margin-left: 16px;
    margin-right: 16px; */
}

.fixed-status-tip {
  position: fixed;
  bottom: 12px;
  right: 12px;
}

</style>