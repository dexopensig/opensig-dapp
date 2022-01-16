<template>
	<span class="truncated_address">
		<a target="_blank" :href="getLink()" >
			{{truncateAddr(address)}}
		</a>
	</span>
</template>

<script>

import { useState } from '@/store';

export default {
	props: {
		address: {default: ""},
		privateSeed: {default: 0},
		explorer: {default: ""},
		truncate: {default: false, type: Boolean},
	},
	setup() {
		return {state: useState()}
	},
	created() {
		//this.address = this.address + "";
	},

	methods: {

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


		truncateAddr: function (addr) {
			addr = addr + "";
			if(this.privateSeed>0){

				let addrArr = addr.substring(2).split('');
				addrArr = this.shuffle(addrArr, this.privateSeed);
				let shuffld = '0x' + addrArr.join('');

				return shuffld.substring(0, 6) + "[...]" + shuffld.substr(-4)
			}
			return addr.substring(0, 6) + "[...]" + addr.substr(-4)
		},
		getLink: function () {
			return this.state.currentChain.explorer + "/address/" + this.address;
		},
	}
}
</script>
