<template>
    <div class="create-project-container">
        <div class="create-project-content-container">
            <span style="font-size:32px; font-weight: 400;">Create a source code project to read</span>
            <span>We currently only support open source project on <strong>github</strong></span>
            <span class="line-breaker"></span>
            <el-form ref="createForm" :model="createForm" :rules="rules" auto-complete="on" @submit.native.prevent label-position="top">
              <el-form-item label="Source code repository url (e.g github.com/rfschub/rfschub)" prop="repo">
                <div style="display:flex">
                    <el-input v-model="createForm.repo" auto-complete="on"></el-input>
                    <el-button v-if="repoStatus === repoStatusMapping.Valid" @click.native.prevent="doCloneRepo" type="primary" style="margin-left:12px">Clone</el-button>
                </div>
                <div v-if="showRepoTips" class="repoTips">
                    <span v-if="repoStatus===repoStatusMapping.Valid">This repository has not been cloned yet, it may take a while to clone</span>
                    <span v-else-if="repoStatus===repoStatusMapping.Cloning">This repository is being cloned, please wait: <br> {{ progress }}</span>
                </div>
              </el-form-item>
              <el-form-item
                v-if="repoStatus===repoStatusMapping.Cloned"
                abel="Choose a branch or tag" prop="commit">
                <el-select
                  :loading="loadingNameCommits"
                  v-model="createForm.hash"
                  filterable
                  placeholder="choose">
                  <el-option-group label="Branch">
                    <el-option
                      v-for="commit in branchesExceptMaster"
                      :key="commit.name"
                      :label="commit.name"
                      :value="commit.hash">
                    </el-option>
                  </el-option-group>
                  <el-option-group label="Tag">
                     <el-option v-for="commit in tags" :key="commit.name" :label="commit.name" :value="commit.hash"></el-option>
                  </el-option-group>
                </el-select>
                <div v-if="branchesExceptMaster.length === 0 && tags.length === 0">
                  <p>No branch other than master or tag found. Please change a source code project to read</p>
                  <!--<p>As branch 'master' is volatile, we highly recommend choosing other branch or tag</p>-->
                </div>
              </el-form-item>
            </el-form>
            <div style="width:80px">
                <el-button
                    v-if="repoStatus !== repoStatusMapping.Cloned"
                    :loading="repoStatus===repoStatusMapping.Cloning"
                    type="primary">
                    {{ repoStatus===repoStatusMapping.Cloning ? "Cloning" : "Verify" }}
                </el-button>
                <el-button v-else type="primary" @click.native.prevent="doCreateProject">
                    Create
                </el-button>
            </div>
        </div>
    </div>
</template>
<script>
import {getRepositoryStatus, cloneRepository, getRepositoryNamedCommits} from '@/api/repository'
import {createProject} from '@/api/project'
import { mapGetters } from 'vuex'

const repoStatusMapping = {
    Valid: 0,
    Cloning: 1,
    Cloned: 2,
}

