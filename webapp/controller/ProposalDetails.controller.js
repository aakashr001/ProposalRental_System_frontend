sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    UIComponent
) {
    "use strict";

    return Controller.extend(
        "ns.proposalrentelsystem.controller.ProposalDetails",
        {

            // ==========================================
            // INITIALIZATION
            // ==========================================
            onInit: function () {

                console.log("Detailed page is  loading");
                const router = UIComponent.getRouterFor(this);

                router.getRoute("ProposalDetails").attachPatternMatched(this.onObjectMatched, this);
                

                // Selected proposal information
                // this.getView().setModel(
                //     new JSONModel({}),
                //     "proposalModel"
                // );

                // // Equipment displayed in the table
                // this.getView().setModel(
                //     new JSONModel({
                //         equipment: []
                //     }),
                //     "equipmentModel"
                // );

                // // Listen for proposal selection/navigation
                // this.getOwnerComponent()
                //     .getRouter()
                //     .getRoute("ProposalDetails")
                //     .attachPatternMatched(
                //         this._onProposalMatched,
                //         this
                //     );
            },


            onObjectMatched(event) {
                const args = event.getParameter("arguments");
                console.log("Args : ", args);
                
                const proposalIDs = args.proposalId;
                console.log("ID : ", proposalIDs);
                

                // const proposalID = decodeURIComponent(event.getParameter("arguments").id);

                this.getView().bindElement({
                    path: `/Proposals(${proposalIDs})`,
                    parameters: {
                        expand: "customer"
                    }
                });
            },

            // ==========================================
            // LOAD SELECTED PROPOSAL
            // ==========================================
            _onProposalMatched: async function (oEvent) {

                var oArgs =
                    oEvent.getParameter("arguments") || {};

                var sProposalId = oArgs.proposalId;

                if (!sProposalId) {
                    MessageBox.error(
                        "Proposal ID is missing. Please select a proposal again."
                    );
                    return;
                }

                // Existing default model: customerapi
                var oCustomerModel =
                    this.getOwnerComponent().getModel();

                var oProposalModel =
                    this.getView().getModel("proposalModel");

                var oEquipmentModel =
                    this.getView().getModel("equipmentModel");

                // Clear previous proposal and equipment
                oProposalModel.setData({});
                oEquipmentModel.setData({
                    equipment: []
                });

                try {

                    // Load the selected proposal
                    var oProposalBinding =
                        oCustomerModel.bindList(
                            "/Proposals",
                            undefined,
                            undefined,
                            [
                                new Filter(
                                    "ID",
                                    FilterOperator.EQ,
                                    sProposalId
                                )
                            ]
                        );

                    var aProposalContexts =
                        await oProposalBinding.requestContexts(
                            0,
                            1
                        );

                    if (!aProposalContexts.length) {
                        MessageBox.information(
                            "No proposal found for ID: " +
                            sProposalId
                        );
                        return;
                    }

                    var oProposal =
                        await aProposalContexts[0].requestObject();

                    oProposalModel.setData(oProposal);

                    console.log(
                        "Loaded proposal:",
                        oProposal
                    );

                    // Load only equipment matching this proposal's products
                    await this._loadEquipmentForProposal(
                        sProposalId,
                        oCustomerModel,
                        oEquipmentModel
                    );

                } catch (oError) {

                    console.error(
                        "Failed to load proposal details:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to load proposal details. Check the browser console."
                    );
                }
            },


            // ==========================================
            // LOAD EQUIPMENT FOR SELECTED PROPOSAL
            // ==========================================
            _loadEquipmentForProposal: async function (
                sProposalId,
                oCustomerModel,
                oEquipmentModel
            ) {

                try {

                    // The salesapi model exposes physical equipment
                    var oSalesModel =
                        this.getOwnerComponent()
                            .getModel("salesService");

                    if (!oSalesModel) {
                        throw new Error(
                            "salesService model is missing. Check manifest.json."
                        );
                    }

                    // STEP 1:
                    // Fetch proposal items belonging to this proposal
                    var oItemsBinding =
                        oCustomerModel.bindList(
                            "/ProposalItems",
                            undefined,
                            undefined,
                            [
                                new Filter(
                                    "proposals_ID",
                                    FilterOperator.EQ,
                                    sProposalId
                                )
                            ]
                        );

                    var aItemContexts =
                        await oItemsBinding.requestContexts(
                            0,
                            100
                        );

                    var aProposalItems =
                        await Promise.all(
                            aItemContexts.map(
                                function (oContext) {
                                    return oContext.requestObject();
                                }
                            )
                        );

                    console.log(
                        "Proposal items:",
                        aProposalItems
                    );

                    // STEP 2:
                    // Collect the requested product IDs
                    var aProductIds = [
                        ...new Set(
                            aProposalItems
                                .map(function (oItem) {
                                    return oItem.product_ID;
                                })
                                .filter(Boolean)
                        )
                    ];

                    console.log(
                        "Requested product IDs:",
                        aProductIds
                    );

                    // No requested products: show an empty table
                    if (aProductIds.length === 0) {

                        oEquipmentModel.setData({
                            equipment: []
                        });

                        console.log(
                            "No products found for proposal:",
                            sProposalId
                        );

                        return;
                    }

                    // STEP 3:
                    // Build a filter for equipment linked to
                    // any requested product
                    var aProductFilters =
                        aProductIds.map(
                            function (sProductId) {
                                return new Filter(
                                    "product_ref_ID",
                                    FilterOperator.EQ,
                                    sProductId
                                );
                            }
                        );

                    var oEquipmentFilter =
                        new Filter({
                            filters: aProductFilters,
                            and: false
                        });

                    // STEP 4:
                    // Read matching physical equipment
                    var oEquipmentBinding =
                        oSalesModel.bindList(
                            "/Rental_Physical_Equipment",
                            undefined,
                            undefined,
                            [oEquipmentFilter]
                        );

                    var aEquipmentContexts =
                        await oEquipmentBinding.requestContexts(
                            0,
                            100
                        );

                    // STEP 5:
                    // Map database fields to table properties
                    var aEquipment =
                        aEquipmentContexts.map(
                            function (oContext) {

                                var oEquipment =
                                    oContext.getObject();

                                return {
                                    equipmentCode:
                                        oEquipment.equipment_Code || "",

                                    equipmentName:
                                        oEquipment.equipment_Name || "",

                                    serialNumber:
                                        oEquipment.serial_Number || "",

                                    model:
                                        oEquipment.model || "",

                                    status:
                                        oEquipment.status || ""
                                };
                            }
                        );

                    // Update the UI table
                    oEquipmentModel.setData({
                        equipment: aEquipment
                    });

                    console.log(
                        "Equipment matching selected proposal:",
                        aEquipment
                    );

                } catch (oError) {

                    console.error(
                        "Failed to load equipment for proposal:",
                        oError
                    );

                    oEquipmentModel.setData({
                        equipment: []
                    });

                    MessageBox.error(
                        "Unable to load equipment for this proposal. Verify the OData service URL, entity set and association fields."
                    );
                }
            },


            // ==========================================
            // NAVIGATE BACK
            // ==========================================
            onNavBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("ProposalHistory");
            }

        }
    );
});