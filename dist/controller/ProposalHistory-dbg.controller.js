
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox,
    XMLView,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend(
        "ns.proposalrentelsystem.controller.ProposalHistory",
        {

            // ==========================================
            // INITIALIZATION
            // ==========================================
            onInit: function () {

                // Create the model immediately so the view
                // has default values while loading.
                var oProposalModel = new JSONModel({
                    total: 0,
                    draft: 0,
                    pending: 0,
                    submitted: 0,
                    approved: 0,
                    rejected: 0,
                    proposals: []
                });

                this.getView().setModel(
                    oProposalModel,
                    "proposal"
                );

                this.loadProposals();

                var oRouter =
                    this.getOwnerComponent().getRouter();

                var oRoute =
                    oRouter.getRoute("ProposalHistory");

                if (oRoute) {
                    oRoute.attachPatternMatched(
                        this._onRouteMatched,
                        this
                    );
                }
            },

            // ==========================================
            // ROUTE MATCHED
            // ==========================================
            _onRouteMatched: function () {
                this.loadProposals();
            },

            // ==========================================
            // NORMALIZE PROPOSAL STATUS
            // ==========================================
            _getNormalizedStatus: function (oProposal) {

                var sStatus = String(
                    oProposal.proposalStatus ||
                    oProposal.status ||
                    ""
                ).trim().toLowerCase();

                // Normalize common status variations.
                if (sStatus === "approved") {
                    return "approved";
                }

                if (sStatus === "rejected") {
                    return "rejected";
                }

                if (
                    sStatus === "pending" ||
                    sStatus === "pending approval" ||
                    sStatus === "awaiting approval"
                ) {
                    return "pending";
                }

                if (sStatus === "draft") {
                    return "draft";
                }

                if (sStatus === "submitted") {
                    return "submitted";
                }

                return sStatus;
            },

            // ==========================================
            // LOAD PROPOSALS AND CALCULATE COUNTS
            // ==========================================
            loadProposals: async function () {

                var oODataModel =
                    this.getOwnerComponent().getModel();

                try {

                    console.log("Loading proposals...");

                    var oBinding =
                        oODataModel.bindList("/Proposals");

                    var aContexts =
                        await oBinding.requestContexts(0, 1000);

                    var aProposals =
                        await Promise.all(
                            aContexts.map(function (oContext) {
                                return oContext.requestObject();
                            })
                        );

                    console.log(
                        "Backend Proposals:",
                        aProposals
                    );

                    // Add normalized status to each proposal.
                    aProposals.forEach(function (oProposal) {
                        oProposal._normalizedStatus =
                            this._getNormalizedStatus(oProposal);
                    }.bind(this));

                    // Calculate KPI counts.
                    var iTotal = aProposals.length;

                    var iDraft = aProposals.filter(
                        function (oProposal) {
                            return oProposal._normalizedStatus === "draft";
                        }
                    ).length;

                    var iPending = aProposals.filter(
                        function (oProposal) {
                            return oProposal._normalizedStatus === "pending";
                        }
                    ).length;

                    var iSubmitted = aProposals.filter(
                        function (oProposal) {
                            return oProposal._normalizedStatus === "submitted";
                        }
                    ).length;

                    var iApproved = aProposals.filter(
                        function (oProposal) {
                            return oProposal._normalizedStatus === "approved";
                        }
                    ).length;

                    var iRejected = aProposals.filter(
                        function (oProposal) {
                            return oProposal._normalizedStatus === "rejected";
                        }
                    ).length;

                    // Dashboard model.
                    var oData = {
                        total: iTotal,
                        draft: iDraft,
                        pending: iPending,
                        submitted: iSubmitted,
                        approved: iApproved,
                        rejected: iRejected,
                        proposals: aProposals
                    };

                    var oProposalModel =
                        this.getView().getModel("proposal");

                    if (oProposalModel) {
                        oProposalModel.setData(oData);
                    } else {
                        oProposalModel = new JSONModel(oData);

                        this.getView().setModel(
                            oProposalModel,
                            "proposal"
                        );
                    }

                    console.log(
                        "Proposal model created:",
                        oData
                    );

                    console.log("Status counts:", {
                        total: iTotal,
                        draft: iDraft,
                        pending: iPending,
                        submitted: iSubmitted,
                        approved: iApproved,
                        rejected: iRejected
                    });

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

            // ==========================================
            // FILTER PROPOSALS BY STATUS TAB
            // ==========================================
            onFilterSelect: function (oEvent) {

                var sKey =
                    oEvent.getParameter("key");

                var oTable =
                    this.byId("proposalHistoryList");

                var oBinding =
                    oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                if (sKey === "all") {

                    // Show all proposals.
                    oBinding.filter([]);

                } else {

                    // Filter by the selected normalized status.
                    var oFilter = new Filter(
                        "_normalizedStatus",
                        FilterOperator.EQ,
                        sKey
                    );

                    oBinding.filter([oFilter]);
                }

                console.log(
                    "Selected proposal status:",
                    sKey
                );
            },

            // ==========================================
            // REFRESH PROPOSALS
            // ==========================================
            onRefresh: function () {
                this.loadProposals();
            },

            // ==========================================
            // CREATE PROPOSAL
            // ==========================================
            onCreateProposal: function () {

                var oView = this.getView();
                var oComponent = this.getOwnerComponent();

                if (!this._pCreateDialog) {

                    this._pCreateDialog =
                        oComponent.runAsOwner(function () {

                            return XMLView.create({
                                viewName:
                                    "ns.proposalrentelsystem.view.CreateProposal"
                            });

                        }).then(function (oCreateView) {

                            oView.addDependent(oCreateView);

                            oCreateView.getController()
                                .setOnCreated(
                                    this.loadProposals.bind(this)
                                );

                            return oCreateView;

                        }.bind(this));
                }

                this._pCreateDialog.then(
                    function (oCreateView) {

                        oCreateView.getController().resetDraft();

                        oCreateView.byId(
                            "createProposalDialog"
                        ).open();

                    }.bind(this)
                ).catch(function (oError) {

                    this._pCreateDialog = null;

                    console.error(
                        "Create dialog failed:",
                        oError
                    );

                    MessageToast.show(
                        "Unable to open Create Proposal dialog"
                    );

                }.bind(this));
            },

            // ==========================================
            // OPEN SELECTED PROPOSAL DETAILS
            // ==========================================
            onProposalPress: function (oEvent) {

                var oContext = oEvent.getSource()
                    .getBindingContext("proposal");

                if (!oContext) {

                    MessageBox.error(
                        "Unable to identify the selected proposal."
                    );

                    return;
                }

                var oProposal = oContext.getObject();

                console.log(
                    "Selected proposal:",
                    oProposal
                );

                console.log(
                    "Selected proposal ID:",
                    oProposal.ID
                );

                if (!oProposal.ID) {

                    MessageBox.error(
                        "Proposal ID is missing."
                    );

                    return;
                }

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("ProposalDetails", {
                        proposalId: oProposal.ID
                    });
            },

            // ==========================================
            // NAVIGATE BACK
            // ==========================================
            onBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteCustomer_View");
            }

        }
    );
});