<template>
	<div>
		<chain-form
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import ChainForm from '@/views/settings/chains/ChainForm';

export default {
	name: "AddChain",
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
	data(){
		return {}
	},

	methods: {
		formUpdated(){
			this.$emit('chainsUpdated');
		}
	}

}
</script>
