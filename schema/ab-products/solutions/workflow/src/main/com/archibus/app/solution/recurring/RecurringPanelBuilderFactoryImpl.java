package com.archibus.app.solution.recurring;

import com.archibus.context.Context;
import com.archibus.datasource.DataSource;
import com.archibus.ext.report.docx.*;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.model.view.report.panel.AbstractReportPanelDef;

/**
 * 
 * Used to export panels that display recurring pattern field in localized format.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class RecurringPanelBuilderFactoryImpl extends PanelBuilderFactoryImpl {
    
    @Override
    public PanelBuilderBase getStandardDocxBuilder(final ReportFormat reportFormat,
            final ReportPropertiesDef reportPropertiesDef, final Context context,
            final DataSource dataSource, final AbstractReportPanelDef reportPanelDef) {
        PanelBuilderBase builder;
        if (reportFormat != null && reportFormat.getType() == ReportFormat.Type.COLUMN) {
            final RecurringColumnPanelBuilder columnPanelBuilder =
                    new RecurringColumnPanelBuilder(reportPanelDef, reportPropertiesDef, context,
                        dataSource);
            columnPanelBuilder.setColumns(reportFormat.getColumns());
            builder = columnPanelBuilder;
        } else {
            final RecurringTablePanelBuilder tablePanelBuilder =
                    new RecurringTablePanelBuilder(reportPanelDef, reportPropertiesDef, context,
                        dataSource);
            
            builder = tablePanelBuilder;
        }
        return builder;
    }
}
