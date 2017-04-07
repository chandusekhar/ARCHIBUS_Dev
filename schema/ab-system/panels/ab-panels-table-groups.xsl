<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-01-30 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">		
	<xsl:template name="afmTableGroups">
		<xsl:param name="afmTableGroups"/>
		<xsl:for-each select="$afmTableGroups">
			<xsl:call-template name="afmTableGroup">
				<xsl:with-param name="afmTableGroup" select="."/>
				<xsl:with-param name="afmTableGroup_index" select="position() - 1"/>
			</xsl:call-template>
		</xsl:for-each>
	</xsl:template>

	<xsl:template name="afmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroup_index"/>
	
        <xsl:variable name="tabIndex" select="$afmTableGroup_index * 10000"/>
		<xsl:variable name="defaultActionsPosition" select="$afmTableGroup/@defaultActionsPosition"/>
		<xsl:variable name="actionsPosition">
			<xsl:choose>
				<xsl:when test="$defaultActionsPosition!=''"><xsl:value-of select="$defaultActionsPosition"/></xsl:when>
				<xsl:otherwise>top</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="afmTableGroup_id">
			<xsl:choose>
				<xsl:when test="$afmTableGroup/@id!=''"><xsl:value-of select="$afmTableGroup/@id"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="generate-id()"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>


		<xsl:if test="$afmTableGroup/title!='' or (contains($actionsPosition,'top') and (count($afmTableGroup/afmAction[./title/text()!='']) &gt; 0))">
			<xsl:variable name="showActions">
				<xsl:choose>
					<xsl:when test="(contains($actionsPosition,'top') and (count($afmTableGroup/afmAction) &gt; 0))">true</xsl:when>
					<xsl:otherwise>false</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="header_class">
				<xsl:choose>
					<xsl:when test="$afmTableGroup/@headerClass!=''"><xsl:value-of select="$afmTableGroup/@headerClass"/></xsl:when>
					<xsl:otherwise>tgrpHeader</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:call-template name="afmTableGroup_header_footer_handler">
				<xsl:with-param name="name" select="$afmTableGroup/@name"/>
				<xsl:with-param name="title" select="$afmTableGroup/title"/>
				<xsl:with-param name="actions" select="$afmTableGroup/afmAction"/>						
				<xsl:with-param name="form_name" select="$afmTableGroup_id"/>
				<xsl:with-param name="actions_style" select="'text-align:right;'"/>
				<xsl:with-param name="showActions" select="$showActions"/>
				<xsl:with-param name="table_class" select="$header_class"/>
                <xsl:with-param name="tabIndex" select="$tabIndex"/>
			</xsl:call-template>
		</xsl:if>

		<xsl:choose>
			<xsl:when test="$afmTableGroup/@type='form'">
				 <xsl:call-template name="afmTableGroup_form">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
					<xsl:with-param name="afmTableGroup_id" select="$afmTableGroup_id"/>
                    <xsl:with-param name="tabIndex" select="$tabIndex"/>
				 </xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="afmTableGroup_report">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
					<xsl:with-param name="afmTableGroup_id" select="$afmTableGroup_id"/>
                    <xsl:with-param name="tabIndex" select="$tabIndex"/>
				 </xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>

		<xsl:if test="(count($afmTableGroup/afmAction[./title/text()!='']) &gt; 0) and  (contains($actionsPosition,'bottom'))">
			<xsl:variable name="footer_class">
				<xsl:choose>
					<xsl:when test="$afmTableGroup/@footerClass!=''"><xsl:value-of select="$afmTableGroup/@footerClass"/></xsl:when>
					<xsl:otherwise>tgrpFooter</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:call-template name="afmTableGroup_header_footer_handler">
				<xsl:with-param name="actions" select="$afmTableGroup/afmAction"/>
				<xsl:with-param name="form_name" select="$afmTableGroup_id"/>
				<xsl:with-param name="showActions" select="'true'"/>
				<xsl:with-param name="table_class" select="$footer_class"/>
                <xsl:with-param name="tabIndex" select="$tabIndex + 9900"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<xsl:template name="afmTableGroup_header_footer_handler">
		<xsl:param name="name"/>
		<xsl:param name="title"/>
		<xsl:param name="actions"/>
		<xsl:param name="form_name"/>
		<xsl:param name="table_class"/>
		<xsl:param name="title_class"/>
                <xsl:param name="title_style"/>
		<xsl:param name="actions_class"/>
                <xsl:param name="actions_style"/>
		<xsl:param name="showActions"/>
        <xsl:param name="tabIndex"/>
		
		<xsl:variable name="temp_titleClass">
            <xsl:if test="$title"><xsl:value-of select="$title/@class"/></xsl:if>
        </xsl:variable>
		<xsl:variable name="temp_titleClass2">
            <xsl:choose>
                <xsl:when test="$temp_titleClass!=''"><xsl:value-of select="$temp_titleClass"/></xsl:when>
                <xsl:otherwise>panelHeader</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
		<xsl:variable name="useTitle_style">
                        <xsl:choose>
                                <xsl:when test="string-length($title_style) &gt; 0"><xsl:value-of select="$title_style"/></xsl:when>
                                <xsl:otherwise><xsl:if test="$temp_titleClass2=''">font-weight:bold;font-family:arial,geneva,helvetica,sans-serif;font-size:14;text-align:left;</xsl:if></xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<xsl:variable name="useActions_style">
                        <xsl:choose>
                                <xsl:when test="string-length($actions_style) &gt; 0"><xsl:value-of select="$actions_style"/></xsl:when>
                                <xsl:otherwise>text-align:center;</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>

		<table width="100%" class="{$table_class}" id="{$name}_head">
			<tr>
				<xsl:if test="$title">
					<td class="{$title/@class}" style="{$useTitle_style}" id="{$name}_title">
						<xsl:value-of select="$title/text()"/>
					</td>
				</xsl:if>
				<xsl:if test="$showActions!='' and $showActions='true'">
					<td class="{$actions_class}" style="{$useActions_style}">
						<xsl:for-each select="$actions[./title/text()!='']">
							<xsl:call-template name="helper_afmAction">
								<xsl:with-param name="afmAction" select="."/>
								<xsl:with-param name="form" select="$form_name"/>
								<xsl:with-param name="bData" select="'true'"/>
                                <xsl:with-param name="tabIndex" select="$tabIndex + position()"/>
							</xsl:call-template>
						</xsl:for-each>
					</td>
				</xsl:if>
			</tr>
		</table>
	</xsl:template>

	<xsl:template name="afmTableGroup_report">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroup_id"/>
        <xsl:param name="tabIndex"/>
		<xsl:call-template name="panels">
			<xsl:with-param name="panels" select="$afmTableGroup/panels"/>
			<xsl:with-param name="afmTableGroup_id" select="$afmTableGroup_id"/>
			<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
            <xsl:with-param name="afmTableGroup_tabIndex" select="$tabIndex"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template name="afmTableGroup_form">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroup_id"/>
        <xsl:param name="tabIndex"/>

		<xsl:call-template name="preparation_form">
			<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
			<xsl:with-param name="afmTableGroup_id" select="$afmTableGroup_id"/>
		</xsl:call-template>

		<!-- preparing select value afmAction and ???? -->
		<xsl:variable name="selectVAction" select="$afmTableGroup/forFields/field/afmAction[@type='selectValue']"/>
		<script language="javascript">
			arrAfmActionSerializedStringsByID['selectValueAfmAction']=new Array();
			arrAfmActionSerializedStringsByID['selectValueAfmAction']['serialized']='<xsl:value-of select="$selectVAction/@serialized"/>';
			arrAfmActionSerializedStringsByID['selectValueAfmAction']['target']='_blank';
			arrAfmActionSerializedStringsByID['selectValueAfmAction']['form']='<xsl:value-of select="$afmTableGroup_id"/>';
		</script>

		<xsl:variable name="form_encType">
                        <xsl:choose>
				<xsl:when test="$afmTableGroup/@enctype!=''"><xsl:value-of select="$afmTableGroup/@enctype"/></xsl:when>
                        </xsl:choose>
                </xsl:variable>
		<xsl:variable name="form_method">
                        <xsl:choose>
				<xsl:when test="$afmTableGroup/@method!=''"><xsl:value-of select="$afmTableGroup/@method"/></xsl:when>
                        </xsl:choose>
                </xsl:variable>
	
		<form name='{$afmTableGroup_id}' style="display:inline" method='{$form_method}' enctype='{$form_encType}' >
			<xsl:call-template name="panels">
				<xsl:with-param name="panels" select="$afmTableGroup/panels"/>
				<xsl:with-param name="afmTableGroup_id" select="$afmTableGroup_id"/>
                <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
                <xsl:with-param name="afmTableGroup_tabIndex" select="$tabIndex"/>
			</xsl:call-template>
		</form>
	</xsl:template>
</xsl:stylesheet>
