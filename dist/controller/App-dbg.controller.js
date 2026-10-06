sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    JSONModel
) {
    "use strict";

    return Controller.extend("proposalrental.controller.App", {

        onInit: function () {

            const oModel = this.getOwnerComponent().getModel();

            // Count model for dashboard tiles
            const oCounts = {
                active: 0,
                completed: 0,
                cancelled: 0,
                approved: 0
            };

            this.getView().setModel(
                new JSONModel(oCounts),
                "Count"
            );

            // Load Rental Contract status counts
            this._loadRentalContractCounts(oModel);

            // Load Approved Proposal count
            this._loadProposalCount(oModel);
        },


      //  Load rental contract status counts

        _loadRentalContractCounts: function (oModel) {

            const oBinding = oModel.bindList("/contracts");

            oBinding.requestContexts()
                .then(function (aContexts) {

                    const oCountModel = this.getView().getModel("Count");
                    const oCounts = oCountModel.getData();

                    // Reset values
                    oCounts.active = 0;
                    oCounts.completed = 0;
                    oCounts.cancelled = 0;

                    aContexts.forEach(function (oContext) {

                        const oData = oContext.getObject();

                        console.log(
                            "Rental Contract Count Data:",
                            oData
                        );

                        if (oData.contractStatus === "Active") {

                            oCounts.active = oData.rcs;

                        } else if (oData.contractStatus === "Completed") {

                            oCounts.completed = oData.rcs;

                        } else if (oData.contractStatus === "Cancelled") {

                            oCounts.cancelled = oData.rcs;
                        }
                    });

                    oCountModel.setData(oCounts);

                    console.log(
                        "Rental Contract Counts:",
                        oCounts
                    );

                }.bind(this))
                .catch(function (oError) {

                    console.error(
                        "Error loading rental contract counts:",
                        oError
                    );

                });
        },


        //Load approved proposals count - comes from backend (view.cds)

        _loadProposalCount: function (oModel) {
            
          const oBinding = oModel.bindList("/ProposalCount");

            oBinding.requestContexts()
                .then(function (aContexts) {

                    const oCountModel =
                        this.getView().getModel("Count");

                    const oCounts = oCountModel.getData();

                    // Default value
                    oCounts.approved = 0;

                    aContexts.forEach(function (oContext) {

                        const oData = oContext.getObject();

                        console.log(
                            "Proposal Count Data:",
                            oData
                        );

                        if (
                            oData.proposalStatus === "Approved"
                        ) {

                            oCounts.approved = oData.ps;
                        }
                    });

                    oCountModel.setData(oCounts);

                    console.log(
                        "Approved Proposal Count:",
                        oCounts.approved
                    );

                }.bind(this))
                .catch(function (oError) {

                    console.error(
                        "Error loading approved proposal count:",
                        oError
                    );

                });
        },

      // APPROVED PROPOSAL TILE PRESS - UI main page

        onApprovedProposalPress: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("proposalrental");
        }

    });
});