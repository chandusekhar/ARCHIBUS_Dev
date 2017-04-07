Ext.define('WorkplacePortal.model.ServiceDeskRequest', {
    extend: 'Common.data.Model',

    probTypeValidation: {
        type: 'presence',
        field: 'prob_type'
    },

    // KB3046810 - set bl_id required for Maintenance requests
    blIdValidation: {
        type: 'presence',
        field: 'bl_id'
    },

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
                name: 'activity_type',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'date_requested',
                type: 'DateClass',
                defaultValue: new Date()
            },
            {
                name: 'status',
                type: 'string'
            },
            {
                name: 'requestor',
                type: 'string'
            },
            {
                name: 'phone_requestor',
                type: 'string'
            },
            {
                name: 'prob_type',
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
                name: 'doc1',
                type: 'string',
                isDocumentField: true
            },
            {
                name: 'doc1_contents',
                type: 'string'
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
                isDocumentField: true
            },
            {
                name: 'doc2_contents',
                type: 'string'
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
                isDocumentField: true
            },
            {
                name: 'doc3_contents',
                type: 'string'
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
                isDocumentField: true
            },
            {
                name: 'doc4_contents',
                type: 'string'
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
            }
        ],

        validations: [
            {
                type: 'presence',
                field: 'site_id'
            },
            {
                type: 'presence',
                field: 'phone_requestor'
            },
            /* KB 3045280 problem type is required for Maintenance work requests only, so it is added dynamically {
             type: 'presence',
             field: 'prob_type'
             },*/
            {
                type: 'presence',
                field: 'description'
            }
        ]
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
    }

});
