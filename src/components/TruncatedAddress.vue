<template>
	<span class="truncated_address">
		<a target="_blank" :href="getLink()" >
			{{truncateAddr(address)}}
		</a>
	</span>
</template>

<script>

import ChainConfig from "@/libs/ChainConfig"

export default {
	props: {
		address: {default: ""},
		truncate: {default: false, type: Boolean},
	},
	created() {
		//this.address = this.address + "";
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
