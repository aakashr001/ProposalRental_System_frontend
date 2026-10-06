sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend(
        "proposalrental.controller.proposalrental",
        {

            onInit: function () {

                this._selectedProposal = null;
                this._allProposals = [];

                var oViewModel = new JSONModel({
                    proposals: []
                });

                this.getView().setModel(
                    oViewModel,
                    "view"
                );

                this._loadProposals();
            },


        // Load proposals

            _loadProposals: async function () {

                var oModel =
                    this.getOwnerComponent().getModel();

                if (!oModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;
                }

                try {

                    var oListBinding =
                        oModel.bindList("/Proposals");

                    var aContexts =
                        await oListBinding.requestContexts(
                            0,
                            1000
                        );

                    this._allProposals =
                        aContexts.map(
                            function (oContext) {
                                return oContext.getObject();
                            }
                        );

                    this._applyFilter(false);

                } catch (oError) {

                    console.error(
                        "Failed to load proposals:",
                        oError
                    );

                    MessageBox.error(
                        this._getErrorMessage(oError)
                    );
                }
            },


            // Apply filter

            onApplyFilters: function () {

                this._applyFilter(true);
            },


            _applyFilter: function (bShowMessage) {

                var oDateRange =
                    this.getView().byId("dateRange");

                if (!oDateRange) {
                    return;
                }

                var oStartDate =
                    oDateRange.getDateValue();

                var oEndDate =
                    oDateRange.getSecondDateValue();


            // Only approved proposal status

                var aFilteredProposals =
                    this._allProposals.filter(
                        function (oProposal) {

                            var sStatus =
                                String(
                                    oProposal.proposalStatus ||
                                    oProposal.ProposalStatus ||
                                    oProposal.status ||
                                    ""
                                ).trim();

                            return (
                                sStatus.toLowerCase() ===
                                "approved"
                            );
                        }
                    );


                //Date Filter

                if (
                    oStartDate &&
                    oEndDate
                ) {

                    var sStartDate =
                        this._getDateString(
                            oStartDate
                        );

                    var sEndDate =
                        this._getDateString(
                            oEndDate
                        );

                    aFilteredProposals =
                        aFilteredProposals.filter(
                            function (oProposal) {

                                var sProposalDate =
                                    this._getDateString(
                                        oProposal.proposalDate
                                    );

                                return (
                                    sProposalDate >= sStartDate &&
                                    sProposalDate <= sEndDate
                                );
                            }.bind(this)
                        );
                }


                // Update UI

                this.getView()
                    .getModel("view")
                    .setProperty(
                        "/proposals",
                        aFilteredProposals
                    );


                // Clear previous selection

                var oTable =
                    this.getView().byId(
                        "proposalTable"
                    );

                if (oTable) {
                    oTable.removeSelections(true);
                }

                this._selectedProposal = null;


                // Disable button

                var oManageButton =
                    this.getView().byId(
                        "manageRentalButton"
                    );

                if (oManageButton) {
                    oManageButton.setEnabled(false);
                }


                if (!bShowMessage) {
                    return;
                }


                if (
                    oStartDate &&
                    oEndDate
                ) {

                    MessageToast.show(
                        aFilteredProposals.length +
                        " approved proposal(s) found."
                    );

                } else {

                    MessageToast.show(
                        "All approved proposals shown."
                    );
                }
            },


            // Date format

            _getDateString: function (vDate) {

                if (!vDate) {
                    return "";
                }


                if (
                    typeof vDate === "string"
                ) {

                    return vDate.substring(
                        0,
                        10
                    );
                }


                if (
                    vDate instanceof Date
                ) {

                    var iYear =
                        vDate.getFullYear();

                    var iMonth =
                        String(
                            vDate.getMonth() + 1
                        ).padStart(
                            2,
                            "0"
                        );

                    var iDay =
                        String(
                            vDate.getDate()
                        ).padStart(
                            2,
                            "0"
                        );

                    return (
                        iYear +
                        "-" +
                        iMonth +
                        "-" +
                        iDay
                    );
                }


                return String(vDate)
                    .substring(0, 10);
            },


            // Clear filter

            onClearFilters: function () {

                var oDateRange =
                    this.getView().byId(
                        "dateRange"
                    );

                if (oDateRange) {
                    oDateRange.setValue("");
                }

                this._applyFilter(false);

                MessageToast.show(
                    "Date filter cleared."
                );
            },


            // Proposal selection

            onProposalSelectionChange: function (
                oEvent
            ) {

                var oSelectedItem =
                    oEvent.getParameter(
                        "listItem"
                    );

                var oManageButton =
                    this.getView().byId(
                        "manageRentalButton"
                    );


                if (!oSelectedItem) {

                    this._selectedProposal =
                        null;

                    oManageButton.setEnabled(
                        false
                    );

                    return;
                }


                var oContext =
                    oSelectedItem.getBindingContext(
                        "view"
                    );


                if (!oContext) {

                    this._selectedProposal =
                        null;

                    oManageButton.setEnabled(
                        false
                    );

                    return;
                }


                this._selectedProposal =
                    oContext.getObject();


                var sStatus =
                    String(
                        this._selectedProposal.proposalStatus ||
                        this._selectedProposal.ProposalStatus ||
                        this._selectedProposal.status ||
                        ""
                    ).trim();


                if (
                    sStatus.toLowerCase() ===
                    "approved"
                ) {

                    oManageButton.setEnabled(
                        true
                    );

                } else {

                    oManageButton.setEnabled(
                        false
                    );
                }
            },


            // View Details

            onViewDetails: function (
                oEvent
            ) {

                var oContext =
                    oEvent.getSource()
                        .getBindingContext(
                            "view"
                        );


                if (!oContext) {

                    MessageBox.error(
                        "Proposal information is not available."
                    );

                    return;
                }


                var oProposal =
                    oContext.getObject();


                var sProposalNumber =
                    oProposal.proposalNumber ||
                    oProposal.ProposalNumber ||
                    oProposal.ID ||
                    "-";


                var sProposalDate =
                    this._formatDate(
                        oProposal.proposalDate
                    );


                var sProposalType =
                    oProposal.proposalType ||
                    oProposal.ProposalType ||
                    "-";


                var sStatus =
                    oProposal.proposalStatus ||
                    oProposal.ProposalStatus ||
                    oProposal.status ||
                    "-";


                var sAmount =
                    oProposal.totalAmount !==
                    undefined
                        ? String(
                            oProposal.totalAmount
                        )
                        : "-";


                MessageBox.information(
                    "Proposal No: " +
                    sProposalNumber +

                    "\n\nDate: " +
                    sProposalDate +

                    "\n\nType: " +
                    sProposalType +

                    "\n\nStatus: " +
                    sStatus +

                    "\n\nTotal Amount: " +
                    sAmount,

                    {
                        title: "Proposal Details"
                    }
                );
            },


            _formatDate: function (
                vDate
            ) {

                if (!vDate) {
                    return "-";
                }

                return this._getDateString(
                    vDate
                );
            },


            // Allocate & Create rental

            onManageRental: function () {

                var oProposal =
                    this._selectedProposal;


                if (!oProposal) {

                    MessageBox.warning(
                        "Please select a proposal first."
                    );

                    return;
                }


                var sStatus =
                    String(
                        oProposal.proposalStatus ||
                        oProposal.ProposalStatus ||
                        oProposal.status ||
                        ""
                    ).trim();


                if (
                    sStatus.toLowerCase() !==
                    "approved"
                ) {

                    MessageBox.warning(
                        "Only approved proposals can be allocated and rented."
                    );

                    return;
                }


                var sProposalId =
                    oProposal.ID ||
                    oProposal.id ||
                    oProposal.proposalId;


                if (!sProposalId) {

                    MessageBox.error(
                        "The selected proposal could not be identified from the backend."
                    );

                    return;
                }


                console.log(
                    "Opening rental wizard for Proposal ID:",
                    sProposalId
                );


                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "proposalwizardWithId",
                        {
                            proposalId:
                                encodeURIComponent(
                                    String(
                                        sProposalId
                                    )
                                )
                        }
                    );
            },


            // Refresh

            onRefresh: async function () {

                await this._loadProposals();

                MessageToast.show(
                    "Proposal list refreshed."
                );
            },


            // Status formatter

            formatStatusState: function (
                sStatus
            ) {

                switch (
                    String(sStatus || "")
                        .toLowerCase()
                ) {

                    case "approved":
                        return "Success";

                    case "submitted":
                        return "Information";

                    case "under review":
                        return "Warning";

                    case "rejected":
                        return "Error";

                    default:
                        return "None";
                }
            },


            // Error message

            _getErrorMessage: function (
                oError
            ) {

                if (
                    oError &&
                    oError.message
                ) {

                    return oError.message;
                }

                return (
                    "Failed to load proposals."
                );
            }

        }
    );
});