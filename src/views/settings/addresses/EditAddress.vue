<template>
	<div>
		<address-form
			:passedName="contact.name"
			:passedAddress="contact.address"
			:editMode="true"
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import AddressForm from '@/views/settings/addresses/AddressForm';
const LS = require('@/libs/LS');

export default {
	name: "EditContract",
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
	data() {
		return {
			contact:null,
		}
	},
	created(){
		this.address = this.$route.params.address;

		this.contact = LS.getContact(this.address);
	},

	methods: {
		formUpdated(){
			this.$emit('contactsUpdated');
		}
	}

}
</script>
