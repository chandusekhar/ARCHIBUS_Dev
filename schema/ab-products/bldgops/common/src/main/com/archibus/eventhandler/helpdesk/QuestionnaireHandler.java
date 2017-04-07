package com.archibus.eventhandler.helpdesk;


import java.text.ParseException;
import java.util.*;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.StringUtil;

/**
 * 
 * Handles workflow rules concerning questionnaires
 *
 */


public class QuestionnaireHandler extends HelpdeskEventHandlerBase  {
	
    /**
     * Return question answers
     * @param context
     * @param tableName
     * @param pkeyField
     * @param questField
     * @param pkeyValue
     * @return
     */
	public List<Map<String,Object>> getQuestionnaireAnswers(EventHandlerContext context, String tableName,String pkeyField,String questField, int pkeyValue){
		Map<String,Object> questAnswers = getAnswers(context, tableName, pkeyField, questField, pkeyValue);
		String quest_id = (String) questAnswers.get("QuestId"); 
		List<Map<String,Object>> questions = new ArrayList<Map<String,Object>>();
		
		String[] fields = {"format_type","quest_name","quest_text","enum_list","sort_order"};
		List records = selectDbRecords(context, "questions", fields, "questionnaire_id = " + literal(context,quest_id));
			
		for(Iterator it = records.iterator();it.hasNext();){
			Object[] record = (Object []) it.next();
			String questName = notNull(record[1]);
			if(questAnswers.get(questName) != null){
				Map<String,Object> question = new HashMap<String,Object>();
				question.put("quest_name", questName);
				question.put("quest_text", notNull(record[2]));
				question.put("sort_order", record[4]);
				String formatType = notNull(record[0]);	
				if(formatType.equals("Enum")){
					String value = (String) questAnswers.get(questName);
					
					String enumList = notNull(record[3]);
					if(enumList.indexOf(value+";") >= 0 ){
						String[] tmp = enumList.split(";");
						for(int i=0;i<tmp.length;i++){
							if(value.equals(tmp[i])){
								question.put("answer", tmp[i+1]);
								break;
							}
						}
					} else {
						question.put("answer", value);	
					}						
				} else {
					question.put("answer", questAnswers.get(questName));
				}
				questions.add(question);
			}
		}
			
		//sort records on sort_order
		Collections.sort(questions,new Comparator<Map<String,Object>>() {
		    public int compare(Map<String,Object> o1, Map<String,Object> o2) {
		        return ((Integer) o1.get("sort_order")).intValue()  - ((Integer) o2.get("sort_order")).intValue();
		    }});
		
		return questions;
	}
	
	/**
	 * Return answer map
	 * @param context
	 * @param tableName
	 * @param pkeyField
	 * @param questField
	 * @param pkeyValue
	 * @return
	 */
	public Map<String,Object> getAnswers(EventHandlerContext context, String tableName,String pkeyField,String questField, int pkeyValue){
		Object answers = selectDbValue(context,tableName,questField,pkeyField+"="+pkeyValue);
		if(StringUtil.notNullOrEmpty(answers)){
			try {
				String answersXml = ((String) answers).replace("''","\"");
				
				Document doc= DocumentHelper.parseText((String) answersXml);
				String quest_id = doc.getRootElement().attribute("questionnaire_id").getText();
				if(quest_id == null){
					throw new ExceptionBase("error parsing questionnaire for record " + tableName + " " + pkeyValue);
				} 
				Element root = doc.getRootElement();
				
				Map<String,Object> questAnswers = new HashMap<String,Object>();
				questAnswers.put("QuestId", quest_id);
				for(Iterator docIt = root.elementIterator("question");docIt.hasNext();){
					Element element = (Element) docIt.next();
					questAnswers.put(element.attribute("quest_name").getText(),element.attribute("value").getText());
				}
				return questAnswers;
			} catch (DocumentException e) {
				e.printStackTrace();
			}
		}
		return null;	
	}
	
	/**
     * save answer to database
     * 
     * @param context
     * @param tableName
     * @param pkeyField
     * @param questField act_quest
     * @param pkeyValue activity_log_id
     * 
     * @param questName
     * @param answer
     * @return
     */
    public void saveAnswer(String tableName, String pkeyField, String questField, int pkeyValue,
            String questName, String answer) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Object answers = selectDbValue(context, tableName, questField, pkeyField + "=" + pkeyValue);
        
