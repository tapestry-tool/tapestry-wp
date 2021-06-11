<template>
    <b-modal
        id="help-modal"
        data-qa="help-modal"
        :visible="show"
        size="lg"
        title="Getting Started"
        @hidden="$emit('close')"
        body-class="p-0"
        hide-footer="true"

    >
        <b-container fluid class="px-0">
            <iframe height="400px" width="100%" src="https://tapestry-tool.com/guide/"></iframe>
        </b-container>
    </b-modal>

</template>

<script>
export default {
    name: "help-modal",
    props: {
        show: {
            type: Boolean,
            required: true,
        }
    },
    methods: {
        closeModal() {
            this.$emit("close")
    },
    }
}
</script>

<style>
iframe {
    border: none;
}
</style>