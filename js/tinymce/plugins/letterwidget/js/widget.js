var WidgetDialog =
{
    data : top.content.mergeCategories,
    formatters : top.content.formatterSets,

    widget: null,

    init: function(editor)
    {
        var widgets = WidgetDialog.getWidgets();
        var node = this.node = editor.selection.getNode();
        if(jQuery(node).find("input").length !== 0)
            node = jQuery(node).find("input")[0];

        if( top.content.tinymce.activeEditor.settings.letterwidget_accountPhoto_disabled )
        {
            jQuery("#accountPhotoSelection").hide();
            jQuery("#accountPhotoSelectionSeparator").hide();
        }

        if( top.content.tinymce.activeEditor.settings.letterwidget_agape_enabled )
        {
            jQuery("#agapeGiftListSelection").show();
            jQuery("#agapeGiftListSelectionSeparator").show();
        }

        // display the selected widget (if there is one)
        jQuery().ready( function() {
            WidgetDialog.widget = pick(widgets, function(w) {
        
                return w.code.isWidgetNode(node);
            });
            
            // Tab to options for existing or stay on select (default to gift list) on new
            if( WidgetDialog.widget )
            {
                WidgetDialog.selectWidget(WidgetDialog.widget.id);
                jQuery("#insert").val(top.content.tinymce.i18n.translate('update'));  // existing, update button text
            }

            // initalize all widget editors (only pass select node if it belongs to the widget)
            each(widgets, function(w) {
                w.code.init(editor, WidgetDialog.getWidgetNode(w, node));
            });
            
        });

        
    },

    getWidgetNode: function(widget, node)
    {
        
        return widget.code.isWidgetNode(node) ? node : null;
    },

    getWidgets: function()
    {
        if( this.registered == null )
            this.registered = new Array(
              {id:"entryList", code:EntryList},
              {id:"pledgeSchedule", code:PledgeSchedule},
              {id:"orderDetails", code:OrderDetails},
              {id:"ecommerceDetails", code:EcommerceDetails},
              {id:"accountPhoto", code:AccountPhoto},
              {id:"agapeGiftList", code:AgapeGiftList},
              {id:"donorLoyaltyLink", code:DonorLoyaltyLink});

        return this.registered;
    },

    getWidget: function(id)
    {
        return pick(WidgetDialog.getWidgets(), function(w) {
            return w.id == id;
        });
    },

    update: function()
    {
        if( !WidgetDialog.widget )
        {
            alert("No widget selected");
            return;
        }

        var editor = top.content.tinymce.activeEditor, form = document.forms[0];

        // only pass an existing node if we know it belongs to the widget
        var testNode = this.node;
        if(jQuery(testNode).find("input").length !== 0)
            testNode = jQuery(testNode).find("input")[0];
        var node = WidgetDialog.getWidgetNode(WidgetDialog.widget, testNode);
        WidgetDialog.widget.code.save(editor, node, form);
        top.content.tinymce.activeEditor.windowManager.close();
    },

    selectWidget: function(selectedId)
    {
        var self = this;
        each(WidgetDialog.getWidgets(), function(widget) {
            var id = widget.id;
            if( id == selectedId )
            {
                WidgetDialog.widget = WidgetDialog.getWidget(id);
                setClass("#" + id + "Area", "selectedWidget");
                jQuery("#noneSelectedOptions").hide();
                jQuery("#" + id + "Options").show();
                self.selectTab('options');
            }
            else
            {
                setClass("#" + id + "Area", "");
                jQuery("#" + id + "Options").hide();
            }
        });
    },

    isWidgetType: function(node, targetType)
    {
        var actualType = node.name || node.id || node.className;
        return (node.nodeName == 'INPUT') && (actualType == targetType);
    },
    
    selectTab: function(tab)
    {
        jQuery(".mce-tab").removeClass("mce-active");
        jQuery(".mce-tab#" + tab + "_tab").addClass("mce-active");
        jQuery("[id*=_panel]").hide();
        jQuery("#" + tab + "_panel").show();
    }
};

// ------ Entry List Widget ---------

