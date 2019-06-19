<template>
    <div>
        <div class="current-path-wrapper">
            <current-path
                :user="userName"
                :repo="repo"
                :commit="commit"
                :path="path"
                :tree="false"
                :project-info="projectInfo"
                @liked="projectInfo.likedCounter += 1"/>
        </div>

        <div v-if="showAnnotationTip" class="annotation-tip">
            <el-tag closable>click line number to add annotations</el-tag>
        </div>

        <div
            v-html="code"
            @mouseover="codeMouseOver($event)"
            @mouseout="codeMouseOut($event)"
            @click.prevent="handleCodeTableClick($event)">
        </div>

        <div id="search-box" class="search-box" :style="boxStyle" @mouseover="searchBoxMouseOver($event)" @mouseout.stop="searchBoxMouseOut($event)">
            <div class="search-content" @click="searchSymbol=selectedSymbol;showSearchResult=true">
                <span>Search: <span style="color:#b58900;">{{ selectedSymbol }}</span></span>
            </div>
        </div>

        <div v-show="showAnnotationMarkdown" class="annotation-markdown-wapper">
            <annotation-markdown
            :init-value="initAnnotation"
            :project-id="projectInfo.id"
            :line-number="annotationLineNumber"
            @annotated="handleAnnotatedEvent"
            ></annotation-markdown>
        </div>

        <div v-show="showAnnotationList" class="annotation-list-container" @click.prevent="showAnnotationList=false">
            <div style="text-align:center;margin-bottom: 4px; cursor:pointer">
                <el-tag type="primary">Hide annotations: #{{showAnnotationLineNumber}} </el-tag>
            </div>
            <annotation-list
            :pid="projectInfo.id"
            :line-number="showAnnotationLineNumber"
            :invalidate-line="annotationListLineInvalid"></annotation-list>
        </div>

        <div class="search-symbol-result">
            <symbol-search :show-search-result="showSearchResult"
                :user="userName"
                :repo="repo"
                :commit="projectInfo.hash ? projectInfo.hash : ''"
                :name="this.commit"
                :symbol="searchSymbol"
                @close="showSearchResult=false"
                >
            </symbol-search>
        </div>
    </div>
</template>

<script>
import { getAnnotationLines, getProjectBlob } from '@/api/project'
import SymbolSearch from '@/components/SymbolSearch'
import CurrentPath from "@/components/CurrentPath"
import AnnotationMarkdown from "@/components/AnnotationMarkdown"
import AnnotationList from "@/components/AnnotationList"
import { getToken } from '@/utils/auth'

