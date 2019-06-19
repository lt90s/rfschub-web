import request from "@/utils/request"

export function getRepositoryStatus(repo) {
    return request({
        url: "/repository/status",
        method: "get",
        params: {
            repo
        }
    })
}

export function cloneRepository(repo) {
    return request({
        url: "/repository/clone",
        method: "post",
        data: {
            repo
        }
    })
}

export function getRepositoryNamedCommits(repo) {
    return request({
        url: "/repository/namedCommits",
        method: "get",
        params: {
            repo
        }
    })
}