var EntryList =
{
    column: "",

    defaultField: {category:"category.commonFields", field:"journal.date", name:"Date"},

    template: ("<a href='javascript:EntryList.deleteRow(\"UID\")'><img src='img/delete.gif' align='absmiddle'/></a> " +
               "<a href='javascript:EntryList.moveUp(\"UID\")'><img src='img/up.gif' align='absmiddle'/></a> " +
               "<a href='javascript:EntryList.moveDown(\"UID\")'><img src='img/down.gif' align='absmiddle'/></a> " +
               "<a href='javascript:EntryList.edit(\"UID\")'>(edit)</a>&nbsp; <span id='UIDDisplay'>NAME</span>" +
               "<input type='hidden' name='fieldValue' id='UIDValue' value='ENCODED'/>"),

    // required for widget implementation
    init: function(editor, node)
    {
        if( node )
        {
            EntryList.decodeColumns(node.title);
        }
        else
        {
            EntryList.add({category:"category.commonFields", field:"journal.date", name:"Date"});
            EntryList.add({category:"category.commonFields", field:"journal.fund", name:"Fund"});
            EntryList.add({category:"category.commonFields", field:"journal.received", name:"Received"});
            EntryList.add({category:"category.journal", field:"journal.nondeductibleAmount", name:"Non-Deductible"});
        }

        EntryList.edit(EntryList.getFirstColumn());
    },

    // required for widget implementation
    save: function(editor, original, form)
    {
        var encoded = EntryList.encodeColumns();
        var names = EntryList.encodeNames();
        createMergeNode(editor, original, encoded, names, "etapEntryList", true);
    },

    decodeColumns: function(encoded)
    {
        each(encoded.split("~~"), function(data) {
            if( isGlobalOption(data) )
            {
                var options = decodeOptions(data);
                setSelectValue(jQuery("#totals"), options.totals);
            }
            else
            {
                EntryList.add(decodeField(data));
            }
        });
    },

    encodeColumns: function()
    {
        var encoded = "[totals=" + getSelectValue("totals") + "]";
        var inputs = jQuery("#entryListColumns").find("input");
        inputs.each(function(index) {
            encoded += ("~~" + jQuery(this).val());
        });
        return encoded;
    },

    encodeNames: function()
    {
        var encoded = "Entry List: ";
        var spans = jQuery("#entryListColumns").find("span");
        spans.each(function(index) {
            encoded += "[" + jQuery(this).html() + "] ";
        });
        return encoded;
    },

    // required for widget implementation
    isWidgetNode: function(n)
    {
        return WidgetDialog.isWidgetType(n, "etapEntryList");
    },

    setField: function(field)
    {
        initializeFieldSelection(field, "category", "field", "aggregate", "format", "sort", "align", WidgetDialog.data, WidgetDialog.formatters);
        jQuery("#displayName").val(field.name);
    },

    getFirstColumn: function()
    {
        var columns = getChildNodes("entryListColumns", "div");
        return (columns.length > 0) ? columns[0].id : null;
    },

    edit: function(id)
    {
        if( id )
        {
            setClass("#" + EntryList.column, "entryListColumn");

            EntryList.column = id;
            var field = decodeField(jQuery("#" + id + "Value").val());
            EntryList.setField(field);

            setClass("#" + EntryList.column, "entryListEditColumn");
        }
    },

    update: function(id)
    {
        id = arguments.length < 1 ? EntryList.column : id;

        // Only 1 sort column
        if( jQuery("#sort")[0].selectedIndex > 0 )
        {
            jQuery("entryListColumns").find("input").each( function(index) {
                var field = decodeField(jQuery(input).val());
                field.sort = "0";
                jQuery(input).val(encodeField(field));
            });
        }

        // Now set the new values on the current field
        jQuery("#" + id + "Display").html(jQuery("#displayName").val());
        jQuery("#" + id + "Value").val(
            encodeValues(jQuery("#displayName").val(),
                     getSelectValue("category"),
                     getSelectValue("field"),
                     getSelectValue("aggregate"),
                     getSelectValue("format"),
                     getSelectValue("sort"),
                     getSelectValue("align"))
        );
    },

    refreshName: function()
    {
        jQuery('#displayName').val(jQuery('#field')[0].options[jQuery('#field')[0].selectedIndex].text);
    },

    add: function(field)
    {
        if( arguments.length == 0 )
            field = EntryList.defaultField;

        var uid = makeid();   // good enough, shut up
        var html = EntryList.template;
        html = html.replace(/UID/g, uid);
        html = html.replace(/ENCODED/g, encodeField(field));
        html = html.replace(/NAME/g, field.name);

        var div = document.createElement("div");
        jQuery("#entryListColumns")[0].appendChild(div);
        div.id = uid;
        div.innerHTML = html;

        jQuery("#entryListColumns")[0].scrollTop = 300;
        EntryList.edit(uid);
    },

    deleteRow: function(id)
    {
        jQuery("#" + id)[0].parentNode.removeChild(jQuery("#" + id)[0]);
        if( id == EntryList.column )
        {
            EntryList.column = EntryList.getFirstColumn();
            EntryList.edit(EntryList.column);
        }
    },

    moveUp: function(id)
    {
        swapNodes(jQuery("#" + id)[0], jQuery("#" + id)[0].previousSibling);
    },

    moveDown: function(id)
    {
        swapNodes(jQuery("#" + id)[0].nextSibling, jQuery("#" + id)[0]);
    }
};

