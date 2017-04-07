/**
 * @author: Radu Bunea
 * @since 22.1
 *
 * Common function for asset receipt
 *
 */


/**
 * get next id based on assetType and lastId
 * @param assetType
 * @param lastId
 * @returns {*} next id incremented
 */
function getNextId(assetType, lastId) {
    try {
        var result = Workflow.callMethod('AbAssetEAM-AssetReceiptService-getNextId', assetType, lastId);
        if (result.code == 'executed') {
            lastId = result.message;
        }
    } catch (e) {
        Workflow.handleError(e);
        return '';
    }
    return lastId;
}

/**
 * checks if asset exists basset on input pkey
 * @param assetType
 * @param pkValue
 * @returns {boolean} if assets exists
 */
function assetExists(assetType, pkValue) {
    var assetExists = true;
    try {
        var result = Workflow.callMethod('AbAssetEAM-AssetReceiptService-verifyExistsAsset', assetType, pkValue);
        if (result.code == 'executed') {
            assetExists = result.value;
        }
    } catch (e) {
        Workflow.handleError(e);
        return false;
    }
    return assetExists;
}

/**
 *  get last id of the asset
 * @param assetType
 * @param prefix
 * @returns {*} last id if exists
 */
function getLastId(assetType, prefix) {
    var lastId = "";
    try {
        var result = Workflow.callMethod('AbAssetEAM-AssetReceiptService-getLastId', assetType, prefix);
        if (result.code == 'executed') {
            lastId = result.message;
        }
    } catch (e) {
        Workflow.handleError(e);
        return '';
    }
    return lastId;
}
