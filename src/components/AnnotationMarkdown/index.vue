<template>
    <div class="md-editor-wrapper">
        <mavon-editor
        :initValue="initValue"
        :placeholder="placeholder"
        v-model="annotation"
        :toolbarsFlag="true"
        :toolbars="toolbars"
        class="md-editor"
        />
        <div class="submit-annotation-wrapper">
            <el-button
            :loading="submitting" :disabled="annotation.length == 0 || annotation.length > 4096"
            type="primary"
            @click.native="doAddAnnotation">Submit</el-button>
        </div>
    </div>
</template>

<script>
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

import { addAnnotation } from '@/api/project'

export default {
    name: "AnnotationMarkdown",
    components: { mavonEditor },
    props: {
        projectId: {
            type: String,
            required: true,
        },
        initValue: {
            type: String,
            required: true
        },
        lineNumber: {
            type: Number,
            required: true,
        }
    },
    data() {
        return {
            annotation: "",
            drafts: {},
            submitting: false,
            toolbars: {
                bold: true, // 粗体
                italic: true, // 斜体
                header: true, // 标题
                underline: true, // 下划线
                strikethrough: true, // 中划线
                mark: true, // 标记
                superscript: true, // 上角标
                subscript: true, // 下角标
                quote: true, // 引用
                ol: true, // 有序列表
                ul: true, // 无序列表
                link: true, // 链接
                // imagelink: true, // 图片链接
                code: true, // code
                table: true, // 表格
                // fullscreen: true, // 全屏编辑
                // readmodel: true, // 沉浸式阅读
                htmlcode: true, // 展示html源码
                help: true, // 帮助
                /* 1.3.5 */
                undo: true, // 上一步
                redo: true, // 下一步
                trash: true, // 清空
                // save: true, // 保存（触发events中的save事件）
                /* 1.4.2 */
                // navigation: true, // 导航目录
                /* 2.1.8 */
                alignleft: true, // 左对齐
                aligncenter: true, // 居中
                alignright: true, // 右对齐
                /* 2.2.1 */
                subfield: true, // 单双栏模式
                preview: true, // 预览
            }
        }
    },
    created() {
        this.value = this.initValue
    },
    computed: {
        placeholder() {
            return "#" + this.lineNumber + ": annotation here"
        },
        repo() {
            return this.$route.params.repo
        },
        path() {
            return "/" + this.$route.params.path
        }
    },
    watch: {
        lineNumber(newNumber, oldNumber) {
            this.saveAndLoadDraft(newNumber, oldNumber)
            console.log("line number change from " + oldNumber + " to " + newNumber, " init value:" + this.initValue)
            if (this.initValue.length > 0) {
                this.annotation = this.initValue
            }
        },
        initValue(newValue) {
            this.value = this.newValue
        },
        // v-show. needs to watch route to reset
        $route(to, from) {
            this.drafts = {}
        }
    },
    methods: {
        saveAndLoadDraft(newNumber, oldNumber) {
            if (this.annotation.length > 0) {
                this.drafts[oldNumber] = this.annotation
            }
            if (newNumber === 0) {
                return
            }
            if (this.drafts[newNumber]) {
                this.annotation = this.drafts[newNumber]
            } else {
                this.annotation = ""
            }
        },
        doAddAnnotation() {
            if (this.annotation.length == 0 || this.annotation.length > 4096) {
                // TODO: error hint
                return
            }
            this.submitting = true
            //projectId, repo, path, lineNumber, annotation
            addAnnotation(this.projectId, this.repo, this.path, this.lineNumber, this.annotation).then(response => {
                console.log(response.data)
                this.submitting = false
                this.annotation = ''
                this.$root.eventBus.$emit("invalidateAnnotationLineEvent", this.lineNumber)
                this.$emit("annotated", this.lineNumber)
            }).catch(error => {
                this.submitting = false
                console.log(error)
                // TODO: error hint
            })
        }
    }
}
</script>

<style>
.md-editor-wrapper {
    position: relative;
    border: 1px solid #cccccc;
}

.md-editor {
    height: 360px;
    overflow: scroll;
    position: relative;
}

.submit-annotation-wrapper {
    position: absolute;
    bottom: 2px;
    left: 4px;
    z-index: 9999;
}
</style>
