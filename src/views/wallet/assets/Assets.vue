<template>
	<div>
		<div v-if="loading">
			Loading...
		</div>
		<div v-else>
			<div class="mb-3">
				{{ tokens.length }} known tokens
			</div>
			<div
				v-if="error"
				class="alert alert-danger"
			>
				{{ error }}
			</div>
			<table class="table table-hoverstyle">
				<thead>
					<tr>
						<th colspan="4">
							Tokens
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="cell-narrow">
							<identicon-address address="native" />
						</td>
						<td>
							{{ state.currentChain.symbol }}
						</td>
						<td>
							{{ humanBalance(nativeBalance, 18) }}
						</td>
						<td class="text-end">
							<button
								class="btn btn-sm btn-primary"
								@click="showSendModal('native')"
							>
								Send
							</button>
						</td>
					</tr>
					<tr
						v-for="(item, index) in tokens"
						:key="index"
					>
						<td class="cell-narrow">
							<img
								v-if="item.imgExists"
								class="asset-image"
								:src="`/icons/${item.address.toLowerCase()}.png`"
								@error="item.imgExists=false"
							>
							<identicon-address
								v-else
								:address="item.address"
								:size="24"
							/>
						</td>
						<td>
							{{ item.symbol }}
						</td>
						<td>
							{{ humanBalance(item.balance, item.decimals) }}
						</td>
						<td class="text-end">
							<button
								class="btn btn-sm btn-primary"
								@click="showSendModal(item.address)"
							>
								Send
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<vue-final-modal
			v-model="sendModalShown"
			classes="modal-container"
			content-class="modal-content"
		>
			<div class="card">
				<div class="card-header">
					<div
						v-if="!pendingTxTransfer"
						class="card-title mt-2 ms-3"
					>
						Send {{ tokenToSend.symbol }}
					</div>
					<div v-else>
						<font-awesome-icon
							icon="spinner"
							spin
						/>
						Pending transaction
					</div>
				</div>
				<div class="card-body">
					<div class="mb-3">
						<label class="form-label">Amount</label>
						<input
							v-model="txtAmount"
							class="form-control"
						>
					</div>
					<div>
						<label class="form-label">Destination address</label>
						<input
							v-model="txtAddress"
							class="form-control"
						>
						<div
							v-if="txtAddress.length"
							class="mt-3"
						>
							<div
								v-if="knownAddress"
								class="alert alert-info"
							>
								<font-awesome-icon icon="check" />
								{{ knownAddress }}
							</div>
							<div
								v-else
								class="alert alert-warning"
							>
								<font-awesome-icon icon="exclamation-triangle" />
								Address unknown
							</div>
						</div>
					</div>
				</div>
				<div class="card-footer text-end">
					<button
						class="btn btn-primary"
						@click="send()"
					>
						Send
					</button>
				</div>
			</div>
		</vue-final-modal>
	</div>
</template>

<style scoped>
.asset-image {
	width: 24px;
	height: 24px;
}

::v-deep .modal-container {
	display: flex;
	justify-content: center;
	align-items: center;
}

::v-deep .modal-content {
	border-radius: 8px;
	background-color: rgba(0, 0, 0, 0.3);
	border: 0;
	max-width: 600px;
	flex-direction: column;
	margin: 0 1rem;
	padding: 1rem;
}

.modal__title {
	font-size: 1.5rem;
	font-weight: 700;
}
</style>

<script>

const BigNumber = require('bignumber.js');
import {watch, toRefs} from 'vue';
import {useState} from '@/store';
import IdenticonAddress from "@/components/IdenticonAddress";

const LS = require("@/libs/LS");
import {$vfm, VueFinalModal, ModalsContainer} from 'vue-final-modal';

const ERC20ABI = require("@/constants/erc20");
const ROUTERABI = require("@/constants/router");


export default {
	name: "Tokens",
	components: {IdenticonAddress, VueFinalModal},
	props: {
		metaEnabled: {
			type: Boolean
		},
	},
	data() {
		return {
			loading: false,
			nativeBalance: 0,
			tokens: [],
			sendModalShown: false,
			tokenToSend: {},
			txtAmount: 0,
			txtAddress: "",

			error: null,
			pendingTxTransfer: false,
		};
	},
	setup(props) {
		let {metaEnabled, prop1} = toRefs(props);

		return {state: useState()};
	},
	computed: {
		knownAddress() {
			debugger;
			const {name: $name} = LS.getResource(this.txtAddress);
			return $name;
		}
	},
	mounted() {
		const $tokens = LS.getTokens();
		this.tokens = $tokens.map(a => {
			a.balance = 0;
			a.imgExists = true;
			return a;
		});

		if (this.state.metaEnabled) {
			this.fetchTokensBalances();
		}
	},

	methods: {
		showSendModal(address) {
			let $t;
			if (address == "native") {
				$t = {
					symbol: 'native',
					decimals: 18,
					address: 'native'
				};
			} else {
				$t = this.tokens.find(a => a.address.toLowerCase() == address.toLowerCase());
			}
			this.tokenToSend = $t;
			this.sendModalShown = true;
		},

		send: async function () {

			this.error = null;
			this.sendModalShown = false;

			//CHECKSUM
			if (!this.txtAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
				this.error = "Invalid Address";
				return;
			}

			if (isNaN(this.txtAmount) || this.txtAmount <= 0) {
				this.error = "Invalid Amount";
				return;
			}

			//estimate gas
			let $txData;
			let $value = 0;
			let $destination;
			if (this.tokenToSend.address == 'native') {
				$txData = "0x";
				$value = new BigNumber(this.txtAmount).times(10 ** this.tokenToSend.decimals).toFixed(0);
				$destination = this.txtAddress;
			} else {
				$destination = this.tokenToSend.address;
				let $tInstance = new this.state.web3Write.eth.Contract(ERC20ABI, this.tokenToSend.address);
				try {
					$txData = $tInstance.methods.transfer(
						this.txtAddress,
						new BigNumber(this.txtAmount).times(10 ** this.tokenToSend.decimals).toFixed(0)
					)
						.encodeABI();
				} catch (e) {
					this.error = e;
					return;
				}
			}

			const $tx = this.$bridge.build(this.state.MSWInstance, 'submitTransaction', {
				destination: $destination,
				value: $value,
				data: $txData
			});

			let $estGas = await $tx.estimateGas({
				from: this.state.metamaskAddress,
				gasLimit: 9000000,
			}).catch(err => {
				if (err) {
					this.error = "Error while estimating gas " + err;
				}
			});

			this.pendingTxTransfer = true;

			$tx.send({
				from: this.state.metamaskAddress,
				gasLimit: $estGas || 500000,
			})
				.catch(err => {
					this.error = err;
					this.pendingTxTransfer = false;
				})
				.then(rcpt => {
					this.pendingTxTransfer = false;
				});
		},

		humanBalance(amount, decimals) {
			return new BigNumber(amount).div(10 ** decimals).toFixed(4);
		},

		fetchTokensBalances: async function () {

			this.nativeBalance = await this.state.web3.eth.getBalance(this.state.selectedMSW.address).catch(err => {
				console.error("could not get native balance");
			});

			for (let $t of this.tokens) {
				let $tInstance = new this.state.web3.eth.Contract(ERC20ABI, $t.address);
				let $b = await $tInstance.methods.balanceOf(this.state.selectedMSW.address).call().catch(err => {
					console.log("Err getting token balance " + $t.address);
				});
				if ($b) {
					$t.balance = $b;
				}
			}

		}

	}
};
</script>
