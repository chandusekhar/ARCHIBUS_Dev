Ext.define('IncidentReporting.controller.IncidentDocuments', {
    extend: 'Ext.app.Controller',

    requires: [ 'IncidentReporting.view.PhotoPanel' ],

    config: {
        refs: {
            mainView: 'main',
            generalView: 'generalcard',
            documentViewItem: 'documentItem'
        },
        control: {
            'button[action=capturePhoto]': {
                tap: 'onCapturePhoto'
            },
            'button[action=attachPhoto]': {
                tap: 'onAttachPhoto'
            },
            'button[action=updatePhotoDetails]': {
                tap: 'onUpdatePhotoDetails'
            },
            'button[action=deletePhoto]': {
                tap: 'onDeletePhoto'
            },
            'button[action=closePhotoPanel]': {
                tap: 'onClosePhotoPanel'
            },
            documentViewItem: {
                displaydocument: 'onDisplayDocument'
            }
        }
    },

    /**
     * Launches the device camera. Displays the photo if the capture is
     * successful.
     */
    onCapturePhoto: function () {
        var me = this,
            generalView = me.getGeneralView(),
            incidentRecord = generalView.getRecord(),
            mobIncidentId = incidentRecord.get('mob_incident_id'),
            errorTitle = LocaleManager.getLocalizedString('Incident unavailable', 'IncidentReporting.controller.IncidentDocuments'),
            errorMessage = LocaleManager.getLocalizedString('Please first save the incident.', 'IncidentReporting.controller.IncidentDocuments'),
            onSuccess = function (imageData) {
                me.displayPhoto(imageData, false);
            },
            onFail = function () {
                // Do nothing if there is a failure.
            };

        if (!mobIncidentId) {
            Ext.Msg.alert(errorTitle, errorMessage);
            return;
        }

        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 15,
            destinationType: Camera.DestinationType.DATA_URL,
            applicationName: "IncidentReporting",
            correctOrientation: true,
            targetWidth: 500,
            targetHeight: 500
        });
    },

    /**
     * Returns the PhotoPanel view to be used for the current profile
     */
    getPhotoPanelView: function () {
        var profile = this.getApplication().getCurrentProfile().getNamespace();

        return Ext.create('IncidentReporting.view.' + profile + '.PhotoPanel');
    },

    onDisplayDocument: function (mobileDocId) {
        var me = this,
            documentsStore = Ext.getStore('documentsStore'),
            documentRecord,
            documentData, documentName, documentDescription;

        documentsStore.setDisablePaging(true);
        documentsStore.load(function () {
            documentsStore.setDisablePaging(false);
            documentRecord = documentsStore.findRecord('mob_doc_id', mobileDocId);
            if (documentRecord) {
                documentData = documentRecord.get('doc_contents');
                documentName = documentRecord.get('name');
                documentDescription = documentRecord.get('description');
                me.displayPhoto(documentData, true, documentName, documentDescription, mobileDocId);
            }
        });
    },

    displayPhoto: function (imageData, isDisplayOnly, documentName, documentDescription, mobileDocId) {
        var me = this, photoFieldSetComponent;

        if (!me.photoPanel) {
            me.photoPanel = me.getPhotoPanelView();
            Ext.Viewport.add(me.photoPanel);
        }

        me.photoPanel.reset();
        me.photoPanel.removeErrorPanelIfExists();
        me.photoPanel.removeFieldErrorCls();

        me.photoPanel.setIsDisplayOnly(isDisplayOnly);
        me.photoPanel.setImageData(imageData);

        photoFieldSetComponent = Ext.ComponentQuery.query('#photoFieldSet')[0];
        if (documentName) {
            photoFieldSetComponent.getItems().get('photoName').setValue(documentName);
        }
        if (documentDescription) {
            photoFieldSetComponent.getItems().get('photoDescription').setValue(documentDescription);
        }
        if (mobileDocId) {
            photoFieldSetComponent.getItems().get('documentId').setValue(mobileDocId);
        }

        me.photoPanel.show();
    },

    onAttachPhoto: function () {
        var me = this,
            generalView = this.getGeneralView(),
            imageData = this.photoPanel.getImageData(),
            photoFieldSetComponent = Ext.ComponentQuery.query('#photoFieldSet')[0],
            photoFieldSetItems = photoFieldSetComponent.getItems(),
            photoName = photoFieldSetItems.get('photoName').getValue(),
            photoDescription = photoFieldSetItems.get('photoDescription').getValue(),
            incidentRecord = generalView.getRecord(),
            mobIncidentId = incidentRecord.get('mob_incident_id'),
            docAuthor = incidentRecord.get('recorded_by'),
            documentsStore = Ext.getStore('documentsStore'),
            record,
            errorTitle = LocaleManager.getLocalizedString('Incident unavailable', 'IncidentReporting.controller.IncidentDocuments'),
            errorMessage = LocaleManager.getLocalizedString('Please first save the incident.', 'IncidentReporting.controller.IncidentDocuments');

        if (!mobIncidentId) {
            Ext.Msg.alert(errorTitle, errorMessage);
            me.onClosePhotoPanel();
            return;
        }
        record = Ext.create('IncidentReporting.model.Document');
        record.set('mob_incident_id', mobIncidentId);
        record.set('name', photoName);
        record.set('doc_author', docAuthor);
        record.set('date_doc', new Date());
        record.set('description', photoDescription);
        record.setChangedOnMobile();

        record.set('doc', photoName + '.jpg');
        record.set('doc_contents', imageData);
        record.set('doc_isnew', true);

        IncidentReporting.util.Ui.calculateNextMobId(documentsStore, 'mob_doc_id', function (calculatedId) {
            record.set('mob_doc_id', calculatedId);
            // Check validation
            me.saveDocumentRecord(record);
        }, me);

    },

    saveDocumentRecord: function (record) {
        var me = this, documentsStore = Ext.getStore('documentsStore');

        if (record.isValid()) {
            documentsStore.add(record);

            documentsStore.sync(function () {
                me.onClosePhotoPanel();

                documentsStore.load(function () {
                    me.refreshDocumentsView();
                });
            }, me);
        } else {
            me.photoPanel.displayErrors(record);
        }
    },

    refreshDocumentsView: function () {
        var me = this,
            mainView = me.getMainView(),
            navBar = mainView.getNavigationBar(),
            currentView = navBar.getCurrentView(),
            generalView = me.getGeneralView(),
            incidentRecord = generalView.getRecord();

        if (currentView.xtype === 'documentscard') {
            currentView.applyRecord(incidentRecord);
        }
    },

    onUpdatePhotoDetails: function () {
        var me = this,
            photoPanel = me.photoPanel,
            documentsStore = Ext.getStore('documentsStore'),
            photoPanelRecord = photoPanel.getRecord(),
            mobileDocId = photoPanelRecord.get('mob_doc_id'),
            photoName, photoDescription,
            record;

        photoName = photoPanel.query('textfield[name=name]')[0].getValue();
        photoDescription = photoPanel.query('textareafield[name=description]')[0].getValue();

        documentsStore.setDisablePaging(true);
        documentsStore.load(function () {
            documentsStore.setDisablePaging(false);
            record = documentsStore.findRecord('mob_doc_id', mobileDocId);
            record.set('name', photoName);
            record.set('description', photoDescription);

            // Check validation
            if (record.isValid()) {
                documentsStore.add(record);

                documentsStore.sync(function () {
                    me.onClosePhotoPanel();
                    me.refreshDocumentsView();
                }, me);
            } else {
                photoPanel.displayErrors(record);
            }
        });
    },

    onDeletePhoto: function () {
        var me = this,
            photoPanel = me.photoPanel,
            documentsStore = Ext.getStore('documentsStore'),
            mobileDocId = photoPanel.getRecord().get('mob_doc_id'),
            record,
            deletePhotoTitle = LocaleManager.getLocalizedString('Delete Photo',
                'IncidentReporting.controller.IncidentDocuments'),
            message = LocaleManager.getLocalizedString('Are you sure you want to delete this photo?',
                'IncidentReporting.controller.IncidentDocuments');

        Ext.Msg.confirm(deletePhotoTitle, message, function (buttonId) {
            if (buttonId === 'yes') {
                documentsStore.setDisablePaging(true);
                documentsStore.load(function () {
                    documentsStore.setDisablePaging(false);

                    record = documentsStore.findRecord('mob_doc_id', mobileDocId);

                    documentsStore.remove(record);
                    documentsStore.sync(function () {
                        me.onClosePhotoPanel();
                        me.refreshDocumentsView();
                    }, me);
                });
            }
        });
    },

    onClosePhotoPanel: function () {
        if (this.photoPanel) {
            this.photoPanel.hide();
        }
    }
});