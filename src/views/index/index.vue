<template>
  <div>
    <h1 align="center"> Read the Fxxking Source Code </h1>
    <div>
       <sign-up-form :style-object="styleObject"></sign-up-form>
    </div>
  </div>
</template>

<script>
import SignUpForm from '@/components/SignUpForm'
export default {
  name: "index",
  components: { SignUpForm },
  data() {
      return {
          styleObject: {
                "margin": "80px auto",
                "width": "420px"
            }
      }
  }
}
</script>
