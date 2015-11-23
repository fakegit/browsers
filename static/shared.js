var sparkline = undefined;
var sparkline_url = undefined;
var sparkline_loading = false;


// Dropdowns
$(function() {

    // Shared
    $(".menu-selector-close").click(function(e) {
        hide_menu();
    });

    $(document).click(function(e){
        hide_menu();
    });

    $(".selector-menu").click(function(e){
        e.stopPropagation();
    });

    $(".drop-skip").click(function(e){
        e.stopPropagation();
    });

    function hide_menu()
    {
        $(".selector-menu").hide();
        $(".dropdown").removeClass("dropdown-shown");
    }

    // Browser
    $("#browser-dropdown").click(function(e) {
        if (!$(".selector-menu").is(":visible")) {
            show_browser_menu();
        } else {
            hide_menu();
        }
        e.stopPropagation();
    });

    $("#browser-selector td:not(:empty)").click(function(e) {
        $("#browser-selector td").removeClass("selected");
        $(this).addClass("selected");

        var tr = $(this).parent();
        var browserTH;
        do {
            browserTH = tr.find("th");
            tr = tr.prev();
        } while (tr && !browserTH.length);

        var platform = $("#browser-selector thead").find("th").eq($(this).index());

        $("#browser-text").text(browserTH.text() + " on " + platform.text());
        $("#browser-icon").attr("src", $(this).find("img").attr("src"));
        $("#browser-label").text($(this).find("label").text());

        hide_menu();
        
        coll = $(this).attr("data-path");
        $("#browser-input").val(coll).trigger("change");
        
        //$("#about-link").text("about " + browserTH.text());
        $("#about-link").attr("href", $(this).attr("data-about-url"));
        $(".about-browser").show();
    });

    function show_browser_menu()
    {
        $("#browser-selector").show();
        $("#browser-dropdown").addClass("dropdown-shown");

        var pos = $("#browser-dropdown").offset();
        pos.top += $("#browser-dropdown").outerHeight();
        $("#browser-selector").offset(pos);
    }

    // Datetime
    $("#datetime-dropdown").click(function(e) {
        if (!$(".selector-menu").is(":visible")) {
            show_datetime_menu();
        } else {
            hide_menu();
        }
        e.stopPropagation();
    });

    function show_datetime_menu()
    {
        $("#datetime-selector").show();
        $("#datetime-dropdown").addClass("dropdown-shown");

        var pos = $("#datetime-dropdown").offset();
        pos.top += $("#datetime-dropdown").outerHeight();
        $("#datetime-selector").offset(pos);
        
        if (url) {
            load_timemap(url);
        } else {
            $("#datetime-info").text("Enter url above to see archive overview");
        }
    }

    var pad = "10000101000000";

    function parse_ts(ts)
    {
        ts = ts.substr(0, 14);
        ts += pad.substr(ts.length);
        set_ts(ts);
    }

    function set_ts(ts)
    {
        curr_ts = ts;

        var formatted = ts.substr(0, 4) + "-" + 
            ts.substr(4, 2) + "-" + 
            ts.substr(6, 2) + " " +
            ts.substr(8, 2) + ":" + 
            ts.substr(10, 2) + ":" +
            ts.substr(12, 2);

        $("#datetime").val(formatted);
    }

    $("#datetime").blur(function() {
        var value = $("#datetime").val();
        value = value.replace(/[^\d]/g, '');
        parse_ts(value);
        if (sparkline) {
            sparkline.move_selected($("#datetime").val());
        }
    });

    function set_dt(date)
    {
        var date_time = date.toISOString().slice(0, -5).replace("T", " ")
        $("#datetime").val(date_time);
        var ts = date_time.replace(/[^\d]/g, '');
        curr_ts = ts;
    }

    function load_timemap(url) {
        if (url == sparkline_url || sparkline_loading) {
            return;
        }
        
        var jsonUrl = "http://" + window.location.hostname + ":1208/timemap/json/" + url;
        
        sparkline_loading = true;
        $("#datetime-info").text("Loading archived overview...");

        $.getJSON(jsonUrl, function(data) {
            sparkline = new Sparkline("#spark", data, {width: 200, 
                                                       height: 400, 
                                                       thickness: 6,
                                                       swapXY: true, 
                                                       onclick: set_dt});

            sparkline.add_marker("curr-dt", "curr-dt-marker", "tooltip");
            sparkline_url = url;
            $("#datetime-info").text("Archived copies by date:");
        }).fail(function(e) {
            console.log(e);
            $("#datetime-info").text("Sorry, couldn't load archive overview");
        }).complete(function(e) {
            sparkline_loading = false;
        });
    }
    
    // On Init
    
    if (coll) {
        var browser = $("#browser-selector td[data-path='" + coll + "']");
        browser.addClass("selected");
        $("#about-link").attr("href", browser.attr("data-about-url"));
        $(".about-browser").show();
    }

    if (url) {
        load_timemap(url);
    }

    if (curr_ts) {
        parse_ts(curr_ts);
    } else {
        set_dt(new Date());
    }
});