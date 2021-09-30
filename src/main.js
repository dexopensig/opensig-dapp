import 'bootstrap/dist/css/bootstrap.min.css'
import { Vue, createApp, reactive} from 'vue'
import App from './views/App.vue'
import router from './router'
import {stateSymbol, createState} from './store'
import './assets/main.scss'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VTooltip from 'v-tooltip'
import ABIStuff from './libs/AbiStuff';

import Notifications from '@kyvg/vue3-notification'
import dayjs from 'dayjs';
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);
import LibRoute from "./libs/LibRoute";
import EthConv from "./libs/EthConv";
import Bridge from "./libs/Bridge";

import TruncatedAddress from "./components/TruncatedAddress";
import BytesFormatter from "./components/BytesFormatter";
import InputsFormatter from "./components/InputsFormatter";
import MappedInputsFormatter from "./components/MappedInputsFormatter";
import InputAutoValue from "./components/InputAutoValue";
import IdenticonAddress from "./components/IdenticonAddress";
import HumanAddress from "./components/HumanAddress";
import MethodSummary from "./components/MethodSummary";

library.add(fas);

const VueApp = createApp(App)
	.use(router)
	.use(Notifications)
	.use(VTooltip)
	.component('font-awesome-icon', FontAwesomeIcon)
	.component('bytes-formatter', BytesFormatter)
	.component('inputs-formatter', InputsFormatter)
	.component('truncated-address', TruncatedAddress)
	.component('identicon-address', IdenticonAddress)
	.component('input-auto-value', InputAutoValue)
	.component('human-address', HumanAddress)
	.component('method-summary', MethodSummary)
	.component('mapped-inputs-formatter', MappedInputsFormatter)
	.provide(stateSymbol, createState());

VueApp.config.globalProperties.$dayjs = dayjs;
VueApp.config.globalProperties.$AbiStuff = ABIStuff;
VueApp.config.globalProperties.$libRoute = LibRoute;
VueApp.config.globalProperties.$EthConv = EthConv;
VueApp.config.globalProperties.$bridge = Bridge;


VueApp.mount("#app");
