const BigNumber = require("bignumber.js");

const ethConv = {

	ONE_GWEI: 10**9,
	ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",

	fromWei: function($wei, $decimals, $displayDecimals){
		$decimals = $decimals || 18;
		$displayDecimals = $displayDecimals || 2
		return new BigNumber($wei).div(10**$decimals).toFixed($displayDecimals);
	},

	toWei: function($human, $decimals){
		$decimals = $decimals || 18;
		return new BigNumber($human).times(10**$decimals).toFixed(0);
	},

	addrEqual: function(addr1, addr2){
		if(addr1 == null){
			addr1 = "";
		}
		if(addr2 == null){
			addr2 = "";
		}

		addr1 = addr1.toLowerCase();
		addr2 = addr2.toLowerCase();

		return addr1 == addr2;
	},

	addrInArray : function($address, $array){
		return ($array.toString().toLowerCase()).indexOf($address.toLowerCase()) !== -1;
	},

	resultToObject: function($result, $isArray, $level) {
		let $obj;

		$level = $level || 0;

		if(!$isArray){
			$obj = {};
			let $len = Object.values($result).length;
			let $half = $len / 2;
			let $count = 0;

			for (let $i in $result) {
				if ($count < $half) {
				} else {
					$obj[$i] = $result[$i];
				}
				$count++;
			}
		} else {
			$obj = $result;
		}

		let $finalObj = {};
		for (let $i in $obj) {
			if(typeof $obj[$i] == "object" && $obj[$i]._isBigNumber){
				$finalObj[$i] = $obj[$i].toString();
			}else if (typeof $obj[$i] == "object") {
				let $keys = Object.keys($obj[$i]);

				let $uniqueKeys = 0;
				let $numberedKeys = 0;

				let $isObj = false;
				let $keyIndex = 0;
				for(let $ki in $keys){
					if($keys[$ki] != $keyIndex){
						$isObj = true;
						break;
					}
					$keyIndex++;
				}

				if($isObj){
					$finalObj[$i] = this.resultToObject($obj[$i], false, $level + 1);
				}else{
					$finalObj[$i] = this.resultToObject($obj[$i], true, $level + 1);
				}

			}else{
				$finalObj[$i] = $obj[$i];
			}
		}

		return $finalObj;
	},

	truncateAddr: function (addr, privateSeed) {
		addr = addr + "";
		if(privateSeed>0){
			let addrArr = addr.substring(2).split('');
			addrArr = this.shuffle(addrArr, privateSeed);
			let shuffld = '0x' + addrArr.join('');

			return shuffld.substring(0, 6) + "[...]" + shuffld.substr(-4)
		}
		return addr.substring(0, 6) + "[...]" + addr.substr(-4)
	},

	shuffle(array, seed) {                // <-- ADDED ARGUMENT
		var m = array.length, t, i;

		// While there remain elements to shuffle…
		while (m) {

			// Pick a remaining element…
			i = Math.floor(this.random(seed) * m--);        // <-- MODIFIED LINE

			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
			++seed                                     // <-- ADDED LINE
		}

		return array;
	},

	random(seed) {
		var x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	},
};

module.exports = ethConv;
