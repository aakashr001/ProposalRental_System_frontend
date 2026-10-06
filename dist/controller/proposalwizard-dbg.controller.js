sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    BusyIndicator,
    MessageBox,
    MessageToast
) {
    "use strict";

    return Controller.extend(
        "proposalrental.controller.proposalwizard",
        {
            onInit: function () {

                this._proposalId = "";
                this._selectedProposal = null;

                this._rentalCreated = false;
                this._rentalContract = null;

                this._equipmentLoadedForProposal = "";

                var oAllocationModel = new JSONModel({

                    proposalId: "",
                    customerId: "",
                    proposalDisplay: "",

                    rentalContractId: "",
                    contractNumber: "",
                    contractDate: "",
                    startDate: "",
                    endDate: "",
                    totalRentalAmount: "",

                    contractStatus: "Active",

                    availableEquipment: [],
                    selectedEquipment: [],
                    selectedEquipmentCount: 0,

                    isExistingContract: false

                });

                this.getView().setModel(
                    oAllocationModel,
                    "allocation"
                );


                var oRouter =
                    this.getOwnerComponent().getRouter();

                oRouter
                    .getRoute("proposalwizardWithId")
                    .attachPatternMatched(
                        this._onWizardMatched,
                        this
                    );

                oRouter
                    .getRoute("proposalwizard")
                    .attachPatternMatched(
                        this._onWizardMatched,
                        this
                    );
            },


            // route matching

            _onWizardMatched: async function (oEvent) {

                var oArguments =
                    oEvent.getParameter(
                        "arguments"
                    ) || {};

                var sProposalId =
                    oArguments.proposalId || "";

                try {
                    sProposalId =
                        decodeURIComponent(
                            sProposalId
                        );
                } catch (e) {
                    // Keep original value
                }


                this._proposalId =
                    sProposalId;

                this._selectedProposal =
                    null;

                this._rentalCreated =
                    false;

                this._rentalContract =
                    null;

                this._equipmentLoadedForProposal =
                    "";


                var oModel =
                    this.getView().getModel(
                        "allocation"
                    );


                oModel.setData({

                    proposalId:
                        sProposalId,

                    customerId: "",

                    proposalDisplay: "",

                    rentalContractId: "",

                    contractNumber: "",

                    contractDate: "",

                    startDate: "",

                    endDate: "",

                    totalRentalAmount: "",

                    contractStatus: "Active",

                    availableEquipment: [],

                    selectedEquipment: [],

                    selectedEquipmentCount: 0,

                    isExistingContract: false

                });


              var oWizard =
    this.byId("proposalWizard");

if (oWizard) {

    var aSteps =
        oWizard.getSteps();

    if (aSteps && aSteps.length > 0) {

        oWizard.goToStep(
            aSteps[0]
        );

        aSteps.forEach(
            function (oStep) {

                oStep.setValidated(false);

            }
        );
    }
}


                var oEquipmentTable =
                    this.byId(
                        "availableEquipmentTable"
                    );

                if (oEquipmentTable) {
                    oEquipmentTable.removeSelections(
                        true
                    );
                }


                var oNextButton =
                    this.byId(
                        "equipmentNextButton"
                    );

                if (oNextButton) {
                    oNextButton.setEnabled(
                        false
                    );
                }


                if (!sProposalId) {

                    MessageBox.error(
                        "Proposal ID is missing."
                    );

                    return;
                }


                await this._loadProposal(
                    sProposalId
                );
            },


            // Load proposal

            _loadProposal: async function (
                sProposalId
            ) {

                BusyIndicator.show(0);

                try {

                    var oModel =
                        this.getView().getModel();


                    var oBinding =
                        oModel.bindList(
                            "/Proposals",
                            null,
                            null,
                            [
                                new Filter(
                                    "ID",
                                    FilterOperator.EQ,
                                    sProposalId
                                )
                            ]
                        );


                    var aContexts =
                        await oBinding.requestContexts(
                            0,
                            1
                        );


                    if (
                        !aContexts ||
                        aContexts.length === 0
                    ) {

                        MessageBox.error(
                            "Proposal not found."
                        );

                        return;
                    }


                    var oProposal =
                        await aContexts[0]
                            .requestObject();


                    this._selectedProposal =
                        oProposal;


                    this._displayProposal(
                        oProposal
                    );

                } catch (oError) {

                    MessageBox.error(
                        this._getErrorMessage(
                            oError,
                            "Failed to load proposal."
                        )
                    );

                } finally {

                    BusyIndicator.hide();
                }
            },


            // display proposal

            _displayProposal: function (
                oProposal
            ) {

                var oModel =
                    this.getView().getModel(
                        "allocation"
                    );


                var sProposalId =
                    oProposal.ID ||
                    oProposal.id ||
                    oProposal.proposalId ||
                    "";


                var sCustomerId =
                    oProposal.customer_ID ||
                    oProposal.Customer_ID ||
                    oProposal.customerId ||
                    oProposal.CustomerId ||
                    "";


                this._proposalId =
                    sProposalId ||
                    this._proposalId;


                oModel.setProperty(
                    "/proposalId",
                    this._proposalId
                );


                oModel.setProperty(
                    "/customerId",
                    sCustomerId
                );


                oModel.setProperty(
                    "/proposalDisplay",
                    this._proposalId
                );
            },

            // rental contract - next

onRentalNext: async function () {

    var oModel =
        this.getView().getModel(
            "allocation"
        );


    var sProposalId =
        oModel.getProperty(
            "/proposalId"
        );


    var sContractNumber =
        oModel.getProperty(
            "/contractNumber"
        );


    var sContractDate =
        oModel.getProperty(
            "/contractDate"
        );


    var sStartDate =
        oModel.getProperty(
            "/startDate"
        );


    var sEndDate =
        oModel.getProperty(
            "/endDate"
        );


    var sTotalAmount =
        oModel.getProperty(
            "/totalRentalAmount"
        );


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!sProposalId) {

        MessageBox.error(
            "Proposal ID is required."
        );

        return;
    }


    if (!sContractNumber ||
        !String(sContractNumber).trim()) {

        MessageBox.error(
            "Please enter Contract Number."
        );

        return;
    }


    if (!sContractDate) {

        MessageBox.error(
            "Please select Contract Date."
        );

        return;
    }


    if (!sStartDate) {

        MessageBox.error(
            "Please select Start Date."
        );

        return;
    }


    if (!sEndDate) {

        MessageBox.error(
            "Please select End Date."
        );

        return;
    }


    if (
        sTotalAmount === "" ||
        sTotalAmount === null ||
        sTotalAmount === undefined
    ) {

        MessageBox.error(
            "Please enter Total Rental Amount."
        );

        return;
    }


    if (
        isNaN(
            Number(sTotalAmount)
        )
    ) {

        MessageBox.error(
            "Please enter a valid rental amount."
        );

        return;
    }


    if (
        new Date(sStartDate) >
        new Date(sEndDate)
    ) {

        MessageBox.error(
            "Start Date cannot be after End Date."
        );

        return;
    }


    BusyIndicator.show(0);


    try {

        // =================================================
        // LOG CURRENT DATA
        // =================================================

        console.log(
            "=========================================="
        );

        console.log(
            "RENTAL CONTRACT - NEXT CLICKED"
        );

        console.log(
            "Proposal ID:",
            sProposalId
        );

        console.log(
            "Contract Number:",
            sContractNumber
        );

        console.log(
            "Contract Date:",
            sContractDate
        );

        console.log(
            "Start Date:",
            sStartDate
        );

        console.log(
            "End Date:",
            sEndDate
        );

        console.log(
            "Total Rental Amount:",
            sTotalAmount
        );

        console.log(
            "=========================================="
        );


        // =================================================
        // CHECK WHETHER CONTRACT ALREADY EXISTS
        // FOR THIS PROPOSAL
        // =================================================

        var oExistingContract =
            await this._findExistingRentalContract(
                sProposalId
            );


        if (oExistingContract) {

            console.log(
                "Existing Rental Contract found:",
                oExistingContract
            );


            this._rentalCreated =
                true;


            this._rentalContract =
                oExistingContract;


            oModel.setProperty(
                "/rentalContractId",
                oExistingContract.ID
            );


            oModel.setProperty(
                "/isExistingContract",
                true
            );


            MessageToast.show(
                "Existing rental contract found."
            );

        } else {

            // =============================================
            // CREATE NEW RENTAL CONTRACT
            // =============================================

            console.log(
                "No existing rental contract found."
            );

            console.log(
                "Creating new Rental Contract..."
            );


            var oModelV4 =
                this.getView().getModel();


            var oFunction =
                oModelV4.bindContext(
                    "/createRentalContract(...)"
                );


            // ---------------------------------------------
            // IMPORTANT:
            // Only Proposal ID is sent.
            // Customer ID is NOT sent from frontend.
            // Backend gets customer_ID from Proposal.
            // ---------------------------------------------

            oFunction.setParameter(
                "proposal_ID",
                sProposalId
            );


            oFunction.setParameter(
                "contractNumber",
                String(
                    sContractNumber
                ).trim()
            );


            oFunction.setParameter(
                "contractDate",
                this._formatDateForModel(
                    sContractDate
                )
            );


            oFunction.setParameter(
                "startDate",
                this._formatDateForModel(
                    sStartDate
                )
            );


            oFunction.setParameter(
                "endDate",
                this._formatDateForModel(
                    sEndDate
                )
            );


            oFunction.setParameter(
                "totalRentalAmount",
                Number(
                    sTotalAmount
                )
            );


            console.log(
                "Calling createRentalContract action..."
            );


            // =============================================
            // EXECUTE BACKEND ACTION
            // =============================================

            await oFunction.execute(
                "$direct"
            );


            console.log(
                "createRentalContract action completed successfully."
            );


            // =============================================
            // GET ACTION RESULT
            // =============================================

            var oResultContext =
                oFunction.getBoundContext();


            var oResult =
                oResultContext
                    ? await oResultContext.requestObject()
                    : null;


            console.log(
                "createRentalContract result:",
                oResult
            );


            var sRentalContractId =
                this._extractActionResult(
                    oResult
                );


            console.log(
                "Created Rental Contract ID:",
                sRentalContractId
            );


            if (!sRentalContractId) {

                throw new Error(
                    "Rental contract was created but Contract ID was not returned."
                );
            }


            // =============================================
            // SAVE CREATED CONTRACT INFORMATION
            // =============================================

            this._rentalCreated =
                true;


            this._rentalContract =
                oResult;


            oModel.setProperty(
                "/rentalContractId",
                sRentalContractId
            );


            oModel.setProperty(
                "/isExistingContract",
                false
            );


            MessageToast.show(
                "Rental contract created successfully."
            );


            console.log(
                "Rental Contract successfully created in backend."
            );

        }


        // =================================================
        // MOVE TO EQUIPMENT ALLOCATION
        // =================================================

        var oWizard =
            this.byId(
                "proposalWizard"
            );


        oWizard.validateStep(
            this.byId(
                "rentalContractStep"
            )
        );


        oWizard.nextStep();


        console.log(
            "Moved to Equipment Allocation step."
        );


        // =================================================
        // LOAD AVAILABLE EQUIPMENT
        // =================================================

        await this._loadAvailableEquipment(
            sProposalId,
            true
        );


        console.log(
            "Available equipment loading completed."
        );


    } catch (oError) {

        console.error(
            "Rental contract creation failed:",
            oError
        );


        MessageBox.error(
            this._getErrorMessage(
                oError,
                "Failed to create rental contract."
            )
        );


    } finally {

        BusyIndicator.hide();

    }

},


            // find existing rental contract

            _findExistingRentalContract: async function (
                sProposalId
            ) {

                var oModel =
                    this.getView().getModel();


                var oBinding =
                    oModel.bindList(
                        "/RentalContracts",
                        null,
                        null,
                        [
                            new Filter(
                                "proposal_ID",
                                FilterOperator.EQ,
                                sProposalId
                            )
                        ]
                    );


                var aContexts =
                    await oBinding.requestContexts(
                        0,
                        1
                    );


                if (
                    aContexts &&
                    aContexts.length > 0
                ) {

                    return await aContexts[0]
                        .requestObject();
                }


                return null;
            },


            // load available equipment

            _loadAvailableEquipment: async function (
    sProposalId,
    bForceReload
) {

    if (
        !bForceReload &&
        this._equipmentLoadedForProposal ===
        sProposalId
    ) {

        return;
    }


    BusyIndicator.show(0);


    try {

        // =================================================
        // VALIDATE PROPOSAL ID
        // =================================================

        if (!sProposalId) {

            throw new Error(
                "Proposal ID is missing."
            );
        }


        console.log(
            "=========================================="
        );

        console.log(
            "LOADING EQUIPMENT FOR PROPOSAL"
        );

        console.log(
            "Proposal ID:",
            sProposalId
        );


        // =================================================
        // GET ODATA MODEL
        // =================================================

        var oModel =
            this.getView().getModel();


        // =================================================
        // CALL BACKEND
        // =================================================

        var oFunction =
            oModel.bindContext(
                "/getAvailableEquipment(...)"
            );


        oFunction.setParameter(
            "proposal_ID",
            sProposalId
        );


        console.log(
            "Calling getAvailableEquipment..."
        );


        await oFunction.execute(
            "$direct"
        );


        // =================================================
        // GET RESPONSE
        // =================================================

        var oContext =
            oFunction.getBoundContext();


        if (!oContext) {

            throw new Error(
                "No response received from getAvailableEquipment."
            );
        }


        var oResult =
            await oContext.requestObject();


        console.log(
            "RAW AVAILABLE EQUIPMENT RESPONSE:",
            oResult
        );


        // =================================================
        // EXTRACT COLLECTION
        // =================================================

        var aEquipment =
            this._extractCollectionResult(
                oResult
            );


        console.log(
            "Equipment returned for Proposal:",
            aEquipment
        );


        // =================================================
        // EXTRA SAFETY:
        // ONLY AVAILABLE STATUS
        // =================================================

        aEquipment =
            aEquipment.filter(
                function (oEquipment) {

                    if (!oEquipment) {
                        return false;
                    }


                    var sStatus =
                        oEquipment.status ||
                        oEquipment.Status ||
                        "";


                    return (
                        String(
                            sStatus
                        )
                            .trim()
                            .toUpperCase() ===
                        "AVAILABLE"
                    );

                }
            );


        // =================================================
        // FORMAT EQUIPMENT FOR UI
        // =================================================

        var aFormattedEquipment =
            aEquipment.map(
                function (oEquipment) {

                    return {

                        ID:
                            oEquipment.ID ||
                            oEquipment.id,

                        equipmentId:
                            oEquipment.equipment_Code ||
                            oEquipment.equipmentCode ||
                            oEquipment.Equipment_Code ||
                            oEquipment.code ||
                            oEquipment.ID ||
                            oEquipment.id,

                        equipmentName:
                            oEquipment.equipment_Name ||
                            oEquipment.equipmentName ||
                            oEquipment.Equipment_Name ||
                            oEquipment.name ||
                            oEquipment.ID ||
                            oEquipment.id,

                        status:
                            "AVAILABLE",

                        productRefId:
                            oEquipment.product_ref_ID ||
                            oEquipment.product_ID ||
                            oEquipment.Product_ID ||
                            oEquipment.productRefId ||
                            ""

                    };

                }
            );


        // =================================================
        // REMOVE DUPLICATES
        // =================================================

        var oUniqueEquipment =
            new Map();


        aFormattedEquipment.forEach(
            function (oEquipment) {

                var sId =
                    oEquipment.ID ||
                    oEquipment.equipmentId;


                if (sId) {

                    oUniqueEquipment.set(
                        String(sId),
                        oEquipment
                    );
                }

            }
        );


        aFormattedEquipment =
            Array.from(
                oUniqueEquipment.values()
            );


        console.log(
            "FINAL EQUIPMENT FOR UI:",
            aFormattedEquipment
        );


        // =================================================
        // SET ALLOCATION MODEL
        // =================================================

        var oAllocationModel =
            this.getView().getModel(
                "allocation"
            );


        oAllocationModel.setProperty(
            "/availableEquipment",
            aFormattedEquipment
        );


        oAllocationModel.setProperty(
            "/selectedEquipment",
            []
        );


        oAllocationModel.setProperty(
            "/selectedEquipmentCount",
            0
        );


        // =================================================
        // CLEAR TABLE SELECTION
        // =================================================

        var oTable =
            this.byId(
                "availableEquipmentTable"
            );


        if (oTable) {

            oTable.removeSelections(
                true
            );
        }


        // =================================================
        // DISABLE NEXT BUTTON
        // =================================================

        var oNextButton =
            this.byId(
                "equipmentNextButton"
            );


        if (oNextButton) {

            oNextButton.setEnabled(
                false
            );
        }


        this._equipmentLoadedForProposal =
            sProposalId;


        console.log(
            "Final Available Equipment Count:",
            aFormattedEquipment.length
        );


        console.log(
            "=========================================="
        );


        // =================================================
        // NO EQUIPMENT
        // =================================================

        if (
            aFormattedEquipment.length === 0
        ) {

            MessageToast.show(
                "No available equipment is found for the products requested in this proposal."
            );
        }


    } catch (oError) {

        console.error(
            "Available equipment loading failed:",
            oError
        );


        MessageBox.error(
            this._getErrorMessage(
                oError,
                "Failed to load available equipment."
            )
        );


    } finally {

        BusyIndicator.hide();

    }

},


            // extract collection result
            _extractCollectionResult: function (
                oResult
            ) {

                if (!oResult) {
                    return [];
                }


                if (
                    Array.isArray(
                        oResult
                    )
                ) {

                    return oResult;
                }


                if (
                    Array.isArray(
                        oResult.value
                    )
                ) {

                    return oResult.value;
                }


                if (
                    oResult.value &&
                    Array.isArray(
                        oResult.value.value
                    )
                ) {

                    return oResult.value.value;
                }


                if (
                    Array.isArray(
                        oResult.results
                    )
                ) {

                    return oResult.results;
                }


                if (
                    oResult.value &&
                    Array.isArray(
                        oResult.value.results
                    )
                ) {

                    return oResult.value.results;
                }


                if (
                    Array.isArray(
                        oResult.$values
                    )
                ) {

                    return oResult.$values;
                }


                if (
                    oResult.ID ||
                    oResult.id
                ) {

                    return [
                        oResult
                    ];
                }


                var aKeys =
                    Object.keys(
                        oResult
                    );


                for (
                    var i = 0;
                    i < aKeys.length;
                    i++
                ) {

                    var oValue =
                        oResult[
                            aKeys[i]
                        ];


                    if (
                        Array.isArray(
                            oValue
                        )
                    ) {

                        return oValue;
                    }
                }


                return [];
            },


            // equipment selection

            onEquipmentSelectionChange: function (
                oEvent
            ) {

                var oTable =
                    oEvent.getSource();


                var aSelectedItems =
                    oTable.getSelectedItems();


                var aSelectedEquipment =
                    [];


                aSelectedItems.forEach(
                    function (oItem) {

                        var oContext =
                            oItem.getBindingContext(
                                "allocation"
                            );


                        if (oContext) {

                            var oEquipment =
                                oContext.getObject();


                            aSelectedEquipment.push(
                                oEquipment
                            );
                        }
                    }
                );


                var oModel =
                    this.getView().getModel(
                        "allocation"
                    );


                oModel.setProperty(
                    "/selectedEquipment",
                    aSelectedEquipment
                );


                oModel.setProperty(
                    "/selectedEquipmentCount",
                    aSelectedEquipment.length
                );


                var oNextButton =
                    this.byId(
                        "equipmentNextButton"
                    );


                if (oNextButton) {

                    oNextButton.setEnabled(
                        aSelectedEquipment.length > 0
                    );
                }
            },


            // equipment next

            onEquipmentNext: function () {

                var oModel =
                    this.getView().getModel(
                        "allocation"
                    );


                var aSelectedEquipment =
                    oModel.getProperty(
                        "/selectedEquipment"
                    ) || [];


                if (
                    aSelectedEquipment.length === 0
                ) {

                    MessageBox.warning(
                        "Please select at least one available equipment."
                    );

                    return;
                }


                var sContractId =
                    oModel.getProperty(
                        "/rentalContractId"
                    );


                if (!sContractId) {

                    MessageBox.error(
                        "Rental contract ID is missing."
                    );

                    return;
                }


                var oWizard =
                    this.byId(
                        "proposalWizard"
                    );


                oWizard.validateStep(
                    this.byId(
                        "equipmentAllocationStep"
                    )
                );


                oWizard.nextStep();
            },


            // back to rental

            onBackToRental: function () {

                var oWizard =
                    this.byId(
                        "proposalWizard"
                    );


                oWizard.previousStep();
            },


            // back to equipment

            onBackToEquipment: function () {

                var oWizard =
                    this.byId(
                        "proposalWizard"
                    );


                oWizard.previousStep();
            },


            // complete rental

            onCompleteRental: async function () {

                var oModel =
                    this.getView().getModel(
                        "allocation"
                    );


                var sProposalId =
                    oModel.getProperty(
                        "/proposalId"
                    );


                var sContractId =
                    oModel.getProperty(
                        "/rentalContractId"
                    );


                var sStartDate =
                    oModel.getProperty(
                        "/startDate"
                    );


                var sEndDate =
                    oModel.getProperty(
                        "/endDate"
                    );


                var aSelectedEquipment =
                    oModel.getProperty(
                        "/selectedEquipment"
                    ) || [];


                if (!sContractId) {

                    MessageBox.error(
                        "Rental contract ID is missing."
                    );

                    return;
                }


                if (
                    aSelectedEquipment.length === 0
                ) {

                    MessageBox.error(
                        "Please select equipment."
                    );

                    return;
                }


                BusyIndicator.show(0);


                try {

                    var oV4Model =
                        this.getView().getModel();


                    // allocate each selected equipment

                    for (
                        var i = 0;
                        i < aSelectedEquipment.length;
                        i++
                    ) {

                        var oEquipment =
                            aSelectedEquipment[i];


                        var sEquipmentId =
                            oEquipment.ID ||
                            oEquipment.id;


                        var oFunction =
                            oV4Model.bindContext(
                                "/allocationEquipment(...)"
                            );


                        oFunction.setParameter(
                            "proposal_ID",
                            sProposalId
                        );


                        oFunction.setParameter(
                            "equipment_ID",
                            sEquipmentId
                        );


                        oFunction.setParameter(
                            "startDate",
                            this._formatDateForModel(
                                sStartDate
                            )
                        );


                        oFunction.setParameter(
                            "endDate",
                            this._formatDateForModel(
                                sEndDate
                            )
                        );


                        oFunction.setParameter(
                            "rentalContract_ID",
                            sContractId
                        );


                        await oFunction.execute(
                            "$direct"
                        );
                    }


                    MessageBox.success(
                        "Rental contract and equipment allocation completed successfully.",
                        {
                            onClose: function () {

                                this._finishWizard();

                            }.bind(this)
                        }
                    );

                } catch (oError) {

                    MessageBox.error(
                        this._getErrorMessage(
                            oError,
                            "Failed to allocate equipment."
                        )
                    );

                } finally {

                    BusyIndicator.hide();
                }
            },

            
            // wizard finish
            _finishWizard: function () {

                var oRouter =
                    this.getOwnerComponent()
                        .getRouter();


                oRouter.navTo(
                    "proposalrental",
                    {},
                    true
                );
            },

            
            // wizard complete
            onWizardComplete: function () {

                this._finishWizard();
            },


            // back to proposalrental page

            onBack: function () {

                var oRouter =
                    this.getOwnerComponent()
                        .getRouter();


                oRouter.navTo(
                    "proposalrental"
                );
            },


            // format date 

            _formatDateForModel: function (
                sDate
            ) {

                if (!sDate) {
                    return null;
                }


                if (
                    typeof sDate === "string" &&
                    /^\d{4}-\d{2}-\d{2}$/.test(
                        sDate
                    )
                ) {

                    return sDate;
                }


                var oDate =
                    new Date(sDate);


                if (
                    isNaN(
                        oDate.getTime()
                    )
                ) {

                    return sDate;
                }


                var iMonth =
                    oDate.getMonth() + 1;


                var sMonth =
                    String(
                        iMonth
                    ).padStart(
                        2,
                        "0"
                    );


                var sDay =
                    String(
                        oDate.getDate()
                    ).padStart(
                        2,
                        "0"
                    );


                return (
                    oDate.getFullYear() +
                    "-" +
                    sMonth +
                    "-" +
                    sDay
                );
            },


            // extract action result

            _extractActionResult: function (
                oResult
            ) {

                if (
                    typeof oResult === "string"
                ) {

                    return oResult;
                }


                if (!oResult) {
                    return "";
                }


                if (
                    oResult.value &&
                    typeof oResult.value === "string"
                ) {

                    return oResult.value;
                }


                if (oResult.ID) {
                    return oResult.ID;
                }


                if (oResult.id) {
                    return oResult.id;
                }


                if (
                    oResult.result &&
                    typeof oResult.result === "string"
                ) {

                    return oResult.result;
                }


                return "";
            },


            // error message

            _getErrorMessage: function (
                oError,
                sDefaultMessage
            ) {

                if (!oError) {
                    return sDefaultMessage;
                }


                if (
                    oError.message
                ) {

                    return oError.message;
                }


                if (
                    oError.cause &&
                    oError.cause.message
                ) {

                    return oError.cause.message;
                }


                return sDefaultMessage;
            }

        }
    );
});

