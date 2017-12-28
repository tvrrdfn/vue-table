<template lang="pug">
    #app 
        v-table
        v-table
</template>

<script>
    import vTable from './components/table.vue';

    export default {
        name: 'app',

        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },

        components: {
            vTable
        }
    }
</script>

<style lang="sass">

</style>
