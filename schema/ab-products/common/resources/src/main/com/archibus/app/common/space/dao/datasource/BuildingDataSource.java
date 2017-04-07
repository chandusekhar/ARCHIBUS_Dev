package com.archibus.app.common.space.dao.datasource;

import java.util.List;

import com.archibus.app.common.space.domain.Building;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * DataSource for buildings.
 * 
 */
public class BuildingDataSource extends ObjectDataSourceImpl<Building> {
    
    /**
     * Site ID field name.
     */
    private static final String SITE_ID_FIELD = "site_id";
    
    /**
     * Site ID property name.
     */
    private static final String SITE_ID_PROPERTY = "siteId";
    
    /**
     * Building name field name.
     */
    private static final String BUILDING_NAME_FIELD = "name";
    
    /**
     * State ID field name.
     */
    private static final String STATE_ID_FIELD = "state_id";
    
    /**
     * City ID field name.
     */
    private static final String CITY_ID_FIELD = "city_id";
    
    /**
     * Field to properties mapping.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { SITE_ID_FIELD, SITE_ID_PROPERTY },
            { BUILDING_NAME_FIELD, BUILDING_NAME_FIELD }, { "bl_id", "buildingId" },
            { "ctry_id", "ctryId" }, { "regn_id", "regnId" }, { STATE_ID_FIELD, "stateId" },
            { CITY_ID_FIELD, "cityId" } };
    
    /**
     * Default Constructor.
     */
    public BuildingDataSource() {
        super("building", "bl");
    }
    
    /**
     * Find buildings by city.
     * 
     * @param stateId state id
     * @param cityId city id
     * @return buildings list of buildings
     */
    public final List<Building> findByCity(final String stateId, final String cityId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        restriction.addClause(this.tableName, STATE_ID_FIELD, stateId, Operation.EQUALS);
        restriction.addClause(this.tableName, CITY_ID_FIELD, cityId, Operation.EQUALS);
        
        return this.find(restriction);
    }
    
    /**
     * Find buildings by site.
     * 
     * @param siteId site id
     * @return buildings list of buildings
     */
    public final List<Building> findBySite(final String siteId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(this.tableName, SITE_ID_FIELD, siteId, Operation.EQUALS);
        return this.find(restriction);
    }
    
    /**
     * For version 20.
     * 
     * @return array of arrays.
     */
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
}
