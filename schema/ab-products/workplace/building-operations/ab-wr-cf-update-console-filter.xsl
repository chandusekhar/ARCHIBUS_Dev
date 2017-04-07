<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle console filter form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- vvvvv custom to include the full path -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
  
	<xsl:variable name="totalRowsForFilter" select="1" />

	<!-- Get the absolute path to the graphics folder -->
	<xsl:variable name="abSchemaSystemGraphicsFolder" select="//preferences/@abSchemaSystemGraphicsFolder" />

  <xsl:template match="/">
    <html>
      <title>
        <xsl:value-of select="/*/title" />
        <xsl:value-of select="$whiteSpace" />
      </title>
      <head>
        <!-- LinkingCSS in common.xsl includes the default style sheets -->
        <xsl:call-template name="LinkingCSS" />
        <!-- afmJavascript includes necessary javascript files -->
        <xsl:call-template name="afmJavascript" />
        <!-- template: SetUpLocales is in locale.xsl -->
        <xsl:call-template name="SetUpLocales" />
      </head>
      <!-- Any initialization can be done in the body onLoad attribute. -->
      <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
        
        <!--  SetUpFieldsInformArray in inputs-validation.xsl creates the field
              information array that is used by the javascript form event handlers. -->
        <xsl:call-template name="SetUpFieldsInformArray">
          <xsl:with-param name="fieldNodes"
                          select="/*/afmTableGroup/dataSource/data/availableFields" />
        </xsl:call-template>
        
        <!-- This section changes the iTotalRowsForFilter value (used in ab-common-fitler.js)
              with the number defined in totalRowsForFilter above.   -->
        <script language="javascript">
          iTotalRowsForFilter=<xsl:value-of select="$totalRowsForFilter"/>;
        </script>
        <table width="100%" valign="top">
          <tr><td>
              <!-- Use standard table and field classes to control formatting -->
              <table class="topTitleBarTable">
                <tr><td class="topTitleBarTableTitle">
                  <!-- Add the title of this view header -->
                  <xsl:value-of select="/*/title" />
                  <xsl:value-of select="$whiteSpace" />
                </td></tr>
              </table>
          </td></tr>        
          <tr><td valign="top">
            <!-- begin the filter form.  afmInputsForm is defined in constants.xsl -->
            <form name="{$afmInputsForm}">
              <table>
                <tr><td>
                  <xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
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

  <xsl:template name="afmJavascript">
    <!-- common.js - Common variables and functions -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- locale.js - Functions for localized formatting of currency and numbers -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- date-time.js - Functions for localized formatting of dates and times -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- inputs-validation.js - Functions for formatting and validating user input in forms -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- ab-common-filter.js - Event handling functions for restriction filter forms -->
    <!-- vvvvv Changed to go to a slightly customized js file to issue an SQL Restriction -->
    <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-cf-update-filter.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
  </xsl:template>

  <xsl:template name="AfmTableGroup">
    <xsl:param name="afmTableGroup"/>
      <table align="center">
 
        <tr class="legendTitle">
          <td>
            <xsl:value-of select="/*/afmTableGroup/title" />
          </td>
        </tr>
        <tr><td>
          <xsl:call-template name="afmFilterFormContent">
            <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
          </xsl:call-template>
        </td></tr>
        <tr>
          <!-- Help text -->
          <td class="instruction">
            <xsl:value-of select="//message[@name='instructionText']" />
          </td>
        </tr>
      </table>
  </xsl:template>
  <xsl:template name="afmFilterFormContent">
    <xsl:param name="afmTableGroup"/>
    
    <!-- Get the node containing the parsed restrictions on this table group -->
    <xsl:variable name="clauseNode"
      select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause[position()=1]"/>
    
    <!-- Get the node containing the actions that are allowed for this form -->
    <xsl:variable name="afmAction"
      select="$afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
    <table><tr>
      <td>
    		<input type="hidden" name="operator1" value="{$restOp}"/>
    		<input type="hidden" name="conjunction1" value="{$restConj}"/>
    		<input type="hidden" name="field1" value="{$restField}"/>
		<xsl:variable name="clauseNode_value">
			<xsl:choose>
				<xsl:when test="$clauseNode/@op='LIKE'">
					<!--???????????? remove % : if original value has %?????????-->
					<xsl:value-of select="translate($clauseNode/@value,'%','')"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$clauseNode/@value"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
        <input class="inputField" id="values1" name="values1"
               type="text" value="{$clauseNode_value}"
               onblur="validationInputs(1);validationAndConvertionDateAndTime(1)" onkeypress="return disableInputEnterKeyEvent( event)"/>
      </td>
      <td>
        <input class="AbActionButtonFormStdWidth" name="selectV1" type="button"
               title="{$afmAction/tip}" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",1); selectValueInputFieldID="values1";'/>
      </td>
      <td>
        <table><tr>
          <xsl:variable name="ACTIONS" select="//afmTableGroup/afmAction"/>
        	<xsl:for-each select="$ACTIONS">
        		<td>
        		  <input class="AbActionButtonFormStdWidth" type="button"
        		         value="{title}" title="{tip}"
        		         onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",true,"")'/>
        		</td>
        	</xsl:for-each>
        </tr></table>
      </td>
    </tr></table>
  </xsl:template>


  <!-- include XSL files that contain templates used above -->
  <!-- vvvvv Custom to include full path -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/locale.xsl" />
  <xsl:include href="../../../ab-system/xsl/inputs-validation.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-actions-bar.xsl" />
</xsl:stylesheet>
