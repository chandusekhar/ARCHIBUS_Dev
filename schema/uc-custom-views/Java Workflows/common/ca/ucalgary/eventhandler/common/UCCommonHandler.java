package ca.ucalgary.eventhandler.common;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.ViewHandlers;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

//import org.json.JSONObject;

public class UCCommonHandler extends EventHandlerBase {
	private final String fkMessage = "Another table has records that validate on this one. You must change the value of these dependent records before changing the value of the current record. See the server error for the dependent table name.";
	
    /**
     * Saves the data record using the default workflow, but with extra error
     * handling.
     * 
     * In Progress: New exception does not appear to override the old
     * message in web central.
     * 
     * @param context
     */
    public void customSaveDataRecord(EventHandlerContext context) {
    	try {
	        ViewHandlers viewHandlers = new ViewHandlers();
	        viewHandlers.saveDataRecord(context);
    	} catch (ExceptionBase ex) {
	        // do custom exception handling
    		String message = "Foreign Key Error";
    		if (!ex.getMessage().equals(fkMessage)) {
    			// throw ExceptionBase but nest the original exception inside
    			throw new ExceptionBase(null, message, ex);
    		}
    		else {
    			throw ex;
    		}
    	}
    }
}
