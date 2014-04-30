var _baseConsole = console;

//define Array.contains if not defined before
if(Array.prototype.contains === undefined) {
	Array.prototype.contains = function(obj) {
		var i = this.length;
		while (i--) {
			if (this[i] === obj) {
				return true;
			}
		}
		return false;
	};
}

console = {
	_filter: undefined,

	// internal utilities ///////////////////////////////////////////////////////////////////////////
	internal: {
		generateMessageAdditions: function(consoleObject, argumentsArray) {
			var args = [];


			//getting author name
			var file_split = new Error().stack.split('\n')[3].split('/'),
				file_location = file_split[file_split.length - 1].replace(')',''),
				filename = file_location.split(':')[0];
				line_number = file_location.split(':')[1] + ":" + file_location.split(':')[2];

			var args_tags = "[" + filename + "][" + line_number + "]";

			if(consoleObject.tags._tags !== undefined) {
				for (var i = 0; i <= consoleObject.tags._tags.length - 1 ; i++) {
					if (consoleObject.tags._mutedTags.contains(consoleObject.tags._tags[i])) {
						return null;
					};
					args_tags += "["+ consoleObject.tags._tags[i] +"]";
				};
			}

			if(!! consoleObject.style._colors) {
				args_tags = "%c" + args_tags;
				args.push(args_tags);
				args.push('background: #222; color: #bada55');
			} else {
				args.push(args_tags);
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

			if(consoleObject.stacks._check_repeats(args)) {
				_baseConsole.error("too much similar messages", arguments);
				return null;
			}
			if(!! consoleObject.stacks.display) {
				var err = new Error();

				consoleObject.stacks._stacks.push(err.stack);
				args.push("[>" + consoleObject.stacks._stacks.length + "]")
			}

			for (var i = 0; i < argumentsArray.length; i++) {
				args.push(argumentsArray[i]);
			};

			return args;
		}
	},

	// Ctor ////////////////////////////////////////////////////////////////////////////////////////

	init: function() {
		console.log("load settings from localStorage, if possible");
		this.settings.load();

		this.tags.flush();
	},

	// Original console method wrappers ////////////////////////////////////////////////////////////

	log: function(messages) {
		var args = this.internal.generateMessageAdditions(this, arguments);

		if(args !== null) {
			_baseConsole.log.apply(_baseConsole, args);
			this.backends.send("log", args);
		}
	},

	group: function() {
		var args = console.internal.generateMessageAdditions(this, arguments);

		if(args !== null) {
			_baseConsole.group.apply(_baseConsole, args);
			this.backends.send("group", args);
		}
	},

	groupEnd: function() {
		var args = this.internal.generateMessageAdditions(this, arguments);

		if(args !== null) {
			_baseConsole.groupEnd.apply(_baseConsole, args);
			this.backends.send("groupEnd", args);
		}
	},

	groupCollapsed: function() {
		var args = this.internal.generateMessageAdditions(this, arguments);

		if(args !== null) {
			_baseConsole.groupCollapsed.apply(_baseConsole, args);
			this.backends.send("groupCollapsed", args);
		}
	},

	info: function() {
		var args = this.internal.generateMessageAdditions(this, arguments);

		if(args !== null) {
			_baseConsole.info.apply(_baseConsole, args);
			this.backends.send("info", args);
		}
	},

	warn: function() {
		var args = this.internal.generateMessageAdditions(this, arguments);

			if(args !== null) {
			_baseConsole.warn.apply(_baseConsole, args);
			this.backends.send("warn", args);
		}
	},

	error: function() {
		var args = this.internal.generateMessageAdditions(this, arguments);

		if(args !== null) {
			_baseConsole.error.apply(_baseConsole, args);
			this.backends.send("error", args);
		}
	},

	// Backends ////////////////////////////////////////////////////////////////////////////////////

	backends: {
		_backends: {},

		add: function(name, backendObject) {
			_backends[name] = backendObject;
		},

		remove: function(name) {
			delete _backends[name];
		},

		send: function(function_name, args) {
			for (var i = 0; i < this._backends.length; i++) {
				this._backends[i].send(function_name, args);
			};
		}
	},

	// Stacks //////////////////////////////////////////////////////////////////////////////////////

	stacks: {
		_stacks: [],
		_repeats: {},
		_repeat_threshold: 10,

		_check_repeats: function() {
				var err = new Error();
				if(this._repeats[err.stack] === undefined) {
					this._repeats[err.stack] = {};
					this._repeats[err.stack].counter = 1;
				}
				else {
					this._repeats[err.stack].counter ++;
				}
				if(this._repeats[err.stack].counter > this._repeat_threshold) {
					return true;
				}
				return false;
		},

		display: false,

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
		},
	},

	// Message filtering ////////////////////////////////////////////////////////////////////////////

	filterMessages: function(regex) {
		this._filter = regex;
	},

	// Settings Management //////////////////////////////////////////////////////////////////////////

	settings: {
		_savedProperties: ["tags._mutedTags", "style._colors", "stacks.display"],

		save: function() {
			for (var i = 0; i < this._savedProperties.length; i++) {
				var currentPropStr = "console." + this._savedProperties[i];

				var val = eval(currentPropStr);
				if(typeof val === "string") {
					val = "'" + val +"'";
				} else if(typeof val === "object") {
					val = JSON.stringify(val);
				}

				localStorage.setItem(currentPropStr, val);
			};
		},

		load: function() {
			for (var i = 0; i < this._savedProperties.length; i++) {
				var currentPropStr = "console." + this._savedProperties[i];

				eval(currentPropStr + "= " + localStorage.getItem(currentPropStr));
			};
		},

		reset: function() {
			for (var i = 0; i < this._savedProperties.length; i++) {
				var currentPropStr = "console." + this._savedProperties[i];

				eval(currentPropStr + "= " + undefined);
			};
		}
	},

	style: {
		_colors: false
	}
};

console.init();

