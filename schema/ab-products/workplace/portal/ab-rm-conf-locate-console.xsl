<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-rm-conf-locate-console.xsl -->
<!-- XSLT for ab-highlt-rmxselected-console.xsl -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- importing constants.xsl which contains constant XSLT variables -->
  <!-- It is preferable to use a relative path here, in case the root location
      of the application changes.  -->
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
    
  <!-- activityGraphic holds the file name of our activity graphic -->
	<xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>
    <xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>

  <!-- specified XSLT variables for this XSLT file -->
  <!-- totalRowsForFilter indicates the number of restriction clauses.  -->
  <!-- There are 4 user restriction fields, and a hidden field to restrict to rm_type 'CONFERENCE' -->
	<xsl:variable name="totalRowsForFilter" select="4" />

	<!-- Get the absolute path to the graphics folder -->
	<xsl:variable name="abSchemaSystemGraphicsFolder"
	              select="//preferences/@abSchemaSystemGraphicsFolder" />
  <xsl:template match="/">
    <html>
      <title>
        <xsl:value-of select="/*/title" />
        <xsl:value-of select="$whiteSpace" />
      </title>
      <head>
		<xsl:call-template name="LinkingCSS" />
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
		<xsl:value-of select="$whiteSpace" />
		</script>

		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js">
		<xsl:value-of select="$whiteSpace" />
		</script>

		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js">
		<xsl:value-of select="$whiteSpace" />
		</script>

		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js">
		<xsl:value-of select="$whiteSpace" />
		</script>
		<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-conf-locate-console.js">
		<xsl:value-of select="$whiteSpace" />
		</script>
		<xsl:call-template name="SetUpLocales" />
      </head>
      <!-- Any initialization can be done in the body onLoad attribute. -->
      <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
        
        <xsl:call-template name="SetUpFieldsInformArray">
          <xsl:with-param name="fieldNodes" select="/*/afmTableGroup/dataSource/data/availableFields" />
        </xsl:call-template>
   
        <script language="javascript">
          iTotalRowsForFilter=<xsl:value-of select="$totalRowsForFilter"/>;
        </script>
        
    
        <table width="100%" valign="top" cellpadding="0">
          <tr><td>
           
              <table class="topTitleBarTable">
                <tr><td class="topTitleBarTableTitle">
                
                  <xsl:value-of select="/*/title" />
                  <xsl:value-of select="$whiteSpace" />
                </td></tr>
              </table>
          </td></tr>        
          <tr><td valign="top">
           
            <form name="{$afmInputsForm}">
              <table cellpadding="0">
                <tr><td>
                 
                  <img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/{$activityGraphic}">
                  <xsl:value-of select="$whiteSpace" /></img>
                </td>
                <td valign="top">
                  <!-- Call the AfmTableGroup template to output the form controls here.  -->
                  <xsl:call-template name="AfmTableGroup">
                    <xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
                  </xsl:call-template>
                </td></tr>  
              </table>
            
            </form>
          </td></tr>
        </table>
        <!-- calling common template common.xsl to add standard content used by the server
                for processing -->
        <xsl:call-template name="common">
          <xsl:with-param name="title" select="/*/title"/>
          <xsl:with-param name="debug" select="//@debug"/>
          <xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
          <xsl:with-param name="xml" select="$xml"/>
          <xsl:with-param name="afmInputsForm" select="$afmInputsForm"/>
        </xsl:call-template>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="AfmTableGroup">
    <xsl:param name="afmTableGroup"/>
      <table align="center">
       
        <tr><td colspan="2">
          <!-- the content of filter form -->
          <xsl:call-template name="afmFilterFormContent">
            <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
          </xsl:call-template>
        </td></tr>
        <tr>
          <!-- Help text -->
          <!--td class="instruction">
           
            <xsl:value-of select="//message[@name='instructionText']" />
          </td-->
        </tr>
      </table>
  </xsl:template>


  <xsl:template name="afmFilterFormContent">
    <xsl:param name="afmTableGroup"/>
    
    <!-- Get the node containing the parsed restrictions on this table group -->
    <xsl:variable name="restrictionNode"
      select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']"/>
    
    <!-- Get the node containing the actions that are allowed for this form -->
    <xsl:variable name="afmAction"
      select="$afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
    <table cellpadding="0">
     
      <tr class="legendTitle">
        <td colspan="3">
          <xsl:value-of select="$afmTableGroup/dataSource/data/availableFields/field[@name='bl_id']/@singleLineHeading" />:
        </td>
        <td>
          <xsl:value-of select="$whiteSpace" />
        </td>
        <td colspan="3">
          <xsl:value-of select="$afmTableGroup/dataSource/data/availableFields/field[@name='fl_id']/@singleLineHeading" />:
        </td>
        <td colspan="2">
          <xsl:value-of select="$whiteSpace" />
        </td>
        
      </tr>
      <tr><td>
       
    		<input type="hidden" name="operator1" value="LIKE"/>
    		<input type="hidden" name="conjunction1" value="AND"/>
    		<input type="hidden" name="field1" value="rm.bl_id"/>
    		<xsl:variable name="v_bl_id" select="translate($restrictionNode//field[concat(@table, '.', @name)='rm.bl_id']/ancestor::clause/@value,'%','')"/>
		
        <input class="inputField" id="values1" name="values1"
               type="text" value="{$v_bl_id}"
               onblur="validationInputs(1);validationAndConvertionDateAndTime(1)"/>
            
      </td>
      <td>
        
        <input class="AbActionButtonFormStdWidth" name="selectV1" type="button"
               title="{$afmAction/tip}" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",1); selectValueInputFieldID="values1";'/>
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td>
      <td>
       
    		<input type="hidden" name="operator2" value="LIKE"/>
    		<input type="hidden" name="conjunction2" value="AND"/>
    		<input type="hidden" name="field2" value="rm.fl_id"/>
		<xsl:variable name="v_fl_id" select="translate($restrictionNode//field[concat(@table, '.', @name)='rm.fl_id']/ancestor::clause/@value,'%','')"/>
		
        <input class="inputField" id="values2" name="values2"
               type="text" value="{$v_fl_id}"
               onblur="validationAndConvertionDateAndTime(2)"/>
      </td>
      <td>
        <input class="AbActionButtonFormStdWidth" name="selectV2" type="button"
               title="{$afmAction/tip}" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",2); selectValueInputFieldID="values2";'/>
      </td>
      </tr>
      <tr class="legendTitle">
        <td colspan="3">
          <xsl:value-of select="$afmTableGroup/dataSource/data/availableFields/field[@name='rm_id']/@singleLineHeading" />:
        </td>
        <td>
          <xsl:value-of select="$whiteSpace" />
        </td>
        <td colspan="3">
          <xsl:value-of select="$afmTableGroup/dataSource/data/availableFields/field[@name='name']/@singleLineHeading" />:
        </td>
        <td colspan="2">
          <xsl:value-of select="$whiteSpace" />
        </td>
      </tr>
      <tr><td>
    		<input type="hidden" name="operator3" value="LIKE"/>
    		<input type="hidden" name="conjunction3" value="AND"/>
    		<input type="hidden" name="field3" value="rm.rm_id"/>
		<xsl:variable name="v_rm_id" select="translate($restrictionNode//field[concat(@table, '.', @name)='rm.rm_id']/ancestor::clause/@value,'%','')"/>
		
        <input class="inputField" id="values3" name="values3"
               type="text" value="{$v_rm_id}"
               onblur="validationAndConvertionDateAndTime(3)"/>
      </td>
      <td>
        <input class="AbActionButtonFormStdWidth" name="selectV3" type="button"
               title="{$afmAction/tip}" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",3); selectValueInputFieldID="values3";'/>
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td>
      <td>
    		<input type="hidden" name="operator4" value="LIKE"/>
    		<input type="hidden" name="conjunction4" value="AND"/>
    		<input type="hidden" name="field4" value="rm.name"/>
		<xsl:variable name="v_rm_name" select="translate($restrictionNode//field[concat(@table, '.', @name)='rm.name']/ancestor::clause/@value,'%','')"/>
		
        <input class="inputField" id="values4" name="values4"
               type="text" value="{$v_rm_name}"
               onblur="validationAndConvertionDateAndTime(4)"/>
      </td>
      <td>
        <input class="AbActionButtonFormStdWidth" name="selectV4" type="button"
               title="{$afmAction/tip}" value="{$afmAction/title}"
               onclick='onSelectV_rm_name("{$afmAction/@serialized}",4); selectValueInputFieldID="values4";'/>
      </td>
			<xsl:variable name="ACTIONS" select="//afmTableGroup/afmAction"/>
			<xsl:for-each select="$ACTIONS">
				<td>
	        <xsl:value-of select="$whiteSpace" />
	      </td>
				<td>
	        <xsl:value-of select="$whiteSpace" />
	      </td>
				<td>
					<input class="AbActionButtonFormStdWidth" type="button"
						value="{title}" title="{tip}"
						onclick='sendingDataFromHiddenForm("","{@serialized}","_parent","{subFrame/@name}",true,"")'/>
				</td>
			</xsl:for-each>
    </tr></table>
  </xsl:template>

  <!-- include XSL files that contain templates used above -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/locale.xsl" />
  <xsl:include href="../../../ab-system/xsl/inputs-validation.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-actions-bar.xsl" />

</xsl:stylesheet>
