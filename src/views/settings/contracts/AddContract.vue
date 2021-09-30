<template>
	<div>
		<contract-form
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import ContractForm from '@/views/settings/contracts/ContractForm';

export default {
	name: "AddContract",
	components: {
		ContractForm
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
			this.$emit('contractsUpdated');
		}
	}

}
</script>
