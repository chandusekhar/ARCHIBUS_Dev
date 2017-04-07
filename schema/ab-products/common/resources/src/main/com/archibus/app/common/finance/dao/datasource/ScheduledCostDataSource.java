package com.archibus.app.common.finance.dao.datasource;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finance.domain.ScheduledCost;

/**
 * DataSource for ScheduledCost.
 *
 * @author Ioan Draghici
 * @author Valery Tydykov
 */
public class ScheduledCostDataSource extends AbstractCostDataSource<ScheduledCost> {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Only fields specific to ScheduledCost are specified here, the common fields are specified in
     * the base class.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "cost_tran_sched_id", "id" },
            { "cost_tran_recur_id", "recurCostId" }, { "date_assessed", "dateAssessed" },
            { Constants.DATE_DUE, "dateDue" }, { Constants.DATE_PAID, "datePaid" },
            { Constants.STATUS, Constants.STATUS }, { "amount_tax_late1", "amountTaxLate1" },
            { "amount_tax_late2", "amountTaxLate2" }, { "amount_tax_late3", "amountTaxLate3" },
            { "date_tax_late1", "dateTaxLate1" }, { "date_tax_late2", "dateTaxLate2" },
            { "date_tax_late3", "dateTaxLate3" } };

    /**
     * Constructs ScheduledCostDataSource, mapped to <code>cost_tran_sched</code> table, using
     * <code>scheduledCost</code> bean.
     */
    public ScheduledCostDataSource() {
        super("scheduledCost", "cost_tran_sched");
        setApplyVpaRestrictions(false);
    }

    /** {@inheritDoc} */

    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES in this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);

        return fieldsToPropertiesMerged;
    }
}
