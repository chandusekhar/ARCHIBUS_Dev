package com.archibus.app.solution.common.report.docx;

import java.util.*;

import com.archibus.context.Context;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.report.docx.*;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.model.view.report.field.UserVirtualFieldDef;
import com.archibus.model.view.report.panel.AbstractReportPanelDef;
import com.archibus.utility.*;

/**
 * 
 * Provides a custom table report output by overwriting core standard TablePanelBuilder APIs.
 * Overwrites buildTableHeader() and buildFieldHeader() to have custom table header; overwrites
 * buildTableRow() and buildRegularField() to have custom table data content;
 * <p>
 * 
 * Used by paginated report view to custom its table panel report output.
 * 
 * @author Yong Shao
 * @since 20.1
 * 
 */
public class CustomTablePanelBuilder extends com.archibus.ext.report.docx.table.TablePanelBuilder {
    /**
     * RMAREA.
     */
    private static final String RMAREA = "rm.area";
    
    /**
     * RMBLID.
     */
    private static final String RMBLID = "rm.bl_id";
    
    /**
     * RMFLID.
     */
    private static final String RMFLID = "rm.fl_id";
    
    /**
     * RMTYPE.
     */
    private static final String RMTYPE = "rm.rm_type";
    
    /**
     * RMRMID.
     */
    private static final String RMRMID = "rm.rm_id";
    
    /**
     * RMDVID.
     */
    private static final String RMDVID = "rm.dv_id";
    
    /**
     * RMDPID.
     */
    private static final String RMDPID = "rm.dp_id";
    
    /**
     * RMTYPEOFFICE.
     */
    private static final String RMTYPEOFFICE = "OFFICE";
    
    /**
     * LOCATIONTITLE.
     */
    // @translatable
    private static final String LOCATIONTITLE = "Building-Floor-Room";
    
    /**
     * BLFLIDFORMAT.
     */
    private static final String BLFLIDFORMAT = "%s-%s-%s";
    
    /**
     * DVDPIDFORMAT.
     */
    private static final String DVDPIDFORMAT = "%s+%s";
    
    /**
     * 
     * Default constructor.
     * 
     * @param reportPanelDef - AbstractReportPanelDef.
     * @param reportPropertiesDef - ReportPropertiesDef.
     * @param context - Context.
     * @param dataSource - DataSource.
     */
    public CustomTablePanelBuilder(final AbstractReportPanelDef reportPanelDef,
            final ReportPropertiesDef reportPropertiesDef, final Context context,
            final DataSource dataSource) {
        super(reportPanelDef, reportPropertiesDef, context, dataSource);
        // TODO Auto-generated constructor stub
    }
    
    @Override
    public void build(final Report report, final List<DataSourceParameter> dataSourceParameters,
            final int leftIndent, final int level) throws ExceptionBase {
        this.setSkippedFieldNames(Arrays.asList(RMBLID, RMFLID, RMDVID));
        super.build(report, dataSourceParameters, leftIndent, level);
    }
    
    @Override
    public void buildFieldHeader(final UserVirtualFieldDef fieldDef, final String fieldTitle,
            final String styleName) {
        final String fieldName = fieldDef.getFullName();
        java.awt.Color fieldFighlightColor = null;
        if (fieldName.equals(RMAREA) || fieldName.equals(RMTYPE)) {
            fieldFighlightColor = java.awt.Color.BLUE;
        }
        
        final String title = getFieldHeader(fieldName, fieldTitle);
        buildFieldHeader(fieldDef, title, styleName, fieldFighlightColor);
    }
    
    /**
     * 
     * Gets Field Header.
     * 
     * @param fieldName - String.
     * @param fieldTitle - String.
     * @return String.
     */
    private String getFieldHeader(final String fieldName, final String fieldTitle) {
        String title = fieldTitle;
        if (fieldName.equals(RMRMID)) {
            title = LOCATIONTITLE;
        } else if (fieldName.equals(RMDPID)) {
            title =
                    String.format(DVDPIDFORMAT, this.getUserVirtualFieldDef(RMDVID).getTitle()
                        .getTranslatedString(), fieldTitle);
        }
        return title;
    }
    
    @Override
    public void buildField(final UserVirtualFieldDef fieldDef, final DataRecord dataRecord,
            final String fieldValue, final String styleName) {
        final String fieldName = fieldDef.getFullName();
        java.awt.Color highlightColor = null;
        if ((fieldName.equals(RMTYPE) || fieldName.equals(RMAREA))
                && RMTYPEOFFICE.equals(dataRecord.getString(RMTYPE))) {
            highlightColor = java.awt.Color.RED;
        }
        
        if (fieldName.equals(RMRMID)) {
            buildField(
                fieldDef,
                
                String.format(BLFLIDFORMAT, dataRecord.getString(RMBLID),
                    dataRecord.getString(RMFLID), StringUtil.notNull(fieldValue)), styleName,
                highlightColor);
        } else if (fieldName.equals(RMDPID) && StringUtil.notNullOrEmpty(fieldValue)) {
            buildField(
                fieldDef,
                
                String.format(DVDPIDFORMAT, dataRecord.getString(RMDVID),
                    StringUtil.notNull(fieldValue)), styleName, highlightColor);
        } else {
            buildField(fieldDef, fieldValue, styleName, highlightColor);
        }
    }
    
}
