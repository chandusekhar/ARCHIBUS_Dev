Ext.define('SpaceBook.view.DocumentList', {
    extend: 'Common.view.DocumentList',

    xtype: 'spaceBookDocumentList',

    config: {
        enableImageRedline: true
    },

    /**
     * Used in parent class Common.view.DocumentList.
     * @param record
     * @returns Array with document fields information
     */
    getDocuments: function (record) {
        var data = record.getData();
        return [
            {
                fieldId: 'survey_photo',
                file: data.survey_photo,
                data: data.survey_photo_contents
            }
        ];
    }
});