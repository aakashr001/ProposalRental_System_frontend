sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    MessageToast,
    JSONModel
) {
    "use strict";

    return Controller.extend(
        "ns.proposalrentelsystem.controller.Customer_View",
        {

            onInit(){

            },
            
             onSignup(){
                console.log("Testing");
                
                this.getOwnerComponent().getRouter().navTo("Registation")
             },

            async onLogin(oEvent) {
                console.log("Login Testing");
                

                const oModel = this.getView().getModel();

                console.log("Model:", oModel);

                const userName = this.byId("username").getValue();

                const password = this.byId("password").getValue();

                console.log("User Name:", userName);
                console.log("Password:", password);


                // Validate username and password
                if (!userName || !password) {

                    MessageToast.show(
                        "Please enter username and password"
                    );

                    return;
                }

                try {

                    // 1. Call login function

                    const oAction = oModel.bindContext("/login(...)");

                    console.log("Login Binding:",oAction);

                    // 2. Set parameters

                    oAction.setParameter("username", userName);

                    oAction.setParameter("password", password);

                    // 3. Execute login

                    await oAction.execute();

                    // 4. Get result context

                    const oResultContext = oAction.getBoundContext();

                    console.log("Result Context:",oResultContext);

                    // 5. Get returned object
                    

                    const resultObj = oResultContext.getObject();

                    console.log("Result Object:",resultObj.value);

                    // 6. Create JSON Model

                    const oProposalModel = new JSONModel(resultObj.value);

                    // 7. Store model globally

                    this.getOwnerComponent().setModel(
                        oProposalModel, "proposalModel");


                    console.log("Proposal Model:",oProposalModel);

                    // 8. Login successful

                    MessageToast.show(
                        "Login successful"
                    );


                    // 9. Navigate to ProposalDetails

                    this.getOwnerComponent().getRouter()
                        .navTo("ProposalHistory");

                } catch (oError) {

                    console.error("Login Error:",oError);

                    MessageToast.show(
                        "Invalid username or password"
                    );
                }
            }

        }
    );
});

