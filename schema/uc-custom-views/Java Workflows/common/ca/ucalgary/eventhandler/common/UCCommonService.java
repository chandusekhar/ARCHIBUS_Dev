package ca.ucalgary.eventhandler.common;import java.util.ArrayList;import java.util.HashMap;import java.util.Iterator;import java.util.List;import java.util.Map;import java.util.Vector;import org.json.JSONObject;import com.archibus.context.ContextStore;import com.archibus.eventhandler.EventHandlerBase;import com.archibus.jobmanager.EventHandlerContext;import com.archibus.utility.ExceptionBase;public class UCCommonService extends EventHandlerBase{	public void renameProject(String oldProjectName,String newProjectName) {       EventHandlerContext context = ContextStore.get().getEventHandlerContext(); 	   		String sqlRenameProject = "exec uc_sp_renameproject "+literal(context,oldProjectName)+", "+literal(context,newProjectName);		        Vector commands = new Vector();        commands.add(sqlRenameProject);        executeDbSqlCommands(context, commands, false);        executeDbCommit(context);	}}	