export default {
    name: "CreateProject",
    data() {
        const validateCommit = (rule, value, callback) => {}
        const validateRepo = (rule, value, callback) => {
            if (value.startsWith("https://")) {
                value = value.replace("https://", "")
            } else if (value.startsWith("http://")) {
                value = value.replace("http://", "")
            }
            if (!value.startsWith("github.com")) {
                callback(new Error("Please enter the correct source code repository url"))
                return
            }

            const parts = value.split('/')
            if (parts.length !== 3) {
                callback(new Error("Please enter the correct source code repository url"))
                return
            }

            getRepositoryStatus("https://" + value).then(response => {
                this.repoStatus = response.data.status
                if (!this.repoStatus) {
                    this.repoStatus = 0
                }
                if (this.repoStatus === 3) {
                    callback(new Error("Source code repository not exist, please check"))
                }
            })
        }
        return {
            createForm: {
                repo: "",
                hash: ""
            },
            rules: {
                repo: [{ required: true, trigger: 'blur', validator: validateRepo }],
                hash: [{ required: true, trigger: "blur", validator: validateCommit }]
            },
            repoStatus: undefined,
            progress: "",
            interval: null,
            repoStatusMapping: repoStatusMapping,
            loadRetryTimes: 0,
            loadingNameCommits: false,
            branches: [],
            tags: [],
        }
    },
    computed: {
        showRepoTips: function() {
            return this.repoStatus === repoStatusMapping.Cloning || this.repoStatus == repoStatusMapping.Valid
        },
        branchesExceptMaster() {
            return this.branches.filter(branch => !(branch.name === "master"))
        },
        ...mapGetters(['username'])
    },
    methods: {
        doCloneRepo: function() {
            cloneRepository(this.normalizedRepo()).then(response => {
                console.log(response)
                this.repoStatus = repoStatusMapping.Cloning;
            }).catch(err => {
                switch (err.response.data.code) {
                    case 100004:
                        // TODO: repository being cloning
                        break;
                    case 100003:
                        // TODO: git service busy
                        break;
                    default:
                        // TODO: error
                }
            })
        },
        updateProgress: function() {
            if (this.repoStatus !== repoStatusMapping.Cloning) {
                return
            }
            getRepositoryStatus(this.normalizedRepo()).then(response => {
                console.log(response.data)
                this.progress = response.data.progress
                if (response.data.status === repoStatusMapping.Cloned) {
                    this.repoStatus = repoStatusMapping.Cloned
                    clearInterval(this.interval)
                }
            })
        },
        normalizedRepo: function() {
            if (!this.createForm.repo.startsWith("https://") || this.createForm.repo.startsWith("http://")) {
                return "https://" + this.createForm.repo
            }
            return this.createForm.repo
        },
        loadNamedCommits: function() {
            this.loadingNameCommits = true
            getRepositoryNamedCommits(this.normalizedRepo()).then(response => {
                console.log(response.data)

                this.loadingNameCommits = false
                this.branches = response.data.commits.filter(commit => commit.branch)
                this.tags = response.data.commits.filter(commit => !commit.branch)
            }).catch(err => {
                if (err.response.data.code === 200001) { // commits in sync
                    console.log(this.loadRetryTimes)
                  if (this.loadRetryTimes < 3) {
                    setTimeout(this.loadNamedCommits, 2000);
                    this.loadRetryTimes += 1
                    return
                  } else {
                      //TODO: load commits timeout
                      return
                  }
                }
                // TODO: handle error
                this.loadingNameCommits = false
            })
        },
        doCreateProject: function() {
            let isBranch = true
            let name = ''
            console.log(this.createForm.hash)
            for (var branch of this.branches) {
                if (branch.hash === this.createForm.hash) {
                    name = branch.name
                    break
                }
            }
            if (name === '') {
                for (var tag of this.tags) {
                    if (tag.hash === this.createForm.hash) {
                        isBranch = false
                        name = tag.name
                    }
                }
            }
            if (name === '') {
                this.createForm.commit = ''
                return
            }
            console.log(this.createForm.repo, this.createForm.hash, name, isBranch)
            createProject(this.normalizedRepo(), this.createForm.hash, name, isBranch).then(response => {
                console.log(response.data)
                var repo = this.normalizedRepo().replace("https://", "")
                const parts = [this.username, repo, 'tree', name]
                this.$router.push('/' + parts.join('/'))
            }).catch(error => {
                console.log(error)
            })
        }
    },
    watch: {
        repoStatus: function(newStatus) {
            if (newStatus === repoStatusMapping.Cloning) {
                this.updateProgress()
                this.interval = setInterval(this.updateProgress, 2000)
            }
            if (newStatus === repoStatusMapping.Cloned || newStatus === repoStatusMapping.Exist) {
                this.loadNamedCommits()
            }
        }
    }
}
</script>

<style>
.create-project-container {
    margin: 40px
}

.create-project-content-container {
    display: flex;
    flex-direction: column;
    width: 600px;
    margin: 0 auto;
}

.line-breaker {
    margin-top: 12px;
    border-bottom: 1px solid #e1e4e8;
    margin-bottom: 24px;
}
</style>