<template>
	<span class="truncated_address">
		<a target="_blank" :href="getLink()" >
			{{ displayName || (truncate?$EthConv.truncateAddr(address, privateSeed):address) }}
		</a>
	</span>
</template>

<script>

const LS = require('@/libs/LS');
import { useState } from '@/store';

export default {
	props: {
		address: {default: ""},
		truncate: {default: true},
		privateSeed: {default: 0},
	},
	setup() {
		return {state: useState()}
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
			return this.state.currentChain.explorer + "/address/" + this.address;
		},
	}
}
</script>
