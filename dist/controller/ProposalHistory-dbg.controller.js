sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    MessageToast
) {
    "use strict";

    return Controller.extend(
        "ns.proposalrentelsystem.controller.ProposalHistory",
        {

            onInit: function () {

                const oData = {

                    total: 5,
                    draft: 1,
                    submitted: 2,
                    approved: 2,

                    proposals: [

                        {
                            proposalNumber: "PROP-2026-0001",
                            type: "Rental",
                            proposalDate: "10 Feb 2026",
                            status: "Submitted",
                            statusState: "Warning",
                            totalAmount: "2,85,000"
                        },

                        {
                            proposalNumber: "PROP-2026-0002",
                            type: "Rental",
                            proposalDate: "18 Feb 2026",
                            status: "Approved",
                            statusState: "Success",
                            totalAmount: "4,20,000"
                        }

                    ]

                };

                const oModel = new JSONModel(oData);

                this.getView().setModel(oModel,"proposal");
            },


            onCreateProposal: function () {

                this.getOwnerComponent().getRouter().navTo("createProposal");

            },




            onProposalPress: function (oEvent) {

                const oContext = oEvent.getSource().getBindingContext("proposal");

                const oProposal = oContext.getObject();

                MessageToast.show("Opening " + oProposal.proposalNumber);

            },


            onBack: function () {

                this.getOwnerComponent().getRouter().navTo("RouteCustomer_View");

            }

        }
    );
});