import { reactive, provide, inject } from 'vue';

export const stateSymbol = Symbol('state');
export const createState = () => reactive({
	networkId: 0,
	selectedMSW: {
		address: null,
		explorer: null,
	},
	metamaskAddress:null,

	currentBlock:null,
	currentRequiredConfirmations: null,

	metaEnabled: false,
	web3Write: null,
	web3: null,
	MSWInstance: null,

	explorer: "https://bscscan.com",

	displayNonce: false
});

export const useState = () => inject(stateSymbol);
export const provideState = () => provide(
	stateSymbol,
	createState()
);
