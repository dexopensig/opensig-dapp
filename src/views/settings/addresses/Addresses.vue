<template>
	<div>
		<div v-if="$libRoute.isLinkExact('/settings/addresses')">
			<div class="mb-3">
				<div class="mb-3">
					<div class="row">
						<div class="col">
							{{ addresses.length }} Contacts
						</div>
						<div class="col col-auto">
							<router-link to="/settings/addresses/add" custom v-slot="{ navigate }">
								<button class="btn btn-primary" @click="navigate">Add contact</button>
							</router-link>
						</div>
					</div>
				</div>
			</div>
			<table class="table">
				<thead>
					<tr>
						<th colspan="2">Contacts</th>
					</tr>
				</thead>
				<tbody>
					<tr :key="index"
						v-for="(item, index) in addresses"
					>
						<td>
							<router-link :to="`/settings/addresses/${item.address}`" >{{ item.name }}</router-link>
						</td>
						<td>{{ item.address }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else>
			<router-view @contactsUpdated="contactsUpdated" />
		</div>
	</div>
</template>

<script>
import { useState } from '@/store';
const LS = require("@/libs/LS");

export default {
	name: "Addresses",
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
			contactList: [],
		}
	},
	computed : {
		addresses(){
			return this.contactList;
		}
	},
	mounted(){
		this.contactList = LS.getContacts();
	},
	methods:{
		contactsUpdated(){
			this.contactList = LS.getContacts();
		}
	}
}
</script>
