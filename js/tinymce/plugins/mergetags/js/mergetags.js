var MergeTagDialog =
{
    data : top.content.mergeCategories,
    formatters : top.content.formatterSets,

    defaultField: {category:"category.commonFields", field:"entity.name"},

    init : function(editor)
    {
        var template = Handlebars.compile(jQuery("#mergeTagsWrapper").html());
        jQuery("#mergeTagsWrapper").html(template(top.content.tinymce.i18n.data)).show();
        
        this.node = editor.selection.getNode();
        
        if( isMergeTagElement(this.node) )
            jQuery("#insert").val(top.content.tinymce.i18n.translate('update'));  // existing, update button text

        var data = MergeTagDialog.data;
        for( var i = 0; i < data.length; i++ )
            jQuery("#category")[0].options[i] = new Option(data[i].name, data[i].id);

        var info = MergeTagDialog.decode(this.node);

        setSelectValue("category", info.category);
        populateFields("category", "field", MergeTagDialog.data);
        setSelectValue("field", info.field);
        setSelectValue("aggregate", info.aggregate);
        populateFormatters("field", "format", MergeTagDialog.data, MergeTagDialog.formatters);
        setSelectValue("format", info.format);
        jQuery("#defaultValue").val(info.defaultValue ? info.defaultValue : "");
    },

    decode : function(node)
    {
        return isMergeTagElement(node) ? decodeField(node.title) : MergeTagDialog.defaultField;
    },

    encode : function(name)
    {
        var get = getSelectValue;
        return encodeValues(name, get("category"), get("field"), get("aggregate"), get("format"), "", "", jQuery("#defaultValue").val());
    },

    display: function()
    {
        return ((jQuery("#aggregate")[0].selectedIndex == 0)
                ? getSelectLabel(jQuery("#field")[0])
                : getSelectLabel(jQuery("#field")[0]) + " (" + getSelectLabel(jQuery("#aggregate")[0]) + ")");
    },

    update : function()
    {
        var editor = top.content.tinymce.activeEditor, form = document.forms[0];
        var display = MergeTagDialog.display().replace(/'/g, "&#39;");
        var encoded = MergeTagDialog.encode(display);

        var selected = this.node;
        selected = isMergeTagElement(selected) ? selected : null;
        
        createMergeNode(editor, selected, encoded, display, "etapMergeTag", false);

        top.content.tinymce.activeEditor.windowManager.close();
    },
    
    selectTab: function(tab)
    {
        jQuery(".mce-tab").removeClass("mce-active");
        jQuery(".mce-tab#" + tab + "_tab").addClass("mce-active");
        jQuery("[id*=_panel]").hide();
        jQuery("#" + tab + "_panel").show();
    }
};

function calcWidth(text)
{
    // each char is 6px. add 1px for space between each char. add 2px for left/right padding.
    return (text.length * 6) + (text.length - 1) + 13;
}

function isMergeTagElement(n)
{
    while( n )
    {
        if( (n.nodeName == 'A') && (n.id == "etapDataTag" || n.className == "etapDataTag") )
            return n;

        n = n.parentNode;
    }
    return null;
}

function doFieldSearch(lengthWarning, noneFoundWarning)
{
    MergeTagDialog.selectTab('search');

    var val = jQuery("#searchBox").val().toLowerCase().replace(/household/g, "hh");
    if( val.length < 3 && val != "hh" )
    {
        alert(lengthWarning);
        return false;
    }

    var html = "", lastCat = "";
    var cats = MergeTagDialog.data;
    for( var i = 0; i < cats.length; i++ )
    {
        var fields = cats[i].fields;
        for( var j = 0; j < fields.length; j++ )
        {
            if( fields[j].name.toLowerCase().indexOf(val) != -1 )
            {
                if( cats[i].name != lastCat )
                {
                    html += (lastCat != "") ? "<br/>" : "";
                    html += "<div class=\"searchResultCategory\">" + cats[i].name + "</div>";
                    lastCat = cats[i].name;
                }
                html += "<div class='searchResult'><a href='javascript:selectField(" + i + "," + j + ")'>" + fields[j].name + "</a></div>";
            }
        }
    }

    jQuery("#searchResults").html((html != "") ? html : ("<i>" + noneFoundWarning + "</i>"));
}

function selectField(catIndex, fieldIndex)
{
    jQuery("#category")[0].selectedIndex = catIndex;
    populateFields("category", "field", MergeTagDialog.data).selectedIndex = fieldIndex;
    populateFormatters("field", "format", MergeTagDialog.data, MergeTagDialog.formatters);
    MergeTagDialog.selectTab('field');
}

MergeTagDialog.init(top.content.tinymce.activeEditor);
