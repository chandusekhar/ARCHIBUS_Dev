package com.archibus.service.space.transaction;

import java.util.List;

import com.archibus.app.common.util.*;
import com.archibus.context.Context;
import com.archibus.core.event.data.IDataEventListener;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.helper.*;
import com.archibus.utility.*;

/**
 * <p>
 * Helper Class for Space Transaction Update action that need suspend data event.<br>
 * 
 * <p>
 * 
 * @author Guo Jiangtao
 */
public final class SpaceTransactionSuspendDataEventUpdate {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceTransactionSuspendDataEventUpdate() {
    }
    
    /**
     * update em from rmpct and suspend date event.
     * 
     * @param rmpctRecord rmpctRecord
     */
    public static void updateEmFromRmpctAndSuspendDataEvent(final DataRecord rmpctRecord) {
        final String emId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.EM_ID);
        
        if (StringUtil.notNullOrEmpty(emId)) {
            // suspend triggering events for RoomTransactionDataEventListener
            final SuspendDataEventsTemplate suspendDataEventsTemplate =
                    new SuspendDataEventsTemplate(IDataEventListener.class);
            final DataSource emDS = SpaceTransactionUtil.getEmDataSource();
            
            final List<DataRecord> emRecords =
                    emDS.getRecords("em.em_id='" + SqlUtils.makeLiteralOrBlank(emId) + "'");
            if (!emRecords.isEmpty()) {
                final DataRecord emRecord = emRecords.get(0);
                emRecord.setValue(
                    SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.BL_ID,
                    rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.BL_ID));
                emRecord.setValue(
                    SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.FL_ID,
                    rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.FL_ID));
                emRecord.setValue(
                    SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.RM_ID,
                    rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.RM_ID));
                
                suspendDataEventsTemplate.doWithContext(new Callback() {
                    public Object doWithContext(final Context context) throws ExceptionBase {
                        emDS.saveRecord(emRecord);
                        return null;
                    }
                });
            }
        }
    }
    
    /**
     * update rm from rmpct and suspend date event.
     * 
     * @param rmpctRecord rmpctRecord
     */
    public static void updateRmFromRmpctAndSuspendDataEvent(final DataRecord rmpctRecord) {
        // suspend triggering events for RoomTransactionDataEventListener
        final SuspendDataEventsTemplate suspendDataEventsTemplate =
                new SuspendDataEventsTemplate(IDataEventListener.class);
        
        final DataSource rmDS = SpaceTransactionUtil.getRmDataSource();
        final String blId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.BL_ID);
        final String flId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.FL_ID);
        final String rmId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.RM_ID);
        final List<DataRecord> rmRecords =
                rmDS.getRecords(SpaceTransactionRestriction.getParsedRmpctRestrictionForLocation(
                    blId, flId, rmId));
        if (!rmRecords.isEmpty()) {
            final DataRecord rmRecord = rmRecords.get(0);
            rmRecord.setValue(
                SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.DV_ID,
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.DV_ID));
            rmRecord.setValue(
                SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.DP_ID,
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.DP_ID));
            rmRecord.setValue(
                SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_CAT,
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.RM_CAT));
            rmRecord.setValue(
                SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_TYPE,
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.RM_TYPE));
            rmRecord.setValue(
                SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.PRORATE,
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PRORATE));
            
            suspendDataEventsTemplate.doWithContext(new Callback() {
                public Object doWithContext(final Context context) throws ExceptionBase {
                    rmDS.saveRecord(rmRecord);
                    return null;
                }
            });
        }
    }
    
}
