<template>
    <el-tag type="warning" class="fixed-status-tip">
        <span v-if="indexing"><i class="el-icon-loading"></i>Project is indexing...</span>
        <span v-else>Project is indexed</span>
    </el-tag>
</template>

<script>
import {projectStatus} from '@/api/project'

export default {
    name: "ProjectStatusTip",
    props: {
        status: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            indexing: false
        }
    },
    created() {
        this.updateIndexStatus()
    },
    methods: {
        updateIndexStatus() {
            projectStatus(this.user, this.repo, this.commit).then(response => {
                console.log(response.data)
                if (response.data.index == 0) {
                    this.indexing = true
                    setTimeout(this.updateIndexStatus, 5000);
                } else {
                    this.indexing = false
                }
            })
        }
    }
}
</script>
<style>
.fixed-status-tip {
    position: fixed;
    bottom: 120px;
    right: 12px;
}
</style>
