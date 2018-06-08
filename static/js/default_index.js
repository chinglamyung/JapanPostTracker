// This is the js for the default/index.html view.

var app = function() {

    var self = {};
    Vue.config.silent = false; // show all warnings

    // Extends an array //I'm not sure where this would be useful but it's from HW3 and I don't think I used this func
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    //self.insertion_id = null; // Initialization.

    self.get_login_status = function() {
        $.getJSON(login_status_url, function (data) {
            self.vue.logged_in = data.logged_in;
            if (self.vue.logged_in === true) {
                self.get_checklists();
            }
        })
    }

    self.get_checklists = function () {
        $.getJSON(checklists_url, function (data) {
            self.vue.checklists = data.checklists;
            self.vue.logged_in = data.logged_in;
            self.vue.current_user = data.current_user;
            enumerate(self.vue.checklists);
        })
    };

    self.add_memo_button = function () {
        // The button to add a memo has been pressed.
        self.vue.is_adding_memo = true;
        self.vue.an_entry_is_being_edited = true;
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
                self.vue.an_entry_is_being_edited = false;
                self.get_checklists(); //still 1-page app
                enumerate(self.vue.checklists);
                self.vue.form_title = "";
                self.vue.form_memo = "";
            });
    };
    self.cancel_add_memo = function() {
        self.vue.is_adding_memo = false;
        self.vue.an_entry_is_being_edited = false;
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

    self.start_edit_memo = function(memo_idx) {
        self.vue.an_entry_is_being_edited = true;
        self.vue.checklists[memo_idx].being_edited = true;
        self.vue.form_title_edit = self.vue.checklists[memo_idx].title;
        self.vue.form_memo_edit = self.vue.checklists[memo_idx].memo;
    };

    self.cancel_edit_memo = function(memo_idx) {
        self.vue.checklists[memo_idx].being_edited = false;
        self.vue.an_entry_is_being_edited = false;
    };

    self.save_edit_memo = function(memo_idx) {
        $.post(edit_memo_url,
            {
                memo_id: self.vue.checklists[memo_idx].id,
                title: self.vue.form_title_edit,
                memo: self.vue.form_memo_edit
            },
            function (data) {
                self.vue.checklists[memo_idx].being_edited = false;
                self.vue.an_entry_is_being_edited = false;
                self.get_checklists(); //still 1-page app
            });
    };

    self.get_tracking_progress_JP = function(memo_idx) {
        $.getJSON(query_japan_post_url,
            { // arguments to the server API
                tracking_num: self.vue.checklists[memo_idx].memo
            },
            function(data) { //handler function for when server API returns
                self.vue.checklists[memo_idx].info_japan_post = data.resp_body;
            }
        )
    };

    self.check_JP = function(memo_idx) {
        $.getJSON(check_JP_url,
            { tracking_num: self.vue.checklists[memo_idx].memo },
            function(data) {
                var url1 = "https://trackings.post.japanpost.jp/services/srv/search/direct?locale=en&reqCodeNo1=";
                var url2 = data.tracking_num_string;
                var url3 = url1.concat(url2); 
                window.open(url3, '_blank');
            }
        )
    };

    self.check_USPS = function(memo_idx) {
        $.getJSON(check_USPS_url,
            { tracking_num: self.vue.checklists[memo_idx].memo },
            function(data) {
                var url1 = "https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=" 
                var url2 = data.tracking_num_string;
                var url3 = url1.concat(url2); 
                window.open(url3, '_blank');
            }
        )
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            logged_in: false,
            current_user: null,  //for discerning between public memos that are editable.
            is_adding_memo: false,
            form_title: null,
            form_memo: null,
            form_title_edit: null,
            form_memo_edit: null,
            checklists: [],
            checklist: null,
            an_entry_is_being_edited: false
        },
        methods: {
            get_login_status: self.get_login_status,
            get_checklists: self.get_checklists,
            add_memo_button: self.add_memo_button,
            add_memo: self.add_memo,
            cancel_add_memo: self.cancel_add_memo,
            delete_memo: self.delete_memo,
            start_edit_memo: self.start_edit_memo,
            cancel_edit_memo: self.cancel_edit_memo,
            save_edit_memo: self.save_edit_memo,

            get_tracking_progress_JP: self.get_tracking_progress_JP,
            check_JP: self.check_JP,
            check_USPS: self.check_USPS,
        }
    });



    self.get_login_status();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
