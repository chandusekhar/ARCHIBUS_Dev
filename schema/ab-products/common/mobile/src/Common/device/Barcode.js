/* global plugins */
/**
 * @class Common.device.Barcode
 * Scans a barcode using the device camera.
 * @since 21.3
 * @author Jeff Martin
 * @singleton
 */
Ext.define('Common.device.Barcode', {
    singleton: true,

    /**
     * Initiates the barcode scanning feature. Barcodes are acquired using the device camera. The scan function
     * returns the barcode acquisition result in the onCompleted function.
     * @param {Function} onCompleted Called when the barcode acquisition is completed.
     * @param {Object} onCompleted.scanResult An object containing the results of the barcode acquisition.
     *    @param {String} onCompleted.scanResult.code The barcode
     *    @param {String} onCompleted.scanResult.format The barcode format
     *    @param {Boolean} onCompleted.scanResult.cancel true if the user cances the barcode scan
     *    @param {Boolean} onCompleted.scanResult.error true if an error occured during the scan
     *    @param {String} onCompleted.scanResult.errorMessage Contains the error message if the error property is true.
     * @param {Object} scope The scope to execute the callback function.
     * @deprecated 23.1 Please use {@link #scanAndDecode} instead.
     */
    scan: function (onCompleted, scope) {
        var me = this,
            scanResult = {
                code: '',
                format: '',
                cancel: false,
                errorMessage: '',
                error: false
            },
            onSuccess = function (result) {
                scanResult.code = result.text;
                scanResult.format = result.format;
                Ext.callback(onCompleted, scope || me, [scanResult]);
            },
            onError = function (error) {
                scanResult.error = true;
                scanResult.errorMessage = error;
                Ext.callback(onCompleted, scope || me, [scanResult]);
            },
            barcodeScanningNotAvailableMessage = LocaleManager.getLocalizedString('Barcode scanning is not available',
                'Common.device.Barcode');

        if (typeof plugins !== 'undefined' && plugins.barcodeScanner) {
            plugins.barcodeScanner.scan(onSuccess, onError);
        } else {
            onError(barcodeScanningNotAvailableMessage);
        }
    },

    /**
     * Initiates the barcode scanning feature. Barcodes are acquired using the device camera.
     * The barcode acquisition result is parsed according to barcodeFormat config property and the result object is constructed.
     * The result object is returned in the Promise object.
     * @param {Array} list of config objects for parsing the scanned value
     * @return {Object} The Promise object. If scan was succefull then a result object is the promise's parameter. The result object:
     * scanResult.code: the scanned value
     * scanResult.fields: object containing fields from barcodeFormat with parsed values.
     * If the scan was not succeful the Promise is rejected with the error message.
     */
    scanAndDecode: function (barcodeFormat) {
        var me = this,
            scanResult = {
                code: '',
                format: '',
                cancel: false,
                errorMessage: '',
                error: false
            },
            callbackFn,
            barcodeScanningNotAvailableMessage = LocaleManager.getLocalizedString('Barcode scanning is not available',
                'Common.device.Barcode');

        // When barcodeFormat is not defined calls scan function (used before 23.1)
        if (Ext.isEmpty(barcodeFormat)) {
            return new Promise(function (resolve, reject) {
                callbackFn = function (scanResult) {
                    if (scanResult.error) {
                        reject(scanResult.errorMessage);
                    } else {
                        resolve(scanResult);
                    }
                };
                me.scan(callbackFn, me);
            });
        } else {
            return new Promise(function (resolve, reject) {
                if (typeof plugins !== 'undefined' && plugins.barcodeScanner) {
                    plugins.barcodeScanner.scan(function (result) {
                        scanResult = me.decode(result.text, barcodeFormat);
                        resolve(scanResult);
                    }, function (error) {
                        reject(error);
                    });
                } else {
                    reject(barcodeScanningNotAvailableMessage);
                }

            });
        }
    },

    // @private
    decode: function (text, barcodeFormat) {
        var i,
            delimitersList,
            delimiters = [],
            fields,
            values,
            result = {};

        result.code = text;
        result.fields = [];

        Ext.each(barcodeFormat, function (configObj) {
            // verify if it is a multi-key value and needs to be parsed
            if (configObj.hasOwnProperty('useDelimiter') && configObj.useDelimiter) {
                // verify if custom delimiter is set in config object or application parameter delimiter should be used
                if (configObj.hasOwnProperty('delimiter')) {
                    delimitersList = configObj.delimiter;
                } else {
                    delimitersList = Common.util.ApplicationPreference.getApplicationPreference('MobileAppsBarcodeDelimiter');
                }

                // a list of delimiters concatenated by ; can be provided
                if (!Ext.isEmpty(delimitersList)) {
                    delimiters = delimitersList.split(';');
                }

                fields = configObj.fields;
                Ext.each(delimiters, function (delimiter) {
                    // parse the value by delimiter
                    values = text.split(delimiter);

                    // verify if the value was splittited by delimiter and can be assigned to fields
                    if (values.length === fields.length) {
                        for (i = 0; i < values.length; i++) {
                            result.fields[fields[i]] = values[i];
                        }
                    }
                });

                // if the values was not splitted by any of the delimiters assign the whole value to each of the fields
                Ext.each(fields, function (field) {
                    if (Ext.isEmpty(result.fields[field])) {
                        result.fields[field] = text;
                    }
                });
            } else {
                // it is a single key value, assign it to each one of the fields
                fields = configObj.fields;
                Ext.each(fields, function (field) {
                    result.fields[field] = text;
                });
            }
        });

        return result;
    }
});