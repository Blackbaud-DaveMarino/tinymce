function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function each(array, fn)
{
    for( var i = 0; i < array.length; i++ )
        fn(array[i], i);
}

function pick(array, fn, def)
{
    for( var i = 0; i < array.length; i++ )
        if( fn(array[i], i) )
            return array[i];

    return arguments.length > 2 ? def : null;
}

function getChildNodes(parent, name)
{
    parent = jQuery("#" + parent)[0];
    var array = new Array();
    each(parent.childNodes, function(node) {
        if( node.nodeName == name.toUpperCase() )
            array.push(node);
    });
    return array;
}

function swapNodes(x, y)
{
    if( x && y )
    {
        var tempNext = x.nextSibling;
        var tempParent = x.parentNode;

        y.parentNode.replaceChild(x, y);
        tempParent.insertBefore(y, tempNext);
    }
}

function setClass(node, name)
{
    if( node )
        jQuery(node).attr('class', name);
}

function createMergeNode(editor, existing, value, display, type, widget)
{
    if( existing )
    {
        _updateMergeNode(editor, existing, value, display, type, widget);
    }
    else
    {
        _createMergeNode(editor, value, display, type, widget);
    }
}

function _updateMergeNode(editor, original, value, display, type, widget)
{
    if( original.nodeName == "A" )
    {
        original.title = value;
        jQuery(original).html(display);
        original.id = 'etapDataTag';
        original.className = 'etapDataTag';
    }
    else if( original.nodeName == "INPUT" )
    {
        var input = editor.dom.create("input", {
            type: "text",
            name: type,
            id: type,
            title: value,
            value: display,
            readonly: "readonly",
            style: "width:99%;"
        });
        input.className = type;
        editor.dom.replace(input, original);
    }
}

/*
 * Function to preserve all of our formatting when putting in mergetags
 */
function insertRawHtml(editor, html)
{
    editor.selection.setContent('tiny_mce_marker');
    editor.setContent( editor.getContent({format: "raw"}).replace(/tiny_mce_marker/g, function() { return html; }), {format: "raw"} );
}

function _createMergeNode(editor, value, display, type, widget)
{
    if( widget )
    {
        var html =
            "<p><input" + 
            " type='text'" +
            " readonly='readonly'" + 
            " class='" + type + "'" +
            " name='" + type + "'" + 
            " id='" + type + "'" + 
            " title='" + value + "'" + 
            " value='" + display + "'" +
            " style='width:99%;'" +
            " /></p><p></p>";
        
        editor.selection.setContent(html);
    }
    else
    {
        var html =
            "<a" +
            " href='javascript:void(0)'" +
            " id='etapDataTag'" +
            " class='etapDataTag mce-item-anchor'" +
            " title='" + value + "'>" + display + "</a>&nbsp;";

        editor.selection.setContent(html);
    }
}

function setSelectValue(select, value)
{
    if(typeof(select) == "string")
        select = jQuery("#" + select)[0];
    
    if(select instanceof jQuery)
        select = select[0];
    
    var option = _.find(select.options, function(option) {
        return option.value === value;
    });
    
    if(option)
        select.selectedIndex = option.index;

}

function getSelectValue(select)
{
    if(typeof(select) == "string")
        select = jQuery("#" + select)[0];
    
    return select.options[select.selectedIndex].value;
}

function getSelectLabel(select)
{
    if(typeof(select) == "string")
        select = jQuery("#" + select)[0];
    
    return select.options[select.selectedIndex].firstChild.nodeValue;
}

function encodeField(field)
{
    return encodeValues(field.name, field.category, field.field, field.aggregate, field.format, field.sort, field.align, field.defaultValue);
}

function encodeValues(name, categoryId, fieldId, aggregate, formatter, sort, align, defaultValue)
{
    return ("category=" + categoryId + "|" +
            "field=" + fieldId + "|" +
            "name=" + name + "|" +
            "aggregate=" + aggregate + "|" +
            "format=" + formatter + "|" +
            "sort=" + (sort ? sort : "0") + "|" + 
            "align=" + (align ? align : "enum.align.auto") +
            (defaultValue ? "|defaultValue=" + defaultValue : ""));
}

function decodeField(fieldStr)
{
    return decodeOptions(fieldStr, {category:"", field:"", name:"", aggregate:"0", formatter:"", sort:"0", align:"enum.align.auto", defaultValue:""});
}

function decodeOptions(encoded, options)
{
    if( arguments.length == 1 )  // if no defaults provided, start with blank slate
        options = {};

    // Strip off "[" and "]" if it's an escaped options section
    if( isGlobalOption(encoded) )
        encoded = encoded.substring(1, encoded.length-1);

    var pairs = encoded.split("|");
    each(encoded.split("|"), function(attr) {
        attr = attr.split("=");
        options[attr[0]] = attr[1];
    });
    return options;
}

function isGlobalOption(encoded)
{
    return ((encoded.charAt(0) == '[') &&
            (encoded.charAt(encoded.length-1) == ']'));
}

function initializeFieldSelection(field, catId, fieldId, aggId, formatId, sortId, alignId, categories, formatters)
{
    populateOptions(catId, categories);
    setSelectValue(catId, field.category);
    populateFields(catId, fieldId, categories);
    setSelectValue(fieldId, field.field);
    setSelectValue(aggId, field.aggregate);
    setSelectValue(sortId, field.sort);
    setSelectValue(alignId, field.align);
    populateFormatters(fieldId, formatId, categories, formatters);
    setSelectValue(formatId, field.format);
}

function populateFields(categorySelect, fieldSelect, categories)
{
    fieldSelect = jQuery("#" + fieldSelect)[0];
    populateOptions(fieldSelect, getCategory(getSelectValue(categorySelect), categories).fields);
    fieldSelect.selectedIndex = 0;
    return fieldSelect;
}

function populateFormatters(fieldSelect, formatterSelect, categories, formatters)
{
    var type = getField(getSelectValue(fieldSelect), categories).type;
    formatterSelect = jQuery("#" + formatterSelect)[0];
    populateOptions(formatterSelect, getFormatterSet(type, formatters).formatters);
    formatterSelect.selectedIndex = 0;
    return formatterSelect;
}

function populateOptions(select, values)
{
    if(typeof(select) == "string")
        select = jQuery("#" + select)[0];
    select.options.length = 0;
    each(values, function(value, i) {
        select.options[i] = new Option(value.name, value.id);
    });
}

function getCategory(id, categories)
{
    return pick(categories, function(category) {
        return (category.id == id);
    });
}

function getField(fieldId, categories)
{
    var target = null;
    each(categories, function(category) {
        if( !target )
        {
            target = pick(category.fields, function(field) {
                return field.id == fieldId;
            });
        }
    });
    return target;
}

function getFormatterSet(setId, formatters)
{
    return pick(formatters, function(set) {
        return (set.id == setId);
    });
}
