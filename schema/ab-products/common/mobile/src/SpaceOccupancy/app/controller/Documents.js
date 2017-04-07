Ext.define('SpaceOccupancy.controller.Documents', {
    extend: 'Ext.app.Controller',

    requires: 'Common.document.DocumentManager',

    config: {
        refs: {
            mainView: 'mainview',
            surveyPanel: 'spaceOccupRoomSurveyPanel',
            documentViewItem: 'documentItem',
            cameraPanel: 'camera',
            roomSurveyPromptListPanel: 'panel[itemId=roomPromptList]', // itemId is set dynamically in function onCaptureRedlineImage
            redlinePanel: 'redlineContainer'
        },

        control: {
            documentViewItem: {
                displaydocument: 'onDisplayDocument'
            },
            cameraPanel: {
                attach: 'onAttachPhoto'
            }
        },

        photoReplaceTitle: LocaleManager.getLocalizedString('Attach photo',
            'SpaceOccupancy.controller.Documents'),

        photoReplaceMessage: LocaleManager.getLocalizedString('Overwrite existing photo?',
            'SpaceOccupancy.controller.Documents'),

        errorTitle: LocaleManager.getLocalizedString('Error', 'SpaceOccupancy.controller.Documents'),

        attachPhotoText: LocaleManager.getLocalizedString('Attaching photo', 'SpaceOccupancy.controller.Documents'),

        attachRedlineText: LocaleManager.getLocalizedString('Attaching image', 'SpaceOccupancy.controller.Documents')
    },

    onDisplayDocument: function (roomMobileId, fileName, documentFieldId, fieldName) {
        var me = this,
            roomSurveyStore = Ext.getStore('occupancyRoomSurveyStore'),
            roomSurveyRecord = roomSurveyStore.findRecord('id', roomMobileId),
            documentField = fieldName + '_contents',
            documentData;

        if (roomSurveyRecord) {
            documentData = roomSurveyRecord.get(documentField);
            // If the document is an image then we display it using the photo panel
            DocumentManager.displayDocumentOrImage(documentData, fileName, me.getCameraPanel());
        }
    },

    /**
     * Saves the photo data in the Room Survey record.
     * @param cameraPanel
     */
    onAttachPhoto: function (cameraPanel) {
        var me = this,
            imageData = cameraPanel.getImageData(),

            attachPhotoFunction = function () {
                document.activeElement.blur();
                me.saveImage(imageData, true, null, function () {
                    cameraPanel.onClosePanel();
                    Mask.hideLoadingMask();
                }, me);

            };
        Mask.displayLoadingMask(me.getAttachPhotoText());
        me.verifyExistsOtherDocAttached(true, null, attachPhotoFunction, me);
    },

    /**
     * Verify if another photo is saved in the room survey record and ask for confirmation if necesary.
     * @param isPhoto true is image data is from taking photos, and false if it is redline image data
     * @param record room survey record for saving redline picture
     * @param callbackFn
     * @param scope
     */
    verifyExistsOtherDocAttached: function (isPhoto, record, callbackFn, scope) {
        var me = this,
            navBar = me.getMainView().getNavigationBar(),
            roomSurveyView = navBar.getCurrentView(),
            roomSurveyRecord,
            existOthers = false;

        if (isPhoto) {
            roomSurveyRecord = roomSurveyView.getRecord();
            existOthers = (!Ext.isEmpty(roomSurveyRecord.get('survey_photo')));
        } else {
            roomSurveyRecord = record;
            existOthers = (!Ext.isEmpty(roomSurveyRecord.get('survey_redline_rm')));
        }

        if (existOthers) {
            Ext.Msg.confirm(me.getPhotoReplaceTitle(), me.getPhotoReplaceMessage(),
                function (buttonId) {
                    if (buttonId === 'yes') {
                        Ext.callback(callbackFn, scope || me);
                    } else {
                        Mask.hideLoadingMask();
                    }
                }
            );
        } else {
            Ext.callback(callbackFn, scope || me);
        }
    },

    /**
     * Save imageData into room survey record's document field.
     * @param roomSurveyRecord
     * @param imageData
     * @param isPhoto true is image data is from taking photos, and false if it is redline image data
     */
    // TODO: Redline image is added in Redline controller
    addPhotoToRoomSurveyRecord: function (roomSurveyRecord, imageData, isPhoto) {
        var documentField;
        if (isPhoto) {
            documentField = roomSurveyRecord.getDocumentField();
        } else {
            documentField = roomSurveyRecord.getRedlineDocumentField();
        }
        roomSurveyRecord.setDocumentFieldData(documentField, imageData);
    },

    /**
     * Save imageData into room survey record and sync store.
     * @param imageData
     * @param isPhoto true is image data is from taking photos, and false if it is redline image data
     * @param record room survey record for saving redline picture
     * @param callbackFn
     * @param scope
     */

    // TODO: Redline image save handled in redline controller
    saveImage: function (imageData, isPhoto, record, callbackFn, scope) {
        var me = this,
            roomSurveyStore = Ext.getStore('occupancyRoomSurveyStore'),
            navBar = me.getMainView().getNavigationBar(),
            roomSurveyView = navBar.getCurrentView(),
            roomSurveyRecord;

        if (isPhoto) {
            roomSurveyRecord = roomSurveyView.getRecord();
        } else {
            roomSurveyRecord = record;
        }

        roomSurveyStore.setAutoSync(false);
        me.addPhotoToRoomSurveyRecord(roomSurveyRecord, imageData, isPhoto);

        roomSurveyStore.sync(function () {
            roomSurveyStore.setAutoSync(true);
            Ext.callback(callbackFn, scope || me);
        });
    }

});