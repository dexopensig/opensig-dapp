<template>
	<div class="card">
		<div class="card-header">
			<ul class="nav mb-2 mb-lg-0">
				<li :class="['nav-item', !$libRoute.isLinkExact('/wallet')||'selected']">
					<router-link class="nav-link" to="/wallet">Overview</router-link>
				</li>
				<li :class="['nav-item', !$libRoute.isLinkActive('/wallet/transactions', false)||'selected']">
					<router-link class="nav-link" to="/wallet/transactions">Transactions</router-link>
				</li>
				<li :class="['nav-item', !$libRoute.isLinkActive('/wallet/permissions', false)||'selected']">
					<router-link class="nav-link" to="/wallet/permissions">Permissions</router-link>
				</li>
				<li :class="['nav-item', !$libRoute.isLinkActive('/wallet/assets', false)||'selected']">
					<router-link class="nav-link" to="/wallet/assets">Assets</router-link>
				</li>
			</ul>
		</div>
		<div class="card-body">
			<router-view :meta-enabled="state.metaEnabled" />
		</div>
	</div>
</template>

<script>

import { useState } from '@/store';
export default {
	name: "Wallet",
	setup(props){
		return {state: useState()}
	},

	mounted(){
	},

	methods: {

	}
}
</script>
