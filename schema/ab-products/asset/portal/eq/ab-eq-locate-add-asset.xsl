<?xml version="1.0"?>
<!-- ab-rm-change-dp-edit.xsl for ab-rm-change-dp-edit.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
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
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-edit-report.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- since it's possible there are a few tgrps in one view, using "//afmTableGroup" instead of "/*/afmTableGroup" -->
			<!-- "//" will test each afmTableGroup -->

			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/edit-forms.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-eq-locate-add-edit-asset.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/calendar.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>

		<body onload="setUpBLFLRM();setUpSelectedBLFLRM();" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>

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
				<xsl:variable name="format" select="$afmTableGroup/@format"/>

				<!-- calling template EditForm which is in edit-forms/edit-forms.xsl -->
				<xsl:call-template name="EditForm">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup[1]"/>
					<xsl:with-param name="margin-left" select="$margin-left"/>
				</xsl:call-template>

			</td></tr>

			<!-- recursive processing AfmTableGroups in child level -->
			<xsl:for-each select="$afmTableGroup/afmTableGroup">
				<xsl:call-template name="AfmTableGroups">
					<xsl:with-param name="afmTableGroup" select="."/>
					<xsl:with-param name="margin-left" select="$margin-left+1"/>
					<xsl:with-param name="level" select="$level+1"/>
				</xsl:call-template>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>

	<xsl:template name="EditForm">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>

		<xsl:variable name="afmTableGroupID" select="generate-id()"/>
		<!-- each tgrp will have a unqiue html form to handle its data inputs  -->
		<!-- javascript variables and functions used here are in edit-forms.js-->
		<script language="javascript">
			setupArrAllUsersInputFormNames('<xsl:value-of select="$afmTableGroupID"/>');
		</script>
		<!-- calling template SetUpFieldsInformArray in inputs-validation.xsl to use its template SetUpFieldsInformArray -->
		<xsl:call-template name="SetUpFieldsInformArray">
			<xsl:with-param name="fieldNodes" select="$afmTableGroup/dataSource/data/fields"/>
		</xsl:call-template>
		<!-- main edit form -->
		<!-- enctype="application/x-www-form-urlencoded; charset=utf-8" doesn't encode form's input values as UTF8 font at IE6 ??? -->
		<form name='{$afmTableGroupID}'><!-- enctype="application/x-www-form-urlencoded; charset=utf-8"-->
			<table  width="100%"  border="0" cellspacing="0" align="center" valign="top">
				<!-- holding all fields in the form -->
				<tr valign="top"><td valign="top">
					<!-- calling template EditForm_data in edit-form-data.xsl-->
					<xsl:call-template name="EditForm_data">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
					</xsl:call-template>
					<input type="hidden" id="Selectedbl_id" name="Selectedbl_id" value=""/>
					<input type="hidden" id="Selectedfl_id" name="Selectedfl_id" value=""/>
					<input type="hidden" id="Selectedrm_id" name="Selectedrm_id" value=""/>
				</td></tr>
			</table>
			<table class="bottomActionsTable">
				<!-- holding all action buttons on the form -->
				 <tr><td>
					<!-- calling template EditForm_actions in edit-form-actions.xsl-->
					<xsl:call-template name="EditForm_actions">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
					</xsl:call-template>
				</td></tr>
			</table>
		</form>
	</xsl:template>
	<xsl:template name="EditForm_actions">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>

		<xsl:variable name="callingFunctionName" select="concat('callingValidatingForm','_',$afmTableGroupID)"/>
		<table align="center" width="100%">
			<tr align="center"><td>
				<xsl:for-each select="$afmTableGroup/afmAction">
					<xsl:variable name="type" select="@type"/>
					<!-- no delete action -->
					<xsl:if test="$type!='addnew' and $type!='delete' and $type!='render' and $type!='addNew'">
						<xsl:choose>
							<!-- javascript variables and functions used here are in edit-forms.js -->
							<!-- going through form inputs validation -->
							<!-- be careful here: afmAction's type="render"==> Cancel? type="addNew"==> Add New? in XML-->
							<xsl:when test="$type != 'render' and $type != 'addNew'">
								<xsl:choose>
									<xsl:when test="$type='delete'">
										<xsl:if test="not(@enabled)">
											<input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{tip}" onclick='return TCAssetDelete("{$afmTableGroupID}","{@serialized}","{@frame}",true)'/>
										</xsl:if>
									</xsl:when>
									<xsl:otherwise>
										<xsl:choose>
											<xsl:when test="$type='executeTransaction'">
												<input  class="AbActionButtonFormStdWidth"  type="button" value="{title}" title="{tip}" onclick='return abProcessingSQLActionToServer("{$afmTableGroupID}","{@serialized}","{@frame}")'/>
											</xsl:when>
											<xsl:otherwise>
												<input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{tip}" onclick='return TCAssetSave("{$afmTableGroupID}","{@serialized}","{@frame}",true)'/>
											</xsl:otherwise>
										</xsl:choose>
									</xsl:otherwise>
								</xsl:choose>
							</xsl:when>
							<!-- cancel and addnew will not validate the form -->
							<xsl:otherwise>
								<xsl:choose>
									<xsl:when test="$type='addnew'">
										<xsl:if test="not(@enabled)">
											<input  class="AbActionButtonFormStdWidth"  type="button" value="{title}" title="{tip}" onclick='TCAssetAddNew("{$afmTableGroupID}","{@serialized}","{@frame}",false)'/>
										</xsl:if>
									</xsl:when>
									<xsl:otherwise>
										<input  class="AbActionButtonFormStdWidth"  type="button" value="{title}" title="{tip}" onclick='javascript:self.close();'/>
									</xsl:otherwise>
								</xsl:choose>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:if>
					<xsl:if test="$type='render'">
						<input  class="AbActionButtonFormStdWidth"  type="button" value="{title}" title="{tip}" onclick='javascript:self.close();'/>
					</xsl:if>
				</xsl:for-each>
			</td></tr>
		</table>
	</xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
	<xsl:include href="../../../ab-system/xsl/inputs-validation.xsl" />
	<xsl:include href="../../../ab-system/xsl/edit-forms/edit-form-data.xsl" />
</xsl:stylesheet>
