/**
 *  Displays an image with title.
 *
 *  To use the Document Field in a {@link Common.form.FormPanel}
 *
 *      Ext.define('Common.form.FormPanel', {
 *          config: {
 *              items: [
 *                   {
 *                      xtype: 'documentfield',
 *                      name: 'doc1_contents'
 *                      label: 'Photo'
 *                   }
 *              ]
 *          }
 *      }
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.field.Document', {
    extend: 'Ext.Component',
    xtype: 'documentfield',

    config: {
        baseCls: 'x-docfield',

        /**
         * @cfg {String} label The label displayed in the title bar
         */
        label: '',

        /**
         * @cfg {String} name The name of the field the document data is stored in.
         * This is the document contents field. If the name of the server side field is doc1
         * the name will be doc1_contents.
         */
        name: null,

        /**
         * @cfg {Ext.data.Model} record. The parent view record
         */
        record: null,

        /**
         * @cfg {Number} width The width in pixels of the document field
         */
        width: 100,

        /**
         * @cfg {Number} height The height in pixels of the document field
         */
        height: 100,

        /**
         * @cfg {String} imageData The base64 encoded image data.
         */
        imageData: ''
    },

    /**
     * @event tapped
     * Fires when the document field is tapped
     * @param {Common.control.field.Document} this
     */

    template: [
        {
            tag: 'div',
            reference: 'container',
            children: [
                {
                    tag: 'div',
                    cls: 'x-docfield-hbox x-docfield-header',
                    children: [
                        {
                            reference: 'label',
                            cls: 'x-docfield-label'
                        }
                    ]
                },
                {
                    tag: 'div',
                    cls: 'x-docfield-hbox',
                    children: [
                        {
                            tag: 'div',
                            reference: 'docimage',
                            cls: 'x-docfield-image'
                        }
                    ]
                }
            ]
        }
    ],

    initialize: function () {
        var me = this,
            height = me.getHeight(),
            width = me.getWidth();

        me.label.setHtml(me.getLabel());

        me.docimage.setWidth(width - 10);
        me.docimage.setHeight(height - 40);

        me.element.on({
            tap: 'onDocumentFieldTapped'
        });
    },

    applyRecord: function (record) {
        var me = this,
            imageData = '',
            fieldName = me.getName();

        if (record) {
            imageData = record.get(fieldName);
            if(imageData && imageData.length > 0) {
                me.setImageData(imageData);
            }
        }
        return record;
    },

    applyImageData: function(imageData) {
        var me = this,
            dom = me.docimage.dom;

        dom.style.backgroundImage = 'url(data:image/png;base64,' + imageData + ')';
        return imageData;
    },

    onDocumentFieldTapped: function() {
        this.fireEvent('tapped', this);
    }

});