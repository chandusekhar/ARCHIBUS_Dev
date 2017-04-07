<?xml version="1.0" encoding="UTF-8"?>
<!-- Steven Meyer, Sergey Kuramshin -->
<!-- 2006-11-27 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


<xsl:template name="panel_grid_body">
	<xsl:param name="panel" />
	<xsl:param name="afmTableGroup" />

	<xsl:variable name="viewFile">
		<xsl:value-of select="//afmXmlView/target/key/@name"/>
	</xsl:variable>

	<xsl:variable name="sortColumnID">
		<xsl:choose>
			<xsl:when test="$afmTableGroup/dataSource/database/sort/order/field">
			    <xsl:value-of select="$afmTableGroup/dataSource/database/sort/order/field/@table" />
			    <xsl:text>.</xsl:text>
			    <xsl:value-of select="$afmTableGroup/dataSource/database/sort/order/field/@name" />
		        </xsl:when>
		        <xsl:otherwise>
				<xsl:text></xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="sortColumnOrder">
		<xsl:choose>
			<xsl:when test="$afmTableGroup/dataSource/database/sort/order/field/@ascending and $afmTableGroup/dataSource/database/sort/order/field/@ascending='false'">
				<xsl:text>-1</xsl:text>
		        </xsl:when>
		        <xsl:otherwise>
				<xsl:text>1</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="afmTableGroupIndex">
		<xsl:choose>
			<xsl:when test="$afmTableGroup/@index">
			    <xsl:value-of select="$afmTableGroup/@index" />
		        </xsl:when>
		        <xsl:otherwise>
				<xsl:text>0</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="gridStyle">
		<xsl:choose>
			<xsl:when test="$panel/@styleClass">
			    <xsl:value-of select="$panel/@styleClass" />
		        </xsl:when>
		        <xsl:otherwise>
				<xsl:text>panelReport</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>		
	<xsl:variable name="showOnLoad">
		<xsl:choose>
			<xsl:when test="$panel/@showOnLoad">
			    <xsl:value-of select="$panel/@showOnLoad" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>true</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>		
	<xsl:variable name="selectionEnabled">
		<xsl:choose>
			<xsl:when test="$panel/@selectionEnabled">
			    <xsl:value-of select="$panel/@selectionEnabled" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>false</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>		
	<xsl:variable name="multipleSelectionEnabled">
		<xsl:choose>
			<xsl:when test="$panel/@multipleSelectionEnabled">
			    <xsl:value-of select="$panel/@multipleSelectionEnabled" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>false</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>		
	<xsl:variable name="useParentRestriction">
		<xsl:choose>
			<xsl:when test="$panel/@useParentRestriction">
			    <xsl:value-of select="$panel/@useParentRestriction" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>true</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>		
	<xsl:variable name="panelHeight">
		<xsl:choose>
			<xsl:when test="$panel/@height">
			    <xsl:value-of select="$panel/@height" />
			</xsl:when>
		        <xsl:otherwise>
				<xsl:text></xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>		


	<xsl:choose>
		<xsl:when test="$panel/@controlType = 'reportGrid'">
			<xsl:call-template name="panel_reportGrid_body">
				<xsl:with-param name="panel" select="$panel"/>
				<xsl:with-param name="viewFile" select="$viewFile"/>
	 			<xsl:with-param name="afmTableGroupIndex" select="$afmTableGroupIndex"/>
				<xsl:with-param name="sortColumnID" select="$sortColumnID"/>
				<xsl:with-param name="sortColumnOrder" select="$sortColumnOrder"/>
	 			<xsl:with-param name="gridStyle" select="$gridStyle"/>
				<xsl:with-param name="showOnLoad" select="$showOnLoad"/>
	 			<xsl:with-param name="selectionEnabled" select="$selectionEnabled"/>
	 			<xsl:with-param name="multipleSelectionEnabled" select="$multipleSelectionEnabled"/>
	 			<xsl:with-param name="useParentRestriction" select="$useParentRestriction"/>
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise>
			<xsl:call-template name="panel_miniConsole_body">
				<xsl:with-param name="panel" select="$panel"/>
 				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="viewFile" select="$viewFile"/>
	 			<xsl:with-param name="afmTableGroupIndex" select="$afmTableGroupIndex"/>
				<xsl:with-param name="sortColumnID" select="$sortColumnID"/>
				<xsl:with-param name="sortColumnOrder" select="$sortColumnOrder"/>
	 			<xsl:with-param name="gridStyle" select="$gridStyle"/>
				<xsl:with-param name="showOnLoad" select="$showOnLoad"/>
	 			<xsl:with-param name="selectionEnabled" select="$selectionEnabled"/>
	 			<xsl:with-param name="multipleSelectionEnabled" select="$multipleSelectionEnabled"/>
	 			<xsl:with-param name="useParentRestriction" select="$useParentRestriction"/>
			</xsl:call-template>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>


