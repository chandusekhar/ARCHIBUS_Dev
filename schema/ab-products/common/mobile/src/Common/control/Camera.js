/**
 * @author Jeff Martin
 * @since 21.2
 *
 * The Camera control provides a simple way to connect to the device camera and acquire a photograph.
 * The Camera control extends from the {@link Ext.Button} class and can be used anywhere a button would be used.
 * Typically we add the Camera control to a form in the title bar as a {@link Common.control.button.Toolbar}
 *
 *     config: {
 *       toolBarButtons: [
 *           {
 *               xtype: 'camera',
 *               align: 'left',
 *               iconCls: 'camera',
 *               ui: 'iron',
 *               displayOn: 'all'
 *           }
 *        ]
 *     }
 *
 * ## Processing the Acquired Image Data
 *
 * The image date is acquired as a base64 encoded string. The imageQuality property contains the data after the
 * photo is taken using the device camera. The attach event can be handled to retrieve the image data and process
 * it.
 *
 * Example of handling the attach event in a {@link Ext.app.Controller}
 *
 *     config: {
 *         control: {
 *             'camera' : {
 *                 attach: function(camera) {
 *                     var imageData = camera.getImageData();
 *                     // process the image data
 *                 }
 *             }
 *     }
 */
Ext.define('Common.control.Camera', {
    extend: 'Common.control.button.Toolbar',
    requires: 'Common.util.Environment',
    xtype: 'camera',

    /**
     * @event attach
     * Fires when the Attach button of Camera panel is tapped.
     * @param {Common.control.Camera} this The Camera control
     */

    config: {
        /**
         * @cfg {Number} imageQuality A number between 0 and 100 that indicates the quality of the camera image.
         * A value of 100 will acquire images with the highest detail but will also increase the amount of image data.
         * @accessor
         */
        imageQuality: 15,

        /**
         * @cfg {String} imageData The base64-encoded image data
         * @accessor
         */
        imageData: '',

        /**
         * @cfg {String} title The title displayed on the image display panel
         * @accessor
         */
        title: LocaleManager.getLocalizedString('Photo', 'Common.control.Camera'),

        /**
         * @cfg {String} attachButtonText The text displayed on the Attach button.
         * @accessor
         */
        attachButtonText: LocaleManager.getLocalizedString('Attach', 'Common.control.Camera'),

        /**
         * @cfg {String} appName The name of the application. Used to select the demo image when the app is
         *  executing in the browser in development or demo mode.
         *  Each application can have a demo image populated in the cordova.js file. The demo image is indexed
         *  by the applicationName
         *  @accessor
         */
        appName: '',

        /**
         * @cfg {Boolean} displayOnly The Attach button is not shown when true
         * @accessor
         */
        displayOnly: false
    },

    initialize: function () {
        var me = this,
            isHidden = me.getHidden(),
            showCameraIcon = Common.control.Camera.getCameraIconVisibility(isHidden),
            imageQuality = Common.util.ApplicationPreference.getApplicationPreference('MobilePhotoQuality');

        me.element.on({
            scope: this,
            tap: 'onCameraButtonTapped'
        });

        me.setHidden(!showCameraIcon);

        // Set image quality
        imageQuality = imageQuality === null ? 15 : imageQuality;
        me.setImageQuality(imageQuality);
    },

    applyDisplayOnly: function (config) {
        var me = this;
        if (me.cameraPanel) {
            me.cameraPanel.down('#attachButton').setHidden(config);
        }
        return config;
    },

    /**
     * Handles the camera button tap event
     * @private
     */
    onCameraButtonTapped: function () {
        this.capturePhoto();
    },

    /**
     * Creates the camera panel
     * @private
     * @returns {Ext.Panel}
     */
    getCameraPanel: function () {
        var phoneConfig = {
                width: '100%',
                height: '100%'
            },

            tabletConfig = {
                modal: true,
                hidden: true,
                hideOnMaskTap: false,
                width: '70%',
                height: '70%',
                centered: true
            },
            config = Ext.os.is.Phone ? phoneConfig : tabletConfig;


        if (!this.cameraPanel) {
            this.cameraPanel = Ext.create('Ext.Panel', Ext.apply({
                zIndex: 20,
                padding:'10px',
                items: [
                    {
                        xtype: 'titlebar',
                        docked: 'top',
                        title: this.getTitle(),
                        items: [
                            {
                                xtype: 'button',
                                text: this.getAttachButtonText(),
                                itemId: 'attachButton',
                                hidden: this.getDisplayOnly(),
                                align: 'right',
                                ui: 'action',
                                listeners: {
                                    tap: 'onAttachPhoto',
                                    scope: this
                                }
                            },
                            {
                                xtype: 'button',
                                margin: 0,
                                text: LocaleManager.getLocalizedString('Close', 'Common.control.Camera'),
                                listeners: {
                                    tap: 'onClosePanel',
                                    scope: this
                                }
                            }
                        ]
                    },
                    {
                        itemId: 'imageContainer',
                        xtype: 'image',
                        width: '100%',
                        height: '100%'
                    }
                ]
            }, config));
        }
        return this.cameraPanel;
    },


    /**
     * Displays the acquired image in a panel. A pop-up panel is displayed if the app is running on a tablet.
     * A fullscreen panel is displayed if the app is running on a phone.
     */
    showPanel: function () {
        var me = this,
            cameraPanel = me.getCameraPanel(),
            imageData = me.getImageData();

        if (!cameraPanel.getParent()) {
            Ext.Viewport.add(cameraPanel);
        }
        me.setImageContainerHtml(imageData);
        cameraPanel.show();
    },

    /**
     * Launches the device camera. Displays the photo if the photo capture is
     * successful.
     * @private
     */
    capturePhoto: function () {
        var me = this,
            onSuccess = function (imageData) {
                me.setImageData(imageData);
                me.setDisplayOnly(false);
                me.showPanel();
            },
            onFail = function (message) {
                // Do nothing if there is a failure.
                // We cannot distinguish between cancelling the photo acquisition and an error
                Log.log('Error acquiring photo [' + message + ']', 'info');
            };

        navigator.camera.getPicture(onSuccess, onFail, {
            quality: me.getImageQuality(),
            destinationType: Camera.DestinationType.DATA_URL,
            applicationName: me.getAppName(),
            correctOrientation: true,
            targetWidth: 500,
            targetHeight: 500
        });
    },

    setImageContainerHtml: function(imageData) {
        var imageContainer;

        if (this.cameraPanel) {
            imageContainer = this.cameraPanel.down('#imageContainer');
            if (imageContainer) {
                imageContainer.setSrc('data:image/jpg;base64,' + imageData);
            }
        }
    },

    /**
     * Fires the attach event
     * @private
     */
    onAttachPhoto: function (button, e) {
        var me = this;

        e.preventDefault();
        e.stopPropagation();

        setTimeout(function () {
            me.fireEvent('attach', me);
        }, 250);
    },

    /**
     * Closes the camera panel
     * @private
     */
    onClosePanel: function (button, e) {
        var me = this;

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setTimeout(function () {
            if (me.cameraPanel) {
                me.cameraPanel.hide();
            }
        }, 50);
    },


    applyHidden: function (config) {
        var cameraIconVisibility = Common.control.Camera.getCameraIconVisibility(config);
        return this.callParent([!cameraIconVisibility]);
    },

    /**
     * Gets the Camera icon visibility based on the device environment and the value of the
     * MobileAppsShowSampleCameraImages activity parameter.
     */
    statics: {
        getCameraIconVisibility: function (isHidden) {
            var preferencesStore = Ext.getStore('appPreferencesStore'),
                isNativeMode = Environment.getNativeMode(),
                showIconRecord,
                showIconValue = false;


            isHidden = Ext.isEmpty(isHidden) ? false : isHidden;

            // If we are running on a device then just return the isHidden value
            // If we are running in a browser the camera icon is hidden unless the
            // MobileAppsShowSampleCameraImages activity parameter is true
            if (isNativeMode) {
                return !isHidden;
            }

            if (!preferencesStore) {
                return !isHidden;
            }

            showIconRecord = preferencesStore.findRecord('param_id', 'MobileAppsShowSampleCameraImages');
            if (showIconRecord) {
                showIconValue = showIconRecord.get('param_value') === '1';
            }

            return showIconValue && !isHidden;
        }
    }

});