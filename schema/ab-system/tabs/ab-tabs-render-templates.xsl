<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-01-23 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format">
	<xsl:template match="tabs">
		<table id="tabs" cellpadding="0" cellspacing="0">
			<tr><td>
				<xsl:variable name="workflow" select="@workflow"/>
				<xsl:for-each select="tab">
					<span name="{@name}" id="{@name}" onclick="onClickTab('{@name}'); return false;">
						<xsl:attribute name="class">
							<xsl:choose>
								<xsl:when test="$workflow='free'">
									<xsl:if test="@selected='true'">selected</xsl:if>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="@selected='true'">disabled_selected</xsl:when>
										<xsl:otherwise>disabled</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>															
						</xsl:attribute>
						<xsl:value-of select="title"/><hr /> 
					</span>
					</xsl:for-each>				
				</td>
				<td style="width: 100%"><br /></td>
			</tr>
		</table>
		 <!-- js invoking -->
		 <div>
			<script language="javascript">
				var temp_free='<xsl:value-of select="@workflow"/>';
				<xsl:for-each select="tab">
					var temp_tabName='<xsl:value-of select="@name"/>';
                    tabsViewNames[temp_tabName]='<xsl:value-of select="@fileName"/>';
					tabsAfmActions[temp_tabName]=['<xsl:value-of select="afmAction/@serialized"/>','<xsl:value-of select="afmAction/@target"/>'];
					tabsWorkFlowRuleActions[temp_tabName]="";
					var temp_status='<xsl:value-of select="@selected"/>';
					if(temp_free=="free"){
						if(temp_status=="selected"){
							//selected tab (active)
							tabsStatus[temp_tabName]="selected";
						}else{
							//selectable tabs
							tabsStatus[temp_tabName]="";
						}
					}else{
						if(temp_status=="selected"){
							//disabled selected tab
							tabsStatus[temp_tabName]="disabled_selected";
						}else{
							//disabled tabs
							tabsStatus[temp_tabName]="disabled";
						}
					}
				</xsl:for-each>									
				<xsl:variable name="selectedTabName" select="tab[@selected='true']/@name"/>
				selectTab('<xsl:value-of select="$selectedTabName"/>');
			</script>
		</div>
	</xsl:template>
</xsl:stylesheet>
