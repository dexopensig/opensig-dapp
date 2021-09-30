<template>
	<div>
		<token-form
			:passedName="token.name"
			:passedAddress="token.address"
			:passedSymbol="token.symbol"
			:passedDecimals="token.decimals"
			:passedReferenceContract="token.referenceContract"
			:editMode="true"
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import TokenForm from '@/views/settings/tokens/TokenForm';
const LS = require('@/libs/LS');

export default {
	name: "EditToken",
	components: {
		TokenForm
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
			token:null,
		}
	},
	created(){
		this.address = this.$route.params.address;

		this.token = LS.getToken(this.address);
	},

	methods: {
		formUpdated(){
			this.$emit('tokensUpdated');
		}
	}

}
</script>
