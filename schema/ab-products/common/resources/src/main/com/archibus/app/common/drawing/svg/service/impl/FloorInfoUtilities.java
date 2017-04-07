package com.archibus.app.common.drawing.svg.service.impl;

import java.util.*;

import com.archibus.app.common.drawing.svg.service.dao.IDrawingDao;
import com.archibus.app.common.drawing.svg.service.domain.Drawing;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Utilities for class DrawingSvgService.
 * <p>
 * Provides methods to retrieve floor and its paired building codes based on specified site ids
 * and/or building ids.
 *
 * @author shao
 * @since 23.1
 *
 */
public final class FloorInfoUtilities {
    /**
     * Constant: fl table.
     */
    public static final String FLOOR = "fl";

    /**
     * Constant: bl table.
     */
    public static final String BUILDING = "bl";

    /**
     * Constant: fl_id field name.
     */
    public static final String FLOOR_ID = "fl_id";
    
    /**
     * Constant: site id.
     */
    public static final String SITE_ID = "site_id";

    /**
     * Constant: bl_id field name.
     */
    public static final String BUILDING_ID = "bl_id";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private FloorInfoUtilities() {
    }
    
    /**
     *
     * Retrieves floor and its paired building codes based on specified sites and/or buildings if
     * their corresponding published svg files exist.
     *
     * @param siteIds site ids.
     * @param buildingIds building ids.
     * @param drawingDao IDrawingDao.
     * @return List<Map<String, String>> like [{bl_id:HQ, fl_id:18}].
     * @throws ExceptionBase anything wrong.
     */
    public static List<Map<String, String>> retrieveFloorCodes(final List<String> siteIds,
        final List<String> buildingIds, final IDrawingDao drawingDao) throws ExceptionBase {
        final List<String> collectedBuildingIds = collectBuildingIdsFromSite(siteIds, buildingIds);
        return retrieveFloorIds(drawingDao, collectedBuildingIds);
    }

    /**
     *
     * Retrieves floor ids from fl table based on specified building ids.
     *
     * @param drawingDao IDrawingDao.
     * @param buildingIds building ids.
     * @return List<Map<String, String>>.
     */
    private static List<Map<String, String>> retrieveFloorIds(final IDrawingDao drawingDao,
        final List<String> buildingIds) {
        final List<Map<String, String>> results = new ArrayList<Map<String, String>>();
        // TODO: dataSource as java bean with DI
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(FLOOR);
        dataSource.addField(BUILDING_ID);
        dataSource.addField(FLOOR_ID);

        final List<ClauseDef> clauses = new ArrayList<ClauseDef>();
        for (final String buildingId : buildingIds) {
            clauses.add(new ClauseDef(FLOOR, BUILDING_ID, buildingId, ClauseDef.Operation.EQUALS,
                ClauseDef.RelativeOperation.OR));
        }
        final AbstractRestrictionDef restrictionDef = new ParsedRestrictionDef(clauses);
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        for (final DataRecord record : records) {
            final String buildingId = record.getString(FLOOR + '.' + BUILDING_ID);
            final String floorId = record.getString(FLOOR + '.' + FLOOR_ID);
            final Drawing drawing =
                    drawingDao.getBySpaceHierarchyValues(buildingId + ';' + floorId);
            if (drawing != null && HighlightUtilities.exist(drawing.getDrawingName())) {
                final Map<String, String> result = new HashMap<String, String>();
                result.put(BUILDING_ID, buildingId);
                result.put(FLOOR_ID, floorId);
                results.add(result);

            }
        }
        return results;
    }

    /**
     *
     * Collects building ids from bl table based on specified site ids and building ids.
     *
     * @param siteIds site_ids.
     * @param buildingIds building ids.
     * @return list of bl_id.
     */
    private static List<String> collectBuildingIdsFromSite(final List<String> siteIds,
        final List<String> buildingIds) {
        List<String> collectedBuildingIds = buildingIds;
        if (collectedBuildingIds == null) {
            collectedBuildingIds = new ArrayList<String>();
        }
        
        // XXX: if buildingIds is not empty, skip????
        if (siteIds != null && !siteIds.isEmpty() && collectedBuildingIds.isEmpty()) {
            // TODO: dataSource as java bean with DI
            final DataSource dataSource = DataSourceFactory.createDataSource();
            dataSource.addTable(BUILDING);
            dataSource.addField(SITE_ID);
            dataSource.addField(BUILDING_ID);
            final List<ClauseDef> clauses = new ArrayList<ClauseDef>();
            for (final String siteId : siteIds) {
                clauses.add(new ClauseDef(BUILDING, SITE_ID, siteId, ClauseDef.Operation.EQUALS,
                    ClauseDef.RelativeOperation.OR));
            }
            final AbstractRestrictionDef restrictionDef = new ParsedRestrictionDef(clauses);

            final List<DataRecord> records = dataSource.getRecords(restrictionDef);
            for (final DataRecord record : records) {
                final String buildingId = record.getString(BUILDING + '.' + BUILDING_ID);
                if (!collectedBuildingIds.contains(buildingId)) {
                    collectedBuildingIds.add(buildingId);
                }
            }
        }
        
        return collectedBuildingIds;
    }
}
