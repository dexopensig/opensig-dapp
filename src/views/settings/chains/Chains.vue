<template>
	<div>
		<div v-if="$libRoute.isLinkExact('/settings/chains')">
			<div class="mb-3">
				<div class="mb-3">
					<div class="row">
						<div class="col">
							{{ addresses.length }} Chains
						</div>
						<div class="col col-auto">
							<router-link to="/settings/chains/add" custom v-slot="{ navigate }">
								<button class="btn btn-primary" @click="navigate">Add chain</button>
							</router-link>
						</div>
					</div>
				</div>
			</div>
			<table class="table">
				<thead>
					<tr>
						<th colspan="3">Chains</th>
					</tr>
				</thead>
				<tbody>
					<tr :key="index"
						v-for="(item, index) in addresses"
					>
						<td>
							<router-link :to="`/settings/chains/${item.id}`" >{{ item.id }}</router-link>
						</td>
						<td>{{ item.nativeSymbol }}</td>
						<td>{{ item.name }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else>
			<router-view @chainsUpdated="chainsUpdated" />
		</div>
	</div>
</template>

<script>
import { useState } from '@/store';
const LS = require("@/libs/LS");

export default {
	name: "Chains",
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
			chainList: [],
		}
	},
	computed : {
		addresses(){
			return this.chainList;
		}
	},
	mounted(){
		this.chainList = LS.getChains();
	},
	methods:{
		chainsUpdated(){
			this.chainList = LS.getChains();
		}
	}
}
</script>
