/**
 * Declare the namespace for the view JS classes.
 */
AFM.namespace('view');

/**
 * Base class for all UI components.
 * Every component has a parent HTML DOM element it is attached to.
 */
AFM.view.Component = Base.extend({

    // component type
    type: '',
    
    // unique control ID, typially the same as the parent element ID
    controlId: '',
    
    // HTML ID attribute of the parent DOM element
    parentElementId: '',
    
    // parent DOM element
    parentElement: null,
    
    // restriction as an object containing primary key values
    restriction: null,
    
    // whether to apply the parent View restriction to the data records
    useParentRestriction: true,
    
    // whether to display data record(s) after page is loaded
    showOnLoad: true,
    
    // whether the control is visible
    visible: false,
    
    // array of buttons for this control
    buttons: [],
    
	// Collection of AFM.view.TranslatableDisplayString objects. 
	// Translatable strings (keys) and, after the first WFR call, their translations (values)
	// Initialize in concrete component class (e.g., ab-miniconsole.js)
	translatableDisplayStrings: [],

    /**
     * Constructor.
	 *
	 * @param controlId
	 * @param type - name of the component type e.g., 'grid', 'form' ...
	 * @param configObject - map with keys of possibly [showOnLoad, useParentRestriction]
     */
    constructor: function (controlId, type, configObject) {
		this.type = type;
        this.controlId = controlId;
        this.parentElementId = this.getParentElementId();
        this.parentElement = $(this.parentElementId);
        this.restriction = new Object();
        
		AFM.view.View.registerControl(window, this.controlId, this);
		
		var showOnLoad = configObject.getConfigParameterIfExists('showOnLoad');
		if (valueExists(showOnLoad)) {
		    this.showOnLoad = showOnLoad;
		}
		
		var useParentRestriction = configObject.getConfigParameterIfExists('useParentRestriction');
		if (valueExists(useParentRestriction)) {
		    this.useParentRestriction = useParentRestriction;
		}

        if (this.useParentRestriction) {
            this.restriction = AFM.view.View.restriction;
        }
		
		this.buttons = new  Array();
    },
    
    /**
     * Changes the parent element.
     */
    setParentElement: function(element) {
        this.parentElement = element;
        this.parentElementId = element.id;
    },
    
    /**
     * Returns parent element ID. By default, the parent element ID is the same as the control ID.
     */
    getParentElementId: function() {
        return this.controlId;
    },
    
    /**
     * Clears the control UI state.
     */
    clear: function() {},
    
    /**
     * Refreshes the control UI state, possibly by obtaining data from the server.
     */
    refresh: function() {},
    
    /**
     * Shows or hides the control.
     * @param {show} If true or undefined shows the control, if false hides the control.
     * @param {includeHeader} If true, shows or hides the panel header bar as well (optional).
     */
    show: function(show, includeHeader) {
        if (!valueExists(show)) {
            show = true;
        }
        
        if (!valueExists(includeHeader)) {
            includeHeader = false;
        }
        
        // do not show|hide if the control is already shown|hidden
        if (this.visible == show) {
            return;
        }
        
        // set new visible status
        this.visible = show;
        
        // show|hide control content parent DOM element
        this.showElement(this.parentElement, show);
        
        // show|hide control header parent DOM element
        if (includeHeader) {
            this.showElement(this.controlId + '_head', show);
        } 
        
        // enable|disable control buttons
        for (var i = 0; i < this.buttons.length; i++) {
            this.enableButton(this.buttons[i], show);
        }
    },
    

    /**
     * Shows or hides HTML element.
     * @param {element} HTML element reference or ID.
     * @param {show}
     */
    showElement: function(element, show) {
        var display = show ? '' : 'none';
        YAHOO.util.Dom.setStyle(element, 'display', display);
    },   
    
    /**
     * Adds an event handler with the list of commands to the panel title bar button.
     */
    addButton: function(buttonId, commandsData) {
        // craere command chain
        var command = new AFM.command.commandChain();
        command.addCommands(commandsData);
        
        // add command as a button property
        var button = $(buttonId);
        button.command = command;
        
        // register command as event handler
        var fn = command['handle'];
        YAHOO.util.Event.addListener(button, "click", fn, command, true);
        
        this.enableButton(button, this.showOnLoad);
        
        this.buttons.push(button);
    },
    
    /**
     * Enables or disables specified button.
     * @param {button}  DOM reference|string
     * @param {enabled} boolean
     */
    enableButton: function(button, enabled) {
        if (typeof button == 'string') {
            button = $(button);
        }
        
        if (button) {
            // enable or disable button input
            button.disabled = !enabled;
            
            // enable or disable button command
            var command = button.command;
            if (command) {
                command.enabled = enabled;
            }
        }
    }
});


/**
 * Element in array simulating a hashMap
 * Collection of these elements holds the set of translatable strings used on the client
 *
 */
AFM.view.TranslatableDisplayString = Base.extend({
	// key to 'hashMap' entry - the English version of the string
	stringKey: '',
	
	// key in 'hashMap' entry - the localized version of the string
	stringValue: '',

	/**
	 * Constructor.
	 */
	constructor: function(key, val) {
		this.stringKey = key;
		this.stringValue = val;
	}
});


/**
 * Configuration object is used to pass configuration options to control constructors.
 */
AFM.view.ConfigObject = Base.extend({

	/**
	 * Constructor.
	 */
	constructor: function() {
	},
		
	
	setConfigParameter: function(key, value) {
		var oldValue = null;
		if (valueExists(key)) {
			oldValue = this[key];
		}
		this[key] = value;


		return oldValue;
	},

	getConfigParameter: function(key, defaultValue) {
		var value = null;
		if (valueExists(key)) {
			value = this[key];
		}
		else {
		    if (valueExists(defaultValue)) {
		        value = defaultValue;
		    } else {
			    alert('The configuration parameter ' + key + ' has not been set in the config object!');
		    }
		}
		return value;
	},

	getConfigParameterIfExists: function(key) {
		var value = null;
		if (valueExists(key)) {
			value = this[key];
		}
		return value;
	},

    getFunction: function(key) {
        var functionName = this.getConfigParameter(key);
        return self[functionName];
    },
    
    addParameterIfNotExists: function(key, value) {
        if (!valueExists(this[key])) {
            this[key] = value;
        }
    }
});