export default {
    name: "RepositoryBlobView",
    components: { SymbolSearch, CurrentPath, AnnotationMarkdown, AnnotationList },
    data() {
        return {
            code: "no",
            boxStyle: {
                opacity: 0,
                top: 0,
                left: 0,
            },
            projectInfo: {
                "id": ""
            },
            selectedSymbol: '',
            searchSymbol: '',
            retryCount: 0,
            showSearchResult: false,
            showAnnotationMarkdown: false,
            showAnnotationTip: true,
            showAnnotationList: false,
            annotationListLineInvalid: 0,
            showAnnotationLineNumber: 0,
            annotationLineNumber: 0,
            initAnnotation: '',
            annotationLines: null
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
            return this.$route.params.path
        }
    },
    created() {
        this.resetAll()
    },
    methods: {
        resetAll() {
            this.code = ''
            this.retryCount = 0
            this.showSearchResult = false
            this.showAnnotationMarkdown = false
            this.annotationLineNumber = 0
            this.showAnnotationTip = true
            this.showAnnotationList = false
            this.AnnotationListLineInvalid = 0
            this.showAnnotationLineNumber = 0
            this.initAnnotation = ''
            this.annotationLines = null
            this.loadBlob()
            let self = this
            setTimeout(() => {
                self.showAnnotationTip = false
            }, 10000);
        },
        loadBlob() {
            getProjectBlob(this.userName, this.repo, this.commit, this.path).then(response => {
                console.log(response.data)
                this.projectInfo = response.data.info
                // TODO: handle binary content
                this.code = response.data.blob.content
                this.annotatinLines = new Set(response.data.lines)
                this.renderCode()
               if (this.$route.hash !== "") {
                   this.$nextTick(() => {
                       const elem = document.querySelector(this.$route.hash)
                       if (!elem) {
                           return
                       }
                       window.location.hash = this.$route.hash
                       window.scrollTo(0, elem.offsetTop)
                   })
               }
            }).catch(error => {
                console.log(error)
                const data = error.response.data
                if (data.code === 200001) {
                    if (this.retryCount < 3) {
                        setTimeout(this.loadBlob, 1000)
                    } else {
                        // TODO: handle failure
                    }
                    this.retryCount += 1
                } else {
                    // TODO: handle failure
                }
            })
        },
        renderCode() {
            let currentLine = 1
            let code = this.code.split("\n").map(line => {
                if (line.startsWith("</span>")) {
                    line = line.substr(7)
                }
                if (!line.startsWith("<pre") && !line.startsWith("</pre>")) {
                    var tdAnnotation
                    if (this.annotatinLines.has(currentLine)) {
                        tdAnnotation = '<td style="width:40px" class="line-has-annotation" id="annotation-' + currentLine.toString() + '" line="' + currentLine + '"></td>'
                    } else {
                        tdAnnotation = '<td style="width:40px" id="annotation-' + currentLine.toString() + '" line="' + currentLine + '"></td>'
                    }
                    line = '<tr>' + tdAnnotation + '<td class="line-number" id="line-number-' + currentLine.toString() + '">' + currentLine.toString() + '</td>' +
                            '<td>' + line.replace(/\t/g, "    ") + '</span></td></tr>'
                    currentLine += 1
                }
                return line
            })
            code.splice(0, 1)
            code.splice(code.length-1, 1)
            let dummy = '<tr style="visibility:hidden"><td class="line-has-annotation"></td><td>0</td><td>abc</td></tr>'
            this.code = '<table class="code-table"><tbody>' + dummy + code.join("") + '</tbody></table>'
        },
        codeMouseOver(e) {
            if (e.target.tagName === "SPAN") {
                let text = e.target.textContent.trim()
                if (!this.textIsSymbol(text)) {
                    return
                }
                let rect = e.target.getBoundingClientRect()
                let boxRect = document.getElementById("search-box").getBoundingClientRect()
                this.boxStyle.left = rect.left + (rect.width / 2) - (boxRect.width / 2) + "px"
                this.boxStyle.top = rect.top - boxRect.height + "px"
                this.selectedSymbol = text
                this.showSearchBox()
            }
        },
        codeMouseOut(e) {
            this.hideSearchBox()
            e.stopPropagation()
        },
        textIsSymbol(text) {
            const validSymbol = /^[a-zA-Z\$_][a-zA-Z\d_]*$/
            return validSymbol.test(text)
        },
        searchBoxMouseOver(e) {
            this.boxStyle.opacity = 1
        },
        searchBoxMouseOut(e) {
            this.hideSearchBox()
        },
        showSearchBox() {
            this.boxStyle.opacity = 1
        },
        hideSearchBox() {
            this.boxStyle.opacity = 0
        },

        handleCodeTableClick(event) {
            const target = event.target
            if (event.target.className.indexOf("line-number") !== -1) {
                if (!this.projectInfo.canAnnotate) {
                    console.log("can not annotate")
                    // TODO: give hint
                    return
                }
                this.annotationLineNumber = parseInt(event.target.innerHTML)
                this.showAnnotationMarkdown = true
                this.showAnnotationList = false
            } else if (target.className.indexOf("line-has-annotation") !== -1) {
                this.showAnnotationList = true
                const line = target.getAttribute('line')
                this.showAnnotationLineNumber = parseInt(line)
            } else {
                this.showAnnotationMarkdown = false
            }
            this.showSearchResult = false
        },

        handleAnnotatedEvent(lineNumber) {
            this.showAnnotationMarkdown = false
            let element = document.querySelector("#annotation-" + lineNumber)
            console.log(element)
            if (element.className.indexOf("line-has-annotation") === -1) {
                element.className += " line-has-annotation"
            }
            // let it reload this line
            this.showAnnotationLineNumber = 0
        }
    },
    watch: {
        $route(to, from) {
            if (to.path === from.path) {
                return
            }
            this.resetAll()
        }
    }
}
</script>

