<template>
	<div>
		<div class="alert alert-danger" v-if="error">
			Couldn't seem to interact with MultisigWallet {{ state.selectedMSW.address }} ({{ error }})<br />
			Please check if the contract is properly deployed, you are connected to the correct network and if the contract mapping is properly set
		</div>
		<div class="row">
			<div class="col-3">
				<div class="card card-ov">
					<div class="card-header">
						<div class="card-title">{{ state.selectedMSW.symbol }} balance</div>
					</div>
					<div class="card-body text-center">
						<span>
							{{ formatAmount(nativeBalance) }}
						</span>
					</div>
				</div>
			</div>

			<div class="col-3">
				<div class="card card-ov">
					<div class="card-header">
						<div class="card-title">Total transactions</div>
					</div>
					<div class="card-body text-center">
						<span>
							{{ totalTransactions }}
						</span>
					</div>
				</div>
			</div>

			<div class="col-3">
				<div class="card card-ov">
					<div class="card-header">
						<div class="card-title">Total signers</div>
					</div>
					<div class="card-body text-center">
						<span>
							{{ ownersCount }}
						</span>
					</div>
				</div>
			</div>

			<div class="col-3">
				<div class="card card-ov">
					<div class="card-header">
						<div class="card-title">Required signatures</div>
					</div>
					<div class="card-body text-center">
						<span>
							{{ requiredSignatures }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {useState} from '@/store'
import BigNumber from 'bignumber.js'

export default {
	name: "Overview",

	setup(){
		return {state: useState()}
	},
	data(){
		return {
			error: null,
			nativeBalance:0,
			totalTransactions:0,
			totalSigners:0,
			requiredSignatures:0,
			ownersCount: 0
		}
	},

	mounted() {
		this.tick();
	},

	methods: {
		formatAmount(amount){
			return new BigNumber(amount).div(10**18).toFixed(2);
		},
		tick(){
			if(this.state.metaEnabled && this.state.MSWInstance){
				this.fetchData();
			}
			setTimeout(this.tick, 3000);
		},
		fetchData: async function(){
			this.error = null;
			this.nativeBalance = await this.state.web3.eth.getBalance(this.state.selectedMSW.address).catch(err => {
				console.error("could not get native balance");
			});
			this.nativeBalance = await this.state.web3.eth.getBalance(this.state.selectedMSW.address).catch(err => {
				console.error("could not get native balance");
			});

			this.totalTransactions = await this.$bridge.build(this.state.MSWInstance, 'getTransactionsCount').call().catch(err => {
				this.error = "getTransactionsCount";
			});
			this.requiredSignatures = await this.$bridge.build(this.state.MSWInstance, 'getCurrentRequiredSignatures').callAndTranslate().catch(err => {
				this.error = "getCurrentRequiredSignatures";
			});
			this.ownersCount = await this.$bridge.build(this.state.MSWInstance, 'getSignersCount').callAndTranslate().catch(err => {
				this.error = "getSignersCount";
			});

		}
	}
}
</script>
