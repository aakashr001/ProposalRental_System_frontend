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

                this.loadProposals();

            },


            loadProposals: async function () {

                const oODataModel =
                    this.getOwnerComponent().getModel();

                try {

                    console.log(
                        "OData model:",
                        oODataModel
                    );

                    console.log(
                        "Loading Proposals..."
                    );


                    const oBinding =
                        oODataModel.bindList("/Proposals");


                    const aContexts =
                        await oBinding.requestContexts();


                    const aProposals =
                        aContexts.map(function (oContext) {

                            return oContext.getObject();

                        });


                    console.log(
                        "Backend Proposals:",
                        aProposals
                    );


                    // ==============================
                    // COUNTS
                    // ==============================

                    const iTotal =
                        aProposals.length;


                    const iDraft =
                        aProposals.filter(function (oProposal) {

                            return oProposal.status === "Draft";

                        }).length;


                    const iSubmitted =
                        aProposals.filter(function (oProposal) {

                            return oProposal.status === "Submitted";

                        }).length;


                    const iApproved =
                        aProposals.filter(function (oProposal) {

                            return oProposal.status === "Approved";

                        }).length;


                    // ==============================
                    // UI MODEL
                    // ==============================

                    const oData = {

                        total: iTotal,

                        draft: iDraft,

                        submitted: iSubmitted,

                        approved: iApproved,

                        proposals: aProposals

                    };


                    const oProposalModel =
                        new JSONModel(oData);


                    this.getView().setModel(
                        oProposalModel,
                        "proposal"
                    );


                    console.log(
                        "Proposal model created:",
                        oData
                    );

                } catch (oError) {

                    console.error(
                        "Failed to load proposals:",
                        oError
                    );


                    MessageToast.show(
                        "Unable to load proposals"
                    );

                }

            },


            onCreateProposal: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("CreateProposal");

            },


            onProposalPress: function (oEvent) {

                const oContext =
                    oEvent.getSource()
                        .getBindingContext("proposal");


                if (!oContext) {

                    MessageToast.show(
                        "Proposal details not available"
                    );

                    return;
                }


                const oProposal =
                    oContext.getObject();


                MessageToast.show(
                    "Opening " +
                    oProposal.proposalNumber
                );

            },


            onBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteCustomer_View");

            }

        }
    );
});