Ext.define('Common.service.document.Document', {
    singleton: true,

    requires: 'Common.service.ExceptionTranslator',


    /**
     *
     * @param {Object} keys An object containing the primary key values of the record containing the document
     * Example {ls_id: '102'}
     * @param {String} tableName The name of the table the document field is contained in
     * @param {String} fieldName The document field name
     * @param {String} documentFileName The name of the document file
     * @returns {Promise} A Promise object resolved to the temporary URL on the Web Central server where the
     * document can be downloaded from.
     */
    retrieveDocumentURL: function(keys, tableName, fieldName, documentFileName ) {
        return new Promise(function(resolve, reject) {
            var options = {
                    async: true,
                    headers: { "cache-control": "no-cache" },
                    callback: resolve,
                    errorHandler: function(message, exception) {
                        reject(exception.message);
                    }
                };

             DocumentService.show(keys, tableName, fieldName, documentFileName, '', true, 'showDocument', options);

        });
    },

    markDocumentDeleted: function(keys, documentTableName, documentFieldName) {
        return new Promise(function(resolve, reject) {
            var options = {
                async: true,
                headers: { "cache-control": "no-cache" },
                callback: resolve,
                errorHandler: function(message, exception) {
                    var errorMessage = ExceptionTranslator.extractMessage(exception);
                    // Handle record not found exception

                    if(exception && exception.errorNumber === 1 && exception.recoverable) {
                        Log.log(errorMessage, 'error');
                        resolve();
                    } else {
                        reject(errorMessage);
                    }
                }
            };

            DocumentService.markDeleted(keys, documentTableName, documentFieldName, options);
        });
    }
});