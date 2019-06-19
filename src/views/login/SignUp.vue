<template>
<sign-up-form :style-object="styleObject"></sign-up-form>
</template>
<script>
import SignUpForm from '@/components/SignUpForm'

export default {
    name: "SignUp",
    components: { SignUpForm },
    data() {
        return {
            styleObject: {
                "margin": "160px auto",
                "width": "360px"
            }

        }
    }
}
</script>
