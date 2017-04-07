/**
 * RoomSurvey domain class
 * @since 21.2
 */
Ext.define('Space.model.RoomSurvey', {
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
                name: 'rm_cat',
                type: 'string'
            },
            {
                name: 'rm_type',
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
                name: 'rm_std',
                type: 'string'
            },
            {
                name: 'rm_use',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'cap_em',
                type: 'IntegerClass'
            },
            {
                name: 'prorate',
                type: 'string'
            },
            {
                name: 'survey_comments_rm',
                type: 'string'
            },
            {
                name: 'date_last_surveyed',
                type: 'date'
            },
            {
                name: 'status',
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
                name: 'transfer_status',
                type: 'string'
            },
            {
                name: 'survey_photo',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'survey_photo_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'survey_photo_isnew',
                type: 'boolean',
                defaultValue: false,
                isSyncField: false
            },
            {
                name: 'survey_photo_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            },
            {
                name: 'survey_redline_rm',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'survey_redline_rm_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'survey_redline_rm_isnew',
                type: 'boolean',
                defaultValue: false,
                isSyncField: false
            },
            {
                name: 'survey_redline_rm_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            }
        ]
    },

    /**
     * Returns the document field name
     * @returns {String}
     */
    getDocumentField: function () {
        return 'survey_photo';
    },

    /**
     * Returns the document field name
     * @returns {String}
     */
    getRedlineDocumentField: function () {
        return 'survey_redline_rm';
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

        if (data.survey_photo !== null) {
            documentCount += 1;
        }
        if (data.survey_redline_rm !== null) {
            documentCount += 1;
        }

        return documentCount;
    }

});