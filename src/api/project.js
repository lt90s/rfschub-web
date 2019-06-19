import request from "@/utils/request"

export function createProject(repo, hash, name, branch) {
    return request({
        url: "/project",
        method: "post",
        data: {
            url: repo,
            hash: hash,
            name: name,
            branch: branch,
        }
    })
}

export function projectStatus(user, repo, commit) {
    return request({
        url: "/project/status",
        method: "get",
        params: {
            user: user,
            repo: repo,
            commit: commit
        }
    })
}

export function getProjectDirectory(user, repo, name, path) {
    return request({
        url: "/project/directory",
        method: "get",
        params: {
            user,
            repo,
            name,
            path
        }
    })
}

export function getProjectBlob(user, repo, name, file) {
    return request({
        url: "/project/blob",
        method: "get",
        params: {
            user,
            repo,
            name,
            file
        }
    })
}

export function getProjectInfo(owner, repo, name) {
    return request({
        url: "/project",
        method: "get",
        params: {
            user: owner,
            repo: repo,
            name: name
        }
    })
}


export function getProjectInfos(user) {
    return request({
        url: "/project/list",
        method: "get",
        params: {
            user
        }
    })
}

export function addAnnotation(projectId, repo, path, lineNumber, annotation) {
    return request({
        url: "/project/annotation",
        method: "post",
        data: {
            pid: projectId,
            url: repo,
            file: path,
            lineNumber,
            annotation
        }
    })
}

export function getAnnotationLines(pid, file) {
    return request({
        url: "/project/annotation/lines",
        method: "get",
        params: {
            pid,
            file
        }
    })
}

export function getLatestAnnotation(pid, parent) {
    return request({
        url: "/project/annotation/latest",
        method: "get",
        params: {
            pid,
            parent
        }
    })
}

export function getAnnotations(pid, file, lineNumber) {
    return request({
        url: "/project/annotations",
        method: "get",
        params: {
            pid,
            file,
            line: lineNumber
        }
    })
}

export function likeProject(owner, repo, commit) {
    return request({
        url: "/project/like",
        method: "post",
        data: {
            owner,
            repo,
            commit
        }
    })
}

export function searchSymbol(repo, hash, symbol) {
    return request({
        url: "/project/symbol",
        method: "get",
        params: {
            repo: "https://" + repo,
            hash: hash,
            name: symbol
        }
    })
}