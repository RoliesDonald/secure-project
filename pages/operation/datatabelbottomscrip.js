
    $(document).ready(function () {
        oTable = $('#listTable').dataTable(dtDefault).addClass('table-striped table-bordered');

        $("div.dataTables_filter input").unbind();

        $("#listTable_filter")
   .prependTo("#divSearchInput");

        // $(".dataTables_filter :input").after(" &nbsp; <button id='btnsearch' class='btn btn-default'>Search</button>");
        $("#divSearchButton").html(" &nbsp; <button id='btnsearch' class='btn btn-default'>Search</button> &nbsp; <button id='btnReset' class='btn btn-default'>Reset</button>");



        $('#listTable_filter').bind('keyup', function (e) {
            if (e.keyCode == 13) {
                oTable.fnFilter($("div.dataTables_filter input").val());
            }
        });

        $('#txtDtFrom,#txtDtTo').datetimepicker({
            timepicker: false,
            format: 'Y-m-d',
            formatDate: 'Y-m-d',
            closeOnDateSelect: true
        });

        $("#ASSIGNMENTID").width('175');

        $('#btnsearch').click(function () {

            if (validSubmit()) {
                return false;
            }


            var fDate = $('#txtDtFrom').val();
            var tDate = $('#txtDtTo').val();

            var d1 = new Date(fDate)
            var d2 = new Date(tDate)

            if (d2 < d1) {
                $('#txtDtTo').select().focus();

                alert('Date To is earlier than Date From');
                return false;
            }

            oTable.fnFilter($("div.dataTables_filter input").val());
        });

        $('#btnReset').click(function () {

            if (validSubmit()) {
                return false;
            }

            $("div.dataTables_filter input").val('');
            $("#txtDtFrom").val('');
            $("#txtDtTo").val('');
            $("#ASSIGNMENTID").empty();
            $("#CUSTOMERID").val('');
            oTable.fnFilter('');
        });

        $('#CUSTOMERID').on('change', function () {
            var id = $(this).val();
            populateassignment(id);
        });


    });

    function validSubmit() {
        var bValid = false;

        if (($("div.dataTables_filter input").val() == '') &&
            ($("#txtDtFrom").val() == '') &&
            ($("#txtDtTo").val() == '') &&
        ($("#ASSIGNMENTID option:selected").text() == '') &&
        ($("#CUSTOMERID option:selected").text() == '')) {

            bValid = true;
        }
        return bValid;
    }

    function populateassignment(customerid) {
        var myUrl = '/AndroidUAT/PatrolTours';
        if (customerid) {
            $.ajax({
                url: myUrl + '/GetAssignment/',
                data: { 'custId': customerid },
                datatype: "json",
                beforeSend: function () {
                    $('#ASSIGNMENTID').hide();
                    $("#imgAssignment").show();
                },
                complete: function () {
                    $('#ASSIGNMENTID').show();
                    $("#imgAssignment").hide();
                },
                success: function (data) {
                    var objects = JSON.parse(data);
                    if (objects.length >= 0) {
                        $('#ASSIGNMENTID').find('option').remove();
                        $.each(objects, function (i, item) {
                            $('#ASSIGNMENTID').append('<option value="' + item.ID + '">' + item.NAME + '</option>');
                        });
                        $('#ASSIGNMENTID').prepend("<option value='' selected='selected'></option>");
                    } else {
                        $('#ASSIGNMENTID').find('option').remove()
                            .append('<option value="">NO DATA</option>');
                    }
                },
                error: function (result) {
                    $('<div>' + result.status + ' ' + result.statusText + '</div>')
                        .dialog({ resizable: false, title: 'Alert', modal: true, buttons: { "Close": function () { $(this).dialog("close"); } } }).dialog("open");
                }
            })
        }
    }


    $(document).on('click', '.toggleSuspend', function () {
        var id = $(this).data("id");
        var t = $(this);

        dlgConfirm('Confirm Toggle?', function () {
            $.ajax(
               {
                   url: '/AndroidUAT/Schedules/toggleSuspend',
                   data: { 'ID': id },
                   datatype: "json",
                   async: false,
                   beforeSend: function () {
                       $(this).text('');
                       $(this).siblings().show();
                   },
                   complete: function () {
                       $(this).siblings().hide();
                   },
                   success: function (data) {
                       if (data == "1") {
                           if (t.text() == "YES") {
                               t.text("NO");
                           } else {
                               t.text("YES")
                           }
                       }
                   },
                   error: function (result) {
                       $('<div>' + result.status + ' ' + result.statusText + '</div>')
                           .dialog({ resizable: false, title: 'Alert', modal: true, buttons: { "Close": function () { $(this).dialog("close"); } } }).dialog("open");
                   }
               })
        });
    });


    function dlgConfirm(msg, callback) {
        $('<div>' + msg + '</div>')
            .dialog({
                resizable: false, title: 'Confirmation', modal: true,
                buttons: {
                    "YES": function () {
                        callback.apply();
                        $(this).dialog("close");
                    },
                    "NO": function () {
                        $(this).dialog("close");
                    }
                }
            }).dialog("open");
    }

    var ajxUrl = '/AndroidUAT/Schedules/AjaxHandler';
    var dtDefault = {
        "bProcessing": true,
        language: {
            "oLanguage": {
                "sLoadingRecords": "Please wait - loading records...",
                "sZeroRecords": "No records returned by application.",
                "sProcessing": "Processing...",
                "sInfoEmpty": "No entries to display.",
                "sEmptyTable": "No records to display"
            },
            "emptyTable": "No data available.",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries",
            "infoEmpty": "Showing 0 to 0 of 0 entries",
            "infoFiltered": "(filtered from _MAX_ total entries)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Show _MENU_ entries",
            "search": "Employee Name : ",
            "zeroRecords": "No matching records found",
            "paginate": {
                "first": "First",
                "last": "Last",
                "next": "Next",
                "previous": "Previous"
            },
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            }
        },
        "bServerSide": true,
        "sAjaxSource": ajxUrl,
        "fnServerParams": function (aoData) {
            aoData.push({ "name": "dtfrom", "value": $("#txtDtFrom").val() },
                            { "name": "dtto", "value": $("#txtDtTo").val() },
                            { "name": "assid", "value": $("#ASSIGNMENTID option:selected").text() },
                            { "name": "cusid", "value": $("#CUSTOMERID option:selected").text() }
                             );
        },
        "aaSorting": [[1, 'desc']],
        "fnInitComplete": function () {
            $("#loadingdata").hide();
            // $('#listTable').show();
        },
        "aoColumnDefs": [
           {
               "aTargets": [9],
               "mData": null,
               "bSortable": false,
               "mRender": function (data, type, full) {
                   return "<a href='Schedules/Edit/"
                           + full[9] + "'>Edit</a> | <a href='Schedules/Details/"
                           + full[9] + "'>Detail</a>";
               }
           },
            {
                "aTargets": [8],
                "mRender": function (data, type, full) {
                    return GetSuspend(full[8]);
                }
            },
            {
                "aTargets": [1],
                "sType": 'date',
                "mRender": function (data, type, full) {
                    if (data != '') {

                        return (moment(data).format("YYYY-MM-DD"));
                    } else {

                        return "";
                    }
                }
            }, { "bSearchable": false, "aTargets": [1, 2, 3, 4, 0, 6, 7, 8] }

        ]



    }

    function GetSuspend(s) {
        switch (s) {
            case "0":
                return "NO";
                break;  // Always break each case
            case "1":
                return "YES";
                break;
            default:
                return "";
                break;
        }
    }
