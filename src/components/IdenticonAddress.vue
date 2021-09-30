<template>
	<div class="identicon-address">
		<div v-if="address === null" class="empty-identicon">

		</div>
		<a v-else
			target="_blank"
			:href="getLink()"
			class="identicon-address"
			v-tooltip="{content:address, trigger:'hover'}"
		>
			<div class="identicon-image" v-html="svg" />
		</a>
	</div>
</template>
<style scoped lang="scss">
	.identicon-address{
		display: flex;
	}
	.empty-identicon{
		background-color: rgba(0,0,0,0.3);
		height:24px;
		width: 24px;
		border-radius: 32px;
		border:2px solid rgba(255,255,255,0.1);
		margin-right:4px;
	}
</style>
<script>
import ChainConfig from "@/libs/ChainConfig"
const jdenticon = require("jdenticon");
const jdenticon_config = {
	lightness: {
		color: [0.38, 0.69],
		grayscale: [0.28, 0.78]
	},
	saturation: {
		color: 0.81,
		grayscale: 0.49
	},
	backColor: "#000"
};
export default {
	props: {
		address: {default: ""},
		truncate: {default: false, type: Boolean},
		size: {default: 20}
	},
	data(){
		return {
			svg: null
		}
	},
	created() {
		this.svg = jdenticon.toSvg(this.address, this.size, jdenticon_config);
	},
	methods: {
		truncateAddr: function (addr) {
			addr = addr + "";
			return addr.substring(0, 6) + "[...]" + addr.substr(-4)
		},
		getLink: function () {
			return ChainConfig.explorer + "/address/" + this.address;
		},
	}
}
</script>
