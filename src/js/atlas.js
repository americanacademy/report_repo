// CONSTANTS
// *****************************************************************************

var tTableStartPerformance = performance.now();

const table = $('#orgs');
// const tableCols = [
//     "Organizations",
//     // "Organization",
//     "State",
//     "Collaborations",
// ];
const tableCols = [
    "organization_name",
    "state",
    "collaboration_links", //collaboration_name", 
    "organization_category" //Organization type
];

const tableColumnTitles = [
    "Organizations",
    "State",
    "Participation in Collaboration",
    "Organization Type"
];

_data = {};

// INIT ******************************************
getFirebaseOrganizationData();
createTableHeader();

// SEARCH TEXT BOX CHANGE
$(".filter").keypress(function(e) {
    if (e.which == 13) {
        refreshTableData($(this).val());
    }
});

function hydrateView() {
    console.log('hydrateView');
    loadSearchFilters();
    refreshTableData('');
}

function getSelectedTableFilters() {
    console.log('getSelectedTableFilters');
    var filters = [];
    for (var index in tableCols) {
        var selectedValues = $('select#' + tableCols[index]).val();
        if (selectedValues && selectedValues.length > 0) {
            filters[index] = selectedValues;
        }
    }
    return filters;
}


function filterData(filters) {
    console.log('filterData');
    var filteredRecords = {};

    if (filters) {
        for (var key in _data) {
            var row = _data[key];
            // Check filters
            var addToDisplay = true;
            for (var i in filters) {

                if (filters[i] && filters[i].length > 0) {
                    var result = (filters[i].includes(row[tableCols[i]]) || row[tableCols[i]].includes(filters[i]));
                    if (tableCols[i] == 'organization_category' && row[tableCols[i]].includes('Ngo')) {
                    	var result = (filters[i].includes(row['nonprofit_status']));
                    }
                    if (result === false) {
                        addToDisplay = false;
                        break;
                    }
                }
            }
            if (addToDisplay) {
                filteredRecords[key] = row;
            }
        }
    }
    return filteredRecords;
}
// LOAD TABLE
// *****************************************************************************
function refreshTableData(query) {
    console.log('refreshTableData');
    // note: query param was never used! TODO?
    // Filter data on query, show first 10.

    $("tbody tr").remove();
    // createTableHeaders();

    var filters = getSelectedTableFilters();
    var recordsToDisplay = filterData(filters);

    createTableBody(recordsToDisplay);

    // var rows = document.getElementsByTagName("tr").length;
    // var msg = ' entries';
    // if(rows === 1) {
    //     msg = ' entry';
    // }
    // $('#row-count').html(rows + msg);

    jQuery(document).ready(function($) {

        var tEnd = performance.now();
        console.log("from start to ready took " + (tEnd - tTableStartPerformance) + " milliseconds.")

        // $("tr").click(function() {
        //     console.log($(this).attr('id'));
        //     window.location = "http://www.sciencepolicyatlas.com/organization?org=" + $(this).attr('id');
        // });
    });
}

function getRecord(name) {
    console.log('getRecord');
    var ref = new Firebase('https://atlas-new-format.firebaseio.com/organizations');

    ref.orderByChild('organization_name').startAt(name).endAt(name).once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {

            var key = childSnapshot.key();
            var data = childSnapshot.val();

            console.log(data);
            var v = "http://www.sciencepolicyatlas.com/organization?org=" + key;;
            console.log(v);
            if (data) {
                window.location = "http://www.sciencepolicyatlas.com/organization?org=" + key;
            }
        });
    });
    return;

    // $.ajax({
    //     type: "GET",
    //     dataType: "jsonp",
    //     data: JSON.stringify(name),
    //     url: "https://atlas-new-format.firebaseio.com/organizations/.json?",
    // https://atlas-organizations.firebaseio.com/.json",
    // ?orderBy=\"organizations\"",
    //     success: function(data) {
    //         if(data) {
    //             window.location = "http://www.sciencepolicyatlas.com/organization?org=" + data;
    //         }
    //        // hydrateView();

    //     }
    // });
}

