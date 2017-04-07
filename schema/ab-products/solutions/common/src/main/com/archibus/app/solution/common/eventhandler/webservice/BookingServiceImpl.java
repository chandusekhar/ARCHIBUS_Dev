package com.archibus.app.solution.common.eventhandler.webservice;

import java.util.*;

import javax.jws.WebService;
import javax.xml.rpc.ServiceException;

import com.archibus.config.UserSession;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.servlet.ServiceHelper;

/**
 * This is an example of WebService, exposed by WebCentral, using CXF framework. The service
 * delegates all calls to BookingServiceHandler WFR.
 * 
 * The bookingService-remote bean is defined in
 * /WEB-INF/config/context/remoting/examples/webservices-cxf/webservices.xml. The supporting
 * 
 * For instructions on how to demonstrate this example, see Online Help.
 * 
 * @author Valery Tydykov
 * @created November 29, 2006
 */
@WebService(
        endpointInterface = "com.archibus.app.solution.common.eventhandler.webservice.BookingService",
        serviceName = "BookingService")
public class BookingServiceImpl implements BookingService {
    private final static String WORKFLOW_RULE_NAME = "com.archibus.app.solution.common.eventhandler.webservice.BookingServiceHandler.handle";
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @exception ServiceException Description of the Exception
     */
    
    public String getRooms() {
        Map workflowRuleInputs = new HashMap();
        workflowRuleInputs.put("method", "getRooms");
        
        UserSession.Immutable userSession = ContextStore.get().getUserSession();
        // execute the specified rule
        EventHandlerContext workflowContext = ServiceHelper.runWorkflowRuleInContext(userSession,
            this.WORKFLOW_RULE_NAME, workflowRuleInputs);
        String rooms = (String) workflowContext.getParameter("rooms");
        
        return rooms;
    }
    
    /**
     * Adds a feature to the Booking attribute of the BookingServiceImpl object
     * 
     * @param aBooking The feature to be added to the Booking attribute
     */
    public void addBooking(Booking aBooking) {
        Map workflowRuleInputs = new HashMap();
        workflowRuleInputs.put("method", "addBooking");
        workflowRuleInputs.put("booking", aBooking);
        
        UserSession.Immutable userSession = ContextStore.get().getUserSession();
        // execute the specified rule
        ServiceHelper.runWorkflowRuleInContext(userSession, this.WORKFLOW_RULE_NAME,
            workflowRuleInputs);
    }
    
    /**
     * Description of the Method
     * 
     * @param aBookingId Description of the Parameter
     */
    public String deleteBooking(String aBookingId) {
        Map workflowRuleInputs = new HashMap();
        workflowRuleInputs.put("method", "deleteBooking");
        workflowRuleInputs.put("bookingId", aBookingId);
        
        UserSession.Immutable userSession = ContextStore.get().getUserSession();
        // execute the specified rule
        ServiceHelper.runWorkflowRuleInContext(userSession, this.WORKFLOW_RULE_NAME,
            workflowRuleInputs);
        return "Deleted Booking: " + aBookingId;
    }
    
    /**
     * Description of the Method
     * 
     * @param aBooking Description of the Parameter
     */
    public void editBooking(Booking aBooking) {
        Map workflowRuleInputs = new HashMap();
        workflowRuleInputs.put("method", "editBooking");
        workflowRuleInputs.put("booking", aBooking);
        
        UserSession.Immutable userSession = ContextStore.get().getUserSession();
        // execute the specified rule
        ServiceHelper.runWorkflowRuleInContext(userSession, this.WORKFLOW_RULE_NAME,
            workflowRuleInputs);
    }
    
    /**
     * Gets the bookings attribute of the BookingServiceImpl object
     * 
     * @param aRoomId Description of the Parameter
     * @param aStart Description of the Parameter
     * @param aEnd Description of the Parameter
     * @return The bookings value
     */
    public Booking[] getBookings(String aRoomId, Date aStart, Date aEnd) {
        Map workflowRuleInputs = new HashMap();
        workflowRuleInputs.put("method", "getBookings");
        workflowRuleInputs.put("roomId", aRoomId);
        workflowRuleInputs.put("start", aStart);
        workflowRuleInputs.put("end", aEnd);
        
        UserSession.Immutable userSession = ContextStore.get().getUserSession();
        // execute the specified rule
        EventHandlerContext workflowContext = ServiceHelper.runWorkflowRuleInContext(userSession,
            this.WORKFLOW_RULE_NAME, workflowRuleInputs);
        Booking[] bookings = (Booking[]) workflowContext.getParameter("bookings");
        
        return bookings;
    }
}
