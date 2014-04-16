Console = Ember.Object.extend({
	baseConsole: undefined,
	author: undefined,
	tags: [],
	mutedTags: [],
	filter: undefined,
	displayStacks: false,
	stacks: [],

	init: function() {
		if(localStorage.getItem("console.mutedTags") !== undefined) {
			console.log("load settings from localStorage, if possible");
			this.mutedTags = localStorage.getItem("console.mutedTags").split(",");
			this.filter = localStorage.getItem("console.filter");
		}
		var scripts = document.getElementsByTagName("script");
		var scriptName = (document.currentScript || scripts[scripts.length - 1]).src;
		scriptName = scriptName.split("/");
		scriptName = scriptName[scriptName.length - 1];

		this.setAuthor(scriptName);
	},

	log: function() {
		if(this.baseConsole !== undefined) {

			var args = [];

			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			};

			if(!! this.displayStacks) {
				var err = new Error();

				this.stacks.push(err.stack);
				args.unshift("[>" + this.stacks.length + "]")
			}

			if(this.tags !== undefined) {
				for (var i = this.tags.length - 1; i >= 0 ; i--) {
					if (this.mutedTags.contains(this.tags[i])) { return; };
					args.unshift("["+ this.tags[i] +"]");
				};
			}

			if(this.filter !== "" && this.filter !== undefined && this.filter !== null) {
				for (var i = 0; i < args.length; i++) {
					if(typeof args[i] === "string") {
						var regex = new RegExp(this.filter);
						if(regex.test(args[i])) {
							return;
						}
					}
				};
			};


			this.baseConsole.log.apply(this.baseConsole, args);
		}
	},

	addTag: function(tag){
		this.tags.push(tag);
	},

	removeTag: function(tag){
		for (var i = 0; i < this.tags.length; i++) {
			if(this.tags[i] === tag) {
				this.tags.splice(i, 1);
				return;
			}
		};
	},

	flushTags: function(){
		this.tags = [];
		this.tags.push(this.author);
	},

	setAuthor: function(author) {
		this.author = author;
		this.tags.push(this.author);
	},

	muteTag: function(tag) {
		this.mutedTags.push(tag);
	},

	unmuteTag: function(tag) {
		for (var i = 0; i < this.mutedTags.length; i++) {
			if(this.mutedTags[i] === tag) {
				this.mutedTags.splice(i, 1);
				return;
			}
		};
	},

	filterMessages: function(regex) {
		this.filter = regex;
	},

	saveSettings: function() {
		localStorage.setItem("console.mutedTags", this.mutedTags);
		localStorage.setItem("console.filter", this.filter);
	},

	getStack: function(index) {
		return this.stacks[index];
	}
});

console = Console.create({
	baseConsole: console
});

console.log("m1", console);
console.addTag("t1");
console.addTag("t2");
console.log("m2", console);
console.removeTag("t1");
console.log("m3", console);
console.flushTags();
console.log("m4", console);


console.addTag("t3");
console.log("Object instantiated");

window.setInterval(function(){
	console.log("m5");
},1000);
