/**
 * Holds various application constants.
 *
 * @author Cristina Reghina
 * @since 21.3
 */
Ext.define('Maintenance.util.Constants', {
    alternateClassName: ['Constants'],  //TODO: Using a common alternateClassName like Constants could cause
                                        // namespace clashes with other apps. Use an alternate name such as MaintenanceConstants

    singleton: true,

    MyWork: 'MyWork',
    MyRequests: 'MyRequests',
    Requested: 'Requested',
    Approved: 'Approved',
    Issued: 'Issued',
    Completed: 'Completed',
    EstimateMaxValue: 99999999.99,
    EstimateMinValue: 0

});