<xsl:template name="panel_reportGrid_body">
    <xsl:param name="panel" />
    <xsl:param name="viewFile" />
    <xsl:param name="afmTableGroupIndex" />
    <xsl:param name="sortColumnID" />
    <xsl:param name="sortColumnOrder" />
    <xsl:param name="gridStyle" />
    <xsl:param name="showOnLoad" />
    <xsl:param name="selectionEnabled" />
    <xsl:param name="multipleSelectionEnabled" />
    <xsl:param name="useParentRestriction" />
    
	<table width="100%" cellpadding="0" cellspacing="0"><tr><td>
		<script language="javascript">
			system_form_onload_handlers.push(
			function() {
				var configObj = new AFM.view.ConfigObject();
				configObj['viewDef'] = '<xsl:value-of select="$viewFile"/>';
				configObj['groupIndex'] = <xsl:value-of select="$afmTableGroupIndex"/>;
				<xsl:choose>
				  <xsl:when test="$sortColumnID and $sortColumnID!=''">
				configObj['sortColumnID'] = '<xsl:value-of select="$sortColumnID"/>';
				  </xsl:when>
				</xsl:choose>
				configObj['cssClassName'] = '<xsl:value-of select="$gridStyle"/>';
				configObj['showOnLoad'] = <xsl:value-of select="$showOnLoad"/>;
				configObj['selectionEnabled'] = <xsl:value-of select="$selectionEnabled"/>;
				configObj['multipleSelectionEnabled'] = <xsl:value-of select="$multipleSelectionEnabled"/>;
				configObj['useParentRestriction'] = <xsl:value-of select="$useParentRestriction"/>;
				<xsl:choose>
				  <xsl:when test="$panel/@refreshWorkflowRuleId and $panel/@refreshWorkflowRuleId!=''">
				configObj['refreshWorkflowRuleId'] = '<xsl:value-of select="$panel/@refreshWorkflowRuleId"/>';
			          </xsl:when>
				</xsl:choose>
				<xsl:choose>
				  <xsl:when test="$sortColumnOrder and $sortColumnOrder=-1">
				configObj['sortAscending'] = <xsl:value-of select="$sortColumnOrder"/>;
			          </xsl:when>
				</xsl:choose>
				var control = new AFM.grid.ReportGrid('<xsl:value-of select="$panel/@id"/>', configObj);
			<xsl:call-template name="addActionCommands">
				<xsl:with-param name="panel" select="$panel"/>
				<xsl:with-param name="controlId" select="$panel/@id"/>
			</xsl:call-template>
			<xsl:choose>
				<xsl:when test="$panel/@height">
			control.panelHeight='<xsl:value-of select="$panel/@height"/>';
				</xsl:when>
			</xsl:choose>
				control.initialDataFetch();
			});
		</script>
		<div id="{$panel/@id}"></div>
	</td></tr></table>
