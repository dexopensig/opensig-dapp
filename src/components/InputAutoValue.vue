<template>
	<div class="input-auto-value">
		<div v-if="type == 'address'">
			<human-address :address="val" />
		</div>
		<div v-else>
			{{ val }}
		</div>
	</div>
</template>
<style lang="scss" scoped>
	.input-auto-value{
		a{
			cursor:pointer;
			opacity:0.3;
			text-decoration: none;
		}

		.toggle{
			text-align: left;
			font-size:12px;
		}

		.bytes-container{
			font-family: monospace;
			line-height: 1em;
			max-height:32px;
			overflow: hidden;

			&.opened{
				max-height: fit-content;
			}
		}

	}
</style>
<script>

export default {
	props: {
		val: {default: ""},
	},
	data(){
		return {
			opened:false,
			chunked:[]
		}
	},
	computed: {
		type(){
			if(this.val.match(/^0x[a-fA-F0-9]{40}$/)){
				return 'address';
			}
			return 'int';
		}
	},
	mounted() {
	},
	methods: {
	}
}
</script>
