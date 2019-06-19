<template>
    <div class="annotation-list-wrapper" @click.stop="">
        <div v-for="annotation in currentAnnotations" :key="annotation.id" class="annotation-list-item-wrapper">
            <div class="user-info-wrapper">
                <img width="40px" :src="getAvatar(annotation.avatar, annotation.name)">
            </div>
            <div class="annotation-wrapper">
                <div class="annotation-title">
                    <router-link :to="'/' + annotation.name">
                        <span>{{ annotation.name }}</span>
                    </router-link>
                    <span style="margin-left:12px"> {{ relativeTime(annotation.createdAt) }}</span>
                </div>
                <div v-html="annotation.annotation"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAnnotations } from '@/api/project'
import { genAvatar } from '@/utils/avatar'

var md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
            return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) {}
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
})
var hljs = require('highlight.js')
var moment = require("moment")

export default {
    name: "AnnotationList",
    props: {
        pid: {
            type: String,
            required: true
        },
        lineNumber: {
            type: Number,
            required: true
        },
        invalidateLine: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            annotations: {},
            accountInfos: {},
            currentAnnotations: null,
            annotation: md.render("```c\nint main()\n```")
        }
    },
    created() {
        this.$root.eventBus.$on('invalidateAnnotationLineEvent', lineNumber => {
            this.annotations[lineNumber] = undefined
        })
    },
    methods: {
        loadAnnotations(lineNumber) {
            if (lineNumber <= 0) {
                return
            }
            if (this.annotations[lineNumber] !== undefined) {
                this.currentAnnotations = this.annotations[lineNumber]
                return
            }
            getAnnotations(this.pid, this.path, lineNumber).then(response => {
                console.log(response.data)
                this.annotations[lineNumber] = response.data.records
                for (var i = 0; i < this.annotations[lineNumber].length; i++) {
                    this.annotations[lineNumber][i].annotation = md.render(this.annotations[lineNumber][i].annotation)
                }
                this.currentAnnotations = this.annotations[lineNumber]
            }).catch(error => {
                console.log(error)
                // TODO: error hint
            })
        },
        getAvatar(avatar, name) {
            if (!avatar) {
                 return genAvatar(name)
            }
            return avatar
        },
        relativeTime(timestamp) {
            console.log(timestamp)
            return moment.unix(timestamp).fromNow();
        }
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
            return "/" + this.$route.params.path
        }
    },
    watch: {
        lineNumber(newLine) {
            console.log("newLine ", newLine)
            if (newLine <= 0) {
                return
            }
            this.loadAnnotations(newLine)
        },
        invalidateLine(invalidLine) {
            if (invalidLine <=0) {
                return
            }
            console.log("invalidate line ", invalidLine)
            this.annotations[invalidLine] = undefined
        }
    }
}
</script>

<style>

.annotation-list-wrapper {
    background-color: aliceblue;
    max-height: 640px;
    overflow: scroll;
}
.annotation-list-item-wrapper {
    padding: 4px 4px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
}

.user-info-wrapper {
    width: 40px;
}

.annotation-wrapper {
    width: 100%;
    margin-left: 12px;
}

.annotation-title {
    border-bottom: 1px solid #cccccc;
}
</style>
