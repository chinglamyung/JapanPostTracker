// This is the js for the default/index.html view.

var app = function() {

    var self = {};
    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    //self.insertion_id = null; // Initialization.

    function get_checklists_url() {
        return checklists_url;
    }

    self.get_checklists = function () {
        $.getJSON(get_checklists_url(), function (data) {
            self.vue.checklists = data.checklists;
            self.vue.logged_in = data.logged_in;
            self.vue.current_user = data.current_user;
            enumerate(self.vue.checklists);
        })
    };

    self.get_checklists_public = function() {
        $.getJSON(checklists_public_url, function (data) {
            self.vue.checklists = data.checklists;
            enumerate(self.vue.checklists);
        })
    }

    self.add_memo_button = function () {
        // The button to add a memo has been pressed.
        self.vue.is_adding_memo = true;
    };
    self.add_memo = function () {
        // Submits the memo info.
        $.post(add_memo_url,
            {
                title: self.vue.form_title,
                memo: self.vue.form_memo
            },
            function (data) {
                self.vue.is_adding_memo = false;
                self.get_checklists(); //still 1-page app
                enumerate(self.vue.checklists);
                self.vue.form_title = "";
                self.vue.form_memo = "";
            });
    };
    self.cancel_add_memo = function() {
        self.vue.is_adding_memo = false;
        //$.post(cleanup_url); // Cleans up any incomplete uploads.
    };

    self.delete_memo = function(memo_idx) {

        $.post(del_memo_url,
            { memo_id: self.vue.checklists[memo_idx].id },
            function () {
                self.vue.checklists.splice(memo_idx, 1);
                enumerate(self.vue.checklists);
            }
        )
    };

    self.toggle_memo = function(memo_idx) {

        $.post(toggle_memo_url,
            { memo_id: self.vue.checklists[memo_idx].id },
            function () {
                self.vue.checklists[memo_idx].is_public = !(self.vue.checklists[memo_idx].is_public);
            }
        )
    };

    self.start_edit_memo = function(memo_idx) {
        self.vue.checklists[memo_idx].being_edited = true;
        self.vue.form_title_edit = self.vue.checklists[memo_idx].title;
        self.vue.form_memo_edit = self.vue.checklists[memo_idx].memo;
    }

    self.cancel_edit_memo = function(memo_idx) {
        self.vue.checklists[memo_idx].being_edited = false;
    }

    self.save_edit_memo = function(memo_idx) {
        $.post(edit_memo_url,
            {
                memo_id: self.vue.checklists[memo_idx].id,
                title: self.vue.form_title_edit,
                memo: self.vue.form_memo_edit
            },
            function (data) {
                self.vue.checklists[memo_idx].being_edited = false;
                self.get_checklists(); //still 1-page app
            });

    }


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            logged_in: false,
            current_user: null,
            is_adding_memo: false,
            form_title: null,
            form_memo: null,
            form_title_edit: null,
            form_memo_edit: null,
            checklists: [],
            checklist: null

        },
        methods: {
            get_checklists_public: self.get_checklists_public(),
            add_memo_button: self.add_memo_button,
            add_memo: self.add_memo,
            cancel_add_memo: self.cancel_add_memo,
            add_memo_url: self.add_memo_url,
            delete_memo: self.delete_memo,
            toggle_memo: self.toggle_memo,
            start_edit_memo: self.start_edit_memo,
            cancel_edit_memo: self.cancel_edit_memo,
            save_edit_memo: self.save_edit_memo
        }
    });


    self.get_checklists();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
