<template>
	<div>
		<img class="asset-image me-1" v-if="imgExists" :src="`/icons/${address.toLowerCase()}.png`" @error="imgExists=false" />
		<a :href="state.selectedMSW.explorer +'/address/' + address" target="_blank" v-if="address">
			{{ humanValue }} {{ symbol }}
		</a>
		<span v-else>
			{{ humanValue }} {{ symbol }}
		</span>
	</div>
</template>
<style>
	.asset-image{
		width:16px;
		height: 16px;
	}
</style>
<script>

import BigNumber from 'bignumber.js';
import { useState } from '@/store';

export default {
	props: {
		address: {default: null},
		amount: {default: 0},
		decimals: {default: 1},
		symbol: {default: "XXX"},
		displayDecimals: {default: 2},
		imgExists: {default: true}
	},
	setup(){
		return {state: useState()}
	},
	computed: {
		humanValue(){
			let $num = new BigNumber(this.amount).div(10**this.decimals).toFixed(this.displayDecimals);

			let $dotIndex = $num.indexOf(".");
			let $integerPart = $num;
			let $decimalPart = "";
			if($dotIndex != -1){
				$integerPart = $num.substring(0, $dotIndex);
				$decimalPart = $num.substr($dotIndex + 1);
			}
			if($integerPart.length){
				const rgx = /(\d+)(\d{3})/;
				while (rgx.test($integerPart)) {
					$integerPart = $integerPart.replace(rgx, '$1' + ',' + '$2');
				}
			}
			$num = $integerPart + "." + $decimalPart;

			return $num;
		}
	},
}
</script>
