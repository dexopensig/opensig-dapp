<template>
	<div>
		<contract-form
			:passedName="contract.name"
			:passedAddress="contract.address"
			:passedAbi="contract.abi"
			:editMode="true"
			@formUpdated="formUpdated"
		/>
	</div>
</template>

<script>
import { useState } from '@/store';
import ContractForm from '@/views/settings/contracts/ContractForm';
const LS = require('@/libs/LS');

export default {
	name: "EditContract",
	components: {
		ContractForm
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
			contract:null,
		}
	},
	created(){
		this.address = this.$route.params.address;

		this.contract = LS.getContract(this.address);
	},

	methods: {
		formUpdated(){
			this.$emit('contractsUpdated');
		}
	}

}
</script>
