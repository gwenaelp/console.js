
Console = Ember.Object.extend({
	_baseConsole: undefined,
	_filter: undefined,

	// internal utilities ///////////////////////////////////////////////////////////////////////////
	internal: {
		generateMessageAdditions: function(consoleObject, argumentsArray) {
			var args = [];

			for (var i = 0; i < argumentsArray.length; i++) {
				args.push(argumentsArray[i]);
			};

			if(!! consoleObject.stacks.display) {
				var err = new Error();

				consoleObject.stacks._stacks.push(err.stack);
				args.unshift("[>" + consoleObject.stacks._stacks.length + "]")
			}

			if(consoleObject.tags._tags !== undefined) {
				for (var i = consoleObject.tags._tags.length - 1; i >= 0 ; i--) {
					if (consoleObject.tags._mutedTags.contains(consoleObject.tags._tags[i])) {
						return null;
					};
					args.unshift("["+ consoleObject.tags._tags[i] +"]");
				};
			}

			if(consoleObject._filter !== "" && consoleObject._filter !== undefined && consoleObject._filter !== null) {
				for (var i = 0; i < args.length; i++) {
					if(typeof args[i] === "string") {
						var regex = new RegExp(consoleObject._filter);
						if(regex.test(args[i])) {
							return null;
						}
					}
				};
			};

			return args;
		}
	},


	// Ctor ////////////////////////////////////////////////////////////////////////////////////////

	init: function() {
		if(localStorage.getItem("console.mutedTags") !== undefined) {
			console.log("load settings from localStorage, if possible");
			this.tags._mutedTags = localStorage.getItem("console.mutedTags").split(",");
		}

		this.tags.flush();
	},

	// Original console method wrappers ////////////////////////////////////////////////////////////

	log: function() {
		if(this._baseConsole !== undefined) {
			var args = this.internal.generateMessageAdditions(this, arguments);

			if(args !== null)
				this._baseConsole.log.apply(this._baseConsole, args);
		}
	},

	// Stacks //////////////////////////////////////////////////////////////////////////////////////

	stacks: {
		display: false,
		_stacks: [],
		get: function(index) {
			return this._stacks[index];
		}
	},

	// Tags ////////////////////////////////////////////////////////////////////////////////////////

	tags: {
		_tags: [],
		_mutedTags: [],
		_author: undefined,

		add: function(tag){
			this._tags.push(tag);
		},

		remove: function(tag){
			for (var i = 0; i < this._tags.length; i++) {
				if(this._tags[i] === tag) {
					this._tags.splice(i, 1);
					return;
				}
			};
		},

		mute: function(tag) {
			this._mutedTags.push(tag);
		},

		unmute: function(tag) {
			for (var i = 0; i < this._mutedTags.length; i++) {
				if(this._mutedTags[i] === tag) {
					this._mutedTags.splice(i, 1);
					return;
				}
			};
		},

		flush: function(){
			this._tags = [];

			//getting author name
			var scripts = document.getElementsByTagName("script");
			var scriptName = (document.currentScript || scripts[scripts.length - 1]).src;
			scriptName = scriptName.split("/");
			scriptName = scriptName[scriptName.length - 1];

			this._author = scriptName;
			this._tags.push(this._author);
		},
	},

	// Message filtering ////////////////////////////////////////////////////////////////////////////

	filterMessages: function(regex) {
		this._filter = regex;
	},

	// Settings Management //////////////////////////////////////////////////////////////////////////

	settings: {
		save: function() {
			localStorage.setItem("console.mutedTags", this.tags._mutedTags);
		},

		reset: function() {
			localStorage.setItem("console.mutedTags", undefined);
		}
	}
});

console = Console.create({
	_baseConsole: console
});

console.log("m1", console);
console.tags.add("t1");
console.tags.add("t2");
console.log("m2", console);
console.tags.remove("t1");
console.log("m3", console);
console.tags.flush();
console.log("m4", console);


console.tags.add("t3");
console.log("Object instantiated");

window.setInterval(function(){
	console.log("m5");
},1000);
