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
			<input type="text" class="form-control" placeholder="Enter Address" v-model="txtAddress">
		</div>

		<div class="row mt-4">
			<div class="col">
				<button v-on:click="cancel()" class="btn btn-primary">
					Cancel
				</button>
			</div>
			<div class="col col-auto">
				<button v-if="editMode" v-on:click="deleteAddress()" class="btn btn-danger">
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
	name: "AddressForm",
	props : {
		metaEnabled: {
			type: Boolean
		},
		passedName: { type:String, default: "" },
		passedAddress: { type:String, default: "" },
		editMode: {type:Boolean, default: false},
	},
	setup(){
		return {state: useState()}
	},
	data() {
		return {
			txtName: "",
			txtAddress: "",
			error: null
		}
	},
	created() {
		this.txtName = this.passedName || "";
		this.txtAddress = this.passedAddress || "";
	},

	methods: {
		cancel (){
			this.$router.push('/settings/addresses');
		},
		deleteAddress(){
			LS.deleteContact(this.passedAddress);
			this.$emit("formUpdated", null);
			this.$router.push('/settings/addresses');
		},
		submitForm(){

			this.error = null;
			const $contact = {
				name: this.txtName,
				address: this.txtAddress
			};

			if($contact.name.trim().length == 0){
				this.error = "Name required";
				return;
			}


			if(!$contact.address.match(/^0x[a-fA-F0-9]{40}$/)) {
				this.error = "Invalid address";
				return;
			}

			let $contacts = LS.getContacts();

			let $addressExists = $contacts.find(a =>
				a.address.toLowerCase() == $contact.address.toLowerCase()
				&& $contact.address.toLowerCase() != this.passedAddress.toLowerCase()
			);
			let $nameExists = $contacts.find(a =>
				a.name.toLowerCase() == $contact.name.toLowerCase()
				&& $contact.name.toLowerCase() != this.passedName.toLowerCase()
			);

			if($addressExists){
				this.error = "Address already exists in address book";
				return;
			}
			if($nameExists){
				this.error = "Name already present in address book";
				return;
			}

			if(this.editMode){
				let $existingIndex = LS.getContactIndex(this.passedAddress);
				$contacts[$existingIndex] = $contact;
			}else{
				$contacts.push($contact);
			}

			LS.saveContacts($contacts);
			this.$emit("formUpdated", $contact);
			this.$router.push('/settings/addresses');
		}
	}
}
</script>
