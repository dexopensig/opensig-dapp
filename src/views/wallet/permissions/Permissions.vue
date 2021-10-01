<template>
	<div>
		<div v-if="loading">Loading...</div>
		<div v-else>
			<div class="mb-3">
				<div class="row">
					<div class="col" style="line-height:2.4em" >
						{{owners.length}} Owners / {{ requiredSignatures }} Required signatures
					</div>
					<div class="col-auto">
						<div v-if="!pendingTx">
							<button class="btn btn-primary me-2" @click="showAddOwnerModal=true" >Add owner</button>
							<button class="btn btn-primary" @click="showChangeRequiredSignatures=true" >Change required signatures</button>
						</div>
						<div v-else>
							<font-awesome-icon icon="spinner" spin /> Pending transaction
						</div>
					</div>
				</div>
			</div>
			<div v-if="error" class="alert alert-danger" >
				{{ error }}
			</div>
			<table class="table">
				<thead>
					<tr>
						<th colspan="3">Accounts</th>
					</tr>
				</thead>
				<tbody>
					<tr :key="index"
						v-for="(item, index) in owners"
					>
						<td class="cell-narrow">
							<identicon-address :address="item" />
						</td>
						<td>
							<human-address :address="item" :truncate="false"></human-address>
						</td>
						<td class="text-end">
							<button class="btn btn-sm btn-danger" @click="revokeOwner(item)" v-if="!pendingTxRevoke">Revoke</button>
							<div v-else>
								<font-awesome-icon icon="spinner" spin /> Pending revoke
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<vue-final-modal
			v-model="showAddOwnerModal"
			classes="modal-container"
			content-class="modal-content"
		>
			<div class="card">
				<div class="card-header">
					<div class="card-title mt-2 ms-3">New owner address</div>
				</div>
				<div class="card-body">
					<label class="form-label">Owner address</label>
					<input v-model="txtNewOwner" class="form-control" />
				</div>
				<div class="card-footer text-end">
					<button class="btn btn-primary"
						@click="addOwner()"
					>
						Add
					</button>
				</div>
			</div>
		</vue-final-modal>
		<vue-final-modal
			v-model="showChangeRequiredSignatures"
			classes="modal-container"
			content-class="modal-content"
		>
			<div class="card">
				<div class="card-header">
					<div class="card-title mt-2 ms-3">Required signatures</div>
				</div>
				<div class="card-body">
					<label class="form-label">Number of required signatures</label>
					<input v-model="txtChangeRequiredSignatures" class="form-control" />
				</div>
				<div class="card-footer text-end">
					<button class="btn btn-primary"
						@click="changeRequiredSignatures()"
					>
						Change
					</button>
				</div>
			</div>
		</vue-final-modal>
	</div>
</template>
<style scoped>
	::v-deep .modal-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	::v-deep .modal-content {
		border-radius: 8px;
		background-color: rgba(0,0,0,0.3);
		border:0;
		max-width:600px;
		flex-direction: column;
		margin: 0 1rem;
		padding: 1rem;
	}
	.modal__title {
		font-size: 1.5rem;
		font-weight: 700;
	}
</style>
<script>
import { watch, toRefs } from 'vue';
import { useState } from '@/store';
import IdenticonAddress from "@/components/IdenticonAddress";
import { $vfm, VueFinalModal, ModalsContainer } from 'vue-final-modal'
import HumanAddress from "../../../components/HumanAddress";

