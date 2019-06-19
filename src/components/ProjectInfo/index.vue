<template>
    <div class="project-info-wrapper">
        <div class="project-info-left-side">
            <svg-icon icon-class="github"></svg-icon>
            <a :href="repoExternalLink()" target="_blank">
                <el-tag>{{ repo }}</el-tag>
            </a>
            <router-link :to="homepage">
                <el-tag>{{ userName }}</el-tag>
            </router-link>
            <el-tooltip v-if="projectInfo.hash" content="abcd" placement="bottom" effect="light">
                <el-tag>{{ commit }}</el-tag>
            </el-tooltip>
            <el-tag v-else>{{ commit }}</el-tag>
        </div>
        <div class="project-info-right-side">
        </div>
    </div>    
</template>
<script>
export default {
    name: "ProjectInfo",
    props: {
        projectInfo: {
            type: Object,
            required: true
        }
    },
    data() {
        return {}
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
        homepage() {
            return '/' + this.userName
        }
    },
    methods: {
        repoExternalLink() {
            return 'https://' + this.repo + '/tree/' + this.commit
        }
    }
}
</script>
<style>
.project-info-wrapper {
    margin-top: 12px;
    margin-left: 32px;
    padding-bottom: 4px;
    border-bottom: 1px solid #cccccc;
}
.project-info-left-side * {
    margin-right: 8px;
}
</style>
