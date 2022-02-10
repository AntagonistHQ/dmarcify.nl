var app = new Vue({
    el: '#app',
    data: {
        p: 'quarantine',
        sp: 'same',
        pct: 100,
        aspf: 'r',
        adkim: 'r',
        reporting_domain: '',
        rua: '',
        ri: '86400',
        ruf: '',
        fo: ['0'],
        rf: ['afrf'],
        dmarc: '"v=DMARC1; p=quarantine"',
        lang: (Cookies.get('lang') || 'nl'),
        text: {},
        help: 'overview',
    },
    methods: {
        translate: function(lang) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/static/js/lang/' + lang + '.json', true);
            xhr.responseType = 'json';

            var _this = this;

            xhr.onload = function() {
                if (xhr.status != 200) {
                    console.error('Could not get translation file');
                    return
                }

                _this.text = xhr.response;
            };

            xhr.send();

            Cookies.set('lang', lang);
        },
        copy: function(event) {
            navigator.clipboard.writeText(this.dmarc)
                .then(() => {
                    UIkit.notification({
                        message: this.text.copied,
                        status: 'primary',
                        pos: 'top-right',
                        timeout: 5000
                    });
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
        },
        update: function(event) {
            var record = 'v=DMARC1';

            /* Policy (REQUIRED) */
            record += '; p=' + this.p;

            /* Subdomain Policy */
            if (this.sp !== 'same' && this.sp != this.p) {
                record += '; sp=' + this.sp;
            }

            /* Percentage */
            if (this.pct != 100) {
                record += '; pct=' + this.pct;
            }

            /* SPF alignment */
            if (this.aspf !== 'r') {
                record += '; aspf=' + this.aspf;
            }

            /* DKIM alignment */
            if (this.adkim !== 'r') {
                record += '; adkim=' + this.adkim;
            }

            /* Aggregate reports */
            if (this.rua !== '') {
                record += '; rua=mailto:' + this.rua;

                if (this.ri !== '86400') {
                    record += '; ri=' + this.ri;
                }
            }

            /* Forensic reports */
            if (this.ruf !== '') {
                record += '; ruf=mailto:' + this.ruf;

                this.fo.sort();
                var fo = this.fo.join(':');

                if (fo !== '0' && this.fo.length > 0) {
                    record += '; fo=' + this.fo.join(':');
                }

                this.rf.sort();
                var rf = this.rf.join(',');
                if (rf !== 'afrf' && this.rf.length > 0) {
                    record += '; rf=' + this.rf.join(',');
                }
            }

            this.dmarc = '"' + record + '"';
        },
        showHelp: function(help) {
            this.help = help;
        },
        update_reporting_domain: function(value) {
            var match = /@(.+)$/.exec(value);
            if (match) {
                this.reporting_domain = match[1];
            }
        },
    },
    mounted: function() {
        this.translate(this.lang);
    },
    watch: {
        ruf: 'update_reporting_domain',
        rua: 'update_reporting_domain',
    },
})
