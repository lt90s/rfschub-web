import request from "@/utils/request"

export function searchSymbol(repo, commit, symbol) {
    return request({
        url: "/index/symbol",
        method: "get",
        params: {
            repo: "https://" + repo,
            commit: commit,
            name: symbol
        }
    })
}