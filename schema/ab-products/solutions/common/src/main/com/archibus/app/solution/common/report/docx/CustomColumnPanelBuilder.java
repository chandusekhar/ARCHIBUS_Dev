package com.archibus.app.solution.common.report.docx;

import com.archibus.context.Context;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.report.docx.column.ColumnPanelBuilder;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.model.view.report.field.UserVirtualFieldDef;
import com.archibus.model.view.report.panel.AbstractReportPanelDef;

/**
 * 
 * Provides a custom column report output by overwriting core standard ColumnPanelBuilder APIs.
 * Overwrites buildRegularField() to have custom table header and custom table data content;
 * <p>
 * 
 * Used by paginated report view to custom its column panel report output.
 * 
 * @author Yong Shao
 * @since 20.1
 * 
 */
public class CustomColumnPanelBuilder extends ColumnPanelBuilder {
    /**
     * WRPROBTYPE.
     */
    private static final String WRPROBTYPE = "wr.prob_type";
    
    /**
     * WRPROBTYPEFURNITURE.
     */
    private static final String WRPROBTYPEFURNITURE = "FURNITURE";
    
    /**
     * 
     * Default constructor specifying.
     * 
     * @param reportPanelDef - AbstractReportPanelDef.
     * @param reportPropertiesDef - ReportPropertiesDef.
     * @param context - Context.
     * @param dataSource - DataSource.
     */
    public CustomColumnPanelBuilder(final AbstractReportPanelDef reportPanelDef,
            final ReportPropertiesDef reportPropertiesDef, final Context context,
            final DataSource dataSource) {
        super(reportPanelDef, reportPropertiesDef, context, dataSource);
        // TODO Auto-generated constructor stub
    }
    
    /**
     * Sets up specified field header and data highlight colors. {@inheritDoc}
     */
    @Override
    public void buildRegularField(final DataRecord dataRecord, final UserVirtualFieldDef fieldDef,
            final String fieldTitle, final String fieldValue, final String titleStyleName,
            final String dataStyleName) {
        java.awt.Color headerHighlightColor = null;
        if (WRPROBTYPE.equals(fieldDef.getFullName())) {
            headerHighlightColor = java.awt.Color.RED;
        }
        
        java.awt.Color dataHighlightColor = null;
        if (WRPROBTYPE.equals(fieldDef.getFullName())
                && WRPROBTYPEFURNITURE.equals(dataRecord.getString(WRPROBTYPE))) {
            dataHighlightColor = java.awt.Color.BLUE;
        }
        
        buildRegularField(fieldDef, fieldTitle, fieldValue, titleStyleName, dataStyleName,
            headerHighlightColor, dataHighlightColor);
    }
}
