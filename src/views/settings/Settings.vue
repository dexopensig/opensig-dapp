<template>
	<div class="card">
		<div class="card-header">
			<div class="row">
				<div class="col">
					<ul class="nav mb-2 mb-lg-0">
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/wallets')||'selected']">
							<router-link class="nav-link" to="/settings/wallets">Wallets</router-link>
						</li>
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/addresses', false)||'selected']">
							<router-link class="nav-link" to="/settings/addresses">Address book</router-link>
						</li>
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/contracts', false)||'selected']">
							<router-link class="nav-link" to="/settings/contracts">Contracts</router-link>
						</li>
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/tokens', false)||'selected']">
							<router-link class="nav-link" to="/settings/tokens">Tokens</router-link>
						</li>
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/chains', false)||'selected']">
							<router-link class="nav-link" to="/settings/chains">Chains</router-link>
						</li>
					</ul>
				</div>
				<div class="col-auto">
					<ul class="nav float-end">
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/export')||'selected']">
							<router-link class="nav-link" to="/settings/export">
								<font-awesome-icon icon="save" />
							</router-link>
						</li>
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/import')||'selected']">
							<router-link class="nav-link" to="/settings/import">
								<font-awesome-icon icon="file-upload" />
							</router-link>
						</li>
						<li :class="['nav-item', !$libRoute.isLinkActive('/settings/reset')||'selected']">
							<router-link class="nav-link" to="/settings/reset">
								<font-awesome-icon icon="trash" />
							</router-link>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="card-body">
			<div v-if="$libRoute.isLinkExact('/settings')">
				OpenSig preferences
			</div>
			<router-view v-else :meta-enabled="state.metaEnabled" />
		</div>
	</div>
</template>

<script>
import { useState } from '../../store';

export default {
	name: "Settings",
	props : {
		metaEnabled: {
			type: Boolean
		},
	},
	setup(props){
		return {state: useState()}
	},
	mounted(){
	},
}
</script>
