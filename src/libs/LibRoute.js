const LibRoute = {

	component : null,

	initRoute(component){
		this.component = component;
	},
	isLinkActive(path, fullPath=true) {
		let $index = fullPath?'fullPath':'path';

		if(path == "/"){
			return this.component.$route[$index] == path;
		}
		return this.component.$route[$index].startsWith(path)
	},

	isLinkExact(path){
		return this.component.$route.fullPath == path;
	}

};

module.exports = LibRoute;
