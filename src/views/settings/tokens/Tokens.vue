<template>
	<div>
		<div v-if="$libRoute.isLinkExact('/settings/tokens')">
			<div class="mb-3">
				<div class="row">
					<div class="col">
						{{ tokens.length }} Tokens
					</div>
					<div class="col col-auto">
						<router-link to="/settings/tokens/add" custom v-slot="{ navigate }">
							<button class="btn btn-primary" @click="navigate">Add token</button>
						</router-link>
					</div>
				</div>
			</div>
			<table class="table">
				<thead>
					<tr>
						<th>Token</th>
						<th>Symbol</th>
						<th>Decimals</th>
						<th>Address</th>
					</tr>
				</thead>
				<tbody>
					<tr :key="index"
						v-for="(item, index) in tokens"
					>
						<td>
							<router-link :to="`/settings/tokens/${item.address}`" >{{ item.name }}</router-link>
						</td>
						<td>{{ item.symbol }}</td>
						<td>{{ item.decimals }}</td>
						<td>{{ item.address }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else>
			<router-view @tokensUpdated="onTokensUpdated" />
		</div>
	</div>
</template>

<script>
const LS = require("@/libs/LS");
import { useState } from '@/store';

export default {
	name: "Tokens",
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
			tokensList : []
		}
	},
	computed : {
		tokens (){
			return this.tokensList;
		}
	},
	mounted(){
		this.tokensList = LS.getTokens();
	},
	methods: {
		onTokensUpdated(){
			this.tokensList = LS.getTokens()
		},
	},
}
</script>

<style scoped>

</style>
