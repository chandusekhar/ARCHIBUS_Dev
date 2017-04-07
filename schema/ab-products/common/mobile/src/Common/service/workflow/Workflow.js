/**
 * Provides methods to execute Workflow rules on the Web Central server.
 *
 *  Calling a Workflow Rule using Common.service.workflow.Workflow#callMethodAsync
 *
 *     var me = this,
 *         callback = function(success, errorMessage, result) {
 *              if (!success) {
 *                   alert('WFR Failed');
 *              } else {
 *                   var wfrResult = result;
 *              }
 *         };
 *
 *       Workflow.callMethodAsync('AbBldgOpsHelpDesk-MaintenanceMobileService-syncWorkData',
 *       ['TRAM', 'TRAM, WILL'], 60,  callback, me);
 *
 * @singleton
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.service.workflow.Workflow', {
    requires: [
        'Common.service.workflow.JsonUtil',
        'Common.service.Session',
        'Common.service.ExceptionTranslator'
    ],

    alternateClassName: ['Workflow'],
    singleton: true,

    /**
     * @property {Number} DEFAULT_TIMEOUT The default timeout in seconds
     */
    DEFAULT_TIMEOUT: 10,

    /**
     * Object to store the result of the workflow rule
     * @private
     */
    resultCallbackObject: {
        result: null,

        afterRuleExecuted: function (result) {
            this.result = result;
        }
    },

    /**
     *
     * Call specified WFR and returns the result object. The call is
     * synchronous, i.e. runRule() does not return until the WFR
     * execution is finished and the result is received back on the
     * client.
     * @deprecated Use {@link Common.service.workflow.Workflow#callMethodAsync}
     * @private
     * @param {String} workflowRuleId id such as AbCommonResources-getUser.
     * @param {Object} parameters input parameters object that can contain: - simple
     *            properties, such as strings or numbers; - other
     *            objects or arrays encoded in JSON notation;
     * @param {Number} timeout Optional: Timeout in seconds, or null to use default timeout.
     * @return {Object} result The WFR result object.
     */
    runRuleAndReturnResult: function (workflowRuleId, parameters, timeout) {
        var callbackDelegate,
            options,
            result;

        try {
            if (Ext.isEmpty(timeout)) {
                timeout = this.DEFAULT_TIMEOUT;
            }

            callbackDelegate = Ext.bind(
                this.resultCallbackObject.afterRuleExecuted,
                this.resultCallbackObject);

            options = {
                callback: callbackDelegate,
                async: false,
                timeout: timeout * 1000
            };
            parameters.version = '2.0';

            workflow.runWorkflowRule(workflowRuleId, parameters, null, options);

            result = this.resultCallbackObject.result || {};
            if (Ext.isEmpty(result.message)) {
                result.message = LocaleManager.getLocalizedString('Workflow Rule Executed', 'Common.service.workflow.Workflow');
            }
            return result;

        } catch (e) {
            e.description = LocaleManager.getLocalizedString('Workflow rule failed: ', 'Common.service.workflow.Workflow') + workflowRuleId;
            throw e;
        }
    },

    /**
     * Call specified WFR with specified parameters.
     *
     * @param {String} workflowRuleId The workflow rule id in the activityId-ruleId format.
     * @param {Object} parameters  The parameters object as in runRule().
     * @param {Number} timeout The timeout value in seconds
     * @throws WFR result as an exception is anything goes wrong.
     */
    call: function (workflowRuleId, parameters, timeout) {
        var errorMessage = 'Workflow rule failed. Message: [ {0} ]',
            result;

        if (Ext.isEmpty(parameters)) {
            parameters = {};
        } else if (parameters.constructor === Array) {
            parameters = {
                records: Common.service.workflow.JsonUtil.toJSON(parameters)
            };
        }

        result = this.runRuleAndReturnResult(workflowRuleId, parameters, timeout);

        // Throw an exception for any code except executed. This
        // includes session timeout.
        if (result.code !== 'executed') {
            throw new Error(Ext.String.format(errorMessage, result.message));
        }
        return result;
    },

    /**
     * Call specified WFR event handler method with specified
     * parameters.
     * @deprecated Use {@link Common.service.workflow.Workflow#callMethodAsync}
     * @param {String} workflowRuleId The workflow rule id in the activityId-ruleId format.
     * @throws WFR result as an exception is anything goes wrong.
     */
    callMethod: function (workflowRuleId) {
        var methodParameters = [],
            result,
            i;

        for (i = 1; i < arguments.length; i++) {
            methodParameters.push(arguments[i]);
        }

        result = this.call(workflowRuleId, {
            methodParameters: Common.service.workflow.JsonUtil.toJSON(methodParameters)
        });

        return result;
    },

    /**
     * @deprecated Use {@link Common.service.workflow.Workflow#callMethodAsync}
     * @param {String} workflowRuleId The workflow rule id in the activityId-ruleId format.
     * @param {Object[]} parameterArray  The parameters object as in runRule().
     * @param {Number} timeout The timeout value in seconds
     * @returns {Object} result The result object
     */
    callMethodWithTimeout: function (workflowRuleId, parameterArray, timeout) {
        return this.call(workflowRuleId, {
            methodParameters: Common.service.workflow.JsonUtil.toJSON(parameterArray)
        }, timeout);
    },

    /**
     *
     * @param {String} workflowRuleId The workflow rule id in the activityId-ruleId format.
     * @param {Object} parameters  The parameters object as in runRule().
     * @param {Number} timeout The timeout value in seconds
     * @param {Function} callback Function called when the WFR completes.
     * @param {Boolean} [callback.success] True if the workflow rules succeeds
     * @param {String} [callback.errorMessage] Contains the error message if an error occurs
     * @param {Object} [callback.result] The WFR result object
     * @param {Object} scope The scope for callback
     */
    callMethodAsync: function (workflowRuleId, parameterArray, timeout, callback, scope) {
        var success,
            errorMsg = null,
            doCallback = function (success, errorMessage, result) {
                var localizedErrorMessage = null;
                Common.service.Session.end()
                    .then(function() {
                        // Localize the message
                        if(!success && errorMessage !== null) {
                            localizedErrorMessage = ExceptionTranslator.checkDwrFrameworkMessages(errorMessage);
                        }
                        Ext.callback(callback, scope, [success, localizedErrorMessage, result]);
                    });
            },

            wfrResult = function (result) {
                if (result.code === 'executed') {
                    success = true;
                } else {
                    success = false;
                    errorMsg = result.message;
                }
                doCallback(success, errorMsg, result);
            },

            wfrError = function (error) {
                success = false;
                doCallback(success, error, null);
            },

            options = {
                callback: wfrResult,
                errorHandler: wfrError,
                async: true,
                timeout: timeout * 1000
            },

            parameters = {
                methodParameters: Common.service.workflow.JsonUtil.toJSON(parameterArray),
                version: '2.0'
            };

        Common.service.Session.start()
            .then(function() {
                workflow.runWorkflowRule(workflowRuleId, parameters, null, options);
            }, function(error) {
                doCallback(false, error, null);
            });

    },

    /**
     *
     * @param {String} workflowRuleId The workflow rule id
     * @param {String[]} parameterArray An array of parameters
     * @param {Number} [timeout] The timeout value in seconds. Defaults to Network.SERVICE_TIMEOUT
     * @returns {Promise} A Promise resolved to the WFR result if the WRF result code is 'executed'. The Promise
     * is rejected if an error occurs during the WFR operation
     */
    execute: function (workflowRuleId, parameterArray, timeout) {
        var me = this,
            networkTimeout = Ext.isEmpty(timeout) ? Network.SERVICE_TIMEOUT : timeout;

        return new Promise(function (resolve, reject) {
            var wfrResult = function (result) {
                    if (result.code === 'executed') {
                        Log.log('WFR ' + workflowRuleId + ' completed [SUCCESS]', 'info', me, 'execute');
                        resolve(result);
                    } else {
                        reject(result.message);
                    }
                },
                options = {
                    callback: wfrResult,
                    errorHandler: reject,
                    async: true,
                    timeout: networkTimeout * 1000
                },
                parameters = {
                    methodParameters: Common.service.workflow.JsonUtil.toJSON(parameterArray),
                    version: '2.0'
                };

            Log.log('Calling WFR ' + workflowRuleId, 'info', me, 'execute');
            workflow.runWorkflowRule(workflowRuleId, parameters, null, options);
        });
    }
});