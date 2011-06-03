Exhibit = {};

Exhibit.History = {
    enabled: false,

    _registeredComponents: [],
    _state: 0,
    _originalTitle: '',
    _total: 0
};

Exhibit.History.init = function() {
    if (typeof History !== "undefined" && History.enabled) {
        Exhibit.History.enabled = true;
        Exhibit.History._originalTitle = document.title;
        Exhibit.History._total = $('.exhibit-collectionSummaryWidget-count').text();

        Exhibit.History.stateListener();
        $(window).bind('statechange', Exhibit.History.stateListener);

        $('.exhibit-facet-header-filterControl').live('click', function(e) {
            History.pushState({state: Exhibit.History._state+1},
                              Exhibit.History._originalTitle,
                              "?"+Exhibit.History._state);
            Exhibit.History._state++;
        });

        $('.exhibit-facet-value a').live('click', function(e) {
            var facet = $(e.target).parents('.exhibit-facet').attr('id');
            var value = $(e.target).parents('.exhibit-facet-value').attr('title');
            var items = Exhibit.History._randomItems($('#'+facet+' div.exhibit-facet-value[title="'+value+'"] .exhibit-facet-value-count').text());
            History.pushState({facet: facet, value: value, items: items, state: Exhibit.History._state+1},
                              Exhibit.History._originalTitle + " {state "+Exhibit.History._state+"}",
                              "?"+Exhibit.History._state);
            Exhibit.History._state++;
            e.preventDefault();
        });
    }
};

Exhibit.History.stateListener = function() {
    var state = History.getState();
    $('a').css('fontWeight', 'normal');
    $('.exhibit-facet-value-checkbox img').hide();
    $('.exhibit-facet-header-filterControl').hide();
    $('.exhibit-facet-header-filterControl span').text('0');
    Exhibit.History._resetItems();
    if (typeof state.data.facet !== "undefined") {
        $('#'+state.data.facet+' div.exhibit-facet-header-filterControl').show();
        $('#'+state.data.facet+' div.exhibit-facet-header-filterControl span').text('1');
        $('#'+state.data.facet+' div.exhibit-facet-value[title="'+state.data.value+'"] a').css('fontWeight', 'bold');
        $('#'+state.data.facet+' .exhibit-facet-value-checkbox img').attr('src', 'http://api.simile.zepheira.com/exhibit/2.2.0/images/no-check.png').show();
        $('#'+state.data.facet+' div.exhibit-facet-value[title="'+state.data.value+'"] .exhibit-facet-value-checkbox img').attr('src', 'http://api.simile.zepheira.com/exhibit/2.2.0/images/black-check.png').show();
    }
    if (typeof state.data.items !== "undefined") {
        Exhibit.History._deselectItems(state.data.items);
    }
};

Exhibit.History._resetItems = function() {
    $('.deselected').removeClass('deselected');
    $('.exhibit-collectionSummaryWidget-count').text(Exhibit.History._total);
};

Exhibit.History._randomItems = function(n) {
    var total = Exhibit.History._total;
    var removeCount = total-n;
    var items = [];
    while (items.length < removeCount) {
        var idx = Math.round(Math.random()*total);
        idx = (idx == total) ? idx-1 : idx;
        if (items.indexOf(idx) == -1) {
            items.push(idx);
        }
    }
    return items;
};

Exhibit.History._deselectItems = function(items) {
    for (var i = 0; i < items.length; i++) {
        $('ol.exhibit-tileView-body li:eq('+i+')').addClass('deselected');
    }
    $('.exhibit-collectionSummaryWidget-count').text(Exhibit.History._total - items.length);
};

$(document).ready(function() {
    Exhibit.History.init();
});