<style>
.code-table {
    font-family: SFMono-Regular,Consolas,Menlo,DejaVu Sans Mono,monospace;
    font-size: 12px;
    line-height: 16px;
    white-space: pre;
}

.line-number {
    padding-right: 18px;
    /* padding-left: 32px; */
    color: rgba(27,31,35,.3);
    text-align: right;
    cursor: pointer;
}

.line-number:hover {
    color: rgba(27,31,35,1);
}

.annotation-tip {
    float: right;
    margin-right: 24px;
}

.search-box {
    position: fixed;
    border-radius: 4px;
    background-color: #b8c486;
    opacity: .4;
    cursor: pointer;
}

.search-content {
    min-width: 6em;
    text-align: center;
    padding: 4px 4px;
}

.annotation-markdown-wapper {
    position: fixed;
    bottom: 0;
    z-index: 100;
    width: 100%;
    height: 360px;
}

.annotation-list-container {
    position: fixed;
    top: 80px;
    right: 2px;
    width: 640px;
    overflow: scroll;
    z-index: 100;
}

.search-symbol-result {
    position: fixed;
    bottom: 0;
    z-index: 100;
    background-color: #ffffff;
    width: 100%;
    max-height: 360px;
    overflow: scroll;
}

.line-has-annotation::after {
    margin-right: 12px;
    margin-left: 24px;
    display: inline-block;
    width: 18px;
    color: skyblue;
    cursor: pointer;
    content: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTU5NzQ1MjY3NDg2IiBjbGFzcz0iaWNvbiIgc3R5bGU9IiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjM1MjYiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTg0Ni45MzMzMzMgMTI1Ljg2NjY2N0gxODMuNDY2NjY3Yy00Ni45MzMzMzMgMC04NS4zMzMzMzMgMzguNC04NS4zMzMzMzQgODUuMzMzMzMzdjQ5MC42NjY2NjdjMCA0Ni45MzMzMzMgMzguNCA4NS4zMzMzMzMgODUuMzMzMzM0IDg1LjMzMzMzM2gxMDIuNGMxMi44IDAgMjEuMzMzMzMzLTguNTMzMzMzIDIxLjMzMzMzMy0yMS4zMzMzMzNzLTguNTMzMzMzLTIxLjMzMzMzMy0yMS4zMzMzMzMtMjEuMzMzMzM0SDE4My40NjY2NjdjLTIzLjQ2NjY2NyAwLTQyLjY2NjY2Ny0xOS4yLTQyLjY2NjY2Ny00Mi42NjY2NjZ2LTQ5MC42NjY2NjdjMC0yMy40NjY2NjcgMTkuMi00Mi42NjY2NjcgNDIuNjY2NjY3LTQyLjY2NjY2N2g2NjMuNDY2NjY2YzIzLjQ2NjY2NyAwIDQyLjY2NjY2NyAxOS4yIDQyLjY2NjY2NyA0Mi42NjY2Njd2NDkwLjY2NjY2N2MwIDIzLjQ2NjY2Ny0xOS4yIDQyLjY2NjY2Ny00Mi42NjY2NjcgNDIuNjY2NjY2aC0yMDQuOC0yLjEzMzMzMy0yLjEzMzMzM2MtNC4yNjY2NjcgMC0xMC42NjY2NjcgMi4xMzMzMzMtMTQuOTMzMzM0IDQuMjY2NjY3bC0xMDYuNjY2NjY2IDkzLjg2NjY2Ny0xMDYuNjY2NjY3LTkzLjg2NjY2N2MtNC4yNjY2NjctNC4yNjY2NjctOC41MzMzMzMtNi40LTE0LjkzMzMzMy02LjQtNi40IDAtMTAuNjY2NjY3IDIuMTMzMzMzLTE0LjkzMzMzNCA2LjQtOC41MzMzMzMgOC41MzMzMzMtNi40IDIxLjMzMzMzMyAyLjEzMzMzNCAyOS44NjY2NjdsMTE5LjQ2NjY2NiAxMDYuNjY2NjY2YzQuMjY2NjY3IDQuMjY2NjY3IDguNTMzMzMzIDYuNCAxNC45MzMzMzQgNi40IDQuMjY2NjY3IDAgMTAuNjY2NjY3LTIuMTMzMzMzIDE0LjkzMzMzMy02LjRsMTE1LjItMTAyLjRoMjAyLjY2NjY2N2M0Ni45MzMzMzMgMCA4NS4zMzMzMzMtMzguNCA4NS4zMzMzMzMtODUuMzMzMzMzdi00OTAuNjY2NjY3Yy0yLjEzMzMzMy00Mi42NjY2NjctNDAuNTMzMzMzLTgxLjA2NjY2Ny04Ny40NjY2NjctODEuMDY2NjY2eiIgcC1pZD0iMzUyNyIgZmlsbD0iIzEyYmZlZCI+PC9wYXRoPjxwYXRoIGQ9Ik0zMjYuNCA0MzkuNDY2NjY3Yy0xOS4yIDAtMzYuMjY2NjY3IDE3LjA2NjY2Ny0zNi4yNjY2NjcgMzYuMjY2NjY2IDAgMTkuMiAxNy4wNjY2NjcgMzYuMjY2NjY3IDM2LjI2NjY2NyAzNi4yNjY2NjcgMTkuMiAwIDM2LjI2NjY2Ny0xNy4wNjY2NjcgMzYuMjY2NjY3LTM2LjI2NjY2NyAwLTIxLjMzMzMzMy0xNC45MzMzMzMtMzYuMjY2NjY3LTM2LjI2NjY2Ny0zNi4yNjY2NjZ6TTUxNC4xMzMzMzMgNDM5LjQ2NjY2N2MtMTkuMiAwLTM2LjI2NjY2NyAxNy4wNjY2NjctMzYuMjY2NjY2IDM2LjI2NjY2NiAwIDE5LjIgMTcuMDY2NjY3IDM2LjI2NjY2NyAzNi4yNjY2NjYgMzYuMjY2NjY3czM2LjI2NjY2Ny0xNy4wNjY2NjcgMzYuMjY2NjY3LTM2LjI2NjY2N2MwLTIxLjMzMzMzMy0xNy4wNjY2NjctMzYuMjY2NjY3LTM2LjI2NjY2Ny0zNi4yNjY2NjZ6TTcwMS44NjY2NjcgNDM5LjQ2NjY2N2MtMTkuMiAwLTM2LjI2NjY2NyAxNy4wNjY2NjctMzYuMjY2NjY3IDM2LjI2NjY2NiAwIDE5LjIgMTcuMDY2NjY3IDM2LjI2NjY2NyAzNi4yNjY2NjcgMzYuMjY2NjY3IDE5LjIgMCAzNi4yNjY2NjctMTcuMDY2NjY3IDM2LjI2NjY2Ni0zNi4yNjY2NjcgMC0yMS4zMzMzMzMtMTcuMDY2NjY3LTM2LjI2NjY2Ny0zNi4yNjY2NjYtMzYuMjY2NjY2eiIgcC1pZD0iMzUyOCIgZmlsbD0iIzEyYmZlZCI+PC9wYXRoPjwvc3ZnPg==');
}
</style>