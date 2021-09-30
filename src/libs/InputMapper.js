const LS = require('@/libs/LS');
const EthConv = require('@/libs/EthConv');
const AbiStuff = require('@/libs/AbiStuff');

const InputMapper = {

	mapTimestamp($value){
		return {
			type: "timestamp",
			timestamp: $value
		}
	},

	mapAmountOf($value, $reference){
		let $ercAddress = $reference;

		let $token = LS.getToken($ercAddress);
		if($token){
			return {
				type: "tokenAmount",
				decimals: $token.decimals,
				symbol: $token.symbol,
				tokenAddress: $ercAddress,
				humanValue: EthConv.fromWei($value, $token.decimals, 4),
				value: $value,
			}
		}
		return null;
	},

	mapAmountOfArray($value, $reference, $index){
		let $arrVal = Object.values($reference);

		if($index < 0){
			$index = $arrVal.length + $index*1;//index = negative
		}

		let $ercAddress = $arrVal[$index];

		let $token = LS.getToken($ercAddress);
		if($token){
			return {
				type: "tokenAmount",
				decimals: $token.decimals,
				symbol: $token.symbol,
				tokenAddress: $ercAddress,
				humanValue: EthConv.fromWei($value, $token.decimals, 4),
				value: $value,
			}
		}
		return null;
	},

	getMappedInputs($targetAddress, $refAddress, $abiStr, $hexData){
		let $mappedInputs = {};
		let $formattedInputs = AbiStuff.getFormattedInputs($abiStr, $hexData);

		let $signature = "0x" + AbiStuff.extractFunction($hexData);
		let $methods = AbiStuff.getMethods($abiStr);
		let $method = $methods.find(a => a.signature.toLowerCase() == $signature);

		if(!$method){
			return $mappedInputs;
		}

		let $inputMaps = LS.getInputMapsOf($refAddress, $signature);
		for(let $i in $formattedInputs){
			let $mappedData = null;
			const $input = $formattedInputs[$i];
			let $mapFunc = $inputMaps[$input.name];
			let $val = $input.value;
			if($mapFunc){

				//timestamp
				let $matches;
				if($mapFunc == 'timestamp'){
					$mappedData = InputMapper.mapTimestamp($input.value*1000);

				}else if(($matches = $mapFunc.match(/^amountOf\((\$|[_A-Za-z0-9]+){1}\)$/)) && $matches){
					let $refVal;
					if($matches[1] != '$') {
						if($formattedInputs[$matches[1]]) {
							$refVal = $formattedInputs[$matches[1]].value;
						}
					}else {
						$refVal = $targetAddress;
					}

					if($refVal) {
						$mappedData = this.mapAmountOf(
							$val,
							$refVal,
						);
					}else {
						console.error("amountOf: Could not find input ref key " + $matches[1]);
						console.log($formattedInputs);
					}
				}else if(($matches = $mapFunc.match(/^amountOfArray\(([^,]+),(-?[0-9]+)\)$/)) && $matches){

					let $ref = $formattedInputs[$matches[1]];
					if($ref) {
						$mappedData = this.mapAmountOfArray(
							$val,
							$ref.value,
							$matches[2],
						);
					}else {
						console.error("amountOfArray: Could not find input ref key " + $matches[1]);
						console.log($formattedInputs);
					}
				}
			}

			$mappedInputs[$input.name] = {
				name: $input.name,
				mappedData : $mappedData,
				value: $val,
			}
		}
		return $mappedInputs;
	}


};

module.exports = InputMapper;
