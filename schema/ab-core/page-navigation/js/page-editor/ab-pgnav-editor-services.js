/**
 * Created by Meyer on 10/18/2015.
 * ab-pgnav-editor-services.js
 * Support for the home page editor interaction with the server.
 */

/**
 * Namespace for the home page editor JS classes.
 */
Ab.namespace('homepage');

/**
 * Services for the Home Page Editor.
 * Singleton.
 */
Ab.homepage.EditorServices = new (Base.extend({
    /**
     * Return the descriptor file contents.
     *
     * @param activityId afm_processes.activity_id for the home page process record.
     * @param processId afm_processes.process_id for the home page process record.
     * @param filename Filename for the descriptor within
     *  ab-products\common\views\page-navigation\descriptors.
     * @returns {{XML string describing one home page}}
     */
    fetchDescriptor: function (activityId, processId, filename) {
        var descriptorObject = {};
        try {
            var result = Workflow.callMethod('AbSystemAdministration-HomePageDescriptorService-getPageDescriptorFile', activityId, processId, filename);
            descriptorObject = JSON.parse(result.jsonExpression);
            descriptorObject.processId = processId;
        }
        catch (e) {
            Workflow.handleError(e);
        }

        return descriptorObject;
    },


    /**
     * Send the descriptor file and name to the server for persisting.
     *
     * @param filename
     * @param descriptorXml
     * @returns {{status message object}}
     */
    saveDescriptor: function (filename, descriptorXml) {
        var resultCode = 'na';
        try {
            var result = Workflow.callMethod('AbSystemAdministration-HomePageDescriptorService-savePageDescriptorFile', filename, descriptorXml);
            resultCode = result.code;
        }
        catch (e) {
            resultCode = e.code;
            // let the view or form show exception as a validation error
            // Workflow.handleError(e);
        }

        return resultCode;
    },

    /**
     * Request that the server create a copy of the descriptor process record
     * AND the descriptor XML file.
     *
     * @param parameters Object holding descriptor properties field values.
     * @returns {*}
     */
    copyDescriptorProcess: function (parameters) {
        var resultCode = 'na';
        try {
            var result = Workflow.callMethod('AbSystemAdministration-HomePageDescriptorService-copyPageDescriptorFile', parameters);
            resultCode = result.code;
        }
        catch (e) {
            resultCode = e.code;
            // let the form show exception as a validation error
            // Workflow.handleError(e);
        }

        return resultCode;
    },

    /**
     * Insert afm_roleprocs record linking the current role to a home page process
     * and when creating or copying an afm_processes record.
     * TODO should this really be a separate service call or part of saving the descriptor
     * 
     * @param parameters
     */
    createLinkingRoleProcsRecord: function(parameters) {
        var resultCode = 'na';
        try {
            var result = Workflow.callMethod('AbSystemAdministration-HomePageDescriptorService-createRoleProcsRecord', parameters);
            resultCode = result.code;
        }
        catch (e) {
            resultCode = e.code;
            Workflow.handleError(e);
        }

        return resultCode;
    },

    /**
     * Save the modified process tasks to afm_ptasks
     * @param taskRecords
     */
    saveAddedProcessTasks: function (taskRecords, parameters) {
        var resultCode = 'na';
        try {
            var dataSet = new Ab.data.DataSetList();
            dataSet.addRecords(taskRecords);
            var result = Workflow.callMethod('AbSystemAdministration-HomePageDescriptorService-saveTransferredTaskRecords', dataSet, parameters);
            resultCode = result.code;
        }
        catch (e) {
            resultCode = e.code;
            Workflow.handleError(e);
        }

        return resultCode;
    },

    /**
     * Publish the descriptor for the current user's role.
     * @param descriptorName
     * @param processId
     * @param title
     * @returns {{status message object}}
     */
    publishDescriptor: function (descriptorName, processId, title) {
        var returnValue = false;
        try {
            var result = Ab.workflow.Workflow.call('AbCommonResources-publishHomePageForRole', {
                descriptorFileName: descriptorName,
                title: title,
                processId: processId
            });

            if (Ab.workflow.Workflow.sessionTimeoutDetected) {
                returnValue = false;
            }
            else if (result.data && result.data.value > 0) {
                // TODO localize
                View.showMessage("Publishing error: " + result.data.message);
                returnValue = false;
            }
            else {
                returnValue = true;
            }
        }
        catch (e) {
            Workflow.handleError(e);
        }

        return returnValue;
    }
}));
