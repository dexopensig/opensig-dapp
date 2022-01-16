<template>
	<div class="method-summary">
		<slot v-if="hexData.length<=2">
			<div class="method-summary-item">Send {{ formatValue(value) }} to </div>
			<div class="method-summary-item"><human-address :address="address" /></div>
		</slot>
		<slot v-else-if="comps.length">
			<component
				class="method-summary-item"
				:is="item"
				:key="index"
				v-for="(item, index) in comps" />
		</slot>
		<slot v-else>
			<span class="no-summary">No summary found</span>
		</slot>
	</div>
</template>
<style lang="scss" scoped>
	.method-summary{
		flex-direction: row;
		display: flex;

		.method-summary-item{
			white-space: pre;
		}

		.no-summary{
			opacity: 0.3;
		}
	}
</style>
<script>

import {h, render, Vue } from 'vue';
import AbiStuff from "@/libs/AbiStuff";
import InputMapper from "@/libs/InputMapper";
const BigNumber = require("bignumber.js");
import LS from "@/libs/LS";
import HumanizedTimestamp from "./HumanizedTimestamp";
import HumanizedTokenAmount from "./HumanizedTokenAmount";
import HumanizedPlain from "./HumanizedPlain"
import HumanAddress from "./HumanAddress";

export default {
	components: {HumanAddress},
	props: {
		hexData: {default: ""},
		address: {default:""},
		value: {default:0},
		displayDecimals: {default: 4},
		scrambleValues: {default: 1}//multiplier
	},
	data(){
		return {
			opened:false,
			compList: []
		}
	},
	computed: {
		comps(){
			return this.compList;
		}
	},

	mounted() {
		let $components = [];

		let {abi: $abiStr, refAddress: $refAddress, targetAddress: $targetAddress} = LS.getResource(this.address);

		if($abiStr){

			const $signature = "0x" + this.$AbiStuff.extractFunction(this.hexData);

			let $summary = LS.getSummaries($refAddress);
			if(!$summary[$signature]){
				return null;
			}

			let $summaryData = {};

			let $strSummary = $summary[$signature];

			let $placeHolders = $strSummary.matchAll(/\{([^}]+)\}/g);
			let $mapped = InputMapper.getMappedInputs($targetAddress, $refAddress, $abiStr, this.hexData);

			let $startingIndex = 0;

			for(let $p of $placeHolders){

				if($p.index > $startingIndex){
					let $content = $strSummary.substring($startingIndex, $p.index);
					if($content.match(/^0x[a-fA-F0-9]{40}$/)){
						$components.push(h(HumanAddress,{address: $content}));
					}else{
						$components.push(h(HumanizedPlain,{content: $content}));
					}
				}

				let $refName = $p[1];
				if($mapped[$refName]){
					let $map = $mapped[$refName];
					let $component = null;
					if(!$map.mappedData){
						if($map.value.match(/^0x[a-fA-F0-9]{40}$/)){
							$component = h(HumanAddress,{address: $map.value});
						}else{
							$component = h(HumanizedPlain, {content: $map.value});
						}
					}else if($map.mappedData.type == "timestamp"){
						$component = h(HumanizedTimestamp, { timestamp: $map.mappedData.timestamp });
					} else if($map.mappedData.type == "tokenAmount"){
						$component = h(HumanizedTokenAmount, {
							amount: new BigNumber($map.mappedData.value).times(this.scrambleValues).toFixed(0),
							decimals: $map.mappedData.decimals,
							displayDecimals: this.displayDecimals,
							symbol: $map.mappedData.symbol,
							address: $map.mappedData.tokenAddress
						});
					}
					$components.push($component)
				}else if($refName == '$value'){
					$components.push(h(HumanizedTokenAmount, {
						amount: new BigNumber(this.value).times(this.scrambleValues).toFixed(0),
						decimals: 18,
						displayDecimals: this.displayDecimals,
						symbol: '',
						address: null
					}));
				}
				$startingIndex = $p.index + $p[0].length;
			}

			if($startingIndex < $strSummary.length){
				$components.push(h(HumanizedPlain, {content: $strSummary.substring($startingIndex, $strSummary.length)}));
			}
		}
		this.compList = $components;
	},

	methods:{
		formatValue(val){
			return new BigNumber(val).times(this.scrambleValues).div(10**18).toFixed(4);
		}
	}
}
</script>
