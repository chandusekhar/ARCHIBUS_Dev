package com.archibus.service.space.future;

import java.text.SimpleDateFormat;
import java.util.*;

import junit.framework.Assert;

import com.archibus.datasource.*;
import com.archibus.service.space.AssignmentObject;
import com.archibus.utility.DateTime;

/**
 * JUnit test class.
 * 
 * @author Guo Jiangtao
 * 
 */
public class SpaceFutureTransactionDataChangeEventProcessTest extends DataSourceTestBase {
    
    /**
     * test method for method detectIfExistFutureTransForRoomAttributeChange().
     * 
     */
    @SuppressWarnings("PMD")
    public void testDetectIfExistFutureTransForRoomAttributeChange() {
        
        // prepare the data - test case that exists future transaction for the given room
        
        // CHECKSTYLE:OFF Justification: Suppress "Multiple String Literals"
        // Preferable to avoid further complicating sql statement with variables
        // for repeated phrases.
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where bl_id='HQ' AND fl_id='17' AND rm_id='101'");
        
        SqlUtils.executeUpdate(
            "rmpct",
            "insert into rmpct(bl_id,fl_id,rm_id,date_start) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(DateTime.addDays(
                        new Date(), 1)) + "')");
        
        // call method detectIfExistFutureTransForRoomAttributeChange
        boolean result =
                SpaceFutureTransactionDataChangeEventProcess
                    .detectIfExistFutureTransForRoomAttributeChange("HQ", "17", "101", new Date());
        
        // assert the result, it should be true
        Assert.assertEquals(true, result);
        
        // prepare the data - test case that not exists future transaction for the given room
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where bl_id='HQ' AND fl_id='17' AND rm_id='101'");
        SqlUtils.executeUpdate("rmpct",
            "insert into rmpct(bl_id,fl_id,rm_id,date_start) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(new Date()) + "')");
        
        // CHECKSTYLE:ON
        
        // call method detectIfExistFutureTransForRoomAttributeChange
        result =
                SpaceFutureTransactionDataChangeEventProcess
                    .detectIfExistFutureTransForRoomAttributeChange("HQ", "17", "101", new Date());
        
        // assert the result, it should be false
        Assert.assertEquals(false, result);
        
    }
    
    /**
     * test method for method detectIfExistFutureTransForRoomDelete().
     * 
     */
    @SuppressWarnings("PMD")
    public void testGetFutureTransForRoomDelete() {
        
        // prepare the data - test case that exists future transaction for the given room
        
        // CHECKSTYLE:OFF Justification: Suppress "Multiple String Literals"
        // Preferable to avoid further complicating sql statement with variables
        // for repeated phrases.
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where bl_id='HQ' AND fl_id='17' AND rm_id='101'");
        
        SqlUtils.executeUpdate(
            "rmpct",
            "insert into rmpct(bl_id,fl_id,rm_id,date_start,activity_log_id) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(DateTime.addDays(
                        new Date(), 1)) + "', 1)");
        
        // call method detectIfExistFutureTransForRoomAttributeChange
        List<AssignmentObject> rmpcts =
                SpaceFutureTransactionDataChangeEventProcess.getFutureTransForRoomDelete("HQ",
                    "17", "101", new Date());
        
        // assert the future transaction list size, it should be 1
        Assert.assertEquals(1, rmpcts.size());
        
        // prepare the data - test case that not exists future transaction for the given room
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where bl_id='HQ' AND fl_id='17' AND rm_id='101'");
        SqlUtils.executeUpdate(
            "rmpct",
            "insert into rmpct(bl_id,fl_id,rm_id,date_start,activity_log_id) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(DateTime.addDays(
                        new Date(), 1)) + "', null)");
        
        // CHECKSTYLE:ON
        
        // call method detectIfExistFutureTransForRoomAttributeChange
        rmpcts =
                SpaceFutureTransactionDataChangeEventProcess.getFutureTransForRoomDelete("HQ",
                    "17", "101", new Date());
        
        // assert the future transaction list size, it should be 0
        Assert.assertEquals(0, rmpcts.size());
        
    }
    
    /**
     * test method for method detectIfExistFutureTransForEmployeeLocationChange().
     * 
     */
    @SuppressWarnings("PMD")
    public void testDetectIfExistFutureTransForEmployeeLocationChange() {
        
        // prepare the data - test case that exists future transaction for the given employee
        
        // CHECKSTYLE:OFF Justification: Suppress "Multiple String Literals"
        // Preferable to avoid further complicating sql statement with variables
        // for repeated phrases.
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where from_bl_id='HQ' and from_fl_id ='17' AND from_rm_id='101'");
        
        SqlUtils.executeUpdate(
            "rmpct",
            "insert into rmpct(from_bl_id,from_fl_id,from_rm_id,date_start,em_id) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(DateTime.addDays(
                        new Date(), 1)) + "', 'AI')");
        
        // call method detectIfExistFutureTransForEmployeeLocationChange
        boolean result =
                SpaceFutureTransactionDataChangeEventProcess
                    .detectIfExistFutureTransForEmployeeLocationChange("AI", "HQ", "17", "101",
                        new Date());
        
        // assert the detect result, it should be true
        Assert.assertEquals(true, result);
        
        // prepare the data - test case that not exists future transaction for the given employee
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where from_bl_id='HQ' and from_fl_id ='17' AND from_rm_id='101'");
        SqlUtils.executeUpdate("rmpct",
            "insert into rmpct(from_bl_id,from_fl_id,from_rm_id,date_start,em_id) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(new Date())
                    + "', 'AI')");
        
        // CHECKSTYLE:ON
        
        // call method detectIfExistFutureTransForEmployeeLocationChange
        result =
                SpaceFutureTransactionDataChangeEventProcess
                    .detectIfExistFutureTransForEmployeeLocationChange("AI", "HQ", "17", "101",
                        new Date());
        
        // assert the detect result, it should be false
        Assert.assertEquals(false, result);
        
    }
    
    /**
     * test method for method getFutureTransForEmployeeDelete().
     * 
     */
    @SuppressWarnings("PMD")
    public void testGetFutureTransForEmployeeDelete() {
        // CHECKSTYLE:OFF Justification: It is a test method
        // prepare the data
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where bl_id='HQ' AND fl_id='17' AND rm_id='101'");
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where from_bl_id='HQ' AND from_fl_id='17' AND from_rm_id='101'");
        SqlUtils.executeUpdate("rmpct", "delete from rmpct where em_id='AI'");
        SqlUtils.executeUpdate(
            "rmpct",
            "insert into rmpct(bl_id,fl_id,rm_id,date_start,em_id,activity_log_id) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(DateTime.addDays(
                        new Date(), 1)) + "', 'AI',1)");
        
        // call method detectIfExistFutureTransForRoomAttributeChange
        List<AssignmentObject> rmpcts =
                SpaceFutureTransactionDataChangeEventProcess.getFutureTransForEmployeeDelete("AI");
        // assert the future transaction list size, it should be 1
        Assert.assertEquals(1, rmpcts.size());
        
        SqlUtils.executeUpdate("rmpct",
            "delete from rmpct where bl_id='HQ' AND fl_id='17' AND rm_id='101'");
        SqlUtils.executeUpdate(
            "rmpct",
            "insert into rmpct(bl_id,fl_id,rm_id,date_start,em_id,activity_log_id) values('HQ','17','101','"
                    + new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH).format(DateTime.addDays(
                        new Date(), 1)) + "', 'AI',null)");
        
        rmpcts = SpaceFutureTransactionDataChangeEventProcess.getFutureTransForEmployeeDelete("AI");
        
        // assert the future transaction list size, it should be 0
        Assert.assertEquals(0, rmpcts.size());
        
        // CHECKSTYLE:ON
    }
    
}
