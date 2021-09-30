<template>
	<div>
		<address-form
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import AddressForm from '@/views/settings/addresses/AddressForm';

export default {
	name: "AddAddress",
	components: {
		AddressForm
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
			this.$emit('contactsUpdated');
		}
	}

}
</script>
