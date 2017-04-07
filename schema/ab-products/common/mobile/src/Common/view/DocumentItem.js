/**
 * Common DocumentItem class
 * @since 21.3
 * @author Jeff Martin
 * @class
 */
Ext.define('Common.view.DocumentItem', {
    extend: 'Ext.Container',
    requires: [
        'Common.util.IconData',
        'Common.document.DocumentManager'
    ],

    xtype: 'documentItem',

    /**
     * The base64 encoding of string "MARK_DELETED"
     */
    MARK_DELETED_TEXT: 'TUFSS19ERUxFVEVE',

    config: {

        cls: 'document-list',

        padding: '0.35em',

        layout: {
            type: 'hbox',
            align: 'center'
        },

        image: true,

        file: {
            margin: '10px',
            flex: 1
        },

        fileExtension: null,

        markDeleted: {
            margin: '10px',
            flex: 1
        },

        redlineButton: {
            iconCls: 'redline',
            cls: 'ab-icon-action',
            style: 'margin-right:20px;border:none;',
            hidden: true,
            itemId: 'redlineButton'
        },

        displayButton: {
            text: LocaleManager.getLocalizedString('Display', 'Common.view.DocumentItem'),
            ui: 'action',
            style: 'margin-right:20px'
        },

        deleteButton: {
            iconCls: 'delete',
            cls: ['ab-icon-button', 'x-button-icon-secondary'],
            itemId: 'deleteButton',
            style: 'margin-right:6px;margin-top:0px'
        },

        downloadButton: {
            iconCls: 'download',
            style: 'border: 0 none',
            ui: 'plain'
        },

        documentData: null,

        recordId: null,

        /**
         * @cfg {Number} documentFieldId The number of the corresponding document field. For
         *      example, a value of 1 corresponds to the doc1 field.
         */
        documentFieldId: null,

        /**
         * @cfg {Boolean} enableImageRedline Set to true to display the image redline button
         */
        enableImageRedline: false,

        /**
         * @cfg {Boolean} enableDelete Set to true to display the delete button
         */
        enableDelete: false,

        /**
         * @cfg {String} fieldName The field name of the document field.
         */
        fieldName: null,

        /**
         * @cfg {Boolean} downloadDocumentsOnDemand When true, the document data will not be included in the sync.
         */
        downloadDocumentsOnDemand: false,

        documentIsDownloaded: false
    },

    applyDocumentIsDownloaded: function (config) {
        var iconCls = config ? 'refresh' : 'download',
            onDemandMode = this.getDownloadDocumentsOnDemand();

        if (onDemandMode) {
            this.getDownloadButton().setIconCls(iconCls);
            this.getDisplayButton().setHidden(!config);
        }
        return config;
    },

    applyFile: function (config) {
        var me = this,
            extensionRe = /\.[0-9a-z]+$/i,
            fileExtensions;

        if (config && config.html) {
            fileExtensions = extensionRe.exec(config.html);
            // Extract the file extension
            if (fileExtensions) {
                me.setFileExtension(fileExtensions[0]);
            }
        }

        return Ext.factory(config, Ext.Component, this.getFile());
    },

    updateFile: function (newFile, oldFile) {
        if (newFile) {
            this.add(newFile);
        }
        if (oldFile) {
            this.remove(oldFile);
        }
    },

    applyMarkDeleted: function (config) {
        return Ext.factory(config, Ext.Component, this.getMarkDeleted());
    },

    updateMarkDeleted: function (newMarkDeleted, oldMarkDeleted) {
        if (newMarkDeleted) {
            this.add(newMarkDeleted);
        }
        if (oldMarkDeleted) {
            this.remove(oldMarkDeleted);
        }
    },

    applyImage: function (config) {
        var me = this,
            image = Ext.factory(config, Ext.Img, this.getImage());

        image.on('tap', me.displayDocumentView, me);

        return image;
    },

    updateImage: function (newImage, oldImage) {
        var me = this;
        if (newImage) {
            me.add(newImage);
        }

        if (oldImage) {
            me.remove(oldImage);
            oldImage.un(me.onImageTap);
        }
    },

    applyDownloadDocumentsOnDemand: function (config) {
        var me = this;
        if (config) {
            // Download on Demand mode.
        } else {
            // Download with Sync mode.
            me.getDownloadButton().setHidden(true);
            me.getDisplayButton().setHidden(false);
        }
        return config;
    },

    applyDocumentData: function (data) {
        var me = this,
            fileExtension = me.getFileExtension();

        me.showDeleteButton();
        me.setIconImage(fileExtension, data);
        me.showRedlineButtonForImageFiles(fileExtension);

        if (data === me.MARK_DELETED_TEXT) {
            me.setStyleForDeletedItem();
        }

        return data;
    },

    setIconImage: function (fileExtension, data) {
        var me = this,
            img = me.getImage(),
            imageSrc,
            extension = fileExtension.toLowerCase();

        if (data && (extension === '.png' || extension === '.jpg' || extension === '.gif')) {
            imageSrc = 'data:image/jpg;base64,' + data;
        } else {
            imageSrc = 'data:image/png;base64,' + Common.util.IconData.getIconForFileType(extension);
        }
        img.setSrc(imageSrc);

    },

    applyDisplayButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDisplayButton());
    },

    updateDisplayButton: function (newButton, oldButton) {
        if (newButton) {
            newButton.on('tap', this.displayDocumentView, this);
            this.add(newButton);
        }

        if (oldButton) {
            oldButton.un('tap', this.displayDocumentView, this);
            this.remove(oldButton);
        }
    },

    applyRedlineButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getRedlineButton());
    },

    updateRedlineButton: function (newButton, oldButton) {
        if (newButton) {
            newButton.on('tap', this.onRedlineButtonTapped, this);
            this.add(newButton);
        }

        if (oldButton) {
            oldButton.un('tap', this.onRedlineButtonTapped, this);
            this.remove(oldButton);
        }
    },

    applyDeleteButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDeleteButton());
    },

    updateDeleteButton: function (newButton, oldButton) {
        if (newButton) {
            newButton.on('tap', this.onDeleteButtonTapped, this);
            this.add(newButton);
        }

        if (oldButton) {
            oldButton.un('tap', this.onDeleteButtonTapped, this);
            this.remove(oldButton);
        }
    },

    applyDownloadButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDownloadButton());
    },

    updateDownloadButton: function (newButton, oldButton) {
        if (newButton) {
            newButton.on('tap', this.onDownloadButtonTapped, this);
            this.add(newButton);
        }


        if (oldButton) {
            oldButton.un('tap', this.onDownloadButtonTapped, this);
            this.remove(oldButton);
        }

    },

    displayDocumentView: function () {
        var me = this,
            recordId = me.getRecordId(),
            fileName = me.getFile().getHtml(),
            documentFieldId = me.getDocumentFieldId(),
            fieldName = me.getFieldName();

        me.fireEvent('displaydocument', recordId, fileName, documentFieldId, fieldName, me.getDownloadDocumentsOnDemand());
    },

    onRedlineButtonTapped: (function () {
        var canFireEvent = true;
        return function () {
            var me = this,
                recordId = me.getRecordId(),
                fileName = me.getFile().getHtml(),
                documentFieldId = me.getDocumentFieldId(),
                fieldName = me.getFieldName();

            if (canFireEvent) {
                canFireEvent = false;
                me.fireEvent('displayredline', recordId, fileName, documentFieldId, fieldName);
                setTimeout(function () {
                    canFireEvent = true;
                }, 1000);
            }
        };
    })(),

    onDeleteButtonTapped: function () {
        var me = this,
            recordId = me.getRecordId(),
            documentFieldId = me.getDocumentFieldId(),
            fieldName = me.getFieldName();

        me.fireEvent('deleteDocument', recordId, documentFieldId, fieldName, me.getDocumentData(), me);
    },

    onDownloadButtonTapped: function () {
        var me = this,
            recordId = me.getRecordId(),
            fileName = me.getFile().getHtml(),
            documentFieldId = me.getDocumentFieldId(),
            fieldName = me.getFieldName();

        me.fireEvent('downloadDocument', me, recordId, fileName, documentFieldId, fieldName);
    },

    setStyleForDeletedItem: function () {
        var me = this,
            image = me.getImage(),
            deleteMsg = "<span style='color:red;margin-left:8px'>" + LocaleManager.getLocalizedString('Delete on Sync', 'Common.view.DocumentItem') + "</span>";

        image.setStyle('border-style: solid;border-width: 1px;border-color:red');

        me.getMarkDeleted().setHtml(deleteMsg);
        me.getDisplayButton().setHidden(true);
        me.getRedlineButton().setHidden(true);
        me.getDeleteButton().setHidden(true);
    },

    showRedlineButtonForImageFiles: function (fileExtension) {
        var me = this,
            redlineButton = me.down('#redlineButton'),
            extension = fileExtension.toLowerCase(),
            isImageFile = (extension === '.png' || extension === '.jpg' || extension === '.gif'),
            enableRedline = me.getEnableImageRedline(),
            downloadDocumentsOnDemand = me.getDownloadDocumentsOnDemand();

        if (redlineButton && enableRedline && !downloadDocumentsOnDemand) {
            redlineButton.setHidden(!isImageFile);
        }
    },

    showDeleteButton: function () {
        var deleteButton = this.down('#deleteButton'),
            enableDelete = this.getEnableDelete();

        if (deleteButton) {
            deleteButton.setHidden(!enableDelete);
        }
    }
});