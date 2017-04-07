Ext.define('Maintenance.model.WorkRequest', {
    extend: 'Common.data.Model',

    config: {
        disableValidation: false,

        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'mob_wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'mob_is_changed',
                type: 'IntegerClass'
            },
            {
                name: 'mob_locked_by',
                type: 'string'
            },
            {
                name: 'mob_pending_action',
                type: 'string'
            },
            {
                name: 'wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'parent_wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'cf_notes',
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
                name: 'prob_type',
                type: 'string'
            },
            {
                name: 'priority',
                type: 'IntegerClass',
                defaultValue: 1
            },
            {
                name: 'requestor',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'eq_id',
                type: 'string'
            },
            {
                name: 'status',
                type: 'string',
                defaultValue: 'R'
            },
            {
                name: 'date_requested',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'tr_id',
                type: 'string'
            },
            {
                name: 'pmp_id',
                type: 'string'
            },
            {
                name: 'date_assigned',
                type: 'DateClass'
            },
            {
                name: 'date_est_completion',
                type: 'DateClass'
            },
            {
                name: 'date_escalation_completion',
                type: 'DateClass'
            },
            {
                name: 'request_type',
                type: 'IntegerClass',
                defaultValue: 0
            },
            {
                name: 'cause_type',
                type: 'string'
            },
            {
                name: 'repair_type',
                type: 'string'
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
            // 21.3 fields
            {
                name: 'status_initial',
                type: 'string',
                isSyncField: false
            },
            {
                name: 'mob_stat_step_chg',
                type: 'IntegerClass'
            },
            {
                name: 'mob_step_action',
                type: 'string'
            },
            {
                name: 'mob_step_comments',
                type: 'string'
            },
            {
                name: 'escalated_response',
                type: 'IntegerClass'
            },
            {
                name: 'escalated_completion',
                type: 'IntegerClass'
            },
            {
                name: 'step',
                type: 'string'
            },
            {
                name: 'step_log_id',
                type: 'IntegerClass'
            },
            {
                name: 'step_type',
                type: 'string'
            },
            {
                name: 'step_status',
                type: 'string'
            },
            {
                name: 'step_user_name',
                type: 'string'
            },
            {
                name: 'step_em_id',
                type: 'string'
            },
            {
                name: 'step_role_name',
                type: 'string'
            },
            {
                name: 'is_req_supervisor',
                type: 'IntegerClass'
            },
            {
                name: 'is_req_craftsperson',
                type: 'IntegerClass'
            },
            {
                name: 'is_wt_self_assign',
                type: 'IntegerClass'
            },
            {
                name: 'cost_est_labor',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_est_parts',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_est_other',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_est_total',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_labor',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_parts',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_other',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'cost_total',
                type: 'float',
                defaultValue: 0
            },
            {
                name: 'time_requested',
                type: 'TimeClass'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'fwd_supervisor',
                type: 'string'
            },
            {
                name: 'fwd_work_team_id',
                type: 'string'
            },
            {
                name: 'supervisor',
                type: 'string'
            },
            {
                name: 'estimation_comp',
                type: 'IntegerClass'
            },
            {
                name: 'scheduling_comp',
                type: 'IntegerClass'
            },
            {
                name: 'work_team_id',
                type: 'string'
            }
        ],

        customValidations: [
            {
                fields: ['bl_id', 'prob_type'],
                type: 'buildingRequired',
                message: LocaleManager.getLocalizedString(' {0} is required',
                    'Maintenance.model.WorkRequest'),
                formatted: true
            }

        ],

        validations: [
            {
                type: 'presence',
                field: 'description'
            }
           
        ]
    },

    /**
     * Override to allow setting of the mob_pending_action field
     * Sets the Changed on Mobile field to true if any of the values in the record have been modified
     */
    setChangedOnMobile: function () {
        this.callParent();

        if (this.fields.containsKey('mob_pending_action') && this.fields.containsKey('status')) {
            this.set('mob_pending_action', this.get('status'));
        }
    },

    /**
     * Returns the number of populated documents in the record.
     */
    getDocumentCount: function () {
        var data = this.getData(),
            documentCount = 0;

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
     * Checks the document fields and returns the first empty field or null
     * if all document fields are populated
     * @returns {String}
     */
    getAvailableDocumentField: function () {
        var data = this.getData(),
            documentFields = ['doc1', 'doc2', 'doc3', 'doc4'], i;

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
     * Returns the document field name given the id.
     * @param documentId
     * @returns {string}
     * */
     getDocumentFieldById: function(documentId) {
        if(documentId === 0) {
            return 'doc';
        }

        if(documentId > 0 && documentId < 5) {
           return 'doc' + documentId.toString();
        }
        return '';
    },

    /**
     * Sets the Status Or Step Changed on Mobile field to true and the Step Action field to the given value
     */
    setMobileStepActionChanged: function (stepAction) {
        var me = this;

        if (me.fields.containsKey('mob_step_action')) {
            me.set('mob_step_action', stepAction);
            me.setMobileStatusChanged();
        }
    },

    /**
     * Sets the Status Or Step Changed on Mobile field to true
     * and calls the setChangedOnMobile()
     * @param [value] (optional) the value to set to mob_stat_step_chg
     */
    setMobileStatusChanged: function (value) {
        var me = this;

        if (me.fields.containsKey('mob_stat_step_chg')) {
            me.set('mob_stat_step_chg', Ext.isDefined(value) ? value : 1);
            me.setChangedOnMobile();
        }
    },

    /**
     * Returns true if the status or step action field changed
     * @returns {Boolean|*|boolean}
     */
    mobileStatusStepChanged: function () {
        var me = this;

        return me.fields.containsKey('mob_stat_step_chg') && me.get('mob_stat_step_chg') === 1;
    },

    updateCostEstTotal: function () {
        var costEstTotal = this.get('cost_est_labor') + this.get('cost_est_parts') + this.get('cost_est_other');

        this.set('cost_est_total', costEstTotal);
        // the costs recalculations do not matter for the sync this.setChangedOnMobile();
    },

    updateCostTotal: function () {
        var costTotal = this.get('cost_labor') + this.get('cost_parts') + this.get('cost_other');

        this.set('cost_total', costTotal);
        // the costs recalculations do not matter for the sync this.setChangedOnMobile();
    },

    getServerTableName: function () {
        return 'wr_sync';
    }
});
