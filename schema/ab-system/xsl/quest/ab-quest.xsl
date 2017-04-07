<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: questionnaire report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../constants.xsl" />

	<!-- top template  -->
	<xsl:template match="/">
		<html lang="EN">
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
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- since it's possible there are a few tgrps in one view, using "//afmTableGroup" instead of "/*/afmTableGroup" -->
			<!-- "//" will test each afmTableGroup -->
			<xsl:if test="//afmTableGroup/@format='editForm'">
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/edit-forms.js"><xsl:value-of select="$whiteSpace"/></script>
			</xsl:if>
			<xsl:if test="//afmTableGroup/@format!='editForm'">
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/reports.js"><xsl:value-of select="$whiteSpace"/></script>
			</xsl:if>
			<!-- executeTransaction -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-processing-sql-actions.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-quest.js"><xsl:value-of select="$whiteSpace"/></script>
                        <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/calendar.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
			<script language="javascript">
			var axvwFile='<xsl:value-of select="//message[@name='axvwFile']"/>';
			</script>
		</head>

		<body onload='setupQuestions("{$afmInputsForm}");' class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<!-- calling template logo_title in common.xsl to set up tgrp's title in the top of html page -->
			<!-- handle add new case in edit form -->
			<xsl:variable name="firstTgrpNode" select="/*/afmTableGroup[position()=1]"/>
			<xsl:choose>
				<xsl:when test="$firstTgrpNode/@format='editForm'">
					<xsl:call-template name="SetUpFieldsInformArray">
						<xsl:with-param name="fieldNodes" select="$firstTgrpNode/dataSource/data/fields" />
					</xsl:call-template>
					<xsl:call-template name="SetUpPrimaryKeys">
						<xsl:with-param name="fieldNodes" select="$firstTgrpNode/dataSource/data" />
					</xsl:call-template>
					<script language="JavaScript">bEditForm=true;</script>
				</xsl:when>
				<xsl:otherwise>
					<script language="JavaScript">bEditForm=false;</script>
				</xsl:otherwise>
			</xsl:choose>


			<!-- calling template common which is in common.xsl -->
			<!-- this should be in the top of html body  -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>

			<xsl:call-template name="logo_title">
				<xsl:with-param name="title" select="$firstTgrpNode/title"/>
				<xsl:with-param name="type" select="$firstTgrpNode/@type"/>
				<xsl:with-param name="format" select="$firstTgrpNode/@format"/>
				<xsl:with-param name="logoFile" select="//preferences/@logoFile"/>
				<xsl:with-param name="showLogo" select="'true'"/>
				<xsl:with-param name="logoPath" select="$projectGraphicsFolder"/>
				<xsl:with-param name="hasRowAction" select="$firstTgrpNode/dataSource/data/records/record/afmAction"/>
				<xsl:with-param name="hasRowSelectionAction" select="$firstTgrpNode/rows/selection/afmAction"/>
				<xsl:with-param name="hasAnyRecord" select="$firstTgrpNode/dataSource/data/records/record"/>
				<xsl:with-param name="addNew" select="$firstTgrpNode/@addNew"/>
			</xsl:call-template>

			<xsl:variable name="format" select="$firstTgrpNode/@format"/>
			<xsl:variable name="type" select="$firstTgrpNode/@type"/>
			<xsl:variable name="minTGrp">
				<xsl:choose>
					<xsl:when test="$format='editForm' and $type='form'">1</xsl:when>
					<xsl:otherwise>0</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:if test="$minTGrp=1">
				<xsl:choose>
					<xsl:when test="/*/afmTableGroup[position()=2]/@type='report'">
						<script language="JavaScript">bReadOnlyQuestions=true;</script>
					</xsl:when>
					<xsl:otherwise>
						<script language="JavaScript">bReadOnlyQuestions=false;</script>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:if>
			<form name="{$afmInputsForm}">
			<table  width="100%" valign="top">
				<!-- main section: going through all afmTableGroups to process their data -->
				<!-- don't use <xsl:for-each select="//afmTableGroup"> ("//" should never be used in <xsl:for-each>)-->
				<tr valign="top"><td valign="top">
					<table border="0" cellspacing="0" cellpadding="2" align="center" valign="top">
						<!-- holding all fields in the form -->
						<!-- calling template EditForm_data in edit-quest-form-data.xsl-->
						<xsl:if test="$minTGrp = 1">
							<xsl:call-template name="EditForm_data">
								<xsl:with-param name="afmTableGroup" select="$firstTgrpNode"/>
								<xsl:with-param name="afmTableGroupID" select="$afmInputsForm"/>
							</xsl:call-template>
						</xsl:if>

						<tr valign="top"><td valign="top">
							<xsl:for-each select="/*/afmTableGroup">
								<xsl:if test="position() &gt; $minTGrp">
									<xsl:call-template name="AfmTableGroups">
										<xsl:with-param name="afmTableGroup" select="."/>
										<xsl:with-param name="margin-left" select="0"/>
										<xsl:with-param name="level" select="1"/>
									</xsl:call-template>
								</xsl:if>
							</xsl:for-each>
						</td></tr>
					</table>
				</td></tr>

				<xsl:if test="$minTGrp = 1">
					<tr valign="top"><td valign="top" colspan="2">
						<table class="bottomActionsTable">
							<!-- holding all action buttons on the form -->
							 <tr><td>
								<!-- calling template EditForm_actions in edit-form-actions.xsl-->
								<xsl:call-template name="EditForm_actions">
									<xsl:with-param name="afmTableGroup" select="$firstTgrpNode"/>
									<xsl:with-param name="afmTableGroupID" select="$afmInputsForm"/>
								</xsl:call-template>
							</td></tr>
						</table>
					</td></tr>
				</xsl:if>
			</table>
			</form>

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
			<!-- using a variable to hold the format of afmTableGroup: form or report (?? changable ??)-->
			<xsl:variable name="format" select="$afmTableGroup/@format"/>
			<xsl:variable name="type"   select="$afmTableGroup/@type"/>
			<xsl:choose>
				<!-- table:(This has to be flagged as a "table" or only the first row is returned) -->
				<xsl:when test="$format='table' and $type='form'">
					<xsl:call-template name="Questions">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="questID"       select="''"/>
					</xsl:call-template>
				</xsl:when>

				<!-- report: table or column -->
				<xsl:otherwise>
					<!-- calling template Report which is in reports/reports.xsl -->
					<xsl:call-template name="Report">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="margin-left" select="$margin-left"/>
						<xsl:with-param name="level" select="$level"/>
						<xsl:with-param name="format" select="$format"/>
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>

			<!-- recursive processing AfmTableGroups in child level -->
			<xsl:for-each select="$afmTableGroup/afmTableGroup">
				<xsl:call-template name="AfmTableGroups">
					<xsl:with-param name="afmTableGroup" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+1"/>
					<xsl:with-param name="level" select="$level+1"/>
				</xsl:call-template>
			</xsl:for-each>

			<!-- checking if there is a subFrame node in afmTableGroup -->
			<!-- if there is a subFrame node, implement it in javascript function to refresh all sub-frames-->
			<xsl:if test="count($afmTableGroup/subFrames/*) &gt; 0">
				<xsl:variable name="subFrameNode" select="$afmTableGroup/subFrames/*"/>
				<xsl:call-template name="autoRefreshingSubFrames">
					<xsl:with-param name="subFrameNode" select="$subFrameNode"/>
					<xsl:with-param name="ID" select="generate-id()"/>
				</xsl:call-template>
			</xsl:if>
		</xsl:if>
	</xsl:template>

	<xsl:template name="SetUpPrimaryKeys">
		<xsl:param name="fieldNodes"/>
		<script language="javascript">
		<xsl:for-each select="$fieldNodes/fields/field[@primaryKey='true']">
			<xsl:variable name="FieldName" select="concat(@table,'.',@name)"/>
			<xsl:variable name="RecordPosition" select="position()-1"/>
			arrPKList[<xsl:value-of select="$RecordPosition"/>] ='<xsl:value-of select="$FieldName"/>';
			arrPKValue[<xsl:value-of select="$RecordPosition"/>]='<xsl:value-of select="$fieldNodes/records/record/@*[name()=$FieldName]"/>';
		</xsl:for-each>
		</script>
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
					<xsl:when test="$format='column'">
						<xsl:call-template name="ReportColumnFormat">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="margin-left" select="$margin-left"/>
							<xsl:with-param name="level" select="$level"/>
						</xsl:call-template>
					</xsl:when>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>

	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../common.xsl"/>
	<xsl:include href="../locale.xsl"/>
	<xsl:include href="../inputs-validation.xsl"/>
	<xsl:include href="../copyright.xsl"/>
	<xsl:include href="ab-quest-questions.xsl"/>
	<xsl:include href="ab-quest-edit-form-data.xsl"/>
	<xsl:include href="ab-quest-edit-form-actions.xsl"/>
	<xsl:include href="ab-quest-report-table-format.xsl"/>
	<xsl:include href="ab-quest-report-column-format.xsl"/>
	<xsl:include href="../reports/error-message-window.xsl"/>
	<xsl:include href="../reports/report-memo-field-value-handler.xsl"/>
</xsl:stylesheet>


