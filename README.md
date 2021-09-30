# OpenSig

OpenSig is an EVM compatible Multi Signature Wallet interface
The main features are base on [Consensys MultiSigWallet](https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol)

### Human readable
Transactions are easy to read and configurable
### Flexible
Map any compatible Consensys MultiSigWallet Smart contract ot OpenSig interface
#### Local
Zero server access (except cdn static assets). All your preferences stored in your browser's local storage. The only logs will be the ones from your RPC endpoint provider (like Infura)
#### MultiMask Extension
OpenSig Multi signature wallet works best combined with MultiMask (a fork supporting proxied MultiSig wallets)

####Requirements
Metamask or compatible Web3 injected extension. We recommend to use MultiMask, a forked metamask extension to be able to sign through proxied MultiSig
Consensys based MultiSig wallet. As the main features of OpenSig rely on the Consensys MultiSig Standards, make sure your smart contract fit with the main features. (RSV/erecover signing is not supported)
Getting started
1. Create an abstract Interface
Create an abstract contract interface using the ABI of your MultiSig Contract Contract address should start with "0xAbstract_".
You an take use Consensys MultiSigWallet as a reference to deploy your contract

2. Deploy your contract. Deploy your MultiSig Wallet contract

3. Add a new wallet. Add a new wallet in your preferences filling your deployed contract address and reference the above abstract address

4. Mapping. Map the methods of your contract to OpenSig's interface. You can use and upload this template based on Consensys MultiSig

5. Select your wallet. Select your wallet to use with OpenSig.

6. Use your wallet.


| Interface | Description | Output | Type | 
| :---        |    :----:   |          ---: |          ---: |
| getTransactionsCount | 	Getting the transactions count of the wallet | uint | Read |
| getSignersCount | 	Getting number of allowed signers | - | Read |
| getCurrentRequiredSignatures | 	Getting current number of required signatures | uint | Read |
| getSignersAddresses | 	Getting the addresses of the allowed signers | address[] | Read |
| getSignersAddressesOfTx | (transactionId)	Getting addresses of the signers for a specific submitted transaction | address[] | Read |
| getTransactionDetails | (transactionId)	Getting the transaction details of a specific transaction | - | Read |
| addSigner | (address)	Add a new signer for the wallet | - | Write |
| removeSigner | (address)	Remove an existing signer from the wallet | - | Write |
| submitTransaction | (destination, value, payload)	Submit a new transaction to the MultiSig contract | - | Write |
| signTransaction | (transactionId)	Sign an existing transaction | - | Write |
| unsignTransaction | (transactionId)	Remove a signature from a specific transaction | - | Write |


## developers
`npm run build`
