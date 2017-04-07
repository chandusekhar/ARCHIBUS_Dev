Ext.define('ConditionAssessment.model.ConditionAssessment', {
    extend: 'Common.data.Model',

    requires: 'Common.data.Validations',

    config: {
        fields: [
            {
                name: 'id',
                type: 'auto'
            },
            {
                name: 'activity_log_id',
                type: 'IntegerClass'
            },
            {
                name: 'project_id',
                type: 'string'
            },
            {
                name: 'site_id',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'location',
                type: 'string'
            },
            {
                name: 'eq_id',
                type: 'string'
            },
            {
                name: 'activity_type',
                type: 'string',
                defaultValue: 'ASSESSMENT'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'assessed_by',
                type: 'string'
            },
            {
                name: 'rec_action',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'completed_by',
                type: 'string'
            },
            {
                name: 'verified_by',
                type: 'string'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },
            {
                name: 'doc',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'doc_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'doc_isnew',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'doc_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'doc1',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },

            {
                name: 'doc1_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'doc1_isnew',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'doc1_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'doc2',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'doc2_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'doc2_isnew',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'doc2_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'doc3',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'doc3_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'doc3_isnew',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'doc3_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'doc4',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'doc4_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'doc4_isnew',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'doc4_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'date_verified',
                type: 'DateClass'
            },
            {
                name: 'date_assessed',
                type: 'DateClass'
            },
            {
                name: 'csi_id',
                type: 'string'
            },
            {
                name: 'cost_to_replace',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_est_cap',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_estimated',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_act_cap',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cond_value',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'cond_priority',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'sust_priority',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'questionnaire_id',
                type: 'string'
            },
            {
                name: 'act_quest',
                type: 'string'
            },
			{
                name: 'cost_fim',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_annual_save',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'uc_fim',
                type: 'IntegerClass',
                defaultValue: 0
            }
        ],
        validations: [
            {
                type: 'presence',
                field: 'description'
            },
            {
                type: 'format',
                field: 'cost_estimated',
                matcher: new RegExp('^[0-9]+$|^[0-9]+.[0-9]$|^[0-9]+.[0-9][0-9]$')
            },
            {
                type: 'format',
                field: 'cost_est_cap',
                matcher: new RegExp('^[0-9]+$|^[0-9]+.[0-9]$|^[0-9]+.[0-9][0-9]$')
            },
            {
                type: 'minvalue',
                field: 'cost_estimated',
                minValue: 0,
                message: LocaleManager.getLocalizedString(' must be greater than or equal to 0',
                    'ConditionAssessment.model.ConditionAssessment')
            },
            {
                type: 'minvalue',
                field: 'cost_est_cap',
                minValue: 0,
                message: LocaleManager.getLocalizedString(' must be greater than or equal to 0',
                    'ConditionAssessment.model.ConditionAssessment')
            },
            {
                type: 'maxvalue',
                field: 'cost_estimated',
                maxValue: 999999999,
                message: LocaleManager.getLocalizedString(' must be less than or equal to 999,999,999',
                    'ConditionAssessment.model.ConditionAssessment')
            },
            {
                type: 'maxvalue',
                field: 'cost_est_cap',
                maxValue: 999999999,
                message: LocaleManager.getLocalizedString(' must be less than or equal to 999,999,999',
                    'ConditionAssessment.model.ConditionAssessment')
            }
        ],
        sqlIndexes: [
            {
                indexName: 'idxConditionAssessmentActivityType',
                fields: ['activity_type']
            },
            {
                indexName: 'idxConditionAssessmentSiteId',
                fields: ['site_id']
            },
            {
                indexName: 'idxConditionAssessmentProjectId',
                fields: ['project_id']
            }
        ],
        uniqueIdentifier: ['activity_log_id']
    },

    /**
     * Returns the number of populated documents in the record.
     */
    getDocumentCount: function () {
        var data = this.getData(),
            documentCount = 0;

        if (!Ext.isEmpty(data.doc)) {
            documentCount += 1;
        }
        if (!Ext.isEmpty(data.doc1)) {
            documentCount += 1;
        }
        if (!Ext.isEmpty(data.doc2)) {
            documentCount += 1;
        }
        if (!Ext.isEmpty(data.doc3)) {
            documentCount += 1;
        }
        if (!Ext.isEmpty(data.doc4)) {
            documentCount += 1;
        }
        return documentCount;
    },

    /**
     * Checks all of the document fields and returns the field name of the first empty document field.
     * Returns null if all document fields are populated.
     *
     * @param conditionAssessmentRecord
     * @return {*}
     */
    getAvailableDocumentField: function (conditionAssessmentRecord) {
        var data = conditionAssessmentRecord.getData(),
            documentFields = ['doc', 'doc1', 'doc2', 'doc3', 'doc4'],
            i;

        for (i = 0; i < documentFields.length; i++) {
            if (Ext.isEmpty(data[documentFields[i]])) {
                return documentFields[i];
            }
        }
        return null;
    },

    /**
     * Applies the image data to the document field
     * @param {String} documentField The name of the document field
     * @param {String} imageData The base64 encoded image data
     */
    setDocumentFieldData: function (documentField, imageData) {
        var me = this;

        me.set(documentField, documentField + '.jpg');
        me.set(documentField + '_contents', imageData);
        me.set(documentField + '_isnew', true);
        me.set('mob_is_changed', 1);
    },

    /**
     * Returns the document field name given the id. The ConditionAssessment model contains a
     * doc field that does meet the naming convention of doc1, doc2 ...
     * @param {Number} documentId
     * @returns {string}
     */
    getDocumentFieldById: function (documentId) {
        if (documentId === 0) {
            return 'doc';
        }

        if (documentId > 0 && documentId < 5) {
            return 'doc' + documentId.toString();
        }

        return '';
    }

});
