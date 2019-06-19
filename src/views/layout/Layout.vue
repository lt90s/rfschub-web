<template>
    <div class="app-container">
        <top-header></top-header>
        <router-view></router-view>
    </div>
</template>

<script>
import TopHeader from './components/Header.vue'
export default {
    name: "Layout",
    components: { TopHeader },
    data() {
        return {}
    }
}
</script>

<style>
.app-container {
    height: 100%;
    width: 100%;
}
</style>