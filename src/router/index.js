import { createWebHistory, createRouter } from "vue-router";

import Overview from "../views/wallet/overview/Overview"
import Permissions from "../views/wallet/permissions/Permissions"
import Transactions from "../views/wallet/transactions/Transactions"
import Assets from "../views/wallet/assets/Assets"
import Wallet from "../views/wallet/Wallet"

import TransactionDetails from "../views/transactionDetails/TransactionDetails"

import Settings from "../views/settings/Settings"

import SettingsWallets from "../views/settings/wallets/Wallets"
import SettingsWalletsAdd from "../views/settings/wallets/AddWallet"
import SettingsWalletsEdit from "../views/settings/wallets/EditWallet"
import SettingsWalletsMap from "../views/settings/wallets/MapWallet"


import SettingsTokens from "../views/settings/tokens/Tokens"
import SettingsTokensAdd from "../views/settings/tokens/AddToken"
import SettingsTokensEdit from "../views/settings/tokens/EditToken"

import SettingsContracts from "../views/settings/contracts/Contracts"
import SettingsContractsAdd from "../views/settings/contracts/AddContract"
import SettingsContractsEdit from "../views/settings/contracts/EditContract"
import SettingsContractsMethods from "../views/settings/contracts/ContractMethods"


import SettingsAddresses from "../views/settings/addresses/Addresses"
import SettingsAddressesEdit from "../views/settings/addresses/EditAddress"
import SettingsAddressesAdd from "../views/settings/addresses/AddAddress"

import SettingsChains from "../views/settings/chains/Chains"
import SettingsChainsEdit from "../views/settings/chains/EditChain"
import SettingsChainsAdd from "../views/settings/chains/AddChain"


import SettingsExport from "../views/settings/Export"
import SettingsImport from "../views/settings/Import"
import SettingsReset from "../views/settings/Reset"

import Home from "../views/home/Home"

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home
	},
	{
		path: "/tx/:walletAddress/:transactionId",
		name: "TransactionDetails",
		component: TransactionDetails,
	},
	{
		path: "/wallet",
		name: "Wallet",
		component: Wallet,
		children: [
			{
				path: "",
				name: "Overview",
				component: Overview,
			},
			{
				path: "transactions",
				name: "Transactions",
				component: Transactions,
			},
			{
				path: "permissions",
				name: "Permissions",
				component: Permissions,
			},
			{
				path: "assets",
				name: "Assets",
				component: Assets,
			},
		]
	},
	{
		path: "/settings",
		name: "Settings",
		component: Settings,
		children: [
			{
				path: "wallets",
				name: "SettingsWallets",
				component: SettingsWallets,
				children: [
					{
						path: "add",
						name: "SettingsWalletsAdd",
						component: SettingsWalletsAdd,
					},
					{
						path: ":address",
						name: "SettingsWalletsEdit",
						component: SettingsWalletsEdit,
					},
					{
						path: ":address/map",
						name: "SettingsWalletsMap",
						component: SettingsWalletsMap,
					},
				]
			},
			{
				path: "tokens",
				name: "SettingsTokens",
				component: SettingsTokens,
				children: [
					{
						path: "add",
						name: "SettingsTokensAdd",
						component: SettingsTokensAdd,
					},
					{
						path: ":address",
						name: "SettingsTokensEdit",
						component: SettingsTokensEdit,
					},
				]
			},
			{
				path: "contracts",
				name: "SettingsContracts",
				component: SettingsContracts,
				children: [
					{
						path: "add",
						name: "SettingsContractsAdd",
						component: SettingsContractsAdd,
					},
					{
						path: ":address",
						name: "SettingsContractsEdit",
						component: SettingsContractsEdit,
					},
					{
						path: ":address/methods",
						name : "SettingsContractsMethods",
						component: SettingsContractsMethods
					}
				]
			},
			{
				path: "addresses",
				name: "SettingsAddresses",
				component: SettingsAddresses,
				children: [
					{
						path: "add",
						name: "SettingsAddressesAdd",
						component: SettingsAddressesAdd,
					},
					{
						path: ":address",
						name: "SettingsAddressesEdit",
						component: SettingsAddressesEdit,
					},
				]
			},
			{
				path: "chains",
				name: "SettingsChains",
				component: SettingsChains,
				children: [
					{
						path: "add",
						name: "SettingsChainsAdd",
						component: SettingsChainsAdd,
					},
					{
						path: ":id",
						name: "SettingsChainsEdit",
						component: SettingsChainsEdit,
					},
				]
			},
			{
				path: "export",
				name: "SettingsExport",
				component: SettingsExport,
			},
			{
				path: "import",
				name: "SettingsImport",
				component: SettingsImport,
			},
			{
				path: "reset",
				name: "SettingsReset",
				component: SettingsReset,
			},
		]
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
