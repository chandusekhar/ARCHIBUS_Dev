/**
 * Declare the namespace for the workflow JS classes.
 */
AFM.namespace('workflow');

/**
 * Workflow gateway class containing static methods to call workflow rules and obtain their results.
 */
AFM.workflow.Workflow = Base.extend({
    // no instance data or methods    
},
{
    // static data and methods
    
    // default WFR call timeout: 10 seconds
    DEFAULT_TIMEOUT: 10,
    
	/**
	 * Call specified WFR and handle the results via given callback function.
	 * The call is synchronous, i.e. runRule() does not return until the WFR execution 
	 * is finished and the result is recieved back on the client.
	 * 
	 * @param {workflowRuleId}   WFR ID, such as AbCommonResources-getUser.
	 * @param {parameters}       WFR input parameters object that can contain:
	 *                           - simple properties, such as strings or numbers;
	 *                           - other objects or arrays encoded in JSON notation;
	 * @param {callabckFunction} Callback function reference (not name).
	 * @param {callbackObject}   Object that contains the callback function; 
	 *                           not required for global callback functions.
	 * @param {timeout}          Timeout in seconds.
	 */
	runRule: function(workflowRuleId, parameters, callbackFunction, callbackObject, timeout) {
	    if (!valueExists(timeout)) {
	        timeout = AFM.workflow.Workflow.DEFAULT_TIMEOUT;
	    }
	    var systemCallback = new AFM.workflow.Callback(callbackFunction, callbackObject);
	    var callbackDelegate = systemCallback.createDelegate();
	    var options = {
	        'callback': callbackDelegate,
	        'async': false,
	        'timeout': timeout * 1000
	    }

	    this.prepareParameters(parameters);
		workflow.runWorkflowRule(workflowRuleId, parameters, options);
	},
	
	/**
	 * Call specified WFR and returns the result object.
	 * The call is synchronous, i.e. runRule() does not return until the WFR execution 
	 * is finished and the result is recieved back on the client.
	 * 
	 * @param {workflowRuleId}   WFR ID, such as AbCommonResources-getUser.
	 * @param {parameters}       WFR input parameters object that can contain:
	 *                           - simple properties, such as strings or numbers;
	 *                           - other objects or arrays encoded in JSON notation;
	 * @param {timeout}          Timeout in seconds.
	 * @return                   WFR result object.
	 */
	runRuleAndReturnResult: function(workflowRuleId, parameters, timeout) {
	    if (!valueExists(timeout)) {
	        timeout = AFM.workflow.Workflow.DEFAULT_TIMEOUT;
	    }
	    var systemCallback = new AFM.workflow.Callback(null, null);
	    var callbackDelegate = systemCallback.createDelegate();
	    var options = {
	        'callback': callbackDelegate,
	        'async': false,
	        'timeout': timeout * 1000
	    }

	    this.prepareParameters(parameters);
		workflow.runWorkflowRule(workflowRuleId, parameters, options);
		var result = systemCallback.result;
		
		if (!valueExists(result.message)) {
		    result.message = 'Workflow rule ' + workflowRuleId + ' executed';
		}
		
		return result;
	},
	
    /**
     * Prepares WFR parameters before calling the WFR.
     */
    prepareParameters: function(parameters) {
        // encode reserved SQL words in the SQL restriction string (but not in the parsed restriction)
        if (valueExists(parameters) && valueExists(parameters.restriction) && 
        		parameters.restriction.constructor === String &&
        		parameters.restriction.length > 0 &&
        		parameters.restriction.charAt(0) !== '{' &&
        		parameters.restriction.charAt(0) !== '[') {
        	parameters.restriction = doSecure(parameters.restriction);
        }
    },
	
	/**
	 * Helper method to handle the error result.
	 */
	handleError: function(result) {
		//XXX: don't alert timeout message sinece browser will display a special timeout view
		if(result.code != "sessionTimeout"){
	    	alert(result.message);
		}
	}
});


/**
 * Callback object that is invoked by DWR and in turn invokes the user-defined callback.
 */
AFM.workflow.Callback = Base.extend({

    // user-defined callback function reference (can be global function or object method)
    callbackFunction: null,
    
    // user-defined callback object instance (undefined if the callback is a global function)
    callbackObject: null,
    
    // placeholder for the WFR result object
    result: null,

    /**
     * Constructor.
     */    
    constructor: function(callbackFunction, callbackObject) {
        this.callbackFunction = callbackFunction;
        this.callbackObject = callbackObject;
    },
    
    /**
     * Callback invoked by DWR.
     * @param {result} DWR workflow service result object.
     */
    afterRuleExecuted: function(result) {
        this.result = result;
        
        // check if there was a session timeout
        if (result.code == 'sessionTimeout') {
            //document.open();
            document.write(result.message);
            //document.close();
            return;
        }
        
        // evaluate the JSON expression abd save the data into the result object
        if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
            result.data = eval('(' + result.jsonExpression + ')');
        }
        
        // call user-defined callback function
        var fn = this.callbackFunction;
        if (valueExists(fn)) {
            if (valueExists(this.callbackObject)) {
                fn.call(this.callbackObject, result);
            } else {
                fn.call(window, result);
            }
        }
    },
    
    /**
     * Create a delegate - a function that calls the afterRuleExecuted() method 
     * with this instance as a scope.
     */
    createDelegate: function() {
    	var me = this;
    	return function(result) {
    		me.afterRuleExecuted(result);
    	}
    }
});

