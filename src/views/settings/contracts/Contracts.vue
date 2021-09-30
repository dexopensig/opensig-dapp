<template>
	<div>
		<div v-if="$libRoute.isLinkExact('/settings/contracts')">
			<div class="mb-3">
				<div class="row">
					<div class="col">
						{{ contracts.length }} Contracts
					</div>
					<div class="col col-auto">
						<router-link to="/settings/contracts/add" custom v-slot="{ navigate }">
							<button class="btn btn-primary" @click="navigate">Add contract</button>
						</router-link>
					</div>
				</div>
			</div>
			<table class="table">
				<thead>
					<tr>
						<th colspan="3">Contracts</th>
					</tr>
				</thead>
				<tbody>
					<tr :key="index"
						v-for="(item, index) in contracts"
					>
						<td>
							<router-link :to="`/settings/contracts/${item.address}`">
								{{ item.name }}
							</router-link>
						</td>
						<td>{{ item.address }}</td>
						<td class="text-end">
							<router-link :to="`/settings/contracts/${item.address}/methods`">
								Methods
							</router-link>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else>
			<router-view @contractsUpdated="onContractsUpdated" />
		</div>
	</div>
</template>

<script>
const LS = require("@/libs/LS");
import { useState } from '@/store';

export default {
	name: "Contracts",
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
			contractsList : []
		}
	},
	computed : {
		contracts (){
			return this.contractsList;
		}
	},
	mounted(){
		this.contractsList = LS.getContracts();
	},
	methods: {
		onContractsUpdated(){
			this.contractsList = LS.getContracts()
		},
	},
}
</script>
