<template>
	<div>
		<table class="table">
			<thead>
				<tr>
					<th>Action</th>
					<th>Abi method</th>
					<th>Transformers</th>
				</tr>
			</thead>
			<tbody>
				<tr :key="bridgeMethodName"
					v-for="(bridgeMethodData, bridgeMethodName) in bridgeMethods">
					<td>
						{{ bridgeMethodName }}
						<div v-if="bridgeMethodData.passedArgs.filter(a => a.type=='placeholder').length" class="map-passed-arguments-container">
							<span class="not-important">Arguments:</span>
							<span class="map-passed-argument" :key="arg" v-for="arg in bridgeMethodData.passedArgs.filter(a => a.type=='placeholder')">{{ arg.value }}</span>
						</div>
					</td>
					<td>
						<vue-multiselect
							v-model="bridgeMethodData.selection"
							:options="bridgeMethodData.options"
							:show-labels="false"
							label="name"
							track-by="name"
							:searchable="true"
							placeholder="Select method"
							@select="onAbiMethodSelected(bridgeMethodName, $event)"
						>
							<template v-slot:singleLabel="{ option }">
								<div class="multiselect-single-label">
									{{ option.name }}
								</div>
							</template>

							<template v-slot:option="{ option }">
								{{ option.name }}
							</template>
						</vue-multiselect>
						<div v-if="bridgeMethodData.abiArgs && bridgeMethodData.abiArgs.length" class="map-abi-arguments-container">
							<div :key="abiMethodSignature" v-for="(abiMethodArg, abiMethodSignature) in bridgeMethodData.abiArgs" class="map-abi-argument-row">
								<div class="map-abi-argument-name">{{ abiMethodArg.arg.name }}</div>
								<div class="map-abi-argument-value">
									<vue-multiselect
										v-model="abiMethodArg.selection"
										placeholder="select mapping"
										:options="bridgeMethodData.passedArgs"
										track-by="value"
										:taggable="true"
										tag-placeholder="Set manual argument"
										@select="onArgSelected(abiMethodArg.arg.name, $event)"
										@Tag="onAddTag(bridgeMethodData.passedArgs, bridgeMethodName, abiMethodSignature, $event)"
									>
										<template v-slot:singleLabel="{ option }">
											<div class="multiselect-single-label">
												{{ option.value }}
											</div>
										</template>

										<template v-slot:option="{ option, search }">
											{{ option.value || search}}
										</template>
									</vue-multiselect>
								</div>
							</div>
						</div>
					</td>
					<td>
						<vue-multiselect
							v-model="bridgeMethodData.transformerSelection"
							placeholder="Optional"
							:options="transformerOptions"
							@select="onTransformerSelected(bridgeMethodName, $event)"
						>
							<template v-slot:singleLabel="{ option }">
								<div class="multiselect-single-label">
									{{ option }}
								</div>
							</template>

							<template v-slot:option="{ option }">
								{{ option }}
							</template>
						</vue-multiselect>
						<div v-if="bridgeMethodData.transformerSelection == 'map'" class="mt-2">
							<textarea v-model="bridgeMethodData.transformerData" class="form-control transformer-map-textarea"></textarea>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="d-grid">
			<button class="btn btn-primary" @click="save()">Save</button>
		</div>
	</div>
</template>
<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<script>
import { useState } from '@/store';
const LS = require('@/libs/LS');
import VueMultiselect from 'vue-multiselect'

export default {
	name: "MapWallet",
	components: {
		VueMultiselect
	},
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
	computed:{
	},
	data() {
		return {
			testValue: null,
			selected:{},
			abiMethods:[],
			abiArgs: {},
			bridgeMethods: {},
			selectedAbiArgs: {},
			transformerOptions : [
				'length',
				'map'
			]
		}
	},
	created(){
		this.address = this.$route.params.address;
		const {abi: $abi} = LS.getResource(this.address);
		if($abi){
			let $walletAbiMethods = this.$AbiStuff.getMethods($abi);

			for(let $m in this.$bridge.maps){
				this.bridgeMethods[$m] = {
					method: $m,
					passedArgs: this.$bridge.maps[$m].passedArgs.map(a => {return {
						type: 'placeholder',
						value: a
					}}),
					options: $walletAbiMethods,
					abiArgs: [],
					transformerSelection: null,
					transformerData: null,
					selection: null,
				};
			}

			let $stored = LS.getWalletMap(this.address);

			try{
				for(let $s of $stored){
					let $bridgeMethod = $s.bridgeMethod;
					if($s.transform){
						this.bridgeMethods[$bridgeMethod].transformerSelection = $s.transform.type;
						this.bridgeMethods[$bridgeMethod].transformerData = JSON.stringify($s.transform.data, "\n", "\t");
					}

					if($s.mappedAbiMethod){
						this.bridgeMethods[$bridgeMethod].selection = {name: $s.mappedAbiMethod};
						let $abiArgs = $walletAbiMethods.find(a => a.name == $s.mappedAbiMethod).inputs.map(a => {
							return {
								arg: a,
								selection: ($s.mappedAbiArgs.find(b => b.name == a.name)||{}).map,
							};
						});

						this.bridgeMethods[$bridgeMethod].abiArgs = $abiArgs;
					}
				}
			}catch(e){
				console.error("Could not load wallet map");
			}


			this.abiMethods = $walletAbiMethods;
		}
	},

	methods: {

		onAbiMethodSelected(index, $event){

			this.bridgeMethods[index].selection = $event;
			this.bridgeMethods[index].abiArgs = this.abiMethods.find(a => a.name == $event.name).inputs.map(a => {
				return {
					arg: a,
					selection: null,
				}
			});
		},

		onTransformerSelected(bridgeMethodName, $event){
			this.bridgeMethods[bridgeMethodName].transformerSelection = $event;
		},

		onAddTag (passedArgs, bridgeMethodName, abiMethodIndex, $event) {
			const newTag = {
				type:'defined',
				value:$event
			};
			this.bridgeMethods[bridgeMethodName].abiArgs[abiMethodIndex].selection = newTag;
		},
		getAbiArgsOptions(bridgeMethodPassedArgs){

			return [
				{ value: 'judy'},
				{ value: 'jane'},
				{ value: 'john'},
				{ value: 'joe' }
			];

			let $options = Object.keys(bridgeMethodPassedArgs).map(a => { return {type:'placeholder', value:a }});

			return [...Object.values($options), {type:'placeholder', value:'testPL' }];
		},
		formUpdated(){
			this.$emit('walletsUpdated');
		},

		save(){

			let $mapData = [];

			for(let $m of Object.values(this.bridgeMethods)){
				let $transform = $m.transformerSelection?{
					type: $m.transformerSelection,
					data: JSON.parse($m.transformerData),
				}:null;
				$mapData.push({
					bridgeMethod: $m.method,
					mappedAbiMethod: ($m.selection?$m.selection.name:null),
					mappedAbiArgs : $m.abiArgs.map( a => {
						return {
							name: a.arg.name,
							map: a.selection
						}
					}),
					transform: $transform
				});
			}

			LS.saveWalletMap(this.address, $mapData);

		}
	}

}
</script>