function createTableBody(list) {
    console.log('createTableBody');
    // Add the header first
    //  console.log(list);
    var count = 0;
    for (var pos in list) {
        table.find('tbody:last').append(createTableRow(pos, list[pos]));
        ++count;
    }
    var msg = ' entries';
    if(count === 1) {
        msg = ' entry';
    }
    $('#row-count').html(count + msg);  
}

function createTableRow(id, org) {
    console.log('createTableRow');

    var string = "<tr id='" + id + "'>";
    for (var i in tableCols) {
        var column = tableCols[i];

        string += "<td class=" + column + ">";
        if (column == "collaboration_links") { //collaboration_name") {
            var collabs = org.collaboration_links ? org.collaboration_links.split("||") : ""; //col].split(", ");

            for (var i in collabs) {

                var collab = collabs[i];

                var collab_key = collab ? collab.split(" | ") : "";
                for (kv in collab_key) {

                    if (i > 0) {
                        string += ", ";
                    }
                    var k = collab_key[1];
                    var name = collab_key[0];
                    k = k.trim();
                    name = name.trim();
                    // console.log(k);
                    // console.log(name);
                    string += "<a target=\"_top\" href=\"http://www.sciencepolicyatlas.com/collaboration?collab=" + k + "\">" + name + "</a>";
                    break;
                }
                //if (i > 0) {
                //   string += ", ";
                //}
                //var collab = collabs[i];
                //string += "<a href=\"http://www.sciencepolicyatlas.com/collaboration?collab=" + collab + "\">" + collab + "</a>";
            }
        } else if (column == 'organization_name') {
            string += "<a target=\"_top\" href=\"http://www.sciencepolicyatlas.com/organization?org=" + id + "\">" + org[column] + "</a>";
        }
        // if(col == "Organizations") {
        //     string += org.organization_name ? org.organization_name : 'empty';
        // } 
        // if(col == "State") {
        //     string += org.state ? org.state : 'empty';
        // }
        else if (column == 'organization_category' && org[column] == 'Ngo') {
            string += org['nonprofit_status']
        }
        else {
            string += org[column];
        }
        string += "</td>\n";
    }
    return string;
}

function createTableHeader() {
    console.log('createTableHeader');
    var string = "<tr>";
    for (var i = 0; i < tableColumnTitles.length; i++) {
        string += "<th>" + tableColumnTitles[i] + "</th>";
    }
    string += "</tr>";
    table.find('thead').append(string);
}

function getsessionStorage() {
    var d = sessionStorage.getItem('data');
    var data = JSON.parse(d);
    return data;
}

function setsessionStorage(data) {
    if (data) {
        var dataToStore = JSON.stringify(data);
        sessionStorage.setItem('data', dataToStore);
    }
}

function getFirebaseOrganizationData() {
    var tTableStartPerformance = performance.now();
    var sData = getsessionStorage();
    if (sData) {
        _data = sData;
        hydrateView();

        var pn = performance.now();
        console.log("hydrateView using session data took " + (pn - tTableStartPerformance) + " milliseconds.")
        return;
    }

    console.log('getFirebaseOrganizationData');
    $.ajax({
        type: "GET",
        dataType: "jsonp",
        url: "https://atlas-new-format.firebaseio.com/organizations/.json",
        success: function(data) {
            _data = data;
            var tEnd = performance.now();
            console.log("getFirebaseOrganizationData took " + (tEnd - tTableStartPerformance) + " milliseconds.")
            hydrateView();
            var tEnd2 = performance.now();
            console.log("hydrateView took " + (tEnd2 - tEnd) + " milliseconds.")
            setsessionStorage(_data);
        }
    });
}

// LOAD TABLE
// *****************************************************************************
function loadSearchFilters() {
    console.log('loadSearchFilters');
    for (var i in tableCols) {
        createFilterFor(tableCols[i]);
    }
    $(".chosen-select").chosen().change(function(evt, params) {
        refreshTableData($(".filter").val());
    });
}

