<template>
	<div>
		<div v-if="error" class="alert alert-danger">
			{{error}}
		</div>
		<div class="form-group">
			<label >Name</label>
			<input type="text" class="form-control" placeholder="Enter name" v-model="txtName">
		</div>

		<div class="form-group">
			<label >Address</label>
			<input type="text" class="form-control" placeholder="Enter Contract Address (or 0xAbstract_example)" v-model="txtAddress">
		</div>

		<div class="form-group">
			<label >ABI</label>
			<input type="text" class="form-control" placeholder="Enter Contract ABI" v-model="txtAbi">
		</div>

		<div class="row mt-4">
			<div class="col">
				<button v-on:click="cancel()" class="btn btn-primary">
					Cancel
				</button>
			</div>
			<div class="col col-auto">
				<button v-if="editMode" v-on:click="deleteContract()" class="btn btn-danger">
					Delete
				</button>
			</div>
			<div class="col-4">
				<div class="d-grid gap-2">
					<button v-on:click="submitForm()" class="btn btn-primary">
						{{ editMode?"Save":"Add" }}
					</button>
				</div>
			</div>
		</div>

	</div>
</template>

<script>
import { useState } from '@/store';
const LS = require('@/libs/LS');

export default {
	name: "ContractForm",
	props : {
		metaEnabled: {
			type: Boolean
		},
		passedName: { type:String, default: "" },
		passedAddress: { type:String, default: "" },
		passedAbi: { type:String, default: "" },
		editMode: {type:Boolean, default: false},
	},
	setup(){
		return {state: useState()}
	},
	data() {
		return {
			txtName: "",
			txtAddress: "",
			txtAbi: "",
			error: null
		}
	},
	created() {
		this.txtName = this.passedName || "";
		this.txtAddress = this.passedAddress || "";
		this.txtAbi = this.passedAbi || "";
	},

	methods: {
		cancel (){
			this.$router.push('/settings/contracts');
		},
		deleteContract(){
			LS.deleteContract(this.passedAddress);
			this.$emit("formUpdated", null);
			this.$router.push('/settings/contracts');
		},
		submitForm(){

			this.error = null;
			const $contract = {
				name: this.txtName,
				address: this.txtAddress,
				abi: this.txtAbi,
				methods: {}
			};

			if($contract.name.trim().length == 0){
				this.error = "Name required";
				return;
			}

			if($contract.address.toLowerCase().startsWith("0xabstract_")){

			} else if(!$contract.address.match(/^0x[a-fA-F0-9]{40}$/)) {
				this.error = "Invalid address";
				return;
			}

			let $contracts = LS.getContracts();

			let $addressExists = $contracts.find(a =>
				a.address.toLowerCase() == $contract.address.toLowerCase()
				&& $contract.address.toLowerCase() != this.passedAddress.toLowerCase()
			);
			let $nameExists = $contracts.find(a =>
				a.name.toLowerCase() == $contract.name.toLowerCase()
				&& $contract.name.toLowerCase() != this.passedName.toLowerCase()
			);

			if($addressExists){
				this.error = "Contract address already exists";
				return;
			}
			if($nameExists){
				this.error = "Name already exists";
				return;
			}

			if(this.editMode){
				let $existingIndex = LS.getContractIndex(this.passedAddress);
				$contracts[$existingIndex] = $contract;
			}else{
				$contracts.push($contract);
			}

			LS.saveContracts($contracts);
			this.$emit("formUpdated", $contract);
			this.$router.push('/settings/contracts');
		}
	}
}
</script>
