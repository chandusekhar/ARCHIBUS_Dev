package com.archibus.eventhandler.rplm;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;

public class LeaseAdministrationServiceTest extends DataSourceTestBase {
    
    LeaseAdministrationService serviceClass = new LeaseAdministrationService();
    
    public void testDuplicateLease() {
        
        String newLsId = "newLeaseCode";
        String itemValue = "HQ";
        String selectedLsId = "001";
        String itemType = "building";
        String isTemplate = "0";
        String landlord_tenant = "'TENANT'";
        String lsParentId = "ls.ls_parent_id";
        String lease_sublease = "'LEASE'";
        
        this.serviceClass.duplicateLease(newLsId, selectedLsId, isTemplate, itemType, itemValue,
            landlord_tenant, lsParentId, lease_sublease);
    }
    
    public void testOnPaginatedReport() {
        Map<String, String> map1 = new HashMap<String, String>();
        map1.put("ls_id", "001");
        map1.put("bl_id", "HQ");
        Map<String, String> map2 = new HashMap<String, String>();
        map2.put("ls_id", "002");
        map2.put("bl_id", "HQ");
        Map<String, String> map3 = new HashMap<String, String>();
        map3.put("ls_id", "003");
        map3.put("bl_id", "HQ");
        Map<String, String> map4 = new HashMap<String, String>();
        map4.put("ls_id", "CT001");
        map4.put("pr_id", "CELL TOWER #8888");
        
        List<Map> pKyes = new ArrayList<Map>();
        pKyes.add(map1);
        pKyes.add(map2);
        pKyes.add(map3);
        pKyes.add(map4);
        
    }
}