</xsl:template>
	
	
	
<xsl:template name="panel_miniConsole_body">
    <xsl:param name="panel" />
    <xsl:param name="afmTableGroup" />
    <xsl:param name="viewFile" />
    <xsl:param name="afmTableGroupIndex" />
    <xsl:param name="sortColumnID" />
    <xsl:param name="sortColumnOrder" />
    <xsl:param name="gridStyle" />
    <xsl:param name="showOnLoad" />
    <xsl:param name="selectionEnabled" />
    <xsl:param name="multipleSelectionEnabled" />
    <xsl:param name="useParentRestriction" />
    <xsl:param name="panelHeight" />
    
    <xsl:variable name="indexColumnID">
	<xsl:choose>
		<xsl:when test="$afmTableGroup/dataSource/database/index/order/field">
			<xsl:value-of select="$afmTableGroup/dataSource/database/index/order/field/@table" />
			<xsl:text>.</xsl:text>
			<xsl:value-of select="$afmTableGroup/dataSource/database/index/order/field/@name" />
		</xsl:when>
		<xsl:otherwise>
			<xsl:text></xsl:text>
		</xsl:otherwise>
	</xsl:choose>
    </xsl:variable>
	<table width="100%" cellpadding="0" cellspacing="0"><tr><td>		
		<script language="javascript">
			system_form_onload_handlers.push(			
			function() {
				var configObj = new AFM.view.ConfigObject();
				configObj['viewDef'] = '<xsl:value-of select="$viewFile"/>';
				configObj['groupIndex'] = <xsl:value-of select="$afmTableGroupIndex"/>;
				<xsl:choose>
				  <xsl:when test="$sortColumnID and $sortColumnID!=''">
				configObj['sortColumnID'] = '<xsl:value-of select="$sortColumnID"/>';
				  </xsl:when>
				</xsl:choose>
				<xsl:choose>
				  <xsl:when test="$indexColumnID and $indexColumnID!=''">
				configObj['indexColumnID'] = '<xsl:value-of select="$indexColumnID"/>';
				  </xsl:when>
				</xsl:choose>			
				configObj['cssClassName'] = '<xsl:value-of select="$gridStyle"/>';
				configObj['showOnLoad'] = <xsl:value-of select="$showOnLoad"/>;
				configObj['selectionEnabled'] = <xsl:value-of select="$selectionEnabled"/>;
				configObj['multipleSelectionEnabled'] = <xsl:value-of select="$multipleSelectionEnabled"/>;
				configObj['useParentRestriction'] = <xsl:value-of select="$useParentRestriction"/>;
				<xsl:choose>
				  <xsl:when test="$panel/@refreshWorkflowRuleId and $panel/@refreshWorkflowRuleId!=''">
				configObj['refreshWorkflowRuleId'] = '<xsl:value-of select="$panel/@refreshWorkflowRuleId"/>';
			          </xsl:when>
				</xsl:choose>
				<xsl:choose>
				  <xsl:when test="$sortColumnOrder and $sortColumnOrder=-1">
				configObj['sortAscending'] = <xsl:value-of select="$sortColumnOrder"/>;
			          </xsl:when>
				</xsl:choose>
				var control = new AFM.grid.MiniConsole('<xsl:value-of select="$panel/@id"/>', configObj);
					
			<xsl:call-template name="addActionCommands">
				<xsl:with-param name="panel" select="$panel"/>
				<xsl:with-param name="controlId" select="$panel/@id"/>
			</xsl:call-template>
			<xsl:choose>
				<xsl:when test="$panel/@height">
			control.panelHeight='<xsl:value-of select="$panel/@height"/>';
				</xsl:when>
			</xsl:choose>
				control.initialDataFetch();
			});
		</script>
		<div id="{$panel/@id}"></div>
	</td></tr></table>	
</xsl:template>

</xsl:stylesheet>