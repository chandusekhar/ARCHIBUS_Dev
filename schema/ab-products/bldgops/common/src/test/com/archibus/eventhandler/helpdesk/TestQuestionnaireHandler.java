/**
 * 
 */
package com.archibus.eventhandler.helpdesk;

import java.text.ParseException;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * test QuestionnaireHandler
 * 
 */
public class TestQuestionnaireHandler extends DataSourceTestBase {
    
    /**
     * test method for getQuestions().
     * 
     * @throws ParseException
     */
    public void testGetQuestions() throws ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("questionnaire_id", "SERVICE DESK - COPY SERVICE");
        
        final QuestionnaireHandler handler = new QuestionnaireHandler();
        handler.getQuestions(context);
        
        assertNotNull(context.getResponse().get("jsonExpression"));
        
        final JSONObject result =
                new JSONObject((String) context.getResponse().get("jsonExpression"));
        
        assertEquals(true, ((Boolean) result.get("quest")).booleanValue());
        
        final JSONArray data = result.getJSONArray("data");
        assertEquals(2, data.length());
        final JSONObject json = data.getJSONObject(0);
        assertEquals("activity_log", json.getString("questionnaire.table_name"));
        assertEquals("act_quest", json.getString("questionnaire.field_name"));
    }
    
    /**
     * Test method for deleteQuestions()
     */
    public void testDeleteQuestions() {
        try {
            SqlUtils
                .executeUpdate(
                    "questionnaire",
                    "INSERT INTO questionnaire (questionnaire_id, table_name, field_name, title) VALUES ('test111', 'activity_log', 'act_quest', 'Test Quest')");
            SqlUtils
                .executeUpdate(
                    "questions",
                    "INSERT INTO questions (quest_text, questionnaire_id, activity_type, quest_name, freeform_width) VALUES ('Test?', 'test111', 'SERVICE DESK - COPY SERVICE', 'pompidom', 10)");
            
            final JSONArray records = new JSONArray();
            final JSONObject record = new JSONObject();
            record.put("questions.questionnaire_id", "test111");
            record.put("questions.quest_name", "pompidom");
            records.put(record);
            
            final QuestionnaireHandler handler = new QuestionnaireHandler();
            handler.deleteQuestions(records);
        } catch (final NullPointerException e) {
            fail("Exception:" + e);
        }
    }
    
    /**
     * Test method for
     * {@link com.archibus.eventhandler.helpdesk.QuestionnaireHandler#saveQuestion(com.archibus.jobmanager.EventHandlerContext)}
     * .
     */
    public void testSaveQuestion() {
        try {
            final QuestionnaireHandler handler = new QuestionnaireHandler();
            
            final JSONObject questionnaireRecord = new JSONObject();
            questionnaireRecord.put("questionnaire.questionnaire_id", "test1111");
            questionnaireRecord.put("questionnaire.table_name", "activity_log");
            questionnaireRecord.put("questionnaire.field_name", "act_quest");
            questionnaireRecord.put("questionnaire.title", "Test Quest");
            handler.saveQuestionnaire(questionnaireRecord);
            
            final JSONObject qustionRecord = new JSONObject();
            qustionRecord.put("questions.quest_text", "Test?");
            qustionRecord.put("questions.format_type", "Free");
            qustionRecord.put("questions.freeform_width", new Integer(10));
            qustionRecord.put("questions.activity_type", "SERVICE DESK - COPY SERVICE");
            qustionRecord.put("questions.questionnaire_id", "test1111");
            qustionRecord.put("questions.quest_name", "test");
            handler.saveQuestion(qustionRecord);
        } catch (final NullPointerException e) {
            fail("Exception:" + e);
        }
    }
    
}
