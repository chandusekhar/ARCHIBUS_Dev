package com.archibus.app.helpdesk.mobile.maintenance.service;

/**
 * API of the WorkflowRule Service for mobile Maintenance application.
 * <p>
 * Only authenticated users are allowed to invoke methods in this service.
 * 
 * @author Constantine Kriezis
 * @since 21.1
 * 
 */
public interface IMaintenanceMobileService {
    
    /**
     * Synchronizes all the data for the mobile maintenance application.
     * 
     * @param cfUser User Name of Crafts Person
     * @param cfId Crafts Person Code
     * @return returnMessage - Return any issues with executing workflow actions.
     */
    // TODO: (VT): can cfId be deduced from cfUser here?
    String syncWorkData(final String cfUser, final String cfId);
}