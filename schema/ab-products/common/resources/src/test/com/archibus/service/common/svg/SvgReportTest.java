package com.archibus.service.common.svg;

import java.io.IOException;
import java.net.URL;

import junit.framework.Assert;

import com.archibus.datasource.DataSourceFactory;
import com.archibus.eventhandler.EventHandlerTestBaseImpl;

/**
 *
 * Test public methods of class SvgReport.
 *
 * @author shao
 * @since 21.1
 *
 */
public class SvgReportTest extends EventHandlerTestBaseImpl {
    /**
     * HQ17.
     */
    private static final String HQ17 = "HQ17";

    /**
     * svg extension .
     */
    private static final String SVGEXTENSION = ".svg";

    /**
     * VIEWFILENAME.
     */
    private static final String VIEWFILENAME = "ab-sp-space-book-rmxrmstd.axvw";

    /**
     * VIEWFILENAME2.
     */
    private static final String VIEWFILENAME2 = "ab-sp-space-book-eqxeqstd.axvw";

    /**
     * HLDATASOURCEID.
     */
    private static final String HLDATASOURCEID = "ds_ab-sp-space-book-rmxrmstd_rmHighlight";

    /**
     * LABELDATASOURCEID.
     */
    private static final String LABELDATASOURCEID = "ds_ab-sp-space-book-rmxrmstd_rmLabel";

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml",
                "/context/reports/docx/reports-docx.xml",
                "/context/controls/drawing/controls-drawing.xml", "appContext-test.xml" };
    }

    /**
     *
     * Tests getSvg() method.Required projects\hq\enterprise-graphics\hq17.svg.
     *
     * @throws IOException if loading svg or highlighting it throws an exception.
     */
    public void testGetSvg() throws IOException {
        final URL url =
                new URL(
                    com.archibus.ext.drawing.highlight.HighLightUtilities.getDrawingSourcePath()
                    + '/' + HQ17.toLowerCase() + SVGEXTENSION);

        final SvgReport svgReport = new SvgReport(HQ17, url.openStream());
        // highlight rooms with room standards
        svgReport.processAsset(
            DataSourceFactory.loadDataSourceFromFile(VIEWFILENAME, HLDATASOURCEID),
            DataSourceFactory.loadDataSourceFromFile(VIEWFILENAME, LABELDATASOURCEID), null, 0.00,
            null, null, null);

        Assert.assertNotNull(svgReport.getSvgDocument());
    }

    /**
     *
     * Tests processAssets() method. Required projects\hq\enterprise-graphics\hq17.svg.
     *
     * @throws IOException if highlighting it throws an exception.
     */
    public void testProcessAssets() throws IOException {
        final URL url =
                new URL(
                    com.archibus.ext.drawing.highlight.HighLightUtilities.getDrawingSourcePath()
                    + '/' + HQ17.toLowerCase() + SVGEXTENSION);

        final SvgReport svgReport = new SvgReport(HQ17, url.openStream());
        svgReport.setHideNoHighlightedAssets(true);
        // highlight rooms with room standards
        svgReport.processAsset(
            DataSourceFactory.loadDataSourceFromFile(VIEWFILENAME, HLDATASOURCEID),
            DataSourceFactory.loadDataSourceFromFile(VIEWFILENAME, LABELDATASOURCEID), null, 0.00,
            null, null, null);

        Assert.assertNotNull(svgReport.getSvgDocument());
        svgReport.setHideNoHighlightedAssets(false);
        // further highlight equipments with standards
        svgReport.processAsset(DataSourceFactory.loadDataSourceFromFile(VIEWFILENAME2,
                "ds_ab-sp-space-book-exeqstd_eqxeqstdHighlight"), DataSourceFactory
                .loadDataSourceFromFile(VIEWFILENAME2, "ds_ab-sp-space-book-eqxeqstd_eqxeqstdLabel"),
                "eq", 0.00, null, null, null);
        Assert.assertNotNull(svgReport.getSvgDocument());

    }

}
