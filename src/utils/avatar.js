import crypto from 'crypto'
import Identicon from 'identicon.js'

export function genAvatar(username, size) {
    if (size === undefined) {
        size = 60
    }
    let hash = crypto.createHash('md5')
    hash.update(username)
    let data = new Identicon(hash.digest('hex'), size).toString()
    return 'data:image/png;base64,' + data
}