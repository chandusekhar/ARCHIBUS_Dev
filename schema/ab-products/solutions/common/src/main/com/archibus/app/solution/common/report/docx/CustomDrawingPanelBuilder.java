package com.archibus.app.solution.common.report.docx;

import com.archibus.context.Context;
import com.archibus.datasource.DataSource;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.model.view.report.panel.AbstractReportPanelDef;

/**
 * 
 * Provides custom drawing highlight paginated report by overwriting core standard
 * DrawingPanelBuilder APIs. Overwrites processDrawingHighlightOutput() for a custom drawing image
 * output; overwrites processLegendOutput() for a custom legend output.
 * <p>
 * Check ScableDrawingPdfBuilder for implementation detail
 * {@link com.archibus.service.common.report.pdf.ScalableDrawingPdfBuilder ScableDrawingPdfBuilder}
 * 
 * Used by a report axvw file by specifying it as a handler in <panel type="drawing"
 * handler="com.archibus.app.solution.common.report.docx.CustomDrawingPanelBuilder"> element.
 * 
 * @author Yong Shao
 * @since 21.1
 * 
 */
// keep this class for compatibility
public class CustomDrawingPanelBuilder extends
        com.archibus.service.common.report.pdf.ScalableDrawingPdfBuilder {
    /**
     * 
     * Default constructor.
     * 
     * @param reportPanelDef - AbstractReportPanelDef Obj.
     * @param reportPropertiesDef - ReportPropertiesDef Obj.
     * @param context - Context Obj.
     * @param dataSource - DataSource Obj.
     */
    public CustomDrawingPanelBuilder(final AbstractReportPanelDef reportPanelDef,
            final ReportPropertiesDef reportPropertiesDef, final Context context,
            final DataSource dataSource) {
        super(reportPanelDef, reportPropertiesDef, context, dataSource);
        // TODO Auto-generated constructor stub
    }
    
}
