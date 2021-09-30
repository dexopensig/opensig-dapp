<template>
	<div>
		<h5>
			Export your preferences
		</h5>
		<div v-if="error" class="alert alert-warning">{{ error }}</div>
		<div class="form-check"
			:key="index"
			v-for="(item, index) in checks">
			<input class="form-check-input" type="checkbox" v-model="item.enabled" :id="index">
			<label class="form-check-label" :for="index">
				{{ item.name }}
			</label>
		</div>
		<div class="d-grid mt-3">
			<button v-if="!pending" class="btn btn-primary" @click="exportSettings()" >
				Export
			</button>
			<div v-else class="text-center">
				<font-awesome-icon icon="spinner" spin /> Exporting...
			</div>
		</div>
	</div>
</template>

<script>
const LS = require("@/libs/LS");
import { useState } from '@/store';

export default {
	name: "Export",
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
			pending: false,
			checks : {
				wallets: {
					name: "Wallets",
					enabled: true,
				},
				contracts: {
					name: "Contracts",
					enabled: true,
				},
				tokens: {
					name: "Tokens",
					enabled: true,
				},
				addressBook: {
					name: "Address book",
					enabled: true,
				},
			},
			error : null
		}
	},
	computed : {
		tokens (){
			return this.tokensList;
		}
	},
	mounted(){

	},
	methods: {
		exportSettings(){

			this.error = null;

			let $json = {
				date: new Date().toISOString(),
				settings : {

				}
			};

			if(!Object.values(this.checks).find(a => a.enabled)){
				this.error = "Select something to export";
				return;
			}

			this.pending = true;
			if(this.checks.wallets.enabled){
				const $wallets = LS.getWallets();

				for(let $i in $wallets){
					$wallets[$i].map = LS.getWalletMap($wallets[$i].address);
				}

				$json.settings['wallets'] = $wallets;
			}



			if(this.checks.contracts.enabled){
				let $storageContracts = LS.getContracts();
				let $contracts = {};
				for(let $c of $storageContracts){
					let $summaries = LS.getSummaries($c.address);
					let $inputMaps = LS.getInputMaps($c.address);

					$contracts[$c.address] = {
						'contract': $c,
						'summaries': $summaries,
						'input_maps': $inputMaps
					};
				}

				$json.settings['contracts'] = $contracts;
			}

			if(this.checks.tokens.enabled){
				$json.settings['tokens'] = LS.getTokens();
			}

			const data = JSON.stringify($json, "\n", "\t");
			const blob = new Blob([data], {type: 'text/plain'});
			const e = document.createEvent('MouseEvents'),
				a = document.createElement('a');
			a.download = "OpenSig." + $json.date + ".json";
			a.href = window.URL.createObjectURL(blob);
			a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
			e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(e);

			this.pending = false;
		}
	},
}
</script>
