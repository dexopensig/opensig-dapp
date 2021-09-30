<template>
	<div>
		<div v-if="$libRoute.isLinkExact('/settings/wallets')">
			<div class="mb-3">
				<div class="row">
					<div class="col">
						{{ wallets.length }} Wallets
					</div>
					<div class="col col-auto">
						<router-link to="/settings/wallets/add" custom v-slot="{ navigate }">
							<button class="btn btn-primary" @click="navigate">Add wallet</button>
						</router-link>
					</div>
				</div>
			</div>
			<table class="table">
				<thead>
					<tr>
						<th colspan="5">Wallets</th>
					</tr>
				</thead>
				<tbody>
					<tr :key="index"
						v-for="(item, index) in wallets"
					>
						<td>
							<font-awesome-icon icon="check" v-if="state.selectedMSW.address == item.address" />
						</td>
						<td>
							<router-link :to="`/settings/wallets/${item.address}`" >{{ item.name }}</router-link>
						</td>
						<td>{{ item.address }}</td>
						<td>
							<router-link :to="`/settings/wallets/${item.address}/map`" >Map</router-link>
						</td>
						<td class="text-end">
							<button v-on:click="selectWallet(item.address)" class="btn-success btn-sm" >Select</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else>
			<router-view @walletsUpdated="onWalletsUpdated"/>
		</div>
	</div>
</template>

<script>
const LS = require("@/libs/LS");
import { useState } from '@/store';

export default {
	name: "Wallets",
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
			walletsList : []
		}
	},
	computed : {
		wallets (){
			return this.walletsList;
		}
	},
	mounted(){
		this.walletsList = LS.getWallets();
	},
	methods: {
		selectWallet(address){
			let $w = LS.getWallet(address);
			this.state.selectedMSW = $w;
			localStorage.setItem('preferences.selectedMSW', JSON.stringify($w));
		},
		onWalletsUpdated(){
			this.walletsList = LS.getWallets()
		},
	},
}
</script>

<style scoped>

</style>
