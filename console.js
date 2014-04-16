Console = Ember.Object.extend({
	baseConsole: undefined,
	author: undefined,
	tags: [],

	log: function() {
		if(this.baseConsole !== undefined) {

			var args = [];

			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			};

			if(this.tags !== undefined) {
				for (var i = this.tags.length - 1; i >= 0 ; i--) {
					args.unshift("["+ this.tags[i] +"]");
				};
			}
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

console.log("Object instantiated");