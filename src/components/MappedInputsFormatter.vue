<template>
	<div class="inputs-formatter" >
		<div v-if="mappedInputs">
			<table class="input-formatter-table">
				<tbody>
					<tr :key="index"
						v-for="(item, index) in mappedInputs">
						<td class="td-key"><span>{{ item.name }}</span></td>
						<td class="td-value">
							<div v-if="item.mappedData === null">
								<div v-if="typeof item.value == 'object'">
									<div class="array-inputs">
										[
										<div :key="subIndex"
											v-for="(subItem, subIndex) in item.value" class="array-inputs-items me-2">
											<input-auto-value :val="subItem" /> <span class="last-invisible">,</span>
										</div>
										]
									</div>
								</div>
								<div v-else>
									<input-auto-value :val="item.value" />
								</div>
							</div>
							<div v-else-if="item.mappedData.type == 'tokenAmount'">
								{{ item.mappedData.humanValue }} {{ item.mappedData.symbol }}
							</div>
							<div v-else-if="item.mappedData.type == 'timestamp'">
								{{ $dayjs(item.mappedData.timestamp).format("YYYY-MM-DD HH:mm:ss") }}
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-else>
			Could not decode Inputs
		</div>
	</div>
</template>
<style lang="scss" scoped>
	.array-inputs{
		flex-direction: row;
		display: flex;

		.array-inputs-items{
			flex-direction: row;
			display: flex;

			&:last-child{
				.last-invisible{
					display:none;
				}
			}
		}

	}
</style>
<script>


import AbiStuff from "@/libs/AbiStuff";
import InputMapper from "@/libs/InputMapper";
import EthConv from "@/libs/EthConv";
import LS from "@/libs/LS";

export default {
	props: {
		hexData: {default: ""},
		address: {default:""}
	},
	data(){
		return {
			opened:false,
			chunked:[]
		}
	},
	computed: {
		mappedInputs () {
			if(!this.address){
				return [];
			}
			if(this.hexData.length<=2){
				return [];
			}
			let {abi, refAddress, targetAddress} = LS.getResource(this.address);
			if(!refAddress){
				return [];
			}
			let mapped = InputMapper.getMappedInputs(targetAddress, refAddress, abi, this.hexData);
			return mapped;
		}
	},
	mounted() {
	},
	methods: {
	}
}
</script>