function asc(s1, s2) {
    var s1lower = s1.toLowerCase();
    var s2lower = s2.toLowerCase();
    return s1lower > s2lower ? 1 : (s1lower < s2lower ? -1 : 0);
}

function desc(s1, s2) {
    var s1lower = s1.toLowerCase();
    var s2lower = s2.toLowerCase();
    return s1lower < s2lower ? 1 : (s1lower > s2lower ? -1 : 0);
}



function sortIt(dropdownkey) {
    var id = '#' + dropdownkey;
    var theOptions = $(id + " option");
    if (theOptions.length > 0) {

        // var my_options = $("#my-dropdown option");
        theOptions.sort(function(a, b) {
            if (a.text > b.text) return 1;
            else if (a.text < b.text) return -1;
            else return 0
        })
        $(id).empty(); //.append(theOptions);
        $(id).chosen({ no_results_text: "No results matched" });

        //  var o = $(id).hasClass('asc') ? 'desc' : 'asc';
        //  $(id).removeClass('asc').removeClass('desc');
        //  $(id).addClass(o);
        //  var asc = o === 'asc';

        //     theOptions.sort(function(a,b) {
        //     var aa = a.text;
        //     var bb = b.text;
        //     var alower = aa.toLowerCase();
        //     var blower = bb.toLowerCase();

        //     if(asc) {
        //         return alower > blower? 1 : (alower < blower? -1 : 0);
        //     } else {
        //         return alower < blower? 1 : (alower > blower? -1 : 0);
        //     }
        // });

        // $(id).empty();
        // var string = '';//<select id="' + dropdownkey + '" class="chosen-select" multiple="' + theOptions.length + '">';
        //  for (var i = 0; i < theOptions.length; i++) {
        //    string += '<option value="' + theOptions[i] + '">' + theOptions[i] + '</option>';
        // }
        // string += '</select>';
        //$(id).append(string);
    }
}

function createFilterFor(key) {
    console.log('createFilterFor');
    var options = [];
    for (var org in _data) {

        // multiple collaborations on one line comma delimited
        var values = _data[org][key] ? _data[org][key].split(", ") : "";

        if (values.length > 0) {
            for (var n in values) {
                var value = values[n];
                value = value.trim();

                // collaborations have a key, don't display it
                if (value.indexOf('|') > -1) {
                    value = value.substr(0, value.indexOf('|'));
                }
                // already in filter?
                if ($.inArray(value, options) === -1) {
                    options.push(value);
                }
            }
        }
    }
    // 
    if (key === 'organization_category') {
       	//options.remove('Ngo');
       	options.push('501(c)(3)', '501(c)(4)', '501(c)(5)', '501(c)(6)');
    }
    if (key === 'collaboration_links') {
        options.sort(desc);
    } else {
        options.sort(asc);
    }

    // var string = '<button onclick="sortIt(\'' + key + '\')">sort</button><select id="' + key + '" class="chosen-select" multiple="' + options.length + '">'; 
    var string = '<select id="' + key + '" class="chosen-select" multiple="' + options.length + '">';
    if (key === 'organization_category') {
        string = '<select id="' + key + '" class="chosen-select" multiple="' + options.length + '" data-placeholder="Organization type">';
    }
    for (var i = 0; i < options.length; i++) {
    	if (options[i] === 'Ngo') {
    	} else {
        string += '<option value="' + options[i] + '">' + options[i] + '</option>';
    	}
    }
    string += '</select>';
    $("#options").append(string);

    var l = key.indexOf('_') > -1 ? key.indexOf('_') : key.length;
    var placeHolder = key.substr(0, l);

    placeHolder = placeHolder.charAt(0).toUpperCase() + placeHolder.substr(1);

    $("#" + key).chosen({
        max_selected_options: 5,
        no_results_text: "Oops, nothing found!",
        width: "90%",
        allow_single_deselect: true,
        placeholder_text_multiple: placeHolder,
    });

    $("#organization_category option[value='Ngo']").remove();

}
