<template>
	<div id="home">
		<h1>OpenSig</h1>
		<p class="jumbo">
			OpenSig is an EVM compatible Multi Signature Wallet interface<br />
			The main features are base on <a href="https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol" target="_blank">Consensys MultiSigWallet</a>
		</p>

		<div>
			<div class="row">
				<div class="col-3">
					<div class="card card-home">
						<div class="card-header">
							<div class="card-title">Human readable</div>
						</div>
						<div class="card-body text-center">
							Transactions are easy to read and configurable
						</div>
					</div>
				</div>
				<div class="col-3">
					<div class="card card-home">
						<div class="card-header">
							<div class="card-title">Flexible</div>
						</div>
						<div class="card-body text-center">
							Map any compatible Consensys MultiSigWallet Smart contract ot OpenSig interface
						</div>
					</div>
				</div>
				<div class="col-3">
					<div class="card card-home">
						<div class="card-header">
							<div class="card-title">Local</div>
						</div>
						<div class="card-body text-center">
							Zero server access (except cdn static assets). All your preferences stored in your browser's local storage.
							The only logs will be the ones from your RPC endpoint provider (like Infura)
						</div>
					</div>
				</div>
				<div class="col-3">
					<div class="card card-home">
						<div class="card-header">
							<div class="card-title">MultiMask Extension</div>
						</div>
						<div class="card-body text-center">
							OpenSig Multi signature wallet works best combined with MultiMask (a fork supporting proxied MultiSig wallets)
						</div>
					</div>
				</div>
			</div>
		</div>


		<h3>Requirements</h3>
		<ul class="home-list">
			<li><b>Metamask</b> or compatible Web3 injected extension. We recommend to use MultiMask, a forked metamask extension to be able to sign through proxied MultiSig</li>
			<li>
				<b>Consensys based MultiSig wallet</b>. As the main features of OpenSig rely on the <a href="#standards">Consensys MultiSig Standards</a>, make sure your smart contract fit with the main features. (RSV/erecover signing is not supported)
			</li>
		</ul>

		<h3>Getting started</h3>
		<h5>1 : Create an abstract Interface</h5>
		<p>
			<router-link to="/settings/contracts/add">Create an abstract contract interface</router-link> using the ABI of your MultiSig Contract Contract address should start with "0xAbstract_".<br />
			You an take use <a href="https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol" target="_blank" >Consensys MultiSigWallet</a> as a reference to deploy your contract
		</p>
		<h5>2 : Deploy your contract</h5>
		<p>
			Deploy your MultiSig Wallet contract
		</p>
		<h5>3 : Add a new wallet</h5>
		<p>
			<router-link to="/settings/wallets/add">Add a new wallet</router-link> in your preferences filling your deployed contract address and reference the above abstract address
		</p>
		<h5>4 : Mapping</h5>
		<p>
			<router-link to="/settings/wallets">Map the methods</router-link> of your contract to OpenSig's interface.
			You can use and upload this template based on Consensys MultiSig
		</p>
		<h5>5 : Select your wallet</h5>
		<p>
			<router-link to="/settings/wallets">Select your wallet</router-link> to use with OpenSig.
		</p>
		<h5>6 : Use your wallet</h5>
		<p>
			<router-link to="/wallet">Use your wallet</router-link>
		</p>



		<h3 id="standards">Consensys MultiSig Standards</h3>
		<table class="table">
			<tr>
				<td>Read</td>
				<td>getTransactionsCount</td>
				<td>Getting the transactions count of the wallet (uint)</td>
			</tr>
			<tr>
				<td>Read</td>
				<td>getSignersCount</td>
				<td>Getting number of allowed signers</td>
			</tr>
			<tr>
				<td>Read</td>
				<td>getCurrentRequiredSignatures</td>
				<td>Getting current number of required signatures (uint)</td>
			</tr>
			<tr>
				<td>Read</td>
				<td>getSignersAddresses</td>
				<td>Getting the addresses of the allowed signers (address[])</td>
			</tr>

			<tr>
				<td>Read</td>
				<td>getSignersAddressesOfTx(transactionId)</td>
				<td>Getting addresses of the signers for a specific submitted transaction (address[])</td>
			</tr>

			<tr>
				<td>Read</td>
				<td>getTransactionDetails(transactionId)</td>
				<td>Getting the transaction details of a specific transaction</td>
			</tr>

			<tr>
				<td>Write</td>
				<td>addSigner(address)</td>
				<td>Add a new signer for the wallet</td>
			</tr>
			<tr>
				<td>Write</td>
				<td>removeSigner(address)</td>
				<td>Remove an existing signer from the wallet</td>
			</tr>

			<tr>
				<td>Write</td>
				<td>submitTransaction(destination, value, payload)</td>
				<td>Submit a new transaction to the MultiSig contract</td>
			</tr>

			<tr>
				<td>Write</td>
				<td>signTransaction(transactionId)</td>
				<td>Sign an existing transaction</td>
			</tr>
			<tr>
				<td>Write</td>
				<td>unsignTransaction(transactionId)</td>
				<td>Remove a signature from a specific transaction</td>
			</tr>
		</table>

		<h3>GitHub</h3>
		<p>
			<a href="https://github.com/dexopensig/opensig-dapp" target="_blank">Source code here</a>
		</p>
	</div>
</template>

<script>

export default {
	name: "Home",
}
</script>
