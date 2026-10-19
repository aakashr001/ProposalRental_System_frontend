sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";
 
    return Controller.extend("ns.proposalrentelsystem.controller.CreateProposal", {
 
        onInit: function () {
            this.resetDraft();
 
            this.byId("createProposalDialog").setEscapeHandler(function (oPromise) {
                this.onCancelCreate();
                oPromise.reject();
            }.bind(this));
        },
 
        // ---------- date helpers ----------
        _today: function () {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            return d;
        },
 
        // "yyyy-MM-dd" -> local Date (avoids timezone shifts)
        _parseDate: function (s) {
            const p = s.split("-");
            return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        },
 
        // end date cannot be before the start date (or today if no start date yet)
        formatEndMinDate: function (sStart) {
            return sStart ? this._parseDate(sStart) : this._today();
        },
 
        // ---------- draft ----------
        resetDraft: function () {
            this.getView().setModel(new JSONModel({
                customerRemarks: "",
                items: [this._newItem()],
                total: 0,
                minDate: this._today()
            }), "draft");
        },
 
        setOnCreated: function (fnCallback) {
            this._fnOnCreated = fnCallback;
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
            oRow.getModel().setProperty(
                oRow.getPath() + "/basePrice",
                oItem ? Number(oItem.getBindingContext().getProperty("basePrice")) : 0
            );
            this.onRecalc();
        },
 
        onRecalc: function () {
            const oModel = this.getView().getModel("draft");
            let total = 0;
            const a = oModel.getProperty("/items").map(function (it) {
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
            const oToday = this._today();
            for (const [i, it] of oData.items.entries()) {
                const n = i + 1;
                if (!it.product_ID) { return "Item " + n + ": select a product."; }
                if (!(it.quantity > 0)) { return "Item " + n + ": quantity must be at least 1."; }
                if (!it.startDate || !it.endDate) { return "Item " + n + ": enter start and end dates."; }
                if (this._parseDate(it.startDate) < oToday) { return "Item " + n + ": start date cannot be in the past."; }
                if (this._parseDate(it.endDate) < this._parseDate(it.startDate)) { return "Item " + n + ": end date is before start date."; }
            }
            return null;
        },
 
        onSubmitProposal: async function () {
            const oData = this.getView().getModel("draft").getData();
            const sError = this._validate(oData);
            if (sError) { MessageBox.warning(sError); return; }
 
            const oPayload = {
                customerRemarks: oData.customerRemarks,
                items: oData.items.map(function (it) {
                    return {
                        product_ID: it.product_ID,
                        quantity: it.quantity,
                        requestType: "RENTAL",
                        startDate: it.startDate,
                        endDate: it.endDate,
                        needed_machineOperator: it.needed_machineOperator
                    };
                })
            };
 
            const oDialog = this.byId("createProposalDialog");
            oDialog.setBusy(true);
            let oCtx;
            try {
                const oBinding = this.getView().getModel().bindList("/Proposals");
                oCtx = oBinding.create(oPayload, true);
                await oCtx.created();
                MessageToast.show("Proposal created");
                oDialog.close();
                if (this._fnOnCreated) { this._fnOnCreated(); }
            } catch (e) {
                if (oCtx) { oCtx.delete().catch(function () {}); }
                MessageBox.error(e.message || "Could not create the proposal.");
            } finally {
                oDialog.setBusy(false);
            }
        },
 
        onCancelCreate: function () {
            MessageBox.confirm("Discard this proposal?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.byId("createProposalDialog").close();
                    }
                }.bind(this)
            });
        }
    });
});
 