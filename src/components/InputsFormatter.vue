<template>
	<div class="inputs-formatter" >
		<div v-if="formattedInputs">
			<table class="input-formatter-table">
				<tbody>
					<tr :key="index"
						v-for="(item, index) in formattedInputs">
						<td class="td-key"><span>{{ item.name }}</span></td>
						<td class="td-value">{{ item.value }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else-if="hexData.length<=2" >

		</div>
		<div v-else>
			Could not decode Inputs
		</div>
	</div>
</template>
<style lang="scss" scoped>
	.bytes-formatter{

		a{
			cursor:pointer;
			opacity:0.3;
			text-decoration: none;
		}

		.toggle{
			text-align: left;
			font-size:12px;
		}

		.bytes-container{
			font-family: monospace;
			line-height: 1em;
			max-height:32px;
			overflow: hidden;

			&.opened{
				max-height: fit-content;
			}
		}

	}
</style>
<script>


import AbiStuff from "@/libs/AbiStuff";
import EthConv from "@/libs/EthConv";

export default {
	props: {
		hexData: {default: ""},
		abiStr: {default: ""},
	},
	data(){
		return {
			opened:false,
			chunked:[]
		}
	},
	computed: {
		formattedInputs () {
			return AbiStuff.getFormattedInputs(this.abiStr, this.hexData);
		}
	},
	mounted() {
	},
	methods: {
	}
}
</script>
