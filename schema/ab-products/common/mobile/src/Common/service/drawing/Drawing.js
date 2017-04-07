/**
 * Drawing services to retrieve SVG data from the WebCentral server.
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.service.drawing.Drawing', {
    requires: [
        'Common.Session',
        'Common.service.ExceptionTranslator'
    ],

    singleton: true,

    /**
     * @property {Object} options Common options used when calling the DWR services.
     */
    options: {
        async: true,
        headers: {"cache-control": "no-cache"},
        timeout: 180000, // 180 seconds
        callback: Ext.emptyFn,
        errorHandler: Ext.emptyFn
    },

   /**
     * Retrieves the SVG file from the server. Opens and closes a Web Central session for each request.
     * @param {Object} primaryKeys The primary key values that the floor plan record is associated with
     * @param {String} planType The plan type to apply to the floor plan
     * @param {Array} highlights
     * @param {Function} onCompleted
     * @param {Object} scope
     */
    getSvgFromServerWithSession: function (primaryKeys, planType, highlights, onCompleted, scope) {
        var me = this,
            session = Ext.create('Common.Session'),
            options = {
                async: true,
                headers: {"cache-control": "no-cache"},
                timeout: me.SERVICE_TIMEOUT,
                callback: function (svgData) {
                    svgData = svgData === null ? '' : svgData;
                    session.endSession();
                    Ext.callback(onCompleted, scope || me, [svgData]);
                },
                errorHandler: function (message) {
                    Log.log('getSvgFromServerWithSession Message: [' + message + ']', 'error');
                    session.endSession();
                    Ext.callback(onCompleted, scope || me, ['']);
                }
            };

        session.startSession();
        DrawingSvgService.highlightSvgDrawing(primaryKeys, planType, highlights, options);
    },

    retrieveSvgFromServer: function (primaryKeys, planType, highlights) {
        var me = this;
        return new Promise(function (resolve) {
            var options = Ext.clone(me.options);
            options.callback = function (svgData) {
                resolve(svgData === null ? '' : svgData);
            };
            options.errorHandler = function () {
                resolve(''); // File does not exists is an error condition
            };
            DrawingSvgService.highlightSvgDrawing(primaryKeys, planType, highlights, options);
        });
    },

    /**
     * Returns the floor codes for all floors that have published SVG drawings
     * @param siteCodes
     * @param buildingCodes
     * @returns {*}
     */
    getFloorCodesForPublishedDrawings: function (siteCodes, buildingCodes) {
        var me = this;
        // TODO: siteCodes and buildingCodes must be array
        return new Promise(function (resolve, reject) {
            var options = Ext.clone(me.options);
            options.callback = resolve;
            options.errorHandler = function(message, exception) {
                var errorMessage = Common.service.ExceptionTranslator.extractMessage(exception);
                Log.log(errorMessage, 'warn', me, arguments);
                reject(errorMessage);
            };

            DrawingSvgService.retrieveFloorCodes(siteCodes, buildingCodes, options);

        });
    }
});