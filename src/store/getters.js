const getters = {
    username: state => state.user.username,
    email: state => state.user.email,
    avatar: state => state.user.avatar,
    token: state => state.user.jwtToken,
    registerTime: state => state.user.registerTime
}

export default getters