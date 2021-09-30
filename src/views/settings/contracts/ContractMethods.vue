<template>
	<div>
		<table class="table">
			<thead>
				<tr>
					<th colspan="3">Methods</th>
				</tr>
			</thead>
			<tbody>
				<tr :key="index"
					v-for="(item, index) in methods"
				>
					<td>
						{{ item.signature }}
					</td>
					<td>
						{{ item.name }}
					</td>
					<td>
						<div v-if="errors[item.signature]" class="alert alert-danger">
							{{ errors[item.signature] }}
						</div>
						<table class="table">
							<tr :key="indexMethod"
								v-for="(inputItem, indexMethod) in item.inputs" >
								<td> {{ inputItem.internalType }} </td>
								<td>{{ inputItem.name }}</td>
								<td>
									<input
										type="text"
										class="form-control"
										:ref="`${item.signature}_${inputItem.name}`"
										:value="inputMaps[item.signature][inputItem.name]"
									>
								</td>
							</tr>
						</table>
						<div class="form-group">
							<label>Summary</label>
							<input
								v-model="summaries[item.signature]"
								type="text"
								class="form-control"
							>
						</div>
						<div class="d-grid gap-2">
							<button class="btn btn-sm btn-primary" v-on:click="save(item)">Save</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
import { useState } from '@/store';
import ContractForm from '@/views/settings/contracts/ContractForm';
const LS = require('@/libs/LS');
const AbiStuff = require('@/libs/AbiStuff');

export default {
	name: "ContractMethods",
	props : {
		metaEnabled: {
			type: Boolean
		},
		//passedName: { type:String, default:null },
		//passedAddress: { type:String, default:null },
		//passedAbi: { type:String, default:null },
	},
	setup(){
		return {state: useState()}
	},
	data() {
		return {
			errors: {},
			contract:null,
			inputMapsList: {},
			methodsList : [],
			summaries: {},
			abi:[],
		}
	},
	computed : {
		methods (){
			return this.methodsList;
		},
		inputMaps(){
			return this.inputMapsList;
		}
	},
	created(){
		this.address = this.$route.params.address;
		this.contract = LS.getContract(this.address);
		this.abi = this.contract.abi;
		this.methodsList = AbiStuff.getMethods(this.abi);
		this.inputMapsList = {};
		this.summaries = LS.getSummaries(this.address);
		for(let $m of this.methodsList){
			this.inputMapsList[$m.signature] = LS.getInputMapsOf(this.address, $m.signature);
			if(!this.summaries[$m.signature]){
				this.summaries[$m.signature] = null;
			}
		}
	},

	methods: {

		save (method) {
			let $maps = {};

			this.errors[method.signature] = null;
			for(let $input of method.inputs){
				let $ref = this.$refs[`${method.signature}_${$input.name}`];
				if($ref.value.length){
					if(AbiStuff.inputMapValid($ref.value)){
						$maps[$input.name] = $ref.value;
					}else{
						this.errors[method.signature] = "Invalid input map " + $ref.value + " for " + method.name + ":" + $input.name;
						console.error(this.errors[method.signature]);
					}
				}
			}
			if(!this.errors.length){
				let $allMaps = LS.getInputMaps(this.address);
				$allMaps[method.signature] = $maps;
				LS.saveInputMaps(this.address, $allMaps);
				this.inputMapsList[method.signature] = $maps;

				LS.saveSummaries(this.address, this.summaries);
			}

		},

	}

}
</script>
