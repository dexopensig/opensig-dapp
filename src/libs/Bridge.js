const LS = require('@/libs/LS');
const placeholder = 'placeholder';
const Bridge = {

	maps: {
		getTransactionsCount: {passedArgs:[]},
		getSignersCount: {passedArgs:[]},
		getCurrentRequiredSignatures: {passedArgs:[]},
		getSignersAddresses: {passedArgs:[]},

		getSignersAddressesOfTx: {passedArgs:['transactionId']},

		getTransactionDetails: {passedArgs:['transactionId']},

		signTransaction: {passedArgs:['transactionId']},
		unsignTransaction: {passedArgs:['transactionId']},

		addSigner: {passedArgs:['address']},
		removeSigner: {passedArgs:['address']},

		submitTransaction: {passedArgs:['destination', 'value', 'data']},
	},

	setup(walletAddress){
		for(let $methodName in this.maps){
			this.maps[$methodName].method = null;
			this.maps[$methodName].abiArgs = null;
			this.maps[$methodName].transform = null;
		}

		const $walletMap = LS.getWalletMap(walletAddress);

		for(let $m of $walletMap){
			this.maps[$m.bridgeMethod].method = $m.mappedAbiMethod;
			if($m.mappedAbiArgs){
				this.maps[$m.bridgeMethod].abiArgs = $m.mappedAbiArgs.map(a => {
					return a.map;
				});
			}
			if($m.transform){
				this.maps[$m.bridgeMethod].transform = [];
				for(let $i in $m.transform){
					this.maps[$m.bridgeMethod].transform = [{
						type: $m.transform.type,
						data: $m.transform.data
					}];
				}
			}
		}
	},

	build(instance, index, args){
		if(this.maps[index]){
			const $mappedArgs = [];
			for(let $a of this.maps[index].abiArgs){
				let $refVal = $a;
				let $type = 'placeholder';
				if(typeof $a == 'object'){
					$refVal = $a.value;
					$type = $a.type;
				}

				if($type == 'placeholder'){
					if(typeof args[$refVal] !== 'undefined' && args[$refVal] !== null){
						$mappedArgs.push(args[$refVal]);
					}else{
						console.error("Bridge: mapped arg not found : " + $refVal);
					}
				}else{
					$mappedArgs.push($a);
				}
			}

			let $func = instance.methods[this.maps[index].method].apply(null, $mappedArgs);
			$func.callAndTranslate = function($f, $transforms){
				return async function(){
					let $res = await $f.call().catch(err => {
						throw new Error("callAndTranslate: " + err);
					});
					if($transforms){
						for(let $t of $transforms){
							$res = Bridge.transform($res, $t);
						}
					}
					return $res;
				}
			}($func, this.maps[index].transform);
			return $func;
		}
		return {
			call(){return null;},
			estimateGas(){return null;},
			send(){return null;},
			callAndTranslate(){return null;},
			encodeABI(){return null;}
		}
	},

	transform: function($value, $transform){
		if($transform.type == 'length'){
			return $value.length;
		}else if($transform.type == 'map'){
			let $transformed = {};

			for(let $key in $transform.data){
				let $ref = $transform.data[$key];
				$transformed[$key] = $value[$ref];
			}
			$value = $transformed;
		}
		return $value;
	}

};

module.exports = Bridge;
