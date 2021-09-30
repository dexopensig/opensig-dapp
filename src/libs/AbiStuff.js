const ethers = require('ethers');
const EthConv = require('@/libs/EthConv');

const ABIStuff = {

	extractFunction: function(payload){
		return payload.substring(2, 10);
	},

	extractBytes: function(payload){
		return payload.substr(10);
	},

	getMethods: function(abiStr){

		let $methods = [];
		let $abi = [];
		try{
			$abi = JSON.parse(abiStr);
		}catch(e){
			console.error("Could not parse ABI STR");
		}

		let $iface = new ethers.utils.Interface(abiStr);

		for(let $method of $abi){
			if($method.type && $method.type == 'function'){

				let $signature = $method.signature;
				if(!$signature){
					$signature = $iface.getSighash($method.name);
				}

				$methods.push({
					name: $method.name,
					signature: $signature,
					inputs: $method.inputs
				});
			}
		}
		return $methods;
	},

	inputMapValid(inputMap){
		let $simples = ['token','timestamp'];

		if($simples.indexOf(inputMap) !== -1){
			return true;
		}

		//tokenOf
		const amountOfRegexp = /^amountOf\((\$|[A-Za-z0-9_]+){1}\)$/g;
		if(inputMap.match(amountOfRegexp))  return true;

		const amountOfArray = /^amountOfArray\([A-Za-z0-9_]+,-?[0-9]+\)$/g;
		if(inputMap.match(amountOfArray)) return true;

		return false;
	},

	getInputs: function(abiStr, hexData){

		if(!abiStr){
			console.warn("GETINPUTS : no ABISTR given");
			return null;
		}
		let $abi = [];
		try{
			$abi = JSON.parse(abiStr);
		}catch(e){
			console.error("Could not parse ABI STR");
			return null;
		}

		let $funcHash = hexData.substr(0, 10);

		try{
			let $iface = new ethers.utils.Interface(abiStr);
			let $func = $iface.getFunction($funcHash);

			let $decoded = $iface.decodeFunctionData($func, hexData);

			return $decoded;
		}catch(e){
			console.warn("Error integrating abi");
		}
		return null;

	},

	getFormattedInputs(abiStr, hexData) {
		const $result = this.getInputs(abiStr, hexData);
		const $inputs = {};

		if($result){
			const $inputsObj = EthConv.resultToObject($result);

			for(let $key in $inputsObj){
				let $strVal = null;
				$strVal = $inputsObj[$key];
				$inputs[$key] = {
					value : $strVal,
					name: $key,
					isArray: typeof $strVal == "object"
				};
			}
			return $inputs;
		}else{
			return null;
		}
	}

};

module.exports = ABIStuff;
