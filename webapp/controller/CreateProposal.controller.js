sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("ns.proposalrentelsystem.controller.CreateProposal", {

        onInit: function () {
            const oComponent = this.getOwnerComponent();
            // make sure the backend (default) model is available on this view
            this.getView().setModel(oComponent.getModel());
            oComponent.getRouter()
                .getRoute("CreateProposal")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this.getView().setModel(new JSONModel({
                customerRemarks: "", items: [this._newItem()], total: 0
            }), "draft");
        },

        _newItem: function () {
            return {
                product_ID: "", basePrice: 0, quantity: 1, startDate: "", endDate: "",
                needed_machineOperator: 0, requestType: "RENTAL", estimate: 0
            };
        },

        onAddItem: function () {
            const oModel = this.getView().getModel("draft");
            oModel.setProperty("/items", oModel.getProperty("/items").concat(this._newItem()));
        },

        onRemoveItem: function (oEvent) {
            const oModel = this.getView().getModel("draft");
            const sPath = oEvent.getSource().getBindingContext("draft").getPath();
            const iIdx = parseInt(sPath.split("/").pop(), 10);
            const a = oModel.getProperty("/items");
            a.splice(iIdx, 1);
            oModel.setProperty("/items", a);
            this.onRecalc();
        },

        onProductChange: function (oEvent) {
            const oItem = oEvent.getParameter("selectedItem");
            const oRow = oEvent.getSource().getBindingContext("draft");
            oRow.getModel().setProperty(oRow.getPath() + "/basePrice",
                oItem ? Number(oItem.getBindingContext().getProperty("basePrice")) : 0);
            this.onRecalc();
        },

        onRecalc: function () {
            const oModel = this.getView().getModel("draft");
            let total = 0;
            const a = oModel.getProperty("/items").map(it => {
                let est = 0;
                if (it.startDate && it.endDate && it.basePrice) {
                    const days = (new Date(it.endDate) - new Date(it.startDate)) / 86400000 + 1;
                    est = days > 0 ? days * it.quantity * it.basePrice : 0;
                }
                total += est;
                return Object.assign(it, { estimate: est });
            });
            oModel.setProperty("/items", a);
            oModel.setProperty("/total", total);
        },

        _validate: function (oData) {
            if (!oData.items.length) { return "Add at least one item."; }
            for (const [i, it] of oData.items.entries()) {
                const n = i + 1;
                if (!it.product_ID) { return "Item " + n + ": select a product."; }
                if (!(it.quantity > 0)) { return "Item " + n + ": quantity must be at least 1."; }
                if (!it.startDate || !it.endDate) { return "Item " + n + ": enter start and end dates."; }
                if (new Date(it.endDate) < new Date(it.startDate)) { return "Item " + n + ": end date is before start date."; }
            }
            return null;
        },

        onSubmitProposal: async function () {
            const oData = this.getView().getModel("draft").getData();
            const sError = this._validate(oData);
            if (sError) { MessageBox.warning(sError); return; }

            // send only input fields; the backend calculates the rest
            const oPayload = {
                customerRemarks: oData.customerRemarks,
                items: oData.items.map(it => ({
                    product_ID: it.product_ID,
                    quantity: it.quantity,
                    requestType: "RENTAL",
                    startDate: it.startDate,
                    endDate: it.endDate,
                    needed_machineOperator: it.needed_machineOperator
                }))
            };

            const oPage = this.byId("createPage");
            oPage.setBusy(true);
            let oCtx;
            try {
                const oBinding = this.getOwnerComponent().getModel().bindList("/Proposals");
                oCtx = oBinding.create(oPayload, true);
                await oCtx.created();
                MessageToast.show("Proposal created");
                this._navBack();
            } catch (e) {
                if (oCtx) { oCtx.delete().catch(() => {}); }
                MessageBox.error(e.message || "Could not create the proposal.");
            } finally {
                oPage.setBusy(false);
            }
        },

        onCancelCreate: function () {
            MessageBox.confirm("Discard this proposal?", {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) { this._navBack(); }
                }
            });
        },
_navBack: function () {
    this.getOwnerComponent().getRouter().navTo("ProposalHistory", {}, true);
}
    });
});