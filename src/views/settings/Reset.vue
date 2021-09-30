<template>
	<div>
		<h5>
			Reset Preferences
		</h5>
		<div>
			<div v-if="success" class="alert alert-success">Reset complete</div>
			<div class="row">
				<div class="col">
					<router-link to="/settings/" custom v-slot="{ navigate }">
						<button class="btn btn-primary" @click="navigate">{{ success?'Go back':'Cancel' }}</button>
					</router-link>
				</div>
				<div class="col-auto text-end" v-if="!success">
					<button v-if="showConfirm" @click="reset" class="btn btn-danger">Confirm</button>
					<button v-else @click="showConfirmButton" class="btn btn-warning">Reset</button>
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
import { useState } from '@/store';

export default {
	name: "Reset",
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
			showConfirm: false,
		}
	},
	methods: {
		showConfirmButton: function () {
			this.showConfirm = true;
		},

		reset: function () {
			localStorage.clear();
			this.success = true;
		},
	},
}
</script>
