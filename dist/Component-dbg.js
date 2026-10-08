sap.ui.define([
    "sap/ui/core/UIComponent",
    "ns/proposalrentelsystem/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("ns.proposalrentelsystem.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },
init() {
    // call the base component's init function
    UIComponent.prototype.init.apply(this, arguments);

    // restore the username header after a page reload
    const sUser = sessionStorage.getItem("username");
    if (sUser) {
        this.getModel().changeHttpHeaders({ "x-username": sUser });
    }

    // set the device model
    this.setModel(models.createDeviceModel(), "device");

    // enable routing
    this.getRouter().initialize();
}
    });
});