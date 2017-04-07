package com.archibus.app.common.depreciation.dao.datasource;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.depreciation.domain.*;
import com.archibus.datasource.SqlUtils;

/**
 * Furniture depreciation data source. Mapped to ta_dep database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FurnitureDepreciationDataSource
        extends AbstractDepreciationDataSource<FurnitureDepreciation> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Only fields specific to Equipment depreciation are specified here, the common fields are
     * specified in the base class.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "ta_id", "furnitureId" } };

    /**
     * Constructs EquipmentDepreciationDataSource, mapped to <code>eq_dep</code> table, using
     * <code>equipmentDepreciation</code> bean.
     */
    public FurnitureDepreciationDataSource() {
        super("furnitureDepreciation", "ta_dep");
    }

    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES from this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);

        return fieldsToPropertiesMerged;
    }

    /**
     * {@inheritDoc}
     *
     * <p>
     * Suppress Warning PMD.AvoidUsingSql.
     *
     * <p>
     * Justification: Case 2.3. Statements with DELETE FROM ... pattern.
     *
     */

    @Override
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteDataForReport(final DepreciationReport depreciationReport) {
        final String deleteStatement = "DELETE FROM ta_dep WHERE ta_dep.report_id = "
                + SqlUtils.formatValueForSql(depreciationReport.getReportId());
        SqlUtils.executeUpdate(this.mainTableName, deleteStatement);
    }

}
