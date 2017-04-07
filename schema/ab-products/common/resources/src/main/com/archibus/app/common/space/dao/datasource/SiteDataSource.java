package com.archibus.app.common.space.dao.datasource;

import java.util.List;

import com.archibus.app.common.space.domain.Site;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * DataSource for sites.
 * 
 * @author Bart Vanderschoot
 * 
 */
public class SiteDataSource extends ObjectDataSourceImpl<Site> {
    
    /**
     * Site table and bean name.
     */
    private static final String SITE = "site";
    
    /**
     * Site name field name.
     */
    private static final String SITE_NAME_FIELD = "name";
    
    /**
     * State ID field name.
     */
    private static final String STATE_ID_FIELD = "state_id";
    
    /**
     * City ID field name.
     */
    private static final String CITY_ID_FIELD = "city_id";
    
    /** fields mapping for version 20. */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "site_id", "siteId" },
            { SITE_NAME_FIELD, SITE_NAME_FIELD }, { CITY_ID_FIELD, "cityId" },
            { STATE_ID_FIELD, "stateId" }, { "regn_id", "regnId" }, { "ctry_id", "ctryId" } };
    
    /**
     * Default constructor.
     */
    public SiteDataSource() {
        super(SITE, SITE);
    }
    
    /**
     * Find sites by city.
     * 
     * @param stateId the state id
     * @param cityId the city id
     * @return list of sites
     */
    public List<Site> findByCity(final String stateId, final String cityId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        restriction.addClause(this.tableName, STATE_ID_FIELD, stateId, Operation.EQUALS);
        restriction.addClause(this.tableName, CITY_ID_FIELD, cityId, Operation.EQUALS);
        
        return this.find(restriction);
    }
    
    /**
     * Fields to properties mapping for version 20.
     * 
     * @return array of arrays.
     */
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
}
