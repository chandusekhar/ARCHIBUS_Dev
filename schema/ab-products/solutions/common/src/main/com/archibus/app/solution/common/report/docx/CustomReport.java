package com.archibus.app.solution.common.report.docx;

import com.archibus.ext.report.docx.DocxPageBuilder;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Provides customized Docx template for a paginated report. Generally, overwrite processFooter()
 * for custom footer output, processHeader() for a custom header output and processPageProperties()
 * for custom page settings.
 * <p>
 * 
 * Used by a report axvw file by specifying it as a handler in report view's <report
 * handler="com.archibus.app.solution.common.report.docx.CustomReport"> element.
 * 
 * @author Yong Shao.
 * @since 20.1
 * 
 */

public class CustomReport extends com.archibus.ext.report.docx.Report {
    /**
     * ROTATION.
     */
    static final int ROTATION = 45;
    
    @Override
    public void processFooter(final DocxPageBuilder docxPageBuilder,
            final ReportPropertiesDef reportProperties) throws ExceptionBase {
        // no custom
        super.processFooter(docxPageBuilder, reportProperties);
        /*
         * final com.aspose.words.Document doc = docxPageBuilder.getDocument(); final HeaderFooter
         * footer = doc.getFirstSection().getHeadersFooters()
         * .getByHeaderFooterType(HeaderFooterType.FOOTER_PRIMARY);
         * 
         * final NodeCollection<?> shapes = footer.getChildNodes(NodeType.SHAPE, true, false);
         * 
         * for (final Shape shape : (Iterable<Shape>) shapes) {
         * 
         * if ("north-arrow.jpg".equals(shape.getAlternativeText().trim())) {
         * shape.setRotation(ROTATION); } }
         * 
         * DocxUtility.replaceText(footer, "{DRAWING.TITLE}", "MIT Drawing");
         * 
         * final String currentDate = SimpleDateFormat.getDateInstance(SimpleDateFormat.SHORT,
         * ContextStore.get().getLocale()).format(new Date()); DocxUtility.replaceText(footer,
         * "{DATE}", currentDate);
         * 
         * DocxUtility.replaceText(footer, "{USER}", "AFM");
         * 
         * DocxUtility.replaceText(footer, "{bl_id}.{fl_id}", "HQ.18");
         * 
         * // one record this.setRecordLimit(1);
         */
        
    }
    
    @Override
    public void processPageProperties(final DocxPageBuilder docxPageBuilder,
            final ReportPropertiesDef reportProperties) throws ExceptionBase {
        // no custom
        super.processPageProperties(docxPageBuilder, reportProperties);
    }
    
    @Override
    public void processHeader(final DocxPageBuilder docxPageBuilder,
            final ReportPropertiesDef reportProperties) throws ExceptionBase {
        // no custom
        super.processHeader(docxPageBuilder, reportProperties);
    }
    
}
