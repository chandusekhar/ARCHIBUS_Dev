/**
 * Created with JetBrains WebStorm.
 * User: meyer
 * Date: 10/13/13
 * Time: 9:19 PM
 * To change this template use File | Settings | File Templates.
 */
Ab.namespace('view');

Ab.view.type = 'page-navigation';

/**
 * ab-ondemand-request-create.js uses top.window.location.parameters as a storage... quite unsafe
 */
window.location.parameters = {};