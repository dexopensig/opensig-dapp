<template>
	<span class="truncated_address">
		<a target="_blank" :href="getLink()" >
			{{ displayName || (truncate?$EthConv.truncateAddr(address):address) }}
		</a>
	</span>
</template>

<script>

import ChainConfig from "@/libs/ChainConfig"
const LS = require('@/libs/LS');

export default {
	props: {
		address: {default: ""},
		truncate: {default: true},
	},
	created() {
		//this.address = this.address + "";
	},
	computed: {
		displayName() {
			let $contract = LS.getContract(this.address);
			if($contract){ return $contract.name; }

			let $wallet = LS.getWallet(this.address);
			if($wallet) { return $wallet.name; }

			let $token = LS.getToken(this.address);
			if($token) { return $token.name; }

			let $contact = LS.getContact(this.address);
			if($contact) { return $contact.name; }

			return null;
		}
	},
	methods: {
		getLink: function () {
			return ChainConfig.explorer + "/address/" + this.address;
		},
	}
}
</script>
