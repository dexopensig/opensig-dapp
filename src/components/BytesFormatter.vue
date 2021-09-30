<template>
	<div class="bytes-formatter" >
		<div :class="['bytes-container', !this.opened||'opened']">
			<div v-for="(item, index) in getChunked"
				:key="index"
			>{{ item }}</div>
		</div>
		<div v-if="getChunked.length > 2 && !full">
			<a v-if="this.opened" v-on:click="toggleOpen()" class="toggle">less</a>
			<a v-else v-on:click="toggleOpen()" class="toggle">more</a>
		</div>
	</div>
</template>
<style lang="scss" scoped>
	.bytes-formatter{

		white-space: pre-wrap;
		word-break: break-all;

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
		bytes: {default: ""},
		size:{default:32},
		full: {default : false}
	},
	data(){
		return {
			opened:false,
			chunked:[]
		}
	},
	computed: {
		getChunked (){
			if(this.size == -1){
				return [this.bytes];
			}
			return this.chunks(this.bytes, this.size);
		}
	},
	mounted() {
		if(this.full){
			this.opened = true;
		}
		this.chunked = this.chunks(this.bytes, this.size);
	},
	methods: {
		toggleOpen() {
			this.opened = !this.opened;
		},
		chunks(bytes, size){
			const regex = new RegExp(`.{1,${size}}`, 'g');
			const splitted = bytes.match(regex);
			return splitted;
		}
	}
}
</script>