        if (StringUtil.notNullOrEmpty(answers)) {
            try {
                String answersXml = ((String) answers).replace("''", "\"");
                
                Document doc = DocumentHelper.parseText(answersXml);
                String quest_id = doc.getRootElement().attribute("questionnaire_id").getText();
                if (quest_id == null) {
                    throw new ExceptionBase("error parsing questionnaire for record " + tableName
                            + " " + pkeyValue);
                }
                
                Element root = doc.getRootElement();
                for (Iterator docIt = root.elementIterator("question"); docIt.hasNext();) {
                    Element element = (Element) docIt.next();
                    if (element.attribute("quest_name").getText().equals(questName)) {
                        element.attribute("value").setText(answer);
                        break;
                    }
                }
                answersXml = root.asXML();
                
                // save answer to database
                Map<String, Object> values = new HashMap<String, Object>();
                values.put(questField, answersXml);
                values.put(pkeyField, new Integer(pkeyValue));
                executeDbSave(context, tableName, values);
                
            } catch (DocumentException e) {
                e.printStackTrace();
            }
        }
    }
	
	/**
	 * 
	 * Get questions and answers for a given questionnaire.
	 * <p>
	 * <b>Inputs:</b> 
	 *	<ul>
	 * 		<li>questionnaire_id : questionnaire id</li>
	 *	</ul>
	 * </p>
	 * <p>
	 * <b>Outputs:</b>
	 * 	<ul>
	 * 		<li>jsonExpression : JSONObject with boolean quest (questionnaire found or not) and JSONArray data (if quest = true)
	 * 		with JSONObjects for all questions in the questionnaire<br />
	 * 		<code>{quest : <i>true/false</i>, data : [{questionnaire.table_name : ?, questionnaire.field_name : ?, questions.format_type : ?, questions.quest_name : ?,
	 * 		questions.questionnaire_id : ?, questions.activity_type : ?, questions.action_response : ?, questions.quest_text: ?, questions.enum_list: ?, questions.freeform_width: ?,
	 * 		questions.lookup_table: ?, questions.lookup_field: ? }]}</code></li>
	 * 	</ul>
	 * </p>
	 * <p>
	 * <b>Pseudo-code:</b>
	 * <ol>
	 * 		<li>Get questionnaire id from context</li>
	 * 		<li>Check if questionnaire exists</li>
	 * 		<li>If questionnaire exists, select all its questions from the database</li>
	 * 		<li>Create and return jsonExpression</li>
	 * </ol>
	 * </p>
	 * @param context Workflow rule execution context
	 * @throws ParseException 
	 */
	public void getQuestions(EventHandlerContext context) throws ParseException{
		String quest_id = context.getString("questionnaire_id");
		
		JSONObject result = new JSONObject();

		Object[] questionnaire = selectDbValues(context, "questionnaire", new String[]{"table_name","field_name"}, "questionnaire_id = " + literal(context,quest_id));
		if(questionnaire == null) {
			result.put("quest", false);
			context.addResponseParameter("jsonExpression", result.toString());
			return;
		}
		JSONArray data = new JSONArray();
		String table = notNull(questionnaire[0]);
		String field = notNull(questionnaire[1]);
		
		String[] fields = {"format_type","quest_name","questionnaire_id","activity_type","action_response","quest_text","enum_list","freeform_width","lookup_table","lookup_field"};
		List records = selectDbRecords(context, "questions", fields, "questionnaire_id = " + literal(context,quest_id));
		if(! (records == null || records.isEmpty())){
			for(Iterator it = records.iterator();it.hasNext();){
				Object[] record = (Object[]) it.next();
				JSONObject json = new JSONObject();
				json.put("questionnaire.table_name", table);
				json.put("questionnaire.field_name", field);
				for(int i = 0;i<fields.length;i++){
					json.put("questions."+fields[i], record[i]);
				}
				data.put(json);
			}
		}
		result.put("quest", true);
		result.put("data", data);
		context.addResponseParameter("jsonExpression", result.toString());
		
	}
	
	/**
	 * 
	 * Delete questions from a questionnaire.
	 * 
	 * <p>
	 * <b>Inputs:</b> 
	 * 		<ul>
	 * 			<li>records : JSONArray with JSONObjects for records to delete</li>
	 * 		</ul>
	 * </p>
	 * <p>
	 * <b>Pseudo-code:</b>
	 * <ol>
	 * 		<li>Get context object</li>
	 * 		<li>Convert each JSONObject (record) to a map</li>
	 * 		<li>Delete record from database</li> 
	 * </ol>
	 * </p>
	 * @param JSONArray records
	 */
	public void deleteQuestions(JSONArray records){	
	    //fix KB3031078 - Update Help Desk WFRs to use DataSource API instead of executeDbDelete(Guo 2011/4/18)
	    //EventHandlerContext context = ContextStore.get().getEventHandlerContext();
	    //JSONArray records = context.getJSONArray("records");
	    DataSource dataSource = null; 
	    if(records.length() > 0){
	        dataSource =  DataRecord.createDataSourceForRecord(records.getJSONObject(0));
            dataSource.addTable("questions");
	    	for(int i=0;i<records.length();i++){
				JSONObject record = records.getJSONObject(i);
				Map values = fromJSONObject(record);
                dataSource.deleteRecord(values);
				//values = stripPrefix(values);
                //executeDbDelete(context, "questions", values);
                //executeDbCommit(context);
            }
        }
	}
	
	/**
	 * 
	 * Save question.
	 * 
	 * <p>
	 * <b>Inputs:</b> 
	 * 		<ul>
	 * 			<li>record : JSONObject which includes the form values submitted</li>
	 * 		</ul>
	 * </p>
	 * <p>
	 * <b>Pseudo-code:</b>
	 * <ol>
	 * 		<li>Get context object</li>
	 *      <li>Convert the from values to map type from JSON</li>
	 * 		<li>Save record in <code>questions</code> table</li>
	 * </ol>
	 * </p>
	 * @param JSONArray record
	 */
	public void saveQuestion(JSONObject record){
	    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
		Map fieldValues = parseJSONObject(context, record);
		Map values = stripPrefix(fieldValues);
		
		executeDbSave(context, "questions",values);
		//executeDbCommit(context);
	}
	
	/**
	 * Save (Create or update) questionnaire.
	 * 
	 * <p>
	 * <b>Inputs:</b> 
	 * 		<ul>
	 * 			<li>record : JSONObject which includes the form values submitted</li>
	 * 		</ul>
	 * </p>
	 * <p>
	 * <b>Pseudo-code:</b>
	 * <ol>
	 * 		<li>Get context object</li>
	 *      <li>Convert the from values submitted to a map from JSONObject </li>
	 * 		<li>Save record in <code>questionnaire</code> table</li>
	 * </ol>
	 * </p>
	 * @param JSONObject record
	 */
	public void saveQuestionnaire(JSONObject record){
	    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
		Map fieldValues = parseJSONObject(context, record);
		Map values = stripPrefix(fieldValues);
		
		executeDbSave(context, "questionnaire",values);
		//executeDbCommit(context);
	}	  	  
	  
}
	  