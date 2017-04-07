/**
 * Declare the namespace for the workflow JS classes.
 */
Ab.namespace('workflow');

/**
 * Workflow gateway class containing static methods to call workflow rules and obtain their results.
 */
Ab.workflow.Workflow = Base.extend({
    // no instance data or methods    
},
{
    // static data and methods

	// moved from ab-view.js because that is not included in navigator
    // set to true when the session timeout is detected
    sessionTimeoutDetected: false,

    
    // default WFR call timeout: 10 seconds
    DEFAULT_TIMEOUT: 10,
    
    // DWR error message when script session has expired or is invalid
    ERROR_SCRIPT_SESSION: 'Attempt to fix script session',

    // DWR error message when the server returns no data (happens in SSO mode when script session has expired)
    ERROR_NO_DATA: 'No data received from server',

    // @begin_translatable
    z_MESSAGE_RULE_EXECUTED: 'Workflow rule executed',
    z_MESSAGE_RULE_FAILED: 'Workflow rule failed',
    z_MESSAGE_RULE_NOT_FOUND: 'Workflow rule not found',
    z_MESSAGE_RULE_NOT_PERMITTED: 'Workflow rule not permitted',
    z_MESSAGE_CONTAINER_FAILED: 'Workflow rules container failed',
    z_MESSAGE_SESSION_TIMEOUT_TITLE: 'Session Timeout',
    z_MESSAGE_SESSION_TIMEOUT: 'Your session has expired, and you have been signed out of WebCentral. To continue working, please sign in again.',
    // @end_translatable
    
    /**
     * 16.3 compatibility method. Use call() in new code instead.
     * @deprecated
     * 
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
        try {
            if (!valueExists(timeout)) {
                timeout = Ab.workflow.Workflow.DEFAULT_TIMEOUT;
            }
            var systemCallback = new Ab.workflow.Callback(callbackFunction, callbackObject);
            var callbackDelegate = systemCallback.afterRuleExecuted.createDelegate(systemCallback);
            var options = {
                'callback': callbackDelegate,
                'async': false,
                'timeout': timeout * 1000
            }
            this.prapareParameters(parameters);
            workflow.runWorkflowRule(workflowRuleId, parameters, options);
        } catch (e) {
            e.description = 'Workflow rule failed';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_FAILED) + workflowRuleId;
            throw e;
        }
    },
    
    /**
     * 16.3 compatibility method. Use call() in new code instead.
     * @deprecated
     * 
     * Call specified WFR and returns the result object.
     * The call is synchronous, i.e. runRule() does not return until the WFR execution 
     * is finished and the result is received back on the client.
     * 
     * @param {workflowRuleId}   WFR ID, such as AbCommonResources-getUser.
     * @param {parameters}       WFR input parameters object that can contain:
     *                           - simple properties, such as strings or numbers;
     *                           - other objects or arrays encoded in JSON notation;
     * @param {timeout}          Optional: Timeout in seconds, or null to use default timeout.
     * @return                   WFR result object.
     */
    runRuleAndReturnResult: function(workflowRuleId, parameters, timeout) {
        try {
            if (!valueExists(timeout)) {
                timeout = Ab.workflow.Workflow.DEFAULT_TIMEOUT;
            }
            var systemCallback = new Ab.workflow.Callback(null, null);
            var callbackDelegate = systemCallback.afterRuleExecuted.createDelegate(systemCallback);
            var options = {
                'callback': callbackDelegate,
                'async': false,
                'timeout': timeout * 1000
            }
            
            this.prapareParameters(parameters);
            workflow.runWorkflowRule(workflowRuleId, parameters, null, options);
            var result = systemCallback.result;
            
			if (!result)
			{
				// alert('No result.');
				result = {};
				result.code = 'ruleFailed';
			}
            else if (!valueExists(result.message)) {
                result.message = 'Workflow rule executed';
				// View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_EXECUTED) + 
                //    ': ' + workflowRuleId + ' (' + result.executionTime + ' ms)';
            }
            
            return result;
        } catch (e) {
            e.description = 'Workflow rule failed';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_FAILED) + ': ' + workflowRuleId;
            throw e;
        }
    },
    
    /**
     * Calls a workflow rule with parameters and file upload. Normally we call rules in async mode,
     * but DWR calls with file uploads can only be made in synchronous mode.
     * 
     * @param {workflowRuleId}   WFR ID, such as AbCommonResources-getUser.
     * @param {parameters}       WFR input parameters object that can contain:
     *                           - simple properties, such as strings or numbers;
     *                           - other objects or arrays encoded in JSON notation;
     * @param {uploadElement}    DOM element reference for file upload (<input type="file">).
     * @param {callbackFunction} Callback function reference (can be global function or object method).
     * @param {callbackObject}   Callback object instance (null if the callback is a global function).
     * @param {timeout}          Optional: Timeout in seconds, or null to use default timeout.
     */
    runRuleWithUpload: function(workflowRuleId, parameters, uploadElement, callbackFunction, callbackObject, timeout) {
        try {
            if (!valueExists(timeout)) {
                timeout = Ab.workflow.Workflow.DEFAULT_TIMEOUT;
            }
            var systemCallback = new Ab.workflow.Callback(callbackFunction, callbackObject);
            var callbackDelegate = systemCallback.afterRuleExecuted.createDelegate(systemCallback);
            var options = {
                'callback': callbackDelegate,
                'timeout': timeout * 1000
            }
            
            this.prapareParameters(parameters);
            workflow.runWorkflowRule(workflowRuleId, parameters, uploadElement, options);
            
        } catch (e) {
            e.description = 'Workflow rule failed';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_FAILED) + ': ' + workflowRuleId;
            throw e;
        }
    },
    
    /**
     * Call specified WFR with specified parameters.

     * @param {workflowRuleId} ID in the activityId-ruleId format. 
     * @param {parameters} One of the following:
     *                     - Ab.data.Record object;
     *                     - array of Ab.data.Record objects;
     *                     - regular parameters object as in runRule().
     * @throws WFR result as an exception is anything goes wrong.
     */
    call: function(workflowRuleId, parameters, timeout) {
        if (!valueExists(parameters)) {
            parameters = {};
        }
        if (parameters.constructor == Ab.data.Record) {
            parameters = {
                record: toJSON(parameters)
            };
        } else if (parameters.constructor == Ab.data.DataSetList) {
            parameters = {
                records: toJSON(parameters)
            };
        } else if (parameters.constructor == Array) {
            parameters = {
                records: toJSON(parameters)
            };
        }
        var result = this.runRuleAndReturnResult(workflowRuleId, parameters, timeout);
        // check if there was a session timeout
        if (result.code == 'sessionTimeout') {
            this.handleSessionTimeout(result.message);
        } else if (result.code != 'executed') {
            throw result;
        }
        return result;
    },
    
    /**
     * Call specified WFR event handler method with specified parameters.
     * 
     * @param {workflowRuleId} ID in the activityId-ruleId-methodName format. 
     * @throws WFR result as an exception is anything goes wrong.
     */
    callMethod: function(workflowRuleId) {
        var methodParameters = [];
        for (var i = 1; i < arguments.length; i++) {
            methodParameters.push(arguments[i]);
        }
        var result = this.call(workflowRuleId, {
            methodParameters: toJSON(methodParameters)
        });
        return result;
    },
    
    /**
     * Call specified WFR event handler method with specified parameters.
     * 
     * @param {workflowRuleId} ID in the activityId-ruleId-methodName format.
     * @param {parameters} Old-style parameters object. 
     * @throws WFR result as an exception is anything goes wrong.
     */
    callMethodWithParameters: function(workflowRuleId, parameters) {
        return this.call(workflowRuleId, parameters);
    },
    
    /**
     * Handles error result.
     */
    handleError: function(result, callback, winLocation) {
/*        if (result.stack) {
            View.showException(result, result.message, callback);
        } else {
            var message = this.resultCodeToMessage(result.code);
            View.log(message + ': ' + result.message, 'error', 'Workflow');
            View.showMessage('error', message + ':<br/>' + result.message, result.detailedMessage, result.data, callback, winLocation);
        }
	*/
		alert('Error ' + result.message);;
    },
    
    /**
     * Handles session timeout result.
     */
    handleSessionTimeout: function(url) {
		// alert('Session timeout ' + url);

        // set flag to avoid Service call on logout & prohibit all message dialogs
        this.sessionTimeoutDetected = true;
        // top.View.sessionTimeoutDetected = true;
/*        
        // display the timeout message
        var title = View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_SESSION_TIMEOUT_TITLE);
        var message = View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_SESSION_TIMEOUT);
        Ext.MessageBox.alert(title, message, function() {
            // when the user clicks OK, redirect to the logout page
            top.location = View.getUrlForPath(url);
        });
*/
    },

    /**
     * Called when DWR reports an error.
     */ 
    handleDwrError: function(message, ex) {
        // DWR has its own session timeout check which may bypass our server-side timeout check
    	// KB 3029607: in SSO mode, if the security interceptor throws an exception, there is no response data 
		alert('Workflow error ' + message);
		/*
        if (message == Workflow.ERROR_SCRIPT_SESSION || message == Workflow.ERROR_NO_DATA) {
            this.handleSessionTimeout(View.logoutView);
        } else {
            View.log(message, 'error', 'Workflow');
        }
		*/
    }, 
    
    /**
     * Called when DWR reports a warning.
     */ 
    handleDwrWarning: function(message, ex) {
        //View.log(message, 'warn', 'Workflow');
		alert('Workflow warning ' + message);
    },
    
    resultCodeToMessage: function(code) {
        var message = 'Workflow rule executed';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_EXECUTED);
        if (code == 'ruleFailed') {
            message = 'Workflow rule failed';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_FAILED);
        } else if (code == 'ruleNotFound') {
            message = 'Workflow rule not found';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_NOT_FOUND);
        } else if (code == 'containerFailed') {
            message = 'Workflow container failed';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_CONTAINER_FAILED);
        } else if (code == 'ruleNotPermitted') {
            message = 'Workflow rule not permitted';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_RULE_NOT_PERMITTED);
        } else if (code == 'sessionTimeout') {
            message = 'Workflow session timeout';//View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_SESSION_TIMEOUT);
        }
        return message;
    } ,
    
    // ----------------------- job-related methods ------------------------------------------------

    /**
     * Call specified WFR event-handler method with specified parameters as a Job.
     * 
     * @param {workflowRuleId} ID in the activityId-ruleId-methodName format. 
     * @return New job ID.
     * @throws WFR result as an exception is anything goes wrong.
     */
    startJob: function(workflowRuleId) {
        var methodParameters = [];
        for (var i = 1; i < arguments.length; i++) {
            methodParameters.push(arguments[i]);
        }
        
        methodParameters = toJSON(methodParameters);
        
        var result = this.call(workflowRuleId, {
            methodParameters: methodParameters,
            startAsJob: true
        }, null, arguments[1]);
        
        return result.message;
    },

    /**
     * Call specified WFR event-handler method with specified parameters as a Job with file upload.
     * 
     * @param {workflowRuleId} ID in the activityId-ruleId-methodName format. 
     * @param {callbackFunction} Callback function reference (can be global function or object method).
     * @param {callbackObject}   Callback object instance (null if the callback is a global function).
     * @throws WFR result as an exception is anything goes wrong.
     */
    startJobWithUpload: function(workflowRuleId, uploadElement, callbackFunction, callbackObject) {
        var methodParameters = [];
        for (var i = 4; i < arguments.length; i++) {
            methodParameters.push(arguments[i]);
        }
        var result = this.runRuleWithUpload(workflowRuleId, {
            methodParameters: toJSON(methodParameters),
            startAsJob: true
        }, uploadElement, callbackFunction, callbackObject);
    },

    /**
     * Returns the job status JSON object for specified job.
     * @return the last known job status.
     */
    getJobStatus: function(jobId) {
        try {
            var result = Workflow.call('AbCommonResources-getJobStatus', {jobId: jobId});
            var jobStatus = result.data;
            if (valueExists(jobStatus.data)) {
                jobStatus.dataSet = Ab.data.createDataSet(jobStatus.data)
            }
            return jobStatus;
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Attempts to stop specified job. 
     * @return the last known job status.
     */
    stopJob: function(jobId){
        try {
            var result = Workflow.call('AbCommonResources-stopJob', {jobId: jobId});
            return result.data;
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Forcefully terminates specified job. Call this method only if the job does not stop after
     * you call the Workflow.stopJob() method. 
     * @return the last known job status.
     */
    terminateJob: function(jobId){
        try {
            var result = Workflow.call('AbCommonResources-terminateJob', {jobId: jobId});
            return result;
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Returns an array of job status JSON objects for all jobs started by the current user.
     */
    getJobStatusesForUser: function(){
        try {
            var result = Workflow.call('AbCommonResources-getJobStatusesForUser');
            return result.data;
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Prepares WFR parameters before calling the WFR.
     */
    prapareParameters: function(parameters) {
    	// ensure that the view version is set to 2.0 (this class can be only used by 2.0 views)
        if (valueExists(parameters) && !valueExists(parameters.version)) {
            parameters.version = '2.0';
        }
        
        // encode reserved SQL words in the SQL restriction string (but not in the parsed restriction)
        if (valueExists(parameters) && valueExists(parameters.restriction) && 
        		parameters.restriction.constructor === String &&
        		parameters.restriction.length > 0 &&
        		parameters.restriction.charAt(0) !== '{' &&
        		parameters.restriction.charAt(0) !== '[') {
        	parameters.restriction = doSecure(parameters.restriction);
        }
    }
});

/**
 * Shortcut Workflow reference.
 */
Workflow = Ab.workflow.Workflow;


/**
 * Callback object that is invoked by DWR and in turn invokes the user-defined callback.
 */
Ab.workflow.Callback = Base.extend({

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
        
        //View.log('rule executed: [' + result.jsonExpression + ']', 'info', 'workflow');
        
        // evaluate the JSON expression and save the data into the result object
        result.data = null;
        result.dataSet = null;
        if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
            result.data = eval('(' + result.jsonExpression + ')');

            //View.log('data evaluated', 'info', 'workflow');
            
            if (valueExists(result.data.type)) {
                result.dataSet = Ab.data.createDataSet(result.data);
            } else if (valueExists(result.data.records)) {
                result.dataSet = new Ab.data.DataSetList(result.data);
            }

            //View.log('data set created', 'info', 'workflow');
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
    }
});
