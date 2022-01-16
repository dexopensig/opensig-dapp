<template>
	<div>
		<chain-form
			:passedName="chain.name"
			:passedId="chain.id"
			:passedExplorer="chain.explorer"
			:passedNativeSymbol="chain.nativeSymbol"
			:editMode="true"
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import ChainForm from '@/views/settings/chains/ChainForm';
const LS = require('@/libs/LS');

export default {
	name: "EditChain",
	components: {
		ChainForm
	},
	props : {
		metaEnabled: {
			type: Boolean
		},
	},
	setup(){
		return {state: useState()}
	},
	data() {
		return {
			chain:null,
		}
	},
	created(){
		this.id = this.$route.params.id;

		this.chain = LS.getChain(this.id);
	},

	methods: {
		formUpdated(){
			this.$emit('chainsUpdated');
		}
	}

}
</script>
