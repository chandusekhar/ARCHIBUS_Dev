/**
 * Upload local file to the application server
 * @param inputFile object
 * @param destFileName string
 * @param overwrite boolean
 * @returns integer
 */
function uploadFileToProjectFolder(inputFile, folderPath, filePath, overwrite, callbackFunction, callbackObject) {
    if (inputFile.files.length>0) {
        if (!filePath) {  // If destination blank, extract source filename without path
            filePath = inputFile.files[0].name;
        }
        if (folderPath==null) {
            folderPath = '';
        }
        // upload the selected local file to the server
        Workflow.startJobWithUpload(
                    'AbCommonResources-ApplicationUtilityService-writeStreamToFile', 
                     inputFile, callbackFunction, callbackObject, folderPath, filePath, overwrite);
    }
}
