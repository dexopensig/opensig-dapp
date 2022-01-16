<template>
	<div>
		<div v-if="error" class="alert alert-danger">
			{{error}}
		</div>

		<div class="form-group">
			<label >Id</label>
			<input type="text" class="form-control" placeholder="Enter Address" v-model="txtId">
		</div>

		<div class="form-group">
			<label >Name</label>
			<input type="text" class="form-control" placeholder="Enter name" v-model="txtName">
		</div>

		<div class="form-group">
			<label >Explorer</label>
			<input type="text" class="form-control" placeholder="Enter Explorer" v-model="txtExplorer">
		</div>

		<div class="form-group">
			<label >Native Symbol</label>
			<input type="text" class="form-control" placeholder="Enter Explorer" v-model="txtNativeSymbol">
		</div>

		<div class="row mt-4">
			<div class="col">
				<button v-on:click="cancel()" class="btn btn-primary">
					Cancel
				</button>
			</div>
			<div class="col col-auto">
				<button v-if="editMode" v-on:click="deleteChain()" class="btn btn-danger">
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
	name: "ChainForm",
	props : {
		metaEnabled: {
			type: Boolean
		},
		passedName: { type:String, default: "" },
		passedId: { type:String, default: "" },
		passedExplorer: { type:String, default: "" },
		passedNativeSymbol: { type:String, default: "" },
		editMode: {type:Boolean, default: false},
	},
	setup(){
		return {state: useState()}
	},
	data() {
		return {
			txtId: "",
			txtName: "",
			txtExplorer: "",
			txtNativeSymbol: "",
			error: null
		}
	},
	created() {
		this.txtName = this.passedName || "";
		this.txtId = this.passedId || "";
		this.txtExplorer = this.passedExplorer || "";
		this.txtNativeSymbol = this.passedNativeSymbol || "";
	},

	methods: {
		cancel (){
			this.$router.push('/settings/chains');
		},
		deleteChain(){
			LS.deleteChain(this.passedId);
			this.$emit("formUpdated", null);
			this.$router.push('/settings/chains');
		},
		submitForm(){

			this.error = null;
			const $chain = {
				id: this.txtId,
				name: this.txtName,
				explorer: this.txtExplorer,
				nativeSymbol: this.txtNativeSymbol
			};

			if($chain.name.trim().length == 0){
				this.error = "Name required";
				return;
			}

			let $chains = LS.getChains();

			let $idExists = $chains.find(a =>
				a.id.toLowerCase() == $chain.id.toLowerCase()
				&& $chain.id.toLowerCase() != this.passedId.toLowerCase()
			);
			let $nameExists = $chains.find(a =>
				a.name.toLowerCase() == $chain.name.toLowerCase()
				&& $chain.name.toLowerCase() != this.passedName.toLowerCase()
			);

			if($idExists){
				this.error = "Id already exists in chains";
				return;
			}
			if($nameExists){
				this.error = "Name already present in chains";
				return;
			}

			if(this.editMode){
				let $existingIndex = LS.getChainIndex(this.passedId);
				$chains[$existingIndex] = $chain;
			}else{
				$chains.push($chain);
			}

			LS.saveChains($chains);
			this.$emit("formUpdated", $chain);
			this.$router.push('/settings/chains');
		}
	}
}
</script>