export default {
	name: "Permissions",
	components: {HumanAddress, IdenticonAddress, VueFinalModal},
	data(){
		return {
			loading: false,
			error: null,
			requiredSignatures : 0,
			pendingTx: false,
			showAddOwnerModal: false,
			showChangeRequiredSignatures: false,
			pendingTxRevoke: false,
			txtNewOwner: "",
			txtChangeRequiredSignatures: "",
			owners: [],
		}
	},
	props : {
		metaEnabled: {
			type: Boolean
		},
	},
	setup(){
		return {state: useState()}
	},
	mounted(){
		if(this.state.metaEnabled){
			this.getOwners();
			this.getRequiredSignatures();
		}
	},

	methods: {

		getOwners: async function() {
			this.owners = await this.$bridge.build(this.state.MSWInstance, 'getSignersAddresses').callAndTranslate();
		},

		getRequiredSignatures : async function(){
			this.requiredSignatures = await this.$bridge.build(this.state.MSWInstance, 'getCurrentRequiredSignatures').callAndTranslate();
			state.selectedMSW.currentRequiredConfirmations = this.requiredSignatures;
		},

		changeRequiredSignatures: async function() {
			this.error = null;
			this.showChangeRequiredSignatures = false;

			let required = this.txtChangeRequiredSignatures*1;

			if(isNaN(required)){
				this.error = "Invalid Number";
				return;
			}

			let $txData;
			try {
				$txData = this.$bridge.build(this.state.MSWInstance, 'setRequiredSignatures', {number: required}).encodeABI();
			}catch(e) {
				this.error = e;
				return;
			}

			let $tx = this.$bridge.build(this.state.MSWInstance, 'submitTransaction', {destination: this.state.MSWInstanceWrite._address, value: 0, data: $txData});

			let $estGas = await $tx.estimateGas( {
				from:this.state.metamaskAddress,
				gasLimit:9000000,
			}).catch(err => {
				if(err){
					this.error = "Error while estimating gas " + err
				}
			});

			this.pendingTx = true;

			$tx.send({
				from:this.state.metamaskAddress,
				gasLimit:$estGas || 500000,
			})
				.catch(err => {
					this.error = err;
					this.pendingTx = false;
				})
				.then(rcpt => {
					this.pendingTx = false;
					if(rcpt){
						this.getRequiredSignatures();
					}
				});
		},

		addOwner: async function() {
			this.error = null;
			this.showAddOwnerModal = false;

			if(!this.txtNewOwner.match(/^0x[a-fA-F0-9]{40}$/)){
				this.error = "Invalid Address";
				return;
			}

			//estimate gas
			let $txData;
			try {
				$txData = this.$bridge.build(this.state.MSWInstance, 'addSigner', {address: this.txtNewOwner}).encodeABI();
			}catch(e) {
				this.error = e;
				return;
			}

			let $tx = this.$bridge.build(this.state.MSWInstance, 'submitTransaction', {destination: this.state.MSWInstanceWrite._address, value: 0, data: $txData});

			let $estGas = await $tx.estimateGas( {
				from:this.state.metamaskAddress,
				gasLimit:9000000,
			}).catch(err => {
				if(err){
					this.error = "Error while estimating gas " + err
				}
			});

			this.pendingTx = true;

			$tx.send({
				from:this.state.metamaskAddress,
				gasLimit:$estGas || 500000,
			})
				.catch(err => {
					this.error = err;
					this.pendingTx = false;
				})
				.then(rcpt => {
					this.pendingTx = false;
					if(rcpt){
						this.getOwners();
					}
				});
		},

		revokeOwner: async function(address) {
			this.error = null;

			let $txData;
			try {
				$txData = this.$bridge.build(this.state.MSWInstance, 'removeSigner', {address: address}).encodeABI();
			}catch(e) {
				this.error = e;
				return;
			}

			let $tx = this.$bridge.build(this.state.MSWInstance, 'submitTransaction', {destination: this.state.MSWInstanceWrite._address, value: 0, data: $txData});

			let $estGas = await $tx.estimateGas( {
				from:this.state.metamaskAddress,
				gasLimit:9000000,
			}).catch(err => {
				if(err){
					this.error = "Error while estimating gas " + err
				}
			});

			this.pendingTxRevoke = true;

			$tx.send({
				from:this.state.metamaskAddress,
				gasLimit:$estGas || 500000,
			})
				.catch(err => {
					this.error = err;
					this.pendingTxRevoke = false;
				})
				.then(rcpt => {
					console.log(rcpt);
					this.pendingTxRevoke = false;
					if(rcpt){
						this.getOwners();
						this.getRequiredSignatures();
					}
				});
		}

	}
}
</script>
