sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("ns.proposalrentelsystem.controller.ProposalDetails", {
     onInit: function () {

    // this.getOwnerComponent().getRouter().getRoute("ProposalDetails")
    // .attachPatternMatched(this._onRouteMatched,this );
},

// _onRouteMatched: function (oEvent) {

//     const customerId = oEvent.getParameter("arguments").customerId;

//     console.log("Customer ID:", customerId);

//     },


     onNavBack: function () {

                this.getOwnerComponent().getRouter().navTo(
                        "RouteCustomer_View"
                    );
            },

             onCreatePress: async function () {
            this.getView().setModel(new JSONModel({
                customerRemarks: "", items: [this._newItem()], total: 0
            }), "draft");

            if (!this._oDialog) {
                this._oDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "customerdashboard.view.CreateProposal",
                    controller: this
                });
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },

  });
});