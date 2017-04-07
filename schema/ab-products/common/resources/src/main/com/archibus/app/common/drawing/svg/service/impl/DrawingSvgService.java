package com.archibus.app.common.drawing.svg.service.impl;

import java.util.*;

import com.archibus.app.common.drawing.svg.service.IDrawingSvgService;
import com.archibus.app.common.drawing.svg.service.dao.*;
import com.archibus.app.common.drawing.svg.service.sankey.SankeyData;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * Implementation of <code>IDrawingSvgService</code>.
 * <p>
 * This is a bean managed by Spring, configured in
 * /schema/ab-products/common/resources/appContext-services.xml.
 * <p>
 * Exposed to JavaScript clients through DWR, configured in /WEB-INF/dwr.xml.
 *
 *
 * @author shao
 * @since 21.1
 *
 */
public class DrawingSvgService implements IDrawingSvgService {
    
    /**
     * DAO for Site.
     * <p>
     * Used to get Site by site_id.
     */
    private ISiteDao siteDao;
    
    /**
     * DAO for Drawing.
     * <p>
     * Used to get Drawing by space_hier_field_values.
     */
    private IDrawingDao drawingDao;
    
    /**
     * DAO for HighlightParameters.
     * <p>
     * Used to get HighlightParameters by plan_type.
     */
    private IHighlightParametersDao highlightParametersDao;
    
    /**
     * {@inheritDoc}
     */
    @Override
    public String highlightSvgDrawing(final Map<String, String> pkeyValues,
            final String planTypeValue, final List<Map<String, String>> parameters)
                    throws ExceptionBase {
        return ServiceUtilities.highlightSvgDrawing(pkeyValues, planTypeValue, parameters,
            this.highlightParametersDao, this.drawingDao, this.siteDao);
    }

    /**
     * Getter for the siteDao property.
     *
     * @see siteDao
     * @return the siteDao property.
     */
    public ISiteDao getSiteDao() {
        return this.siteDao;
    }
    
    /**
     * Setter for the siteDao property.
     *
     * @see siteDao
     * @param siteDao the siteDao to set
     */
    
    public void setSiteDao(final ISiteDao siteDao) {
        this.siteDao = siteDao;
    }
    
    /**
     * Getter for the drawingDao property.
     *
     * @see drawingDao
     * @return the drawingDao property.
     */
    public IDrawingDao getDrawingDao() {
        return this.drawingDao;
    }
    
    /**
     * Setter for the drawingDao property.
     *
     * @see drawingDao
     * @param drawingDao the drawingDao to set
     */
    
    public void setDrawingDao(final IDrawingDao drawingDao) {
        this.drawingDao = drawingDao;
    }
    
    /**
     * Getter for the highlightParametersDao property.
     *
     * @see highlightParametersDao
     * @return the highlightParametersDao property.
     */
    public IHighlightParametersDao getHighlightParametersDao() {
        return this.highlightParametersDao;
    }
    
    /**
     * Setter for the highlightParametersDao property.
     *
     * @see highlightParametersDao
     * @param highlightParametersDao the highlightParametersDao to set
     */
    public void setHighlightParametersDao(final IHighlightParametersDao highlightParametersDao) {
        this.highlightParametersDao = highlightParametersDao;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public String getSankeyData(final Map<String, String> parameters) {
        return new SankeyData().getSankeyData(parameters);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public String loadSvg(final String fileName) {
        return ServiceUtilities.loadSvg(fileName);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void checkin(final String fileContent, final Map<String, String> keys,
            final Map<String, String> parameters) throws ExceptionBase {
        RedmarkUtilities.checkin(fileContent, keys, parameters);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public String checkOut(final Map<String, String> keys, final Map<String, String> parameters)
            throws ExceptionBase {
        return RedmarkUtilities.checkOut(keys, parameters);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public List<Map<String, String>> retrieveFloorCodes(final List<String> siteIds,
        final List<String> buildingIds) throws ExceptionBase {
        return FloorInfoUtilities.retrieveFloorCodes(siteIds, buildingIds, this.drawingDao);
    }

}
