import React from "react";
import RegisterModal from "../src/components/modals/RegisterModal";
import Homescreen from "../src/components/Homescreen";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContextProvider } from "../src/contexts/auth";

describe("<RegisterModal />", () => {
	it("closes modal", () => {
		cy.on("uncaught:exception", (err) => {
			// Log the error to the console
			console.log(err);
			// Return false to prevent Cypress from failing the test
			return false;
		});
		cy.mount(
			<AuthContextProvider>
				<Router>
					<Homescreen />
				</Router>
			</AuthContextProvider>
		);
		cy.get("[id=registerButton]").click();
		cy.wait(3000);
		cy.get("[id=close-button]").click();
		cy.get("[id=register-modal]").should("not.exist");
	});
});
