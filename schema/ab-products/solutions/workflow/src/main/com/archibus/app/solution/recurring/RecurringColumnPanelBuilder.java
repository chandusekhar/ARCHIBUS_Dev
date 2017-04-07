package com.archibus.app.solution.recurring;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.context.Context;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.model.view.report.field.UserVirtualFieldDef;
import com.archibus.model.view.report.panel.AbstractReportPanelDef;
import com.archibus.utility.StringUtil;

/**
 * 
 * Custom column panel builder - display recurring pattern field.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class RecurringColumnPanelBuilder extends
        com.archibus.ext.report.docx.column.ColumnPanelBuilder {
    
    /**
     * Constructor.
     * 
     * @param reportPanelDef report panel definition
     * @param reportPropertiesDef report properties
     * @param context context
     * @param dataSource data source
     */
    public RecurringColumnPanelBuilder(final AbstractReportPanelDef reportPanelDef,
            final ReportPropertiesDef reportPropertiesDef, final Context context,
            final DataSource dataSource) {
        super(reportPanelDef, reportPropertiesDef, context, dataSource);
    }
    
    @Override
    public void buildRegularField(final DataRecord dataRecord, final UserVirtualFieldDef fieldDef,
            final String fieldTitle, final String fieldValue, final String titleStyleName,
            final String dataStyleName) {
        if (fieldDef.isRecurring() && StringUtil.notNullOrEmpty(fieldValue)) {
            final RecurringScheduleService recurringScheduleService =
                    new RecurringScheduleService();
            final String recurringValue =
                    recurringScheduleService.getRecurringPatternDescription(fieldValue);
            buildRegularField(fieldDef, fieldTitle, recurringValue, titleStyleName, dataStyleName,
                null, null);
            
        } else {
            buildRegularField(fieldDef, fieldTitle, fieldValue, titleStyleName, dataStyleName,
                null, null);
        }
        
    }
}
