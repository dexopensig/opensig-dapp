<template>
	<div>
		{{ formatted }}
	</div>
</template>
<script>

export default {
	props: {
		timestamp: {default: 0},
		format: {default: "YYYY-MM-DD HH:mm:ss"},
	},
	computed: {
		formatted(){
			return this.$dayjs(this.timestamp).format(this.format)
		}
	},
}
</script>
