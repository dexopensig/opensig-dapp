<template>
	<div>
		<div v-if="loading">Loading...</div>
		<div v-else>
			<div class="mb-3">Total of {{totalTransactions}} transactions</div>
			<div class="table-responsive">
				<table class="table table-hoverstyle">
					<thead>
						<tr>
							<th></th>
							<th></th>
							<th></th>
							<th></th>
							<th>Confirmations</th>
							<th>To</th>
							<th>Function</th>
							<th>Action</th>
							<th>Value</th>
						</tr>
					</thead>
					<tbody>
						<tr :key="item.id"
							v-for="(item) in getTransactions"
						>
							<td>
								<router-link
									:to="`/tx/${state.selectedMSW.address}/${item.id}`"
									custom
									v-slot="{navigate}" >
									<div class="transaction-details-button" @click="navigate">
										<font-awesome-icon icon="eye" />
									</div>
								</router-link>
							</td>
							<td class="cell-narrow">
								{{ item.id }}
							</td>
							<td class="cell-narrow">
								<font-awesome-icon icon="check" class="me-2" v-if="item.executed" />
								<font-awesome-icon icon="times" class="text-danger me-2" v-if="item.lastFailure>0" />
								<font-awesome-icon icon="ban" class="text-warning me-2" v-if="item.cancelled" />
							</td>
							<td>
								<div v-tooltip="{
									html:true,
									content: `Submitted ${$dayjs(item.submissionTime * 1000).format('YYYY-MM-DD HH:mm')}`
										+ (item.executionTime>0?`<br />Executed ${$dayjs(item.executionTime * 1000).format('YYYY-MM-DD HH:mm')}`:'')
								}">
									<div class="transaction-status-date" v-if="item.executed"> {{ $dayjs(item.executionTime*1000).fromNow(true) }} ago </div>
									<div class="transaction-status-date" v-else> {{ $dayjs(item.submissionTime*1000).fromNow(true) }} ago </div>
								</div>
							</td>
							<td>
								<div class="transaction-validators-container">
									<!--<span class="transaction-signers-counter">{{item.confirmationsCount}}/{{item.confirmationsRequired}}</span>-->
									<div class="transaction-validators">
										<identicon-address
											:key="cIndex"
											v-for="(c, cIndex) in item.signers"
											:address="c"
										/>
									</div>
								</div>
							</td>
							<td>
								<human-address :address="item.destination"></human-address>
							</td>
							<td>
								<human-method
									:address="item.destination"
									:signature="$AbiStuff.extractFunction(item.data)" />
							</td>
							<td>
								<method-summary
									class="transaction-summary-smaller"
									:display-decimals="2"
									:address="item.destination"
									:value="item.value"
									:hexData="item.data"
								/>
							</td>
							<td>
								<span v-if="item.value>0">{{ getNativeValue(item.value) }}</span>
								<span v-else class="transaction-value-zero">0</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script>
import { watch, toRefs } from 'vue';
import { useState } from '@/store';
import IdenticonAddress from "@/components/IdenticonAddress";
import HumanAddress from "@/components/HumanAddress";
import HumanMethod from "@/components/HumanMethod";
import MethodSummary from "../../../components/MethodSummary";
const BigNumber = require("bignumber.js");

export default {
	name: "Transactions",
	components: {
		MethodSummary,
		IdenticonAddress,
		HumanAddress,
		HumanMethod
	},
	data(){
		return {
			loading : false,
			transactions: {},
			totalTransactions:0
		}
	},
	props : {
		metaEnabled: {
			type: Boolean
		},
	},
	setup(props){

		let { metaEnabled } = toRefs(props);

		watch(metaEnabled, (newVal, oldVal) => {
			if(newVal && this.loading){
				this.fetchData();
			}
		});

		return {state: useState()}
	},

	computed:{
		getTransactions(){
			let $txs = [];
			for(const $tx of Object.values(this.transactions)){
				$txs.push($tx);
			}
			$txs.sort((a, b) => b.id - a.id);
			return $txs;
		}
	},

	mounted(){
		if(this.state.metaEnabled){
			this.fetchData();
		}
	},

	methods: {

		fetchData: async function() {

			if(!this.state.MSWInstance){
				return;
			}

			this.totalTransactions = await this.$bridge.build(this.state.MSWInstance, 'getTransactionsCount').callAndTranslate();
			for(let $i = this.totalTransactions-1; $i >=0 ; $i--){
				const $tx = await this.$bridge.build(this.state.MSWInstance, 'getTransactionDetails', {transactionId: $i}).callAndTranslate();

				let $txObj = {
					id: $i,
					executionTime: $tx.executionTime || null,
					submissionTime: $tx.submissionTime || null,
					executed: $tx.executed || null,
					cancelled: $tx.cancelled || null,
					lastFailure: $tx.lastFailure || null,
					destination: $tx.destination || null,
					data: $tx.data || null,
					value: $tx.value || null,
					signersWhenExecuted: $tx.signersWhenExecuted || null,
					confirmationsCount: 0,
					confirmationsRequired: 0,
				};
				$txObj.signers = $txObj.signersWhenExecuted;

				if(!$tx.executed){
					$txObj.signers = await this.$bridge.build(this.state.MSWInstance, 'getSignersAddressesOfTx', {transactionId: $i}).callAndTranslate();
					let $signersSlots = [];
					for(let $i = 0; $i < this.state.currentRequiredConfirmations; $i++) {
						$signersSlots[$i] = $txObj.signers[$i] || null;
						if($signersSlots[$i]){
							$txObj.confirmationsCount++;
						}
					}
					$txObj.signers = $signersSlots;
					$txObj.confirmationsRequired = this.state.currentRequiredConfirmations;
				}else{
					$txObj.confirmationsCount = $txObj.signers.length;
					$txObj.confirmationsRequired = $txObj.signers.length;
				}

				this.transactions[$i] = $txObj;
			}

			if(this.owners){
				this.loading = true;
			}
		},

		getNativeValue(val){
			return new BigNumber(val).div(10**18).toFixed(4);
		}

	}
}
</script>
