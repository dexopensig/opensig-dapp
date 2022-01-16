const LS = {


	saveTokens(items){ this.saveItems(items, 'tokens') },
	deleteToken(address){ this.deleteItem(address, 'address', 'tokens') },
	getTokens () { return this.getItems('tokens') },
	getToken (address){ return this.getItem(address, 'address', 'tokens') },
	getTokenIndex (address){ return this.getItemIndex(address, 'address', 'tokens') },


	saveContracts(items){ this.saveItems(items, 'contracts') },
	deleteContract(address){ this.deleteItem(address, 'address', 'contracts') },
	getContracts () { return this.getItems('contracts') },
	getContract (address){ return this.getItem(address, 'address', 'contracts') },
	getContractIndex (address){ return this.getItemIndex(address, 'address', 'contracts') },

	saveContacts(items){ this.saveItems(items, 'contacts') },
	deleteContact(address){ this.deleteItem(address, 'address', 'contacts') },
	getContacts () { return this.getItems('contacts') },
	getContact (address){ return this.getItem(address, 'address', 'contacts') },
	getContactIndex (address){ return this.getItemIndex(address, 'address', 'contacts') },

	saveChains(items){ this.saveItems(items, 'chains') },
	deleteChain(id){ this.deleteItem(id, 'id', 'chains') },
	getChains () { return this.getItems('chains') },
	getChain (id){ return this.getItem(id, 'id', 'chains') },
	getChainIndex (id){ return this.getItemIndex(id, 'id', 'chains') },

	saveWallets(items){ this.saveItems(items, 'wallets') },
	deleteWallet(address){ this.deleteItem(address, 'address', 'wallets'); },
	getWallets () { return this.getItems('wallets') },
	getWallet (address){ return this.getItem(address, 'address', 'wallets')},
	getWalletIndex (address){ return this.getItemIndex(address, 'address', 'wallets')},

	saveItems(items, prefName){
		localStorage.setItem('preferences.' + prefName, JSON.stringify(items));
	},

	deleteItem(id, key, prefName){
		let $items = this.getItems(prefName);
		let $index = this.getItemIndex(id, key, prefName);
		if($index != -1){
			$items.splice($index, 1);
			this.saveItems($items, prefName);
		}
	},
	getItems (prefName) {
		let $storedItems = [];
		try {
			$storedItems = JSON.parse(localStorage.getItem('preferences.' + prefName)) || [];
		} catch (err) {

		}
		return $storedItems;
	},
	getItem (id, key, prefName){
		let $w = this.getItems(prefName);
		return $w.find(a => (a[key]+"").toLowerCase() == (id+"").toLowerCase());
	},
	getItemIndex (id, key, prefName){
		let $w = this.getItems(prefName);
		return $w.findIndex(a => (a[key]+"").toLowerCase() == (id+"").toLowerCase());
	},


	saveInputMaps(contractAddress, allMaps){
		allMaps = Object.fromEntries(Object.entries(allMaps)
			.filter(([key, val]) => val != null));
		localStorage.setItem('inputMaps.' + contractAddress.toLowerCase(), JSON.stringify(allMaps));
	},

	getInputMapsOf(contractAddress, signature){
		let $maps = this.getInputMaps(contractAddress);
		if($maps){
			for(const $key in $maps){
				if($key.toLowerCase() == signature.toLowerCase()){
					return $maps[$key];
				}
			}
		}
		return {};
	},

	getInputMaps(contractAddress){

		let {refAddress: $refAddress} = this.getResource(contractAddress);

		let $maps = {};
		try {
			$maps = JSON.parse(localStorage.getItem('inputMaps.' + $refAddress.toLowerCase())) || {};
		} catch (err) {

		}
		return $maps;
	},


	saveSummaries(contractAddress, summaries){
		summaries = Object.fromEntries(Object.entries(summaries).
			filter(([key, val]) => val != null));
		localStorage.setItem('summaries.' + contractAddress.toLowerCase(), JSON.stringify(summaries));
	},

	getSummaries(contractAddress){
		let {refAddress: $refAddress} = this.getResource(contractAddress);

		let $maps = {};
		try {
			$maps = JSON.parse(localStorage.getItem('summaries.' + $refAddress.toLowerCase())) || {};
		} catch (err) {

		}
		return $maps;
	},

	getResource(address, $types=[]){
		let $contract = this.getContract(address);
		if($contract){ return {abi: $contract.abi, refAddress: $contract.address, targetAddress: $contract.address, name: $contract.name} }

		if(!$types.length || $types.indexOf('wallet') !== -1){
			let $wallet = this.getWallet(address);
			if($wallet){
				$contract = this.getContract($wallet.referenceContract);
				if($contract){
					return {abi: $contract.abi, refAddress: $contract.address, targetAddress: address, name: $contract.name}
				}
			}
		}

		if(!$types.length || $types.indexOf('token') !== -1){
			let $token = this.getToken(address);
			if($token){
				if($token.abi){
					return {abi: $token.abi, refAddress: $token.address, targetAddress: address, name: $token.name}
				}
				let $erc = this.getContract($token.referenceContract);
				if($erc){
					return {abi: $erc.abi, refAddress: $erc.address, targetAddress: address, name: $token.name};
				}
			}
		}

		if(!$types.length || $types.indexOf('contacts') !== -1){
			let $contact = this.getContact(address);
			if($contact){
				return {abi: null, refAddress: null, targetAddress: address, name: $contact.name}
			}
		}

		return {abi: null, refAddress: null, targetAddress: null, name: null};
	},

	saveWalletMap(address, mapData){
		localStorage.setItem('walletMap.' + address.toLowerCase(), JSON.stringify(mapData));
	},

	getWalletMap(address){
		let $map = {};
		try {
			$map = JSON.parse(localStorage.getItem('walletMap.' + address.toLowerCase())) || {};
		} catch (err) {

		}
		return $map;
	}

};

module.exports = LS;
