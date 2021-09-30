<template>
	<div>
		<token-form
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import TokenForm from '@/views/settings/tokens/TokenForm';

export default {
	name: "AddToken",
	components: {
		TokenForm
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
			this.$emit('tokensUpdated');
		}
	}

}
</script>
