<template>
	<div>
		<wallet-form
			:passedName="wallet.name"
			:passedAddress="wallet.address"
			:passedAbi="wallet.abi"
			:passedExplorer="wallet.explorer"
			:passedReferenceContract="wallet.referenceContract"
			:editMode="true"
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import WalletForm from '@/views/settings/wallets/WalletForm';
const LS = require('@/libs/LS');

export default {
	name: "EditWallet",
	components: {
		WalletForm
	},
	props : {
		metaEnabled: {
			type: Boolean
		},
		//passedName: { type:String, default:null },
		//passedAddress: { type:String, default:null },
		//passedAbi: { type:String, default:null },
	},
	setup(){
		return {state: useState()}
	},
	data() {
		return {
			wallet:null,
		}
	},
	created(){
		this.address = this.$route.params.address;

		this.wallet = LS.getWallet(this.address);
	},

	methods: {
		formUpdated(){
			this.$emit('walletsUpdated');
		}
	}

}
</script>
