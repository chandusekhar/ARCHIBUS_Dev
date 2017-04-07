/**
 * Used to display additional Tool Bar Buttons using the Common.view.navigation.NavigationView framework. Tool Bar
 * buttons are defined in the navigation view configuration. The Navigation View framework handles displaying the
 * buttons in the NavigationBar toolbar.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.control.button.Toolbar', {
	extend : 'Ext.Button',

	xtype : 'toolbarbutton',

	isToolbarButton : true,

	config : {
		/**
		 * @cfg {String} displayOn Determines if the button is displayed on the Create, Update or All versions of the
		 *      view. Valid values are: create - The button is only displayed when the view is in Create mode. update -
		 *      The button is only displayed when the view is in Update mode. all - The buton is always displayed.
		 * 
		 * Create and Update modes are determined by the Common.view.navigation.EditBase class isCreateView
		 * configuration.
		 */
		displayOn : 'all'
	}

});