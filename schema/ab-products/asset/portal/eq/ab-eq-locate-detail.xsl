<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<xsl:variable name="selected_room" select="//afmTableGroup/dataSource/data/records/record/@rm.rm_id"/>
	<xsl:variable name="selected_floor" select="//afmTableGroup/dataSource/data/records/record/@rm.fl_id"/>
	<xsl:variable name="selected_building" select="//afmTableGroup/dataSource/data/records/record/@rm.bl_id"/>
	<xsl:variable name="expand" translatable="true">Expand</xsl:variable>
	<xsl:variable name="default" translatable="true">Default</xsl:variable>
	<xsl:variable name="selected" translatable="true">Selected</xsl:variable>
				
	<!-- top template  -->
	<xsl:template match="/">
		<html>
		<title>
			<!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
			<!-- to generate <title /> if there is no title in source XML -->
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-edit-report.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/reports.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-eq-locate-detail.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0">
			<!--xsl:choose-->
				<script language="javascript">
					var selected_building='<xsl:value-of select="$selected_building"/>';
					var selected_floor='<xsl:value-of select="$selected_floor"/>';
					var selected_room='<xsl:value-of select="$selected_room"/>';
				</script>

				<table class="showingTgrpTitleTable">
					<tr>
						<td align="left" rowspan="2">
							<span translatable="true">Add</span>
						</td>
						<!--td align="center">
							<xsl:variable name="employee" select="//message[@name='employee']"/>
							<input class="AbActionButtonFormStdWidth" type="button" name="employee" value="{$employee}" onclick='addTCAsset("em")'/>
						</td-->
						<td align="center">
							<xsl:variable name="equipment" select="//message[@name='equipment']"/>
							<input class="AbActionButtonFormStdWidth" type="button" name="equipment" value="{$equipment}" onclick='addTCAsset("eq")'/>
						</td>
						<td align="center">
							<xsl:variable name="faceplates" select="//message[@name='faceplates']"/>
							<input class="AbActionButtonFormStdWidth" type="button" name="faceplates" value="{$faceplates}" onclick='addTCAsset("fp")'/>
						</td>
					<!--/tr>
					<tr-->
						<td align="center">
							<xsl:variable name="jacks" select="//message[@name='jacks']"/>
							<input class="AbActionButtonFormStdWidth" type="button" name="jacks" value="{$jacks}" onclick='addTCAsset("jk")'/>
						</td>
						<td align="center">
							<xsl:variable name="punch_blocks" select="//message[@name='punch_blocks']"/>
							<input class="AbActionButtonFormStdWidth" type="button" name="punchblocks" value="{$punch_blocks}" onclick='addTCAsset("pb")'/>
						</td>
						<td align="center">
							<xsl:variable name="patch_panels" select="//message[@name='patch_panels']"/>
							<input class="AbActionButtonFormStdWidth" type="button" name="panels" value="{$patch_panels}" onclick='addTCAsset("pn")'/>
						</td>
                                                <xsl:variable name="renderSerialized" select="//afmAction[@type='render']/@serialized"/>
                                                <input name="documentManagerTargetRefresh" id="documentManagerTargetRefresh" type="hidden" value="{$renderSerialized}"/>
					</tr>
				</table>

				<table align="center" width="100%" valign="top">
					<tr valign="top">
						<td id="instruction" class="instruction" align="center" valign="top">
							<span translatable="true">Selected Room: </span><xsl:value-of select="concat(' ',$selected_building,'-',$selected_floor,'-',$selected_room)"/>
						</td>
					</tr>
				</table>

				<table  width="100%" valign="top">
					<!-- main section: going through all afmTableGroups to process their data -->
					<!-- don't use <xsl:for-each select="//afmTableGroup"> ("//" should never be used in <xsl:for-each>)-->
					<xsl:for-each select="/*/afmTableGroup">
						<xsl:call-template name="AfmTableGroups">
							<xsl:with-param name="afmTableGroup" select="."/>
							<xsl:with-param name="margin-left" select="0"/>
							<xsl:with-param name="level" select="1"/>
						</xsl:call-template>
					</xsl:for-each>
				</table>
			<!--/xsl:choose-->
			<!-- calling template common which is in common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>

	<!-- template (AfmTableGroups) used in xslt -->
	<xsl:template name="AfmTableGroups">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
		<!-- checking if there is any afmTableGroup node in xml -->
		<xsl:if test="count($afmTableGroup) &gt; 0">
			<tr valign="top"><td valign="top">
				<!-- using a variable to hold the format of afmTableGroup: form or report (?? changable ??)-->
				<xsl:variable name="format" select="'table'"/>
				<!-- calling template Report which is in reports/reports.xsl -->
				<xsl:call-template name="Report">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup[1]"/>
					<xsl:with-param name="margin-left" select="$margin-left"/>
					<xsl:with-param name="level" select="$level"/>
					<xsl:with-param name="format" select="$format"/>
				</xsl:call-template>
			</td></tr>

			<!-- recursive processing AfmTableGroups in child level -->
			<!--xsl:for-each select="$afmTableGroup/afmTableGroup">
				<xsl:call-template name="AfmTableGroups">
					<xsl:with-param name="afmTableGroup" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+1"/>
					<xsl:with-param name="level" select="$level+1"/>
				</xsl:call-template>
			</xsl:for-each-->
		</xsl:if>
	</xsl:template>

	<xsl:template name="Report">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
		<xsl:param name="format"/>

		<!-- variable holding the format of processing afmTableGroup: table or column -->
		<!--xsl:variable name="format" select="$afmTableGroup/@format"/-->
		<xsl:choose>
			<!-- handling the afmTableGroup for server-side error messages -->
			<xsl:when test="$afmTableGroup/@separateWindow='true'">
				<xsl:call-template name="ErrorMessage">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				</xsl:call-template>
			</xsl:when>
			<!-- handling normal afmTableGroups for data report -->
			<xsl:otherwise>
				<xsl:choose>
					<!-- showing the data in table -->
					<xsl:when test="$format='table'">
						<xsl:call-template name="ReportTableFormat">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="margin-left" select="$margin-left"/>
							<xsl:with-param name="level" select="$level"/>
						</xsl:call-template>
					</xsl:when>
					<!-- showing the data in column -->
					<!--xsl:when test="$format='column'">
						<xsl:call-template name="ReportColumnFormat">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="margin-left" select="$margin-left"/>
							<xsl:with-param name="level" select="$level"/>
						</xsl:call-template>
					</xsl:when-->
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="ReportTableFormat">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>

		<!-- setting up variables which will be used in xsl -->
		<xsl:variable name="tableWidth" select="$afmTableGroup/@tableWidth"/>
		<xsl:variable name="printable" select="$afmTableGroup/afmReportParameters/@printable"/>
		<xsl:variable name="showGrid" select="$afmTableGroup/@showGrid"/>
		<xsl:variable name="afmTableGroupID" select="generate-id()"/>
		<!-- setting up report table's margin-left according to the value of  margin-left.
			     style's real margin-left will be 30 times of the value of variable margin-left
		-->
                <script language="javascript">
                  var selected_formname='<xsl:value-of select="$afmTableGroupID"/>';
		</script>

		<div style='margin-left:{$margin-left*30}pt;'>
			<!-- html form identified by afmTableGroupID -->
			<table>
				<form name='{$afmTableGroupID}'>

					<!-- statistics information -->
					<!--xsl:variable name="hasStatistics" select="$afmTableGroup/dataSource/statistics/statistic"/>
					<xsl:if test="count($hasStatistics) &gt; 0">
						<tr><td>
							<xsl:call-template name="ReportTable_statistics">
								<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							</xsl:call-template>
						</td></tr>
					</xsl:if-->
					<!-- data information-->
					<tr><td>
						<!-- calling template ReportTable_data in report-table-data.xsl to set up main report -->
						<xsl:call-template name="ReportTable_data">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
							<xsl:with-param name="level" select="$level"/>
						</xsl:call-template>
					</td></tr>
					<!-- action information-->
					<xsl:variable name="hasAction" select="$afmTableGroup/rows/selection/afmAction"/>
					<xsl:if test="count($hasAction)>0">
						<tr><td>
							<!-- calling template ReportTable_actions in report-table-actions.xsl to set up actions with report-->
							<xsl:call-template name="ReportTable_actions">
								<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
								<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
							</xsl:call-template>
						</td></tr>
					</xsl:if>
				</form>
			</table>
			<!-- setting up some spaces between two reports -->
			<table height="5"><tr><td></td></tr></table>
		</div>
	</xsl:template>

	<xsl:template name="ReportTable_data">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>
		<xsl:param name="level"/>

		<!-- setting up variables which will be used in xsl -->
		<!-- don't change "bSelect", it is used in reports.js -->
		<xsl:variable name="bSelect" select="'bSelect'"/>
		<xsl:variable name="levelMod" select="$level mod 3"/>
		<!-- making sure that tgrp levels will be 1,2,3,1,2,3... -->
		<xsl:variable name="CssClassLevel">
			<xsl:choose>
				<xsl:when test="$levelMod=0">3</xsl:when>
				<xsl:otherwise><xsl:value-of select="$levelMod"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="showGrid">
			<xsl:choose>
				<!-- check if there is showGrid in axvw -->
				<xsl:when test="$afmTableGroup/@showGrid">
					<xsl:value-of select="$afmTableGroup/@showGrid"/>
				</xsl:when>
				<!-- there is no showGrid in axvw, false is used as default -->
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="printable">
			<xsl:choose>
				<!-- check if there is printable in axvw -->
				<xsl:when test="$afmTableGroup/afmReport/@printable">
					<xsl:value-of select="$afmTableGroup/afmReport/@printable"/>
				</xsl:when>
				<!-- there is no printable in axvw, false is used as default -->
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="hasRowAction" select="$afmTableGroup/dataSource/data/records/record/afmAction"/>
		<xsl:variable name="hasRowSelectionAction" select="$afmTableGroup/rows/selection/afmAction"/>
		<xsl:variable name="fieldNodes" select="$afmTableGroup/dataSource/data/fields/field"/>
		<xsl:variable name="tgrpType" select="$afmTableGroup/@type"/>
		<xsl:variable name="selectedPosition" select="$afmTableGroup/dataSource/data/records/@selectedPosition"/>

		<!-- if there is no record in current tgrp, don't show field titles -->
		<!--xsl:if test="count($afmTableGroup/dataSource/data/records/record) &gt; 0"-->
		<!-- overwritting js variable in reports.js -->
		<script language="javascript">
			abSchemaSystemGraphicsFolder='<xsl:value-of select="$abSchemaSystemGraphicsFolder"/>';
		</script>
		<table cellspacing="0">
			<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>
			<!-- Show the table-style header -->
			<xsl:variable name="HeadClass">
				<xsl:choose>
					<xsl:when test="$printable='false'"><xsl:value-of select="concat('AbHeaderTable',$CssClassLevel)"/></xsl:when>
					<xsl:otherwise>AbHeaderTable_print</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<tr class="{$HeadClass}">
				<xsl:if test="count($hasRowAction) &gt; 0  and ($hasRowAction/title!='')">
					<td><br /></td>
				</xsl:if>
<!-- Blank header column for EDIT Image -->
<td><br /></td>
				<!-- Use a blank column as a place holder for selection toggle if there is any selection action-->
				<xsl:if test="count($hasRowSelectionAction) &gt; 0  and ($hasRowSelectionAction/title!='')">
					<td><br /></td>
				</xsl:if>
				<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field">
					<td>
						<!-- numeric fields are right-justified -->
						<xsl:attribute name="align">
							<xsl:choose>
								<xsl:when test="@type='java.lang.Float' or @type='java.lang.Double' or @type='java.lang.Integer'">right</xsl:when>
								<xsl:otherwise>left</xsl:otherwise>
							</xsl:choose>
						</xsl:attribute>
						<!--xsl:for-each select="multiLineHeadings/multiLineHeading">
							<xsl:value-of select="@multiLineHeading"/><xsl:value-of select="$whiteSpace"/>
						</xsl:for-each-->
						<xsl:value-of select="@singleLineHeading"/>
					</td>
				</xsl:for-each>
				<xsl:for-each select="$afmTableGroup/LicenseHeadings/LicenseHeading">
					<td>
						<!-- numeric fields are right-justified -->
						<xsl:attribute name="align">
							<xsl:choose>
								<xsl:when test="@type='java.lang.Float' or @type='java.lang.Double' or @type='java.lang.Integer'">right</xsl:when>
								<xsl:otherwise>left</xsl:otherwise>
							</xsl:choose>
						</xsl:attribute>
						<xsl:value-of select="@Name"/>
					</td>
				</xsl:for-each>

			</tr>
			<!-- Show each row of table data with action linkings -->
			<xsl:variable name="DataClass">
				<xsl:choose>
					<xsl:when test="$printable='false'">AbDataTable</xsl:when>
					<xsl:otherwise>AbDataTable_print</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
				<xsl:variable name="recordRowIndex" select="position()"/>
				<xsl:variable name="recordID" select="concat($afmTableGroupID,'_',generate-id())"/>
				<tr class="{$DataClass}">
					<!-- set up a variable to hold each row's data (only PKs)-->
					<xsl:variable name="TableRowValues">
						<xsl:for-each select="@*">
							<xsl:variable name="counter" select="position()"/>
							<xsl:if test="$fieldNodes[position()=$counter]/@primaryKey='true'">
								<xsl:value-of select="$whiteSpace"/>
								<xsl:value-of select="name()"/>
								<xsl:text>="</xsl:text>
								<xsl:value-of select="."/>
								<xsl:text>"</xsl:text>
							</xsl:if>
						</xsl:for-each>
					</xsl:variable>

					<!-- action links for each row -->
					<!-- if there is no title for afmAction, don't show  -->
					<xsl:if test="(count(afmAction[@type!='executeTransaction']) &gt; 0) and (afmAction/title!='')">
						<td>
							<table><tr>
								<xsl:for-each select="afmAction">
									<xsl:variable name="Index" select="concat($recordRowIndex,'_', position())"/>
									<td nowrap="1">
										<!-- ???action must have a title??? -->
										<xsl:choose>
										<xsl:when test="title!=''">
											<xsl:if test="$recordRowIndex=($selectedPosition+1)">
												<script language="javascript">
													previouSelectedNodeImgID='IMG_'+'<xsl:value-of select="$Index"/>';
												</script>
											</xsl:if>
											<!-- ChangeItToActiveItem() in reports.js -->
											<A href="#" onclick='ChangeItToActiveItem("{$Index}","","{@serialized}","{@frame}");return false;' title="{title}" ><!-- onclick='sendingRequestToServer("{$afmTableGroupID}","{@serialized}","{@frame}", false); return false;' title="{title}" -->
												<xsl:choose>
													<xsl:when test="$recordRowIndex=($selectedPosition+1)">
														<img ID="IMG_{$Index}" alt="{$expand}" name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-exp.gif" border="0"/>
													</xsl:when>
													<xsl:otherwise>
														<img ID="IMG_{$Index}" name="" alt="{$default}" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dflt.gif" border="0"/>
													</xsl:otherwise>
												</xsl:choose>
											</A>
										</xsl:when>
										<xsl:otherwise><br /></xsl:otherwise>
										</xsl:choose>
									</td>
								</xsl:for-each>
							</tr></table>
						</td>
					</xsl:if>
					<!-- select box for each data row-->
					<!--xsl:if test="count($hasRowSelectionAction) &gt; 0 and ($hasRowSelectionAction/title!='')">
						<td>
							<input type="checkbox" name="{$bSelect}" value="{$TableRowValues}" onclick='EnableSelectionActionButtons("{$afmTableGroupID}")'/>
						</td>
					</xsl:if-->
					<!-- data row -->
					<xsl:for-each select="@*">
						<xsl:variable name="recordValue" select="."/>
						<xsl:variable name="recordField" select="name()"/>
						<xsl:variable name="index" select="position()"/>
						<xsl:variable name="currentField" select="$fieldNodes[position()=$index]"/>
						<xsl:if test="$index = 1">
							<td>
								<a href="#" onclick='editTCAsset("{$recordField}","{$recordValue}")'>
									<xsl:variable name="edit_tooltip" translatable="true">Edit</xsl:variable>
									<img name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-rpt3.gif" border="0" alt="{$edit_tooltip}" title="{$edit_tooltip}"/>
								</a>
							</td>
						</xsl:if>
						<!-- showing autocolor -->
						<xsl:variable name="Autocolor">
							<xsl:if test="$recordRowIndex mod 2 = 0 and $printable='false'">AbDataTableAutocolor</xsl:if>
						</xsl:variable>

						<td class="{$Autocolor}">
							<!-- numeric fields are right-justified -->
							<xsl:attribute name="align">
								<xsl:choose>
									<xsl:when test="$currentField/@type='java.lang.Float' or $currentField/@type='java.lang.Double' or $currentField/@type='java.lang.Integer'">Right</xsl:when>
									<xsl:otherwise>left</xsl:otherwise>
								</xsl:choose>
							</xsl:attribute>
							<xsl:choose>
								<!-- force a white space: -->
								<xsl:when test="$recordValue=''"><br /></xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<!-- XmlGeneratorForm; type="form" why type="form" in floors-rooms-room-form.axvw????? -->
										<xsl:when test="$tgrpType='form'">
											<!-- could be enum fields??? -->
											<xsl:variable name="field_enum" select="$currentField/enumeration"/>
											<xsl:variable name="field_enum_value">
											<xsl:choose>
												<xsl:when test="count($field_enum) &gt; 0">
													<xsl:for-each select="$field_enum/item">
														<xsl:if test="@value=$recordValue"><xsl:value-of select="@displayValue"/></xsl:if>
													</xsl:for-each>
												</xsl:when>
												<xsl:otherwise><xsl:value-of select="$recordValue"/></xsl:otherwise>
											</xsl:choose>
											</xsl:variable>
											<xsl:value-of select="$field_enum_value"/>
										</xsl:when>
										<xsl:otherwise>
											<xsl:choose>
												<xsl:when test="$currentField/@format='Memo'">
													<xsl:call-template name="memo_field_value_handler">
														<xsl:with-param name="memo_value" select="$recordValue"/>
													</xsl:call-template>
												</xsl:when>
												<xsl:otherwise>
													<xsl:value-of select="$recordValue"/>
												</xsl:otherwise>
											</xsl:choose>

										</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>

							<!-- since XML has fully-formatted data, XSLT will not handle them at all  -->
							<!--xsl:call-template name="RecordDataFormatting">
								<xsl:with-param name="fieldNode" select="$currentField"/>
								<xsl:with-param name="recordValue" select="$recordValue"/>
							</xsl:call-template-->
						</td>
					</xsl:for-each>
				</tr>
			</xsl:for-each>
			<xsl:for-each select="$afmTableGroup/records/record">
				<xsl:variable name="recordRowIndex" select="position()"/>
				<xsl:variable name="recordID" select="concat($afmTableGroupID,'_',generate-id())"/>
				<tr class="{$DataClass}">
					<!-- set up a variable to hold each row's data (only PKs)-->
					<xsl:variable name="TableRowValues">
						<xsl:for-each select="@*">
							<xsl:variable name="counter" select="position()"/>
							<xsl:if test="$fieldNodes[position()=$counter]/@primaryKey='true'">
								<xsl:value-of select="$whiteSpace"/>
								<xsl:value-of select="name()"/>
								<xsl:text>="</xsl:text>
								<xsl:value-of select="."/>
								<xsl:text>"</xsl:text>
							</xsl:if>
						</xsl:for-each>
					</xsl:variable>

					<!-- action links for each row -->
					<!-- if there is no title for afmAction, don't show  -->
					<xsl:if test="(count(afmAction[@type!='executeTransaction']) &gt; 0) and (afmAction/title!='')">
						<td>
							<table><tr>
								<xsl:for-each select="afmAction">
									<xsl:variable name="Index" select="concat($recordRowIndex,'_', position())"/>
									<xsl:choose>
										<xsl:when test="title!=''">
											<td nowrap="1">
												<xsl:if test="$recordRowIndex=1">
													<script language="javascript">
														previouSelectedNodeImgID='IMG_'+'<xsl:value-of select="$Index"/>';
													</script>
												</xsl:if>
												<!-- ChangeItToActiveItem() in reports.js -->
												<A href="#" onclick='ChangeItToActiveItem("{$Index}","","{@serialized}","{@frame}");return false;' title="{title}" ><!-- onclick='sendingRequestToServer("{$afmTableGroupID}","{@serialized}","{@frame}", false); return false;' title="{title}" -->
													<xsl:choose>
														<xsl:when test="$recordRowIndex=1">
															<img ID="IMG_{$Index}" alt="{$selected}" name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-tree-selected.gif" border="0"/>
														</xsl:when>
														<xsl:otherwise>
															<img ID="IMG_{$Index}" alt="{$default}" name="" src="{$abSchemaSystemGraphicsFolder}/ab-icon-task-dflt.gif" border="0"/>
														</xsl:otherwise>
													</xsl:choose>
												</A>
											</td>
										</xsl:when>
										<xsl:otherwise><br /></xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
							</tr></table>
						</td>
					</xsl:if>
					<!-- select box for each data row-->
					<xsl:if test="count($hasRowSelectionAction) &gt; 0">
						<td>
							<!-- EnableSelectionActionButtons() in reports.js -->
							<input type="checkbox" name="{$bSelect}" value="{$TableRowValues}" onclick='EnableSelectionActionButtons("{$afmTableGroupID}")'/>
						</td>
					</xsl:if>
					<!-- data row -->
					<xsl:for-each select="@*">
						<xsl:variable name="recordValue" select="."/>
						<xsl:variable name="index" select="position()"/>
						<xsl:variable name="currentField" select="$fieldNodes[position()=$index]"/>
						<!-- showing autocolor -->
						<xsl:variable name="Autocolor">
							<xsl:if test="$recordRowIndex mod 2 = 0 and $printable='false'">AbDataTableAutocolor</xsl:if>
						</xsl:variable>
						<td class="{$Autocolor}">
							<!-- numeric fields are right-justified -->
							<xsl:attribute name="align">
								<xsl:choose>
									<xsl:when test="$currentField/@type='java.lang.Float' or $currentField/@type='java.lang.Double' or $currentField/@type='java.lang.Integer'">Right</xsl:when>
									<xsl:otherwise>left</xsl:otherwise>
								</xsl:choose>
							</xsl:attribute>
							<xsl:choose>
								<!-- force a white space: -->
								<xsl:when test="$recordValue=''"><br /></xsl:when>
								<xsl:otherwise><xsl:value-of select="$recordValue"/></xsl:otherwise>
							</xsl:choose>

							<!-- since XML has fully-formatted data, XSLT will not handle them at all  -->
							<!--xsl:call-template name="RecordDataFormatting">
								<xsl:with-param name="fieldNode" select="$currentField"/>
								<xsl:with-param name="recordValue" select="$recordValue"/>
							</xsl:call-template-->
						</td>
					</xsl:for-each>
				</tr>
			</xsl:for-each>

		</table>
		<xsl:if test="not (count($afmTableGroup/dataSource/data/records/record) &gt; 0)">
			<div style='margin-left:5pt;'>
				<table><tr>
					<td  class="instruction" align="center" valign="top">
						<p><span translatable="true">No Items.</span></p>
					</td>
				</tr></table>
			</div>
		</xsl:if>
		<div>
			<!-- check if there is a report records max limitaion -->
			<xsl:variable name="moreRecords" select="$afmTableGroup/dataSource/data/records/@moreRecords"/>
			<xsl:if test="$moreRecords='true'">
				<table><tr>
					<td  class="instruction" align="center" valign="top">
						<p><span translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data</span></p>
					</td>
				</tr></table>
			</xsl:if>
		</div>
	</xsl:template>

	<xsl:template name="ReportTable_actions">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>

		<xsl:variable name="hasRowsSelectionAction" select="$afmTableGroup/rows/selection/afmAction"/>
		<xsl:variable name="hasTableAction" select="$afmTableGroup/afmAction"/>
		<table width="100%">
		<xsl:if test="count($hasRowsSelectionAction) &gt; 0">
			<tr><td>
				<FIELDSET>
					<LEGEND class="legendTitle" translatable="true">Selection Actions</LEGEND>
					<table align="left">
						<tr align="left">
							<!-- showing actions by using html form buttons  -->
							<!-- javascript function sendingRequestToServer() will set up proper url for each action button -->
							<xsl:for-each select="$hasRowsSelectionAction">
								<xsl:variable name="selectionActionButtonID" select="generate-id()"/>
								<!-- arrSelectionActionButtonNames in reports.js -->
								<script language="javascript">
									var temp_array = new Array();
									temp_array[<xsl:value-of select="position()-1"/>]='<xsl:value-of select="$selectionActionButtonID"/>';
									arrSelectionActionButtonNames['<xsl:value-of select="$afmTableGroupID"/>']=temp_array;
								</script>
								<td align="left">
									<!-- sendingRequestToServer() in reports.js -->
									<input class="AbActionButtonFormStdWidth" type="button" disabled="true" name="{$selectionActionButtonID}" value="{title}" title="{tip}" onclick='sendingRequestToServer("{$afmTableGroupID}","{@serialized}","{@frame}",true);return true;'/>
								</td>
							</xsl:for-each>
						</tr>
					</table>
				</FIELDSET>
			</td></tr>
		</xsl:if>
		<xsl:if test="count($hasTableAction) &gt; 0">
			<tr><td>
				<FIELDSET>
					<!-- string must come from XML for localization -->
					<LEGEND class="legendTitle" translatable="true">Table Actions</LEGEND>
					<table align="left">
						<tr align="left">
							<!-- showing actions by using html form buttons  -->
							<!-- javascript function sendingRequestToServer() will set up proper url for each action button -->
							<xsl:for-each select="$hasTableAction">
								<td align="left">
									<!-- sendingRequestToServer() in reports.js -->
									<input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{tip}" onclick='sendingRequestToServer("{$afmTableGroupID}","{@serialized}","{@frame}",false);return true;'/>
								</td>
							</xsl:for-each>
						</tr>
					</table>
				</FIELDSET>
			</td></tr>
		</xsl:if>
		</table>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
	<!--xsl:include href="../../../ab-system/xsl/reports/reports.xsl" /-->
</xsl:stylesheet>
