<template>
	<div class="row">
		<div class="col-3">
			<div class="card card-ov">
				<div class="card-header">
					<div class="card-title">Native balance</div>
				</div>
				<div class="card-body text-center">
					<span >
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
					<span >
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
			this.nativeBalance = await this.state.web3.eth.getBalance(this.state.selectedMSW.address).catch(err => {
				console.error("could not get native balance");
			});
			this.nativeBalance = await this.state.web3.eth.getBalance(this.state.selectedMSW.address).catch(err => {
				console.error("could not get native balance");
			});

			this.totalTransactions = await this.$bridge.build(this.state.MSWInstance, 'getTransactionsCount').call();
			this.requiredSignatures = await this.$bridge.build(this.state.MSWInstance, 'getCurrentRequiredSignatures').callAndTranslate();
			this.ownersCount = await this.$bridge.build(this.state.MSWInstance, 'getSignersCount').callAndTranslate();
		}
	}
}
</script>
