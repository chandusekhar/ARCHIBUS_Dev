/**
 * 
 */
function loadJsFiles() {
    if (self == top) {
    //if (typeof(top['Ext']) == 'undefined') {
        insertJsNode('/archibus/schema/ab-core/libraries/ext/ext-base.js')
    	insertJsNode('/archibus/schema/ab-core/libraries/ext/ext-all-debug.js')
    } else {
        insertJsNode('/archibus/schema/ab-core/libraries/ext/ext-base.js')
        self['Ext'] = top['Ext'];
    }
}

function insertJsNode(fileName) {
    var fileRef = document.createElement('script')
    fileRef.setAttribute('type', 'text/javascript')
    fileRef.setAttribute('src', fileName)
    document.getElementById('view_layoutWrapper').appendChild(fileRef);
}

loadJsFiles();