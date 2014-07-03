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

	// internal utilities 
	internal: {
		generateMessageAdditions: function(consoleObject, argumentsArray, forceDisplay) {
			var args = [];
			var i;

			//getting author name
			var file_split = new Error().stack.split('\n')[3].split('/');

			//consoleObject._baseConsole.log("file split", file_split);

			var file_location = file_split[file_split.length - 1];
			for(i = 1; i < consoleObject.tags._authorFoldersDisplay; i++) {
				file_location = file_split[file_split.length - i - 1] + "/" + file_location;
			}

			var	filename = file_location.split(':')[0];
			file_location = file_location.replace(')','');
			var	line_number = file_location.split(':')[1] + ":" + file_location.split(':')[2];

			if (consoleObject.tags._selectedTags !== undefined && consoleObject.tags._selectedTags !== null && consoleObject.tags._selectedTags.contains(filename)) {
				return null;
			}
			var args_tags = "[" + filename + "][" + line_number + "]";

			var tagMatchSelectedTag = false;
			if(consoleObject.tags._tags !== undefined) {
				for (i = 0; i <= consoleObject.tags._tags.length - 1 ; i++) {
					if (consoleObject.tags._selectedTags.contains(consoleObject.tags._tags[i])) {
						tagMatchSelectedTag = true;
					}
					args_tags += "["+ consoleObject.tags._tags[i] +"]";
				}
			}

			if (consoleObject.tags._muteAllByDefault === false && consoleObject.tags._selectedTags !== undefined && consoleObject.tags._selectedTags !== null && consoleObject.tags._selectedTags.contains(filename)) {
				if(! forceDisplay)
					return null;
			}
			if (consoleObject.tags._muteAllByDefault === true && consoleObject.tags._selectedTags !== undefined && consoleObject.tags._selectedTags !== null && !consoleObject.tags._selectedTags.contains(filename)) {
				if(! forceDisplay)
					return null;
			}
			if(tagMatchSelectedTag === false && consoleObject.tags._muteAllByDefault === true) {
				if(! forceDisplay)
					return null;
			}
			if(tagMatchSelectedTag === true && consoleObject.tags._muteAllByDefault === false) {
				if(! forceDisplay)
					return null;
			}

			if(!! consoleObject.style._colors) {
				args_tags = "%c" + args_tags;
				args.push(args_tags);
				args.push('background: #444; color: #eee; border-radius:4px;padding:2px');
			} else {
				args.push(args_tags);
			}

			if(consoleObject._filter !== "" && consoleObject._filter !== undefined && consoleObject._filter !== null) {
				for (i = 0; i < args.length; i++) {
					if(typeof args[i] === "string") {
						var regex = new RegExp(consoleObject._filter);
						if(regex.test(args[i])) {
							if(! forceDisplay)
								return null;
						}
					}
				}
			}

			if(consoleObject.stacks._check_repeats(args)) {
				_baseConsole.error("too much similar messages", arguments);
				if(! forceDisplay)
					return null;
			}
			if(!! consoleObject.stacks.display) {
				var err = new Error();

				consoleObject.stacks._stacks.push(err.stack);
				args.push("[>" + consoleObject.stacks._stacks.length + "]");
			}

			for (i = 0; i < argumentsArray.length; i++) {
				args.push(argumentsArray[i]);
			}

			return args;
		}
	},

	// Ctor 

	init: function() {
		console.log("load settings from localStorage, if possible");
		this.settings.load();
		if(this.tags._selectedTags === undefined || this.tags._selectedTags === null) {
			this.tags._selectedTags = [];
		}	
		this.tags.flush();
	},

	// Original console method wrappers 

	log: function() {
		var args = this.internal.generateMessageAdditions(this, arguments);

		if(args !== null) {
			_baseConsole.log.apply(_baseConsole, args);
			this.backends.send("log", args);
		}
	},

	group: function() {
		var args = console.internal.generateMessageAdditions(this, arguments, true);

		if(args !== null) {
			_baseConsole.group.apply(_baseConsole, args);
			this.backends.send("group", args);
		}
	},

	groupEnd: function() {
		var args = this.internal.generateMessageAdditions(this, arguments, true);

		if(args !== null) {
			_baseConsole.groupEnd.apply(_baseConsole, args);
			this.backends.send("groupEnd", args);
		}
	},

	groupCollapsed: function() {
		var args = this.internal.generateMessageAdditions(this, arguments, true);

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
		var args = this.internal.generateMessageAdditions(this, arguments, true);

			if(args !== null) {
			_baseConsole.warn.apply(_baseConsole, args);
			this.backends.send("warn", args);
		}
	},

	error: function() {
		var args = this.internal.generateMessageAdditions(this, arguments, true);

		if(args !== null) {
			_baseConsole.error.apply(_baseConsole, args);
			this.backends.send("error", args);
		}
	},

	// Backends 

	backends: {
		_backends: {},

		add: function(name, backendObject) {
			this._backends[name] = backendObject;
		},

		remove: function(name) {
			delete this._backends[name];
		},

		send: function(function_name, args) {
			for (var i = 0; i < this._backends.length; i++) {
				this._backends[i].send(function_name, args);
			}
		}
	},

	// Stacks 

	stacks: {
		_stacks: [],
		_repeats: {},
		_repeat_threshold: 1000,

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

	// Tags 

	tags: {
		_tags: [],
		_selectedTags: [],
		_muteAllByDefault:true,
		_author: undefined,
		_authorFoldersDisplay: 2,

		add: function(tag){
			this._tags.push(tag);
		},

		remove: function(tag){
			for (var i = 0; i < this._tags.length; i++) {
				if(this._tags[i] === tag) {
					this._tags.splice(i, 1);
					return;
				}
			}
		},

		select: function(tag) {
			this._selectedTags.push(tag);
		},

		unselect: function(tag) {
			for (var i = 0; i < this._selectedTags.length; i++) {
				if(this._selectedTags[i] === tag) {
					this._selectedTags.splice(i, 1);
					return;
				}
			}
		},

		flush: function(){
			this._tags = [];
		},
	},

	// Message filtering 

	filterMessages: function(regex) {
		this._filter = regex;
	},

	// Settings Management 

	settings: {
		_savedProperties: ["tags._selectedTags", "style._colors", "stacks.display","tags._authorFoldersDisplay", "tags._muteAllByDefault"],

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
			}
		},

		load: function() {
			for (var i = 0; i < this._savedProperties.length; i++) {
				var currentPropStr = "console." + this._savedProperties[i];

				eval(currentPropStr + "= " + localStorage.getItem(currentPropStr));
			}
		},

		reset: function() {
			for (var i = 0; i < this._savedProperties.length; i++) {
				var currentPropStr = "console." + this._savedProperties[i];

				eval(currentPropStr + "= " + undefined);
			}
		}
	},

	style: {
		_colors: false
	}
};
console.init();

