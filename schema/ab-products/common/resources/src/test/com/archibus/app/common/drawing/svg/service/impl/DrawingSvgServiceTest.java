package com.archibus.app.common.drawing.svg.service.impl;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.common.drawing.svg.service.dao.*;
import com.archibus.app.common.drawing.svg.service.domain.*;
import com.archibus.app.common.util.Callback;
import com.archibus.context.*;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Test public API of class DrawingSvgService.
 *
 * @author shao
 * @since 21.1
 *
 */
public class DrawingSvgServiceTest extends DataSourceTestBase {
    /**
     * bl_id for "HQ".
     */
    static final String BLIDVALUEHQ = "HQ";

    /**
     * fl_id for "17".
     */
    static final String FLIDVALUE17 = "17";

    /**
     * methodInvoked.
     */
    private String methodInvoked;

    /**
     * drawingSvgService.
     */
    private DrawingSvgService drawingSvgService;

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml",
                "/context/reports/docx/reports-docx.xml",
                "/context/controls/drawing/controls-drawing.xml", "appContext-test.xml" };
    }

    /** {@inheritDoc} */

    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        this.drawingSvgService = new DrawingSvgService();
    }

    /**
     *
     * TODO prepareSiteDao.
     *
     * @param callback call back.
     * @return ISiteDao.
     */
    private ISiteDao prepareSiteDao(final Callback callback) {
        return new ISiteDao() {

            @Override
            public Site getBySiteId(final String siteId) {
                final Context context = ContextStore.get();
                DrawingSvgServiceTest.this.methodInvoked = "getBySiteId";

                callback.doWithContext(context);
                final Site site = new Site();
                site.setSiteId("MARKET");
                site.setDetailDrawingName("US-PA-CAMPUS");
                return site;
            }
        };
    }

    /**
     *
     * TODO prepareDrawingDao.
     *
     * @param callback call back.
     * @return IDrawingDao.
     */
    private IDrawingDao prepareDrawingDao(final Callback callback) {
        return new IDrawingDao() {

            @Override
            public Drawing getBySpaceHierarchyValues(final String spaceHierarchyValues) {
                ContextStore.get();
                DrawingSvgServiceTest.this.methodInvoked = "getBySpaceHierarchyValues";
                final Drawing drawing = new Drawing();
                drawing.setDrawingName("HQ17");
                drawing.setSpaceHierarchyValues("HQ;17");
                return drawing;
            }
        };
    }

    /**
     *
     * TODO prepareHighlightParametersDao.
     *
     * @param callback call back.
     * @return IHighlightParametersDao.
     */
    private IHighlightParametersDao prepareHighlightParametersDao(final Callback callback) {
        return new IHighlightParametersDao() {

            @Override
            public List<HighlightParameters> getByPlanType(final String planType) {
                ContextStore.get();
                DrawingSvgServiceTest.this.methodInvoked = "getByPlanType";
                final List<HighlightParameters> result = new ArrayList<HighlightParameters>();
                final HighlightParameters highlightParameters = new HighlightParameters();
                highlightParameters.setViewName("ab-sp-space-book-rmxrmstd.axvw");
                highlightParameters
                .setHighlightDatasourceId("ds_ab-sp-space-book-rmxrmstd_rmHighlight");
                highlightParameters.setLabelDataSourceId("ds_ab-sp-space-book-rmxrmstd_rmLabel");
                result.add(highlightParameters);
                return result;
            }
        };
    }

    /**
     * Test method for {@link DrawingSvgService#highlightSvgDrawing()} Required
     * projects\hq\enterprise-graphics\hq17.svg.
     */
    public final void testHighlightSvgDrawing() {
        this.drawingSvgService.setSiteDao(this.prepareSiteDao(new Callback() {
            @Override
            public Object doWithContext(final Context context) throws ExceptionBase {
                return null;
            }
        }));
        this.drawingSvgService.setDrawingDao(this.prepareDrawingDao(new Callback() {
            @Override
            public Object doWithContext(final Context context) throws ExceptionBase {
                return null;
            }
        }));

        this.drawingSvgService.setHighlightParametersDao(this
            .prepareHighlightParametersDao(new Callback() {
                @Override
                public Object doWithContext(final Context context) throws ExceptionBase {
                    return null;
                }
            }));

        final Map<String, String> pkeyValues = new HashMap<String, String>();
        pkeyValues.put(Constants.BUILDING_ID, BLIDVALUEHQ);
        pkeyValues.put(Constants.FLOOR_ID, FLIDVALUE17);

        final String xml =
                this.drawingSvgService.highlightSvgDrawing(pkeyValues, "1 - ALLOCATION", null);

        Assert.assertNotNull(xml);
    }

}
