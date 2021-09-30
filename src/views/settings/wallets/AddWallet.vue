<template>
	<div>
		<wallet-form
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import WalletForm from '@/views/settings/wallets/WalletForm';

export default {
	name: "AddWallet",
	components: {
		WalletForm
	},
	props : {
		metaEnabled: {
			type: Boolean
		},
	},
	setup(){
		return {state: useState()}
	},

	methods: {
		formUpdated(){
			this.$emit('walletsUpdated');
		}
	}

}
</script>
