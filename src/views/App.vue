<template src="./App.template.html" />
<script>
import { useState } from '@/store';

import VueMetamask from '@/components/VueMetamask.vue';

import Web3 from 'web3';
import LS from '@/libs/LS';

import {REVERT_CODES} from "@/constants/constants"

export default {
	name: 'App',
	components: {
		VueMetamask,
	},
	setup() {
		return {state: useState()}
	},
	data : function(){
		return {

			contractAbi:null,

			queryParams: {},

			metamaskAddress: null,
			currentNonce: 0,

			isOwner: false,

			showProviderModal: false,

			contractInstance:null,
			contractInstanceWrite:null,

			txtProvider:null,

			trieError:false,
			contractError:false,

			pulses:{}
		}
	},
	created(){
		try{
			this.state.selectedMSW = JSON.parse(localStorage.getItem("preferences.selectedMSW")) || {address:null, explorer:null};
		}catch(e){
			console.log(e);
		}

		if(this.state.selectedMSW.address){
			const {abi:$abi} = LS.getResource(this.state.selectedMSW.address);
			if($abi){
				this.contractAbi = $abi;
			}else{
				this.contractAbi = null;
			}
		}else{
			this.contractAbi = null;
		}
	},
	mounted(){
		this.$libRoute.initRoute(this);
	},
	methods: {
		onMetamaskComplete(data){

			if(data.metaMaskAddress){

				this.state.web3Write = data.web3;
				this.state.web3 = data.web3;
				if(this.provider){
					console.log("Using web3 provider " + this.provider);
					this.state.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));
				}else{
					console.log("Using injected MM");
				}

				this.state.metamaskAddress = data.metaMaskAddress;
				this.state.networkId = data.netID;

				this.state.currentChain.id = data.netID;
				const prefChain = LS.getChain(data.netID);
				if (prefChain) {
					this.state.currentChain.explorer = prefChain.explorer;
					this.state.currentChain.id = prefChain.id;
					this.state.currentChain.name = prefChain.name;
					this.state.currentChain.symbol = prefChain.nativeSymbol;
				}

				this.metamaskAddress = this.state.metamaskAddress;
				if(this.state.selectedMSW.address){
					try{
						this.state.MSWInstance = new this.state.web3.eth.Contract(JSON.parse(this.contractAbi), this.state.selectedMSW.address);
						this.state.MSWInstanceWrite = new this.state.web3Write.eth.Contract(JSON.parse(this.contractAbi), this.state.selectedMSW.address);

						this.$bridge.setup(this.state.selectedMSW.address);

					}catch(err){

					}
				}else{
					this.contractAbi = null;
					this.state.MSWInstance = null;
				}

				this.state.metaEnabled = true;
				this.tick();
			}else{
				this.state.metaEnabled = false;
			}
		},
		onMetamaskChange(data){
			this.onMetamaskComplete(data);
		},
		getPulseClass(pulseId){
			if(this.pulses[pulseId] === null){
				this.pulses[pulseId] = 0;
			}

			let $class = (this.pulses[pulseId]>0)?"pulse-on":"";

			//if(this.pulses[pulseId] > 0 && new Date().getTime() - this.pulses[pulseId] >= 1000 ){
			//	this.pulses[pulseId] = 0;
			//}
			this.pulses[pulseId] = 0;

			return $class;
		},
		getBlock(){
			return this.state.currentBlock;
		},
		getBotVersion(){
			return this.state.botVersion;
		},
		getNetworkId(){
			return this.state.networkId;
		},
		getMultiplierClass(){

			let $mulColor = "";
			if(this.batchData.currentMultiplier/10**8 > 9){
				$mulColor = "mul_4";
			}else if(this.batchData.currentMultiplier/10**8 > 5){
				$mulColor = "mul_3";
			}else if(this.batchData.currentMultiplier/10**8 > 3){
				$mulColor = "mul_2";
			}else if(this.batchData.currentMultiplier/10**8 > 1.5){
				$mulColor = "mul_1";
			}

			return $mulColor;
		},
		displayProviderModal(){
			this.showProviderModal = true;
		},
		hideModal(){
			this.showMSWAddressModal = false;
			this.showProviderModal = false;
		},
		enabled(){
			return this.state.metaEnabled;
		},
		getNetworkName(id) {


			const chain = LS.getChain(id);

			if (chain) return chain.name;
			return "unknown " + id;
		},
		saveProvider(){

			if(this.txtProvider.length != 0){
				this.provider = this.txtProvider;
				this.state.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));
				localStorage.setItem("provider", this.provider);
			}else{
				localStorage.removeItem("provider");
				this.provider = null;
			}
			this.state.metaEnabled = false;
			location.reload();
			this.hideModal();
		},

		getPreciseError : function(error){

			let $err = error+"";
			if(error.message){
				$err = error.message;
			}
			let $txHash = null;
			let $realError = null;
			let $errMsg = null;
			let $jsonStr;

			try{
				if(error.message){
					$errMsg = $err;
					let $index = $errMsg.indexOf("'{");
					if($index != -1){
						$jsonStr = $errMsg.substring($index+1);
						$jsonStr = $jsonStr.substring(0, $jsonStr.length - 1);
						let $jsonErr = JSON.parse($jsonStr);

						let $internalMsg = $jsonErr.value.data.message;

						let $indexMsgPrecision = $internalMsg.indexOf(": revert");
						if($indexMsgPrecision != -1){
							$realError = $internalMsg.substring($indexMsgPrecision + 9);
						}

						let $txKeys = Object.keys($jsonErr.value.data.data);
						$txHash = $txKeys[0];
					}
				}
			}catch($e){
				console.warn("err parsing JSON " + $jsonStr);
			}

			return {
				realError: $realError,
				errMsg: $errMsg,
				fullError: $err,
				txHash: $txHash
			};
		},

		getExplicitError: function($preciseError){
			let $key = Object.keys(REVERT_CODES).find(key => REVERT_CODES[key] == $preciseError);
			if($key){
				return "Revert explicit : " + $key;
			}
			return $preciseError;
		},

		rpcErrorHandler(err, name){
			console.error("Error: " + name + " " + err);
			if((err+"").indexOf("missing trie") != -1){
				this.trieError = true;
				this.$notify({
					title: 'Network error',
					text: 'Network probably has to be reset',
					type:"error"
				});
			}
		},

		tx_rpcErrorHandler(err, name){
			//console.error("Err " + name + " " + err);
			if((err+"").indexOf("missing trie") != -1){
				this.trieError = true;
			} else if((err && err.message+"").indexOf("have the correct nonce") != -1){
				this.$notify({
					title: "Nonce error",
					text: name + ": Please, use the nonce shown in the top bar",
					type:"error",
					duration: 5000,
					closeOnClick:false
				});
			}else{

				if(err.code && err.code == 4001){
					this.$notify({
						title: "Rejected",
						text: name + ": Transaction rejected by user",
						type:"info",
						duration: 5000,
						closeOnClick:false
					});
				}else{
					let $errData = this.getPreciseError(err);

					console.log($errData);

					let $errorTxt = null;
					if($errData.realError){
						$errorTxt = this.getExplicitError($errData.realError);
					}else{
						$errorTxt = $errData.fullError;
					}

					this.$notify({
						title: 'Error ' + name,
						text: ($errorTxt) + ($errData.txHash?("<br /><span>TxId:" + $errData.txHash + "</span>"):""),
						type:"error",
						duration: 10000,
						closeOnClick:false
					});
				}


			}
		},

		tx_rpcSuccessHandler(rcpt, name){
			if(!rcpt){

			}else{
				this.$notify({
					title: "Success",
					text: name + ": Transaction successful",
					type:"success",
					duration: 5000,
					closeOnClick:false
				});
			}
		},

		tick: async function(){

			let $block = await this.state.web3.eth.getBlockNumber().catch(err => {
				console.error("ERR getBlockNumber " + err);
			});

			if($block > this.state.currentBlock){
				this.pulses["block"] = new Date().getTime();
			}
			this.state.currentBlock = $block;

			this.currentNonce = await this.state.web3.eth.getTransactionCount(this.metamaskAddress).catch(err => {
				console.error("Err getTxCount " + err);
			});

			if(this.state.MSWInstance){
				this.state.currentRequiredConfirmations = await this.$bridge.build(this.state.MSWInstance, 'getCurrentRequiredSignatures').callAndTranslate().catch(err => {
					this.contractError = true;
					this.error = "Could not get info from Multisig Wallet. Is the address / network / compatibility correct?"
				});
				this.state.MSWInstanceWrite = new this.state.web3Write.eth.Contract(JSON.parse(this.contractAbi), this.state.selectedMSW.address);
			}

			setTimeout(this.tick, 3000);
		},

	},
}
</script>
