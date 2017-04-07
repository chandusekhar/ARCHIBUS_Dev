Ext.define('IncidentReporting.view.PhotoPanel', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'incidentPhotoPanel',

    config: {
        incidentId: null,

        imageData: null,

        styleHtmlContent: true,

        isDisplayOnly: false,

        isCreateView: true,

        // KB3046972 - avoid showing the Display buttons from underneath list
        zIndex: 20,

        model: 'IncidentReporting.model.Document',
        storeId: 'documentsStore',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                title: LocaleManager.getLocalizedString('Photo', 'IncidentReporting.view.PhotoPanel')
            },
            {
                itemId: 'imageContainer',
                xtype: 'container',
                html: ''
            },
            {
                xtype: 'fieldset',
                itemId: 'photoFieldSet',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },

                items: [
                    {
                        xtype: 'commontextfield',
                        label: LocaleManager.getLocalizedString('Photo Name', 'IncidentReporting.view.PhotoPanel'),
                        name: 'name',
                        itemId: 'photoName',
                        required: true
                    },
                    {
                        xtype: 'commontextareafield',
                        label: LocaleManager.getLocalizedString('Photo Desc.', 'IncidentReporting.view.PhotoPanel'),
                        name: 'description',
                        itemId: 'photoDescription',
                        required: true
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'mob_doc_id',
                        itemId: 'documentId'
                    }
                ]
            },
            {
                xtype: 'titlebar',
                docked: 'bottom',
                cls: 'ab-toolbar',
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Attach', 'IncidentReporting.view.PhotoPanel'),
                        ui: 'action',
                        align: 'right',
                        action: 'attachPhoto'
                    },
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Save', 'IncidentReporting.view.PhotoPanel'),
                        ui: 'action',
                        align: 'right',
                        action: 'updatePhotoDetails'
                    },
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Delete', 'IncidentReporting.view.PhotoPanel'),
                        ui: 'action',
                        align: 'right',
                        action: 'deletePhoto'
                    },
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Close', 'IncidentReporting.view.PhotoPanel'),
                        action: 'closePhotoPanel',
                        margin: 0
                    }
                ]
            }
        ]
    },

    applyImageData: function (imageData) {
        this.setImageHtml(imageData);
        return imageData;
    },

    setImageHtml: function (imageData) {
        var imageContainer = this.query('#imageContainer')[0];

        imageContainer.setHtml('<div style="width:380px;margin-left:auto;margin-right:auto;"><img style="margin:auto;display:block" width=220" height="220" src="data:image/jpg;base64,'
            + imageData + '"/></div>');
    },

    applyIsDisplayOnly: function (config) {
        var attachButton = this.query('button[action=attachPhoto]')[0],
            saveButton = this.query('button[action=updatePhotoDetails]')[0],
            deleteButton = this.query('button[action=deletePhoto]')[0];

        attachButton.setHidden(config);
        deleteButton.setHidden(!config);
        saveButton.setHidden(!config);
    }

});