<template>
	<div>
		<h5>
			Import preferences
		</h5>
		<div
			v-if="success"
			class="alert alert-success"
		>
			<div v-if="importedResult.wallets>0">
				{{ importedResult.wallets }} wallets imported
			</div>
			<div v-if="importedResult.contacts>0">
				{{ importedResult.contacts }} contacts imported to address book
			</div>
			<div v-if="importedResult.tokens>0">
				{{ importedResult.tokens }} tokens imported
			</div>
			<div v-if="importedResult.contracts>0">
				{{ importedResult.contracts }} contracts imported
			</div>
			<div v-if="importedResult.chains>0">
				{{ importedResult.chains }} chains imported
			</div>

			<div v-if="importedResult.total>0">
				Import successful
			</div>
			<div v-else>
				Nothing to be imported
			</div>
		</div>
		<div
			v-if="error"
			class="alert alert-warning"
		>
			{{ error }}
		</div>
		<div
			v-if="!report"
			:class="['alert-dark', 'drop-zone', !($refs.upload && $refs.upload.dropActive)||'drop-active']"
		>
			<vue-upload-component
				ref="upload"
				v-model="files"
				:drop="true"
				@input-filter="inputFilter"
			>
				Click or Drop your file here
			</vue-upload-component>
		</div>
		<div v-else-if="report">
			<div class="row">
				<div class="col-8">
					<div class="alert alert-dark">
						<h5>{{ report.wallets.imported.length }} wallets to import</h5>
						<div
							v-for="(item, index) in report.wallets.imported"
							:key="index"
						>
							<span class="old-or-new">
								<font-awesome-icon
									v-if="item.existing"
									icon="exclamation-circle"
									class="text-warning"
								/>
							</span>
							<span>
								{{ item.item.name }}
							</span>
						</div>
					</div>

					<div class="alert alert-dark">
						<h5>{{ report.contacts.imported.length }} address book contacts to import</h5>
						<div
							v-for="(item, index) in report.contacts.imported"
							:key="index"
						>
							<span class="old-or-new">
								<font-awesome-icon
									v-if="item.existing"
									icon="exclamation-circle"
									class="text-warning"
								/>
							</span>
							<span>
								{{ item.item.name }}
							</span>
						</div>
					</div>

					<div class="alert alert-dark">
						<h5>{{ report.chains.imported.length }} chains to import</h5>
						<div
							v-for="(item, index) in report.chains.imported"
							:key="index"
						>
							<span class="old-or-new">
								<font-awesome-icon
									v-if="item.existing"
									icon="exclamation-circle"
									class="text-warning"
								/>
							</span>
							<span>
								{{ item.item.name }}
							</span>
						</div>
					</div>

					<div class="alert alert-dark">
						<h5>
							{{ report.tokens.imported.length }} tokens to import <span v-if="report.tokens.existing.length">( {{ report.tokens.existing.length }} existing )</span>
						</h5>

						<div
							v-for="(item, index) in report.tokens.imported"
							:key="index"
						>
							<span
								v-if="item.existing"
								class="old-or-new"
							>
								<font-awesome-icon
									icon="exclamation-circle"
									class="text-warning"
								/>
							</span>
							<span>
								{{ item.item.name }}
							</span>
						</div>
					</div>

					<div class="alert alert-dark">
						<div class="alert alert-dark">
							<h5>
								{{ report.contracts.imported.length }} tokens to import <span v-if="report.contracts.existing.length">( {{ report.contracts.existing.length }} existing )</span>
							</h5>

							<div
								v-for="(item, index) in report.contracts.imported"
								:key="index"
							>
								<span
									v-if="item.existing"
									class="old-or-new"
								>
									<font-awesome-icon
										icon="exclamation-circle"
										class="text-warning"
									/>
								</span>
								<span>
									{{ item.item.contract.name }}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="col-4">
					<div
						v-for="(item, index) in checks"
						:key="index"
						class="form-check"
					>
						<input
							:id="index"
							v-model="item.enabled"
							class="form-check-input"
							type="checkbox"
						>
						<label
							class="form-check-label"
							:for="index"
						>
							{{ item.name }}
						</label>
					</div>
					<label>How to process existing entries?</label>
					<select v-model="importStyle">
						<option value="0">
							Skip
						</option>
						<option value="1">
							Override
						</option>
					</select>
					<div class="d-grid mt-3">
						<button
							v-if="!pending"
							class="btn btn-primary"
							@click="importSettings()"
						>
							import
						</button>
						<div
							v-else
							class="text-center"
						>
							<font-awesome-icon
								icon="spinner"
								spin
							/> Importing...
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.old-or-new{
		font-size:0.6em;
		vertical-align: 2px;
		margin-right:4px;
	}
</style>

<script>
const LS = require("@/libs/LS");
const EthConv = require("@/libs/EthConv");
import { useState } from '@/store';
const VueUploadComponent = require('vue-upload-component');

export default {
	name: "Export",
	components:{
		VueUploadComponent
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
			success: false,
			importedResult:{
				wallets: 0,
				tokens: 0,
				contacts: 0,
				contracts: 0,
				total: 0,
			},
			report: null,
			pending: false,
			jsonConfig: null,
			importStyle: 0,
			error : null,
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
				chains: {
					name: "Chains",
					enabled: true,
				},
			},
		}
	},
	methods: {
		/**
		 * Pretreatment
		 * @param  Object|undefined   newFile   Read and write
		 * @param  Object|undefined   oldFile   Read only
		 * @param  Function           prevent   Prevent changing
		 * @return undefined
		 */
		inputFilter: function (newFile, oldFile, prevent) {
			this.success = false;
			this.report = null;

			const reader = new FileReader();
			this.error = null;

			if (newFile && !oldFile) {
				if (!/\.(json)$/i.test(newFile.name)) {
					this.error = ".json files only";
					return prevent();
				}
			}
			this.jsonConfig = null;

			reader.onload = (res) => {
				try{
					this.jsonConfig = JSON.parse(res.target.result);
					if(!this.jsonConfig.settings){
						this.error = "Incorrect settings file";
						return;
					}
					this.analyseConfig();
				}catch(err){
					this.error = "Invalid Json config" + err;
				}
			};
			reader.readAsText(newFile.file);
			return prevent();
		},

		analyseConfig(){

			debugger;
			const $report = {
				wallets: {existing:[], new: [], imported: []},
				contacts: {existing:[], new: [], imported: []},
				contracts: {
					existing:[], new: [], imported: {}
				},
				tokens: {existing:[], new: [], imported: []},
				chains: {existing:[], new: [], imported: []},
				//summaries: {existing:[], new: 0, imported: {}},
				//inputMaps: {existing:[], new: 0, imported: {}},
			};

			$report.wallets.imported = (this.jsonConfig.settings.wallets || []).map(a => { return {existing: false, item:a}});
			$report.contacts.imported = (this.jsonConfig.settings.contacts || []).map(a => { return {existing: false, item:a}});
			$report.tokens.imported = (this.jsonConfig.settings.tokens || []).map(a => { return {existing: false, item:a}});
			$report.contracts.imported = (this.jsonConfig.settings.contracts?Object.values(this.jsonConfig.settings.contracts):[] || []).map(a => { return {existing: false, item:a}});
			$report.chains.imported = (this.jsonConfig.settings.chains?Object.values(this.jsonConfig.settings.chains):[] || []).map(a => { return {existing: false, item:a}});

			let $storageWallets = LS.getWallets();
			$report.wallets.existing = $storageWallets.filter(a => EthConv.addrInArray(a.address, Object.values($report.wallets.imported.map(a => a.item.address)))) || [];
			$report.wallets.new = $storageWallets.filter(a => !EthConv.addrInArray(a.address, Object.values($report.wallets.imported.map(a => a.item.address)))) || [];
			$report.wallets.imported.map(a => {
				a.existing = EthConv.addrInArray(a.item.address, $storageWallets.map(a => a.address));
				return a;
			});

			let $storageContacts = LS.getContacts();
			$report.contacts.existing = $storageContacts.filter(a => EthConv.addrInArray(a.address, Object.values($report.contacts.imported.map(a => a.item.address)))) || [];
			$report.contacts.new = $storageContacts.filter(a => !EthConv.addrInArray(a.address, Object.values($report.contacts.imported.map(a => a.item.address)))) || [];
			$report.contacts.imported.map(a => {
				a.existing = EthConv.addrInArray(a.item.address, $storageContacts.map(a => a.address));
				return a;
			});

			let $storageChains = LS.getChains();
			$report.chains.existing = $storageChains.filter(a => Object.values($report.chains.imported.map(a => a.item.id)).indexOf(a.id) !== -1) || [];
			$report.chains.new = $storageChains.filter(a => Object.values($report.chains.imported.map(a => a.item.id)).indexOf(a.id) === -1) || [];
			$report.chains.imported.map(a => {
				a.existing = $storageChains.map(a => a.id).indexOf(a.item.id) !== -1;
				return a;
			});

			let $storageTokens = LS.getTokens();
			$report.tokens.existing = $storageTokens.filter(a => EthConv.addrInArray(a.address, Object.values($report.tokens.imported.map(a => a.item.address)))) || [];
			$report.tokens.new = $storageTokens.filter(a => !EthConv.addrInArray(a.address, Object.values($report.tokens.imported.map(a => a.item.address)))) || [];
			$report.tokens.imported.map(a => {
				a.existing = EthConv.addrInArray(a.item.address, $storageTokens.map(a => a.address));
				return a;
			});

			let $storageContracts = LS.getContracts();
			let $importedContractAddresses = $report.contracts.imported.map(a => a.item.contract.address);

			$report.contracts.existing = $storageContracts.filter(a => EthConv.addrInArray(a.address, $importedContractAddresses));
			$report.contracts.new = $storageContracts.filter(a => !EthConv.addrInArray(a.address, $importedContractAddresses));

			$report.contracts.existing.map(a => {
				a.input_maps = [];
				a.summaries = [];
				return a;
			});
			$report.contracts.new.map(a => {
				a.input_maps = [];
				a.summaries = [];
				return a;
			});
			$report.contracts.imported.map(a => {
				a.existing = EthConv.addrInArray(a.item.contract.address, $storageContracts.map(a => a.address));
				return a;
			});

			let $totalExistingSummaries = 0;
			let $totalExistingIM = 0;
			for(const $addr of $importedContractAddresses){

				let $existingContractIndex = $report.contracts.existing.findIndex(a => EthConv.addrEqual(a.address, $addr));
				let $importedContractIndex = $report.contracts.imported.findIndex(a => EthConv.addrEqual(a.item.contract.address, $addr));

				if($existingContractIndex !== -1 && $importedContractIndex !== -1){
					let $storageInputMaps = Object.entries(LS.getInputMaps($addr)).map(([key, val]) => {return {signature:key, maps:val}});
					let $storageInputMapsKeys = $storageInputMaps.map(a => a.signature);
					let $importedInputMaps = Object.entries($report.contracts.imported[$importedContractIndex].item.input_maps).map(([key, val]) => {return {signature:key, maps:val}});

					$report.contracts.existing[$existingContractIndex].input_maps = $importedInputMaps.filter(a => EthConv.addrInArray(a.signature, $storageInputMapsKeys));
					$totalExistingIM += $report.contracts.existing[$existingContractIndex].input_maps.length;

					let $summaries = Object.entries(LS.getSummaries($addr)).map(([key, val]) => {return {signature: key, summary: val}});
					let $storageSummariesKeys = $summaries.map(a => a.signature);
					let $importedSummaries = Object.entries($report.contracts.imported[$importedContractIndex].item.summaries).map(([key, val]) => {return {signature: key, summary: val}});
					$report.contracts.existing[$existingContractIndex].summaries = $importedSummaries.filter(a => EthConv.addrInArray(a.signature, $storageSummariesKeys));
					$totalExistingSummaries += $report.contracts.existing[$existingContractIndex].summaries.length;
				}
			}

			console.log($report.wallets.existing.length + " existing wallets");
			console.log($report.contacts.existing.length + " existing contacts");
			console.log($report.contracts.existing.length + " existing contracts");
			console.log($report.tokens.existing.length + " existing tokens");
			console.log($report.chains.existing.length + " existing chains");

			console.log($totalExistingIM + " total existing InputMaps");
			console.log($totalExistingSummaries + " existing summaries");

			console.log($report.wallets.new.length + " new wallets");
			console.log($report.contacts.new.length + " new contacts");
			console.log($report.contracts.new.length + " new contracts");
			console.log($report.tokens.new.length + " new tokens");
			console.log($report.chains.new.length + " new chains");

			this.report = $report;
		},

		importSettings(){

			this.importedResult = {
				wallets: 0,
				tokens: 0,
				contacts: 0,
				contracts: 0,
				chains: 0,
				total: 0,
			};

			//WALLETS
			for(let item of this.report.wallets.imported){
				let $wallets = LS.getWallets();
				let $index = $wallets.findIndex(a => EthConv.addrEqual(a.address, item.item.address));

				const $w = {
					name: item.item.name || null,
					address: item.item.address || null,
					referenceContract: item.item.referenceContract || null,
				};
				if($index == -1) {
					$wallets.push($w);
				}else if(this.importStyle == 1){
					$wallets[$index] = $w;
				}else{
					continue;
				}

				LS.saveWallets($wallets);
				if(item.item.map){
					LS.saveWalletMap($w.address, item.item.map);
				}

				this.importedResult.wallets++;
			}

			//CONTACTS
			for(let item of this.report.contacts.imported){
				let $contacts = LS.getContacts();
				let $index = $contacts.findIndex(a => EthConv.addrEqual(a.address, item.item.address));

				const $c = {
					name: item.item.name || null,
					address: item.item.address || null,
				};

				if($index == -1) {
					$contacts.push($c);
				}else if(this.importStyle == 1){
					$contacts[$index] = $c;
				}else{
					continue;
				}

				LS.saveContacts($contacts);

				this.importedResult.contacts++;
			}

			//CHAINS
			for(let item of this.report.chains.imported){
				let $chains = LS.getChains();
				let $index = $chains.findIndex(a => a.id == item.item.id);

				const $c = {
					name: item.item.name || null,
					id: item.item.id || null,
					nativeSymbol: item.item.nativeSymbol || null,
					explorer: item.item.explorer || null,
				};

				if($index == -1) {
					$chains.push($c);
				}else if(this.importStyle == 1){
					$chains[$index] = $c;
				}else{
					continue;
				}

				LS.saveChains($chains);

				this.importedResult.chains++;
			}

			//TOKENS
			for(let item of this.report.tokens.imported){
				let $tokens = LS.getTokens();
				let $index = $tokens.findIndex(a => EthConv.addrEqual(a.address, item.item.address));

				const $t = {
					name: item.item.name || null,
					address: item.item.address || null,
					decimals: item.item.decimals || 0,
					symbol: item.item.symbol || "???",
					referenceContract: item.item.referenceContract || null,
				};

				if($index == -1) {
					$tokens.push($t);
				}else if(this.importStyle == 1){
					$tokens[$index] = $t;
				}else{
					continue;
				}

				LS.saveTokens($tokens);
				this.importedResult.tokens++;
			}

			//CONTRACTS
			for(let item of this.report.contracts.imported){
				let $contracts = LS.getContracts();

				let $index = $contracts.findIndex(a => EthConv.addrEqual(a.address, item.item.contract.address));

				const $c = {
					name: item.item.contract.name || null,
					address: item.item.contract.address || "0xNULL",
					abi: item.item.contract.abi || "???",
				};

				if($index == -1){
					$contracts.push($c);
					LS.saveSummaries($c.address, item.item.summaries);
					LS.saveInputMaps($c.address, item.item.input_maps);
				}else if(this.importStyle == 1){
					$contracts[$index] = $c;
					LS.saveSummaries($c.address, item.item.summaries);
					LS.saveInputMaps($c.address, item.item.input_maps);
				}else{
					continue;
				}

				LS.saveContracts($contracts);
				this.importedResult.contracts++;
			}

			this.importedResult.total =
				this.importedResult.wallets
				+ this.importedResult.tokens
				+ this.importedResult.contracts
				+ this.importedResult.contacts;
			+ this.importedResult.chains;

			this.success = true;
			this.report = null;
		}
	},
}
</script>
