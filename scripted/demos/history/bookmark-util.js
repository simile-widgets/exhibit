Exhibit.Bookmark = {
    _id: "exhibit-bookmark-display"
};

Exhibit.Bookmark.generateBookmarkHash = function(state) {
    if (typeof state.data.state === "undefined") {
        return "";
    }
    return Base64.encode(JSON.stringify(state)).replace(/\//g, '|');
};

Exhibit.Bookmark.interpretBookmarkHash = function(hash) {
    return JSON.parse(Base64.decode(hash.replace(/\|/g, '/')));
};

Exhibit.Bookmark.generateBookmark = function() {
    var hash = Exhibit.Bookmark.generateBookmarkHash(History.getState());
    return document.location.href + ((hash === "") ? "": "#" + hash);
};

Exhibit.Bookmark.implementBookmark = function(state) {
    History.replaceState(state.data, state.title, state.url);
};

Exhibit.Bookmark.showBookmark = function() {
    $('#'+Exhibit.Bookmark._id+' input').val(Exhibit.Bookmark.generateBookmark()).focus(function(){this.select()});
    $('#'+Exhibit.Bookmark._id).toggle();
};

Exhibit.Bookmark.init = function() {
    $('#exhibit-bookmark').live('click', Exhibit.Bookmark.showBookmark);
    if (document.location.hash.length > 0) {
        Exhibit.Bookmark.implementBookmark(Exhibit.Bookmark.interpretBookmarkHash(document.location.hash.substr(1)));
    }
};

$(document).ready(function() {
    Exhibit.Bookmark.init();
});
