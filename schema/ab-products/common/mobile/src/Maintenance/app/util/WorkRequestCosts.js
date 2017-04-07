/**
 * Holds functions for handling the costs of the work requests
 *
 * @author Cristina Moldovan
 * @since 21.3
 */
Ext.define('Maintenance.util.WorkRequestCosts', {
    alternateClassName: ['WorkRequestCostsUtil'],

    singleton: true,

    /**
     * Defines for each resource type the field to update and its calculation formula
     */
    resourceTypes: {
        part: {
            idField: 'part_id',
            estimatedCostField: 'cost_est_parts',
            actualCostField: 'cost_parts',
            calculateEstimatedCost: function (wrpt, pt) {
                return wrpt.get('qty_estimated') * pt.get('cost_unit_avg');
            },
            calculateActualCost: function (wrpt, pt) {
                return wrpt.get('qty_actual') * pt.get('cost_unit_avg');
            }
        },
        trade: {
            idField: 'tr_id',
            estimatedCostField: 'cost_est_labor',
            actualCostField: '',
            calculateEstimatedCost: function (wrtr, tr) {
                return wrtr.get('hours_est') * tr.get('rate_hourly');
            },
            calculateActualCost: function () {
                return 0.00; // no actual costs for trades
            }
        },
        cost: {
            idField: '',
            estimatedCostField: 'cost_est_other',
            actualCostField: 'cost_other',
            calculateEstimatedCost: function (wrcost) {
                return wrcost.get('cost_estimated');
            },
            calculateActualCost: function (wrcost) {
                return wrcost.get('cost_total');
            }
        },
        craftsperson: {
            idField: 'cf_id',
            estimatedCostField: 'cost_est_labor',
            actualCostField: 'cost_labor',
            calculateEstimatedCost: function (wrcf, cf) {
                return wrcf.get('hours_est') * cf.get('rate_hourly');
            },
            calculateActualCost: function (wrcf, cf) {
                return wrcf.get('hours_straight') * cf.get('rate_hourly')
                    + wrcf.get('hours_over') * cf.get('rate_over')
                    + wrcf.get('hours_double') * cf.get('rate_double');
            }
        }
    },

    /**
     * Calculates and updates the costs of the work request with the passed costs of the resources
     * @param resourceType Maintenance.util.WorkRequestCosts.resourceTypes#part, #trade etc.
     * @param wrRecords work requests
     * @param wrResourceRecords Resources of the WRs
     * @param resourceRecords resource records of all WRs' resources
     */
    updateWorkRequestCosts: function (resourceType, wrRecords, wrResourceRecords, resourceRecords) {
        var me = this,
            wrResources = [],
            resources,
            resourcesOfTheWR = function (wrResource) {
                var wr = this;
                return (wrResource.get('wr_id') === wr.get('wr_id'));
            },
            resourceOfTheWRResource = function (resource) {
                var wrResource = this.wrResource,
                    idField = this.idField;

                return (resource.get(idField) === wrResource.get(idField));
            },
            estimatedCost = 0.00,
            actualCost = 0.00;

        Ext.Array.each(wrRecords, function (wrRecord) {
            wrResources = Ext.Array.filter(wrResourceRecords, resourcesOfTheWR, wrRecord);

            estimatedCost = 0.00;
            actualCost = 0.00;
            Ext.Array.each(wrResources, function (wrResource) {
                resources = Ext.Array.filter(resourceRecords, resourceOfTheWRResource,
                    {wrResource: wrResource, idField: resourceType.idField});

                estimatedCost += resourceType.calculateEstimatedCost(wrResource,
                    !Ext.isEmpty(resources) ? resources[0] : resources);
                actualCost += resourceType.calculateActualCost(wrResource,
                    !Ext.isEmpty(resources) ? resources[0] : resources);
            });

            me.setWorkRequestCosts(wrRecord,
                resourceType.estimatedCostField, estimatedCost,
                resourceType.actualCostField, actualCost);
        });
    },

    /**
     * Updates the work request(s) cost fields (estimated and actual) and the total costs
     * @param {Model/Array} wrRecord
     * @param estimatedCostField
     * @param estimatedCostValue
     * @param actualCostField
     * @param actualCostValue
     */
    setWorkRequestCosts: function (wrRecord, estimatedCostField, estimatedCostValue, actualCostField, actualCostValue) {
        var mobIsChanged,
            records = Ext.isArray(wrRecord) ? wrRecord : [wrRecord];

        Ext.each(records, function (record) {
            mobIsChanged = record.get('mob_is_changed');
            record.set(estimatedCostField, estimatedCostValue);
            if (!Ext.isEmpty(actualCostField)) {
                record.set(actualCostField, actualCostValue);
            }
            record.set('mob_is_changed', mobIsChanged);
            record.updateCostEstTotal();
            record.updateCostTotal();
        });
    }
});