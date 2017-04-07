Ext.define('AssetAndEquipmentSurvey.model.Task', {
    extend: 'Common.data.Model',

    config: {

        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'survey_id',
                type: 'string'
            },
            {
                name: 'eq_id',
                type: 'string'
            },
            {
                name: 'num_serial',
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
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'eq_std',
                type: 'string'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'status',
                type: 'string'
            },
            {
                name: 'marked_for_deletion',
                type: 'IntegerClass'
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
                name: 'date_last_surveyed',
                type: 'date'
            },
            {
                name: 'transfer_status',
                type: 'string'
            },
            {
                name: 'survey_complete',
                type: 'boolean',
                defaultValue: false,
                isSyncField: false
            },
            {
                name: 'survey_comments',
                type: 'string'
            },
            {
                name: 'survey_photo_eq',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'survey_photo_eq_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'survey_photo_eq_isnew',
                type: 'boolean',
                defaultValue: false,
                isSyncField: true
            },
            {
                name: 'survey_photo_eq_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'survey_redline_eq',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'survey_redline_eq_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'survey_redline_eq_isnew',
                type: 'boolean',
                defaultValue: false,
                isSyncField: true
            },
            {
                name: 'survey_redline_eq_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            }
        ],

        validations: [
            {
                type: 'presence',
                field: 'eq_id'
            },
            {
                type: 'presence',
                field: 'survey_id'
            }
        ]
    },

    /**
     * Returns the document field to be used for this app
     * This app uses only one document field.
     * @returns {String}
     */
    getDocumentField: function () {
        return 'survey_photo_eq';
    },

    /**
     * Applies the image data to the document field
     * @param {String} documentField The name of the document field
     * @param {String} imageData The base64 encoded image data
     */
    setDocumentFieldData: function (documentField, imageData) {
        var me = this;

        // autoSync is disabled in the Controller
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

        if (data.survey_photo_eq !== null) {
            documentCount += 1;
        }
        if (data.survey_redline_eq !== null) {
            documentCount += 1;
        }

        return documentCount;
    },

    hasPhotoDocument: function() {
        var data = this.getData();

        return (data.survey_photo_eq !== null);
    }
});