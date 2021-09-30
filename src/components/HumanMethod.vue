<template>
	<div v-if="signature.length" class="transaction-function" v-tooltip="{content :( displayName || signature )}">
		{{ truncate(displayName) || signature }}
	</div>
	<div v-else class="no-transaction-function">
		no method
	</div>
</template>

<script>

const LS = require('@/libs/LS');
const AbiStuff = require('@/libs/AbiStuff');

export default {
	props: {
		signature: {default: ""},
		address: {default: ""},
	},
	created() {
		//this.address = this.address + "";
	},
	computed: {
		displayName() {
			let {abi: $abi} = LS.getResource(this.address);
			if(!$abi){
				return null;
			}

			let $methods = AbiStuff.getMethods($abi);

			let $method = $methods.find(a => a.signature && a.signature.toLowerCase() == "0x" + this.signature.toLowerCase());

			if($method){
				return $method.name;
			}

			return null;
		}
	},
	methods: {
		truncate(name, len=16){
			if(name && name.length > len){
				return name.substr(0, len-3) + "..."
			}
			return name;
		}
	}
}
</script>
