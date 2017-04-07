Ext.define('Maintenance.view.WorkRequestReferenceListsItems',{
    extend:'Common.view.DocumentItem',
    xtype:'referenceDocumentListItem',
    config:{

        displayButton: {
            text: LocaleManager.getLocalizedString('Display', 'Common.view.DocumentItem'),
            ui: 'action',
            style: 'margin-right:20px'
        },
        displayURLButton:{
            text: LocaleManager.getLocalizedString('OpenURL', 'Maintenance.view.WorkRequestReferenceListsItems'),
            ui: 'action',
            style: 'margin-right:20px'
        },
        /**
         * @cfg {Boolean} enableDisplayURL Set to true to display the OpenURL button
         */
        enableDisplayURL:false,
        /**
         * @cfg {Boolean} enableDisplay Set to true to display the Diaplay button
         */
        enableDisplay: false
    },

    /**
     * Applay DisplayURL button
     * @param config
     * @returns {*}
     */
    applyDisplayURLButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getDisplayURLButton());
    },
    /**
     * Bind button tap event
     * @param newButton
     * @param oldButton
     */
    updateDisplayURLButton: function (newButton, oldButton) {
        if (newButton) {
            newButton.on('tap', this.onDisplayURLButtonTapped, this);
            this.add(newButton);
        }

        if (oldButton) {
            oldButton.un('tap', this.onDisplayURLButtonTapped, this);
            this.remove(oldButton);
        }
    },

    onDisplayURLButtonTapped: function(){
        var me=this,
            recordId = me.getRecordId(),
            referenceStore=Ext.getStore('referenceStore');

        var filterArray=[Ext.create('Common.util.Filter',{
            property: 'mob_doc_id',
            value: recordId,
            conjunction: "AND",
            exactMatch: true
        })];

        referenceStore.retrieveRecord(filterArray,function(record){
            var url=record.get('url');
                if(!Ext.isEmpty(url)){
                    window.open(url, '_blank', 'location=no,EnableViewPortScale=yes');
                }else{
                    Ext.Msg.alert(LocaleManager.getLocalizedString('URL does not exsits','Maintenance.view.WorkRequestReferenceListsItems'));
                }

        },me);


    },
    /**
     * Override applyDocumentData function in DocumenListItem.js
     * According to the document list content,if doc field exsits,then show Display button,and if url field value exsits , then show openURL button.
     * If both of doc and url are exsits, the Display button and openURL button will hidden.
     * @param data
     * @returns {*}
     */
    applyDocumentData: function (data) {
        var me = this,
            fileExtension = me.getFileExtension();
        me.showDeleteButton();
        //Fix issue that if file extension is empty (eg. URL) it will cause 'toLowerCase is not function' error in setIconImage function.
        if(Ext.isEmpty(fileExtension)){
            fileExtension="";
        }
        me.setIconImage(fileExtension, data);
        me.showRedlineButtonForImageFiles(fileExtension);
        me.showDisplayButton();
        me.showDisplayUrlButton();
        if (data === me.MARK_DELETED_TEXT) {
            me.setStyleForDeletedItem();
        }

        return data;
    },
    /**
     * Hidden Display button by enableDisplay parameter,true to show the button,false to hidden the button
     */
    showDisplayButton: function(){
        var displayButton=this.getDisplayButton(),
            enableDisplay=this.getEnableDisplay();
        displayButton.setHidden(!enableDisplay);
    },
    /**
     * Hidden DisplayURL button by enableDisplayUrl parameter,true to show the button,false to hidden the button
     */
    showDisplayUrlButton: function(){
        var displayUrlButton=this.getDisplayURLButton(),
            enableDisplayUrl=this.getEnableDisplayURL();
        displayUrlButton.setHidden(!enableDisplayUrl);
    }
});
