<template>
	<div class="card">
		<h5 class="card-header">
			<div class="header-content">
				<div class="me-2">
					<a href="#"><font-awesome-icon icon="arrow-left" v-on:click="goBack()"/></a>
				</div>
				<div>
					Transaction details
				</div>
			</div>
		</h5>
		<div class="card-body">
			<div v-if="error" class="alert alert-danger">
				{{ error }}
			</div>
			<div v-if="loading">Loading...</div>
			<div v-if="transaction">
				<div class="alert alert-light ">
					<div class="row">
						<div class="col-auto">
							<font-awesome-icon icon="angle-double-right" />
						</div>
						<div class="col">
							<method-summary
								:displayDecimals="4"
								:address="transaction.destination"
								:value="transaction.value"
								:hexData="transaction.data" />
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-4">
						<div class="table-responsive">
							<table class="table">
								<thead>
									<tr>
										<th colspan="2">Transaction</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Id</td>
										<td>{{ transaction.id }}</td>
									</tr>
									<tr>
										<td>Status</td>
										<td>
											<span v-if="transaction.executed" class="text-success">
												<font-awesome-icon icon="check" /> Executed
											</span>
											<span v-else-if="transaction.cancelled" class="text-warning">
												<font-awesome-icon icon="ban" /> Cancelled
											</span>
											<span v-else-if="transaction.lastFailure>0" class="text-danger">
												Failed at block {{ transaction.lastFailure }}
											</span>
											<span v-else >
												Pending confirmations
											</span>
										</td>
									</tr>
									<tr>
										<td>Confirmations</td>
										<td>
											<div class="transaction-validators-container">
												<span class="transaction-validators-counter">
													{{ transaction.signers.length}}
													/
													{{transaction.signersWhenExecuted && transaction.signersWhenExecuted.length>0?transaction.signersWhenExecuted.length:(state.currentRequiredConfirmations) }}
												</span>
												<div class="transaction-validators">
													<identicon-address
														:key="c"
														v-for="(c) in transaction.signers"
														:address="c"
													/>
												</div>
											</div>
										</td>
									</tr>
									<tr>
										<td>Submission time</td>
										<td>{{ $dayjs(transaction.submissionTime * 1000).format('YYYY-MM-DD HH:mm') }}</td>
									</tr>
									<tr>
										<td>Execution time</td>
										<td>
											<span v-if="transaction.executionTime>0">
												{{ $dayjs(transaction.executionTime * 1000).format('YYYY-MM-DD HH:mm') }}
											</span>
											<span v-else>
												Not executed
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div class="col-8">
						<div class="table-responsive">
							<table class="table">
								<thead>
									<tr>
										<th colspan="3">Actions</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Destination</td>
										<td>
											<human-address :address="transaction.destination"></human-address> <span class="not-important"> {{ transaction.destination }}</span>
										</td>
									</tr>

									<tr>
										<td>Method</td>
										<td>
											{{ getHumanMethod||'No method specified' }}
											<span class="not-important" v-if="getHumanMethod">(0x{{ $AbiStuff.extractFunction(transaction.data) }})</span>
										</td>
									</tr>
									<tr>
										<td>Transferred value</td>
										<td>
											<span v-if="transaction.value<=0" class="not-important">0</span>
											<span v-else>{{ formatNativeValue(transaction.value) }} <span class="not-important">({{ transaction.value }})</span></span>
										</td>
									</tr>
									<tr>
										<td>Human Inputs</td>
										<td colspan="2">
											<mapped-inputs-formatter
												:address="transaction.destination"
												:hexData="transaction.data" />
										</td>
									</tr>
									<tr>
										<td>Decoded Inputs</td>
										<td colspan="2">
											<inputs-formatter
												:full="true"
												:abiStr="destinationAbiStr"
												:hexData="transaction.data" />
										</td>
									</tr>
									<tr>
										<td>Payload</td>
										<td>
											<bytes-formatter
												:full="true"
												:size="-1"
												:bytes="$AbiStuff.extractBytes(transaction.data)" />
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			<div class="p-3">
				<div v-if="pendingTx" class="alert alert-info text-center">
					<font-awesome-icon icon="spinner" spin /> Pending transaction
				</div>
				<div v-else>
					<div v-if="allowedToSign">
						<div class="row justify-content-md-center" v-if="!transaction.executed && !transaction.cancelled">
							<div class="col-6">
								<div class="d-grid gap-2" v-if="this.signed">
									<button class="btn btn-warning" v-on:click="unSign()">Unsign</button>
								</div>
								<div class="d-grid gap-2" v-else>
									<button class="btn btn-primary" v-on:click="sign()">Sign</button>
								</div>
							</div>
						</div>
					</div>
					<div v-else-if="!loading" class="alert alert-warning">
						You are not allowed to sign
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style scoped>
	.header-content{
		padding:16px;
		display: flex;
	}
</style>
<script>
import { useState } from '@/store';
import IdenticonAddress from "@/components/IdenticonAddress";
import HumanAddress from "@/components/HumanAddress";
import LS from "@/libs/LS";
import AbiStuff from "@/libs/AbiStuff";
const BigNumber = require("bignumber.js");
import {REVERT_CODES} from "@/constants/constants"

export default {
	name: "TransactionDetails",
	components: {
		IdenticonAddress,
		HumanAddress,
	},
	data(){
		return {
			loading : true,
			transactionId: 0,
			walletAddress: "",
			transaction: null,
			destinationAbiStr: null,
			owners: [],
			signed: false,
			pendingTx: false,
			error : null,
		}
	},
	props : {
		metaMaskAddress: {default:null}
	},
	watch: {
		metaMaskAddress(newVal, oldVal){
			if(newVal != oldVal){
				this.fetchData()
			}
		}
	},
	setup(){
		return {state: useState()}
	},
	created(){
		this.transactionId = this.$route.params.transactionId;
		this.walletAddress = this.$route.params.walletAddress;
	},

	computed: {
		allowedToSign(){
			if(this.metaMaskAddress){
				return this.owners.find(a => a.toLowerCase() == this.state.metamaskAddress.toLowerCase())
			}
			return false;
		},
		getHumanMethod() {

			if(!this.transaction){
				return null;
			}

			let {abi: $abi} = LS.getResource(this.transaction.destination);

			if(!$abi){
				return null;
			}

			let $methods = AbiStuff.getMethods($abi);

			let $method = $methods.find(a => a.signature && a.signature.toLowerCase() == "0x" + AbiStuff.extractFunction(this.transaction.data).toLowerCase());

			if($method){
				return $method.name;
			}

			return null;
		}
	},

	mounted(){
		if(this.metaMaskAddress){
			this.fetchData();
		}
	},

	methods: {

		fetchData: async function () {
			let $contract = LS.getWallet(this.walletAddress);
			if(!$contract){
				this.error = "Cant find wallet contract";
				this.loading = false;
				return;
			}

			let {abi: $walletAbi} = LS.getResource(this.walletAddress, 'wallet');

			let $contractInstance;
			try{
				$contractInstance = new this.state.web3.eth.Contract(JSON.parse($walletAbi), this.walletAddress);
			}catch(e){
				this.error = e;
				return;
			}

			const $tx = await this.$bridge.build(this.state.MSWInstance, 'getTransactionDetails', {transactionId: this.transactionId}).callAndTranslate();

			let $txObj = {
				id: this.transactionId,
				executionTime: $tx.executionTime || null,
				submissionTime: $tx.submissionTime || null,
				executed: $tx.executed || null,
				cancelled: $tx.cancelled || null,
				lastFailure: $tx.lastFailure || null,
				destination: $tx.destination || null,
				data: $tx.data || null,
				value: $tx.value || null,
				signersWhenExecuted: $tx.signersWhenExecuted || [],
				confirmationsCount: 0,
				confirmationsRequired: 0,
			};

			$txObj.signers = $txObj.signersWhenExecuted;

			const $currentRequiredConf = await this.$bridge.build(this.state.MSWInstance, 'getCurrentRequiredSignatures').callAndTranslate();

			if(!$tx.executed){
				$txObj.signers = await this.$bridge.build(this.state.MSWInstance, 'getSignersAddressesOfTx', {transactionId: this.transactionId}).callAndTranslate();
				let $signersSlots = [];
				for(let $i = 0; $i < $currentRequiredConf; $i++) {
					let $addr = $txObj.signers[$i] || null;
					if($addr){
						$signersSlots[$i] = $addr;
						$txObj.confirmationsCount++;
					}
				}
				$txObj.signers = $signersSlots;
				$txObj.confirmationsRequired = $currentRequiredConf;
			}else{
				$txObj.confirmationsCount = $txObj.signers.length;
				$txObj.confirmationsRequired = $txObj.signers.length;
			}

			//signers

			this.signed = Boolean($txObj.signers.find(a => a.toLowerCase() == this.state.metamaskAddress.toLowerCase()));

			this.transaction = $txObj;

			let {abi: $abi} = LS.getResource(this.transaction.destination);

			if($abi){
				this.destinationAbiStr = $abi;
			}

			this.owners = await this.$bridge.build(this.state.MSWInstance, 'getSignersAddresses').callAndTranslate();

			this.loading = false;
		},
		goBack(){
			this.$router.push('/wallet/transactions');
		},
		sign: async function() {

			this.error = null;

			//estimate gas
			let $tx = this.$bridge.build(this.state.MSWInstance, 'signTransaction', {transactionId: this.transactionId});

			let $estGas = await $tx.estimateGas( {
				from:this.state.metamaskAddress,
				gasLimit:9000000,
			}, (err, gasAmt) => {
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
					this.signed = false;
				})
				.then(rcpt => {
					this.pendingTx = false;
					if(rcpt){
						this.signed = true;
						this.fetchData();

						if(rcpt.events && rcpt.events.ExecutionFailure){
							if(this.$EthConv.addrEqual(this.transaction.destination, this.state.selectedMSW.address)){
								let $key = Object.keys(REVERT_CODES).find(key => REVERT_CODES[key] == rcpt.events.ExecutionFailure.returnValues.revertMsg);
								this.error = $key || rcpt.events.ExecutionFailure.returnValues.revertMsg;
							}else{
								this.error = rcpt.events.ExecutionFailure.returnValues.revertMsg;
							}
						}

					}
				});

		},
		unSign: async function() {

			this.error = null;

			//estimate gas
			let $tx = this.$bridge.build(this.state.MSWInstance, 'unsignTransaction', {transactionId: this.transactionId});

			let $estGas = await $tx.estimateGas( {
				from:this.state.metamaskAddress,
				gasLimit:9000000,
			}, (err, gasAmt) => {
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
						this.signed = false;
						this.fetchData();
					}
				});

		},
		formatNativeValue(val){
			return new BigNumber(val).div(10**18).toFixed(4);
		}
	},

}
</script>
