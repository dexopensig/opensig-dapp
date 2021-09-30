<template>
	<div>
		<div v-if="error" class="alert alert-danger">
			{{error}}
		</div>

		<div class="form-group">
			<label >Address</label>
			<input type="text" class="form-control" placeholder="Enter Contract Address" v-model="txtAddress">
		</div>

		<div class="form-group">
			<label >Reference Contract</label>
			<input type="text" class="form-control" placeholder="0xAbstract_ERC20" v-model="txtReferenceContract">
		</div>

		<div v-if="editMode">
			<div class="form-group">
				<label >Name</label>
				<input type="text" class="form-control" placeholder="Enter name" v-model="txtName">
			</div>

			<div class="form-group">
				<label >Symbol</label>
				<input type="text" class="form-control" placeholder="Enter symbol" v-model="txtSymbol">
			</div>

			<div class="form-group">
				<label >Decimals</label>
				<input type="text" class="form-control" placeholder="Enter decimals" v-model="txtDecimals">
			</div>

		</div>

		<div class="row mt-4">
			<div class="col">
				<button v-on:click="cancel()" class="btn btn-primary">
					Cancel
				</button>
			</div>
			<div class="col col-auto">
				<button v-if="editMode" v-on:click="deleteToken()" class="btn btn-danger">
					Delete
				</button>
			</div>
			<div class="col-4">
				<div v-if="processing">Processing</div>
				<div class="d-grid gap-2" v-else>
					<button v-on:click="submitForm()" class="btn btn-primary">
						{{ editMode?"Save":"Add" }}
					</button>
					<button v-if="!editMode" v-on:click="submitFormMany()" class="btn btn-primary">
						Add many
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { useState } from '@/store';
const LS = require('@/libs/LS');
const ERC20Abi = require('@/libs/ERC20Abi');

export default {
	name: "TokenForm",
	props : {
		metaEnabled: {
			type: Boolean
		},
		passedName: { type:String, default: "" },
		passedAddress: { type:String, default: "" },
		passedDecimals: { type:Number, default: 0 },
		passedSymbol: { type:String, default: "" },
		passedReferenceContract: {type:String, default: ""},
		editMode: {type:Boolean, default: false},
	},
	setup(props){
		return {state: useState()}
	},
	data() {
		return {
			txtName: "",
			txtAddress: "",
			txtSymbol: "",
			txtDecimals: 0,
			txtReferenceContract: "",
			error: null,
			processing: false,
		}
	},
	created() {
		this.txtName = this.passedName || "";
		this.txtAddress = this.passedAddress || "";
		this.txtDecimals = this.passedDecimals || 0;
		this.txtSymbol = this.passedSymbol || "";
		this.txtReferenceContract = this.passedReferenceContract || "";
	},

	methods: {
		cancel (){
			this.$router.push('/settings/tokens');
		},
		deleteToken(){
			LS.deleteToken(this.passedAddress);
			this.$emit("formUpdated", null);
			this.$router.push('/settings/tokens');
		},
		async submitForm(){

			this.error = null;
			this.processing = true;
			const $token = {
				name: this.txtName,
				address: this.txtAddress,
				symbol: this.txtSymbol,
				decimals: this.txtDecimals,
				referenceContract: this.txtReferenceContract
			};

			if(!$token.address.match(/^0x[a-fA-F0-9]{40}$/)){
				this.error = "Invalid address";
				this.processing = false;
				return;
			}

			let $referenceContract = LS.getContract($token.referenceContract);
			if(!$referenceContract){
				this.error = "Invalid contract reference address. Please add the token abstract contract first";
				this.processing = false;
				return;
			}

			let $tokens = LS.getTokens();

			let $addressExists = $tokens.find(a =>
				a.address.toLowerCase() == $token.address.toLowerCase()
				&& $token.address.toLowerCase() != this.passedAddress.toLowerCase()
			);

			if($addressExists){
				this.error = "Address already exists";
				this.processing = false;
				return;
			}

			if(!this.editMode){
				let $erc20Instance;
				try{
					$erc20Instance = new this.state.web3.eth.Contract(ERC20Abi, $token.address);
				}catch(err){
					this.error = err;
				}

				if(!$erc20Instance){
					this.processing = false;
					return;
				}
				try{
					$token.symbol = await $erc20Instance.methods.symbol().call();
					$token.name = await $erc20Instance.methods.name().call();
					$token.decimals = await $erc20Instance.methods.decimals().call();
				}catch(e){
					this.error = e;
					this.processing = false;
					return;
				}
				$tokens.push($token);
			}else{
				if($token.name.trim().length == 0){
					this.error = "Name required";
					return;
				}
				let $existingIndex = LS.getTokenIndex(this.passedAddress);
				$tokens[$existingIndex] = $token;
			}

			LS.saveTokens($tokens);
			this.$emit("formUpdated", $token);
			this.$router.push('/settings/tokens');
			this.processing = false;
		},
		async submitFormMany(){

			this.error = null;
			this.processing = true;

			let $addresses = this.txtAddress.split(",").map(a => a.trim());

			let $referenceContract = LS.getContract(this.txtReferenceContract);
			if(!$referenceContract){
				this.error = "Invalid contract reference address. Please add the token abstract contract first";
				this.processing = false;
				return;
			}

			let $errors = [];
			let $tokens = LS.getTokens();

			for(let $address of $addresses){
				if(!$address.match(/^0x[a-fA-F0-9]{40}$/)){
					$errors.push("Invalid address" + $address);
				}
			}

			if($errors.length){
				this.error = $errors.join(", ");
				this.processing = false;
				return;
			}

			for(let $address of $addresses){
				let $addressExists = $tokens.find(a => a.address.toLowerCase() == $address.toLowerCase());

				if(!$addressExists){
					const $token = {
						name: null,
						address: $address,
						symbol: null,
						decimals: null,
						referenceContract: null
					};

					let $erc20Instance;
					try{
						$erc20Instance = new this.state.web3.eth.Contract(ERC20Abi, $token.address);
					}catch(err){
						this.error = err;
					}

					if(!$erc20Instance){
						this.processing = false;
						return;
					}
					try{
						$token.symbol = await $erc20Instance.methods.symbol().call();
						$token.name = await $erc20Instance.methods.name().call();
						$token.decimals = await $erc20Instance.methods.decimals().call();
						$token.referenceContract = this.txtReferenceContract;
					}catch(e){
						this.error = e;
						this.processing = false;
						return;
					}
					$tokens.push($token);
				}

			}

			LS.saveTokens($tokens);
			this.$emit("formUpdated", $tokens);
			this.$router.push('/settings/tokens');
			this.processing = false;
		}
	}
}
</script>