// ------ Pledge Schedule Widget ---------

var PledgeSchedule =
{
    // required for widget impl
    init: function(editor, node)
    {
    },

    // required for widget impl
    save: function(editor, original, form)
    {
        createMergeNode(editor, original, "", "Pledge Schedule", "etapPledgeSchedule", true);
    },

    // required for widget impl
    isWidgetNode: function(n)
    {
        return WidgetDialog.isWidgetType(n, "etapPledgeSchedule");
    }
};

// ------ Order Details Widget ---------

var OrderDetails =
{
    // required for widget impl
    init: function(editor, node)
    {
        if (node && node.title)
        {
            var options = decodeOptions(node.title);
            setSelectValue(jQuery("#itemQuestions"), options.itemQuestions);
            setSelectValue(jQuery("#generalQuestions"), options.generalQuestions);
        }
    },

    // required for widget impl
    save: function(editor, original, form)
    {
        var encoded = "itemQuestions=" + getSelectValue("itemQuestions") + "|generalQuestions=" + getSelectValue("generalQuestions");
        createMergeNode(editor, original, encoded, "", "etapOrderDetails", true);
    },

    // required for widget impl
    isWidgetNode: function(n)
    {
        return WidgetDialog.isWidgetType(n, "etapOrderDetails");
    }
};

// ------ Agape Gift List Widget ---------

var AgapeGiftList =
{
    // required for widget impl
    init: function(editor, node)
    {
    },

    // required for widget impl
    save: function(editor, original, form)
    {
        createMergeNode(editor, original, "", "Segmented Gift Details List", "etapAgapeGiftList", true);
    },

    // required for widget impl
    isWidgetNode: function(n)
    {
        return WidgetDialog.isWidgetType(n, "etapAgapeGiftList");
    }
};

// ------ Ecommerce Details Widget ---------

var EcommerceDetails =
{
    // required for widget impl
    init: function(editor, node)
    {
    },

    // required for widget impl
    save: function(editor, original, form)
    {
        createMergeNode(editor, original, "", "", "etapEcommerceDetails", true);
    },

    // required for widget impl
    isWidgetNode: function(n)
    {
        return WidgetDialog.isWidgetType(n, "etapEcommerceDetails");
    }
};

// ------ Account Photo Widget ---------

var AccountPhoto =
{
    // required for widget impl
    init: function(editor, node)
    {
    },

    // required for widget impl
    save: function(editor, original, form)
    {
        var html = "<img id='etapAccountPhoto' src='https://content.delivra.com/etapcontent/stockphotos/account-photo-widget.gif' alt='Account Photo'/>";
        editor.execCommand('mceInsertContent', false, html);
    },

    // required for widget impl
    isWidgetNode: function(n)
    {
        // We insert a real img tag in that can then be edited using the normal image properties popup
        return false;
    }
};

// ------ Donor Loyalty Link Widget ---------

var DonorLoyaltyLink =
{
    // required for widget impl
    init: function(editor, node)
    {
    },

    // required for widget impl
    save: function(editor, original, form)
    {
        var db = top.content.tinymce.activeEditor.settings.etap_org_name;
        var dbRoot = db.substr(0, db.indexOf("@"));
        var link = "https://app.etapestry.com/hosted/" + dbRoot + "/dl.html?id=" + "__ACCOUNT_NUMBER__";
        var html = "<a class='hideBody' href='" + link + "'>" + jQuery("#donorLoyaltyLinkName").val() + "</a>";
        editor.execCommand('mceInsertContent', false, html);
    },

    // required for widget impl
    isWidgetNode: function(n)
    {
        // You modify the text in the editor itself
        return false;
    }
};

WidgetDialog.init(top.content.tinymce.activeEditor);
