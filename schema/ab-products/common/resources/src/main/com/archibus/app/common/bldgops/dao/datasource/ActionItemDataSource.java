package com.archibus.app.common.bldgops.dao.datasource;

import java.util.List;

import com.archibus.app.common.bldgops.dao.IActionItemDao;
import com.archibus.app.common.bldgops.domain.ActionItem;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.model.view.datasource.*;

/**
 * DataSource for Action Item.
 *
 * @see ObjectDataSourceImpl.
 *
 * @author Zhang Yi
 *
 */
public class ActionItemDataSource extends ObjectDataSourceImpl<ActionItem>
        implements IActionItemDao {

    /**
     * Constant: table name: "activity_log".
     */
    public static final String ACTIVITY_LOG = "activity_log";

    /**
     * Constant: field name: "activity_log_id".
     */
    public static final String ACTIVITY_LOG_ID = "activity_log_id";

    /**
     * Constant: field name: "action_title".
     */
    public static final String ACTION_TITLE = "action_title";

    /**
     * Constant: field name: "comments".
     */
    public static final String COMMENTS = "comments";

    /**
     * Constant: field name: "description".
     */
    public static final String DESCRIPTION = "description";

    /**
     * Constant: field name: "doc4".
     */
    public static final String DOC4 = "doc4";

    /**
     * Constant: domain object's property name: "item_id".
     */
    public static final String ITEM_ID = "item_id";

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES =
            { { ACTIVITY_LOG_ID, "id" }, { DESCRIPTION, DESCRIPTION },
                    { ACTION_TITLE, "actionTitle" }, { COMMENTS, COMMENTS }, { DOC4, DOC4 } };

    /**
     * Constructs ActionItemDataSource, mapped to <code>activity_log</code> table, using
     * <code>actionItem</code> bean.
     */
    public ActionItemDataSource() {
        super("actionItem", ACTIVITY_LOG);
    }

    @Override
    public ActionItem getByPrimaryKey(final ActionItem item) {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + ACTIVITY_LOG_ID);
            pkField.setValue(item.getId());
            primaryKeysValues.getFieldsValues().add(pkField);
        }

        return this.get(primaryKeysValues);
    }

    @Override
    // Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
    @SuppressWarnings("PMD.AvoidUsingSql")
    public final List<ActionItem> findByScenario(final String scenarioId) {

        final Object[] origins = { "HTML5-based Floor Plan", "HTML5-based Map or Drawing Image" };
        final String sqlRedlineExists = String.format("EXISTS (SELECT 1 FROM afm_redlines "
                + " WHERE afm_redlines.activity_log_id = activity_log.activity_log_id "
                + " AND afm_redlines.origin IN ('%s','%s'))",
            origins);

        final String sql = String.format(
            "%s AND activity_log.project_id = '%s' AND activity_log.doc4 IS NOT NULL",
            sqlRedlineExists, scenarioId);

        return this.find(new SqlRestrictionDef(new QueryDef(sql)));
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
