sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], (BaseController,JSONModel,MessageToast,MessageBox) => {
  "use strict";

  return BaseController.extend("ns.proposalrentelsystem.controller.Registation", {
    onInit() {
      const oModel = {
        companyName: "",
        companyType: "",
        contactPerson: "",
        customerEmail: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        username: "",
        password: ""
      }
      const jModel = new JSONModel(oModel)
      this.getView().setModel(jModel,"Details")
    },
    onNavto:  function(){

      this.getOwnerComponent().getRouter().navTo("RouteCustomer_View");

    },
    // onCityChange(oEvent){
    //   //
    //         const oSelectedItem = oEvent.getParameter("selectedItem");
    //         const detailModel = this.getView().getModel('Details');
    //         console.log(detailModel.getProperty('/city'))

    // },
    // onCountryChange(oEvent){
    //   const oSelectedItem = oEvent.getParameter("selectedItem");
    //         const detailModel = this.getView().getModel('Details');
    //         console.log(detailModel.getProperty('/companyType'))
    // },
    async onSelect(oEvent) {
       const oModel = this.getView().getModel();

       const sModel = this.getView().getModel("Details");
     
       const sData = sModel.getData();

       console.log(sData);
       

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       
       //this regex for the mail validation
       if(!emailRegex.test(sData.customerEmail)){
        MessageBox.error("Enter the valid mail address");
        return;
        
       }

       //this is for phone numner validation
        const phoneRegex = /^[0-9]{10}$/;
          
        if(!phoneRegex.test(sData.phone)){
        MessageBox.error("please enter the valid phone number");
        return;
       }
       
       //this regex for the username validation
       const usernameRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

       if(!usernameRegex.test(sData.username)){
        MessageBox.error("enter the valid user name");
        return;
       }

       //password validation 
       const passwordRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

       if(!passwordRegex.test(sData.password)){
        MessageBox.error("provide the strong and valid passeord");
        return;
       }

       
      if(!sData.companyType){
        
      }
      if(!sData.city){

      }
       const oAction = oModel.bindContext('/Register(...)');
          oAction.setParameter("companyName", sData.companyName);
          oAction.setParameter("companyType", sData.companyType);
          oAction.setParameter("contactPerson", sData.contactPerson);
          oAction.setParameter("customerEmail", sData.customerEmail);
          oAction.setParameter("phone", sData.phone);
          oAction.setParameter("address", sData.address);
          oAction.setParameter("city", sData.city);
          oAction.setParameter("state", sData.state);
          oAction.setParameter("country", sData.country);
          oAction.setParameter("username", sData.username);
          oAction.setParameter("password", sData.password);
       try{
          console.log("hi")
          await oAction.execute();
          console.log("hello")
          MessageBox.success("Successfully created")
          return;

       }catch(err){
          MessageBox.error(err.message)
       }
       MessageToast.show( "Registation Failed")

    }
  });
});