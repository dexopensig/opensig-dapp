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
			<input type="text" class="form-control" placeholder="Enter Contract Address" v-model="txtAddress">
		</div>

		<div class="form-group">
			<label >ABI</label>
			<input type="text" class="form-control" placeholder="Enter Contract ABI" v-model="txtAbi">
		</div>

		<div class="form-group">
			<label >Reference Abi</label>
			<input type="text" class="form-control" placeholder="Contract Address" v-model="txtReferenceContract">
		</div>

		<div class="form-group">
			<label >Chain Explorer</label>
			<input type="text" class="form-control" placeholder="Enter chain explorer" v-model="txtExplorer">
		</div>

		<div class="row mt-4">
			<div class="col">
				<button v-on:click="cancel()" class="btn btn-primary">
					Cancel
				</button>
			</div>
			<div class="col col-auto">
				<button v-if="editMode" v-on:click="deleteWallet()" class="btn btn-danger">
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
	name: "WalletForm",
	props : {
		metaEnabled: {
			type: Boolean
		},
		passedName: { type:String, default: "" },
		passedAddress: { type:String, default: "" },
		passedAbi: { type:String, default: "" },
		passedExplorer: { type:String, default: "" },
		passedReferenceContract: { type:String, default: "" },
		editMode: {type:Boolean, default: false},
	},
	setup(props){
		return {state: useState()}
	},
	data() {
		return {
			txtName: "",
			txtAddress: "",
			txtAbi: "",
			txtExplorer: "",
			txtReferenceContract: "",
			error: null
		}
	},
	created() {
		this.txtName = this.passedName || "";
		this.txtAddress = this.passedAddress || "";
		this.txtAbi = this.passedAbi || "";
		this.txtExplorer = this.passedExplorer || "";
		this.txtReferenceContract = this.passedReferenceContract || "";
	},

	methods: {
		cancel (){
			this.$router.push('/settings/wallets');
		},
		deleteWallet(){
			LS.deleteWallet(this.passedAddress);
			this.$emit("formUpdated", null);
			this.$router.push('/settings/wallets');
		},
		submitForm(){

			this.error = null;
			const $wallet = {
				name: this.txtName,
				address: this.txtAddress,
				abi: this.txtAbi,
				explorer: this.txtExplorer,
				referenceContract: this.txtReferenceContract
			};

			if($wallet.name.trim().length == 0){
				this.error = "Name required";
				return;
			}

			if(!$wallet.address.match(/^0x[a-fA-F0-9]{40}$/)){
				this.error = "Invalid address";
				return;
			}

			let $wallets = LS.getWallets();

			let $referenceContract = LS.getContract($wallet.referenceContract);
			if(!$referenceContract){
				this.error = "Invalid contract reference address. Please add the multisig abstract contract first";
				return;
			}

			let $addressExists = $wallets.find(a =>
				a.address.toLowerCase() == $wallet.address.toLowerCase()
				&& $wallet.address.toLowerCase() != this.passedAddress.toLowerCase()
			);
			let $nameExists = $wallets.find(a =>
				a.name.toLowerCase() == $wallet.name.toLowerCase()
				&& $wallet.name.toLowerCase() != this.passedName.toLowerCase()
			);

			if($addressExists){
				this.error = "Address already exists";
				return;
			}
			if($nameExists){
				this.error = "Name already exists";
				return;
			}

			if(this.editMode){
				let $existingIndex = LS.getWalletIndex(this.passedAddress);
				$wallets[$existingIndex] = $wallet;
			}else{
				$wallets.push($wallet);
			}

			LS.saveWallets($wallets);
			this.$emit("formUpdated", $wallet);
			this.$router.push('/settings/wallets');
		}
	}
}
</script>
