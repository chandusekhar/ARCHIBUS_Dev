/*
 * javascript-objects.js Examples of object-oriented programming using the
 * open-source base.js from Dean Edwards.
 * 
 * See also: http://dean.edwards.name/weblog/2006/03/base/
 * 
 * Please note that ARCHIBUS uses the 1.0.1 version of "base.js", which uses the
 * "inherit()" method rather than the "base()" method in 1.0.2.
 */

/**
 * extendBaseClassExample. Illustrates how you use the extend() method to add
 * another interface to an object. You pass the extend() method a set of "name:
 * value," pairs. These pairs define the variables and methods of the derived
 * object.
 */

function extendBaseClassExample() {

	var objectInstance = new Base;

	objectInstance.extend({
		addedValue : "data added to object",
		addedMethod : function() {
			alert("Message from method added to object.");
		}
	});

	objectInstance.addedMethod();// ==> Message from method added to object.

} // end function extendBaseClassExample

/**
 * subClassExample illustrates how use hse the inherit() method to access the
 * parent variables and functions from a sub-class that has over-loaded the same
 * variable or function name as its super-class.
 */

function subClassExample() {

	var objectInstance = new Base;

	objectInstance.extend({
		addedMethod : function() {
			alert("Message from the super-class.");
		}
	});

	objectInstance.extend({
		addedMethod : function() {
			// Call the "super-class" version of the method.
			// That is, inherit the super-class's functionality.
			this.inherit();
			// Add some code in this sub-classed version of the method.
			alert("Message from the sub-class.");
		}
	});

	objectInstance.addedMethod();// ==> Message from the super-class. ==>
									// Message from the sub-class.

} // end function subClassExample

/**
 * animalSubClassExample Illustrates how you define new sub-classes by calling
 * the extend() method of the superclass.
 */

function animalSubClassExample() {

	// Define an animal superclass.

	var Animal = Base.extend({
		constructor : function(name) {
			this.name = name;
		},

		name : "",

		eat : function() {
			this.say("Yum!");
		},

		say : function(message) {
			alert(this.name + ": " + message);
		}
	}); // end Animal class

	// Define a Mouse sub-class.
	// You define sub-classes by using the extend() method of the superclass.
	// In base.js 1.0.1 you must call the constructor of the superclass
	// explicitly. (In base.js 1.0.2, this step is not necessary.)

	var Mouse = Animal.extend({
		constructor : function(name) {
			this.inherit(name);
		}
	});

	// Define a Cat sub-class.
	// You can override the methods to provide functionality specific to
	// the sub-class.

	var Cat = Animal.extend({
		constructor : function(name) {
			this.inherit(name);
		},
		eat : function(food) {
			if (food instanceof Mouse) // if this is mouse
				this.inherit(); // eat it like a normal animal
			else
				this.say("Yuk! I only eat mice."); // otherwise, alert the chef
		}
	});

	// Use the new Animal, Cat, and Mouse classes you defined above
	// by declaring instances of each type of object.

	var beastieFrank = new Animal("Generic Beastie Named Frank");
	beastieFrank.say("Roar"); // <== Generic Beastie Named Frank: Roar

	var catFluffy = new Cat("Cat Named Fluffy");
	catFluffy.say("Meow"); // <== Cat Named Fluffy: Meow

	var mouseFieval = new Mouse("Mouse Named Fieval");
	mouseFieval.say("Squeak"); // <== Mouse Named Fieval: Squeak

	catFluffy.eat(beastieFrank); // <== Cat Named Fluffy: Yuk! I only eat
									// mice.
	catFluffy.eat(mouseFieval); // <== Cat Named Fluffy: Yum!
	beastieFrank.eat(catFluffy); // <== Generic Beastie Named Frank: Yum!

} // end animalSubClassExample() example function

/**
 * animalInterfaceExample() illustrates the use of a second * parameter to
 * extend() method to define an interface to the * class itself.
 */

function animalInterfaceExample() {

	var BetterAnimal = Base.extend(

	// The first parameter defines the interface to each particular instance;
			// that is, it defines the functions and data that differ
			// for each instance of the object and operates on the data that
			// differ for each of those instances.

			{
				constructor : function(name) {
					this.name = name;
				},

				say : function(message) {
					alert(BetterAnimal.PHYLUM + " : " + this.name + ": "
							+ message);
				},
				name : ""
			},

			// The second parameter defines the interface to the class;
			// that is, it defines the constants and functions that are the same
			// for
			// all instances of the same class.
			{
				PHYLUM : "Animal phylum",

				sayCopyright : function() {
					alert("(C) Build a Better Beast Enterprises.  Better living through rational taxonomy.");
				}
			}); // end Animal class

	// Declare an instance.

	var betterBeastInstance = new BetterAnimal("Better Beast Instance");

	// The instance method refers to the common BetterBeast.PHYLUM.

	betterBeastInstance.say("Roar"); // <== Animal phylum : Better Beast
										// Instance : Roar

	// You can also access constance and functions through the class
	// definition itself.

	BetterAnimal.sayCopyright(); // <== (C) Build a Better Beast
									// Enterprises...

} // end function animalInterfaceExample

/**
 * Illustrates the uses of namespaces. By declaring your objects under a
 * namespace, you ensure that no other JavaScript class can have the same name
 * and conflict.
 */

function namespaceExample() {

	// Declare the namespace for the animal classes: Ab.animals.
	// Prefix the class name with the namespace name

	Ab.namespace('phyla');

	// Declare a class within this namespace.

	Ab.phyla.Animal = Base.extend({
		constructor : function(name) {
			this.name = name;
		},

		name : "",

		say : function(message) {
			alert(this.name + ": " + message);
		}
	}); // end Ab.phyla.Animal class

	// Declare an instance of this class and use it.

	var beastie = new Ab.phyla.Animal("Instance of Ab.phyla.Animal");

	beastie.say("safe in its own namespace.");

}