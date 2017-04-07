package com.archibus.app.solution.recurring;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.context.Context;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.report.docx.table.TablePanelBuilder;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.model.view.report.field.UserVirtualFieldDef;
import com.archibus.model.view.report.panel.AbstractReportPanelDef;
import com.archibus.utility.StringUtil;

/**
 * Export panels that display recurring pattern field in localized format.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class RecurringTablePanelBuilder extends TablePanelBuilder {
    /**
     * Constructor.
     * 
     * @param reportPanelDef report panel
     * @param rPropertiesDef report properties
     * @param context context
     * @param dataSource data source
     */
    public RecurringTablePanelBuilder(final AbstractReportPanelDef reportPanelDef,
            final ReportPropertiesDef rPropertiesDef, final Context context,
            final DataSource dataSource) {
        super(reportPanelDef, rPropertiesDef, context, dataSource);
    }
    
    @Override
    public void buildField(final UserVirtualFieldDef fieldDef, final DataRecord dataRecord,
            final String fieldValue, final String styleName) {
        if (fieldDef.isRecurring() && StringUtil.notNullOrEmpty(fieldValue)) {
            final RecurringScheduleService recurringScheduleService =
                    new RecurringScheduleService();
            final String recurringValue =
                    recurringScheduleService.getRecurringPatternDescription(fieldValue);
            buildField(fieldDef, recurringValue, styleName, null);
        } else {
            buildField(fieldDef, fieldValue, styleName, null);
        }
    }
}
