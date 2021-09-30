<template>
	<div>
		{{ content }}
	</div>
</template>
<style scoped>
	div{
		white-space: pre;
	}
</style>
<script>

export default {
	props: {
		content: {default: null},
	},
	computed: {
	},
}
</script>
