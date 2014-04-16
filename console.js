Console = Ember.Object.extend({
	baseConsole: undefined,
	author: undefined,
	tags: [],
	mutedTags: [],
	filter: undefined,

	log: function() {
		if(this.baseConsole !== undefined) {

			var args = [];

			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			};

			if(this.tags !== undefined) {
				for (var i = this.tags.length - 1; i >= 0 ; i--) {
					if (this.mutedTags.contains(this.tags[i])) { return; };
					args.unshift("["+ this.tags[i] +"]");
				};
			}

			if(this.filter !== "" && this.filter !== undefined) {
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
	}
});

console = Console.create({
	baseConsole: console
});

console.log("m1", console);
console.setAuthor("a1");
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
