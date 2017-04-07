/**
 *Implementation of the custom control that displays the current user information.
 */
 
/**
 * Declare the "examples" namespace.
 */
Ab.namespace('examples');
 
/**
 * Custom control class. Extends the base Component class.
 */
Ab.examples.UserInfo = Ab.view.Component.extend({
    
    /**
     * User information obtained from the server.
     */
    userInfo: null,
    
    /**
     * User-defined event handler for the Show Details button.
     */
    onShowDetails: null,

    /**
     * Constructor function creates the control instance and sets its initial state.
     */
    constructor: function(parentElementId, configObject) {
        // add default config parameters if they are not defined in AXVW
		configObject.addParameterIfNotExists('showOnLoad', true); 
		configObject.addParameterIfNotExists('useParentRestriction', false); 

        // call the base Component constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
        this.inherit(parentElementId, 'userInfo', configObject);
        
        // if the view passed custom Show Details event handler, store it
        var listener = configObject['onShowDetails'];
        if (valueExists(listener)) {
            this.addEventListener('onShowDetails', listener);
        }
        
        // refresh the control content unless showOnLoad is set to false
        if (this.showOnLoad) {
            this.refresh();
        }
    },
    
    /**
     * Call the WFR to loads the user information from the server.
     */
    refresh: function() {
        try {
		    var result = Workflow.call("AbCommonResources-getUser", {});
    		this.userInfo = result.data;
    		this.displayUserInfo();
    	} catch (e) {
    	   // Workflow.handleError(e);
    	}        
    },
    
    /**
     * Helper function to display the user information.
     */
    displayUserInfo: function() {
        // create text content                
        var text = document.createElement('span');
        text.style.fontSize = 'large';
        text.style.fontWeight = 'bold';
        text.style.marginLeft = '8px';
        text.style.marginRight = '8px';
        var message = getMessage('hello');
        message = message.replace('{0}', this.userInfo.user_name);
        message = message.replace('{1}', this.id);        
        text.appendChild(document.createTextNode(message));
        this.parentElement.appendChild(text);
	    
	    // create Show Details button, if the event handler for it specified
	    var listener = this.getEventListener('onShowDetails');
	    if (listener != null) {
    	    var button = document.createElement('button');
    	    button.appendChild(document.createTextNode(getMessage('details')));
            this.parentElement.appendChild(button);
            
            // register the event handler with the button using Ext event manager
            Ext.EventManager.addListener(button, "click", listener);
	    }
    }
});