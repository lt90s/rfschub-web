<template>
    <div v-if="showSearchResult" class="search-result-container">
        <div class="close-icon-wrapper" @click="closeSearchResult">
            <i class="el-icon-close"></i>
        </div>
        <div v-for="(result, index) in results" class="result-file-container" :key="index">
            <div class="result-file-title">
                <svg-icon icon-class="file"></svg-icon>
                <router-link :to="buildHref(result.file, result.lineNumber)">
                    <span> {{ result.file }} </span>
                </router-link>
            </div>
            <router-link :to="buildHref(result.file, result.lineNumber)">
              <div class="result-code" v-html="generateSnippet(result)">
              </div>
            </router-link>
        </div>
    </div>
</template>

<script>
import { searchSymbol } from "@/api/project"
export default {
    name: "SymbolSearch",
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
        name: {
            type: String,
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        showSearchResult: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            results: null
        }
    },
    methods: {
        search() {
            if (this.repo === "" || this.commit === "" || this.symbol === "") {
                return
            }
            searchSymbol(this.repo, this.commit, this.symbol).then(response => {
                console.log(response.data.symbols)
                this.results = response.data.symbols
            }).catch(err => {
                console.log(err)
                // TODO: deal with error
            })
        },
        buildHref(path, lineNumber) {
            const parts = [this.user, this.repo, 'blob', this.name, path]
            return '/' + parts.join('/') + '#line-number-' + lineNumber
        },
        generateSnippet(result) {
            let lines = []
            if (result.lineBefore) {
                lines = result.lineBefore.split("\n")
            } else {
                lines = [""]
            }
            let startLine = result.lineNumber - lines.length
            lines.push(result.line.replace(this.symbol, '<span style="color: blue; font-size:18px">' + this.symbol + '</span>'))
            if (lines.length < 3) {
                lines.push(result.lineAfter)
            }
            
            let html = '<table class="code-table"><tbody>'
            for (var line of lines) {
                html += '<tr><td><span class="line-number">' + startLine + '</span></td><td><span>' + line + '</span></td></td>'
                startLine += 1
            }
            html += '</tbody></table>'
            return html
        },
        closeSearchResult() {
            this.$emit("close")
        }
    },
    watch: {
        symbol: function(newSymbol) {
            this.search()
        }
    }
}
</script>

<style>
.search-result-container {
    border: 1px solid #cccccc;
    background-color: #e4e9f1;
    width: 100%;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    /* margin-bottom: 1em; */
}

.close-icon-wrapper {
    float: right;
    margin: 4px 8px;
    cursor: pointer;
}

.result-file-container {
}

.result-file-title {
    display: flex;
    align-items: center;
    margin-left: 6px;
    cursor: pointer;
    margin-left: 24px;
    margin-top: 6px;
    margin-bottom: 6px;
}
.result-file-title a {
    margin-left: 12px;
}

.result-code {
    background-color: #ffffff;
    white-space: pre;
    cursor: pointer
}

.result-code:hover {
    background-color: #718cb4;
}
</style>