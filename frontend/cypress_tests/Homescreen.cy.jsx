import React from "react";
import App from "../src/App";
import Homescreen from "../src/components/Homescreen";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContextProvider } from "../src/contexts/auth";

describe("<Homescreen />", () => {
	it("opens modal", () => {
		cy.on("uncaught:exception", (err) => {
			// Log the error to the console
			console.log(err);
			// Return false to prevent Cypress from failing the test
			return false;
		});

		cy.mount(
			<AuthContextProvider>
				<Router path="/">
					<Homescreen />
				</Router>
			</AuthContextProvider>
		);

    cy.get('[id=registerButton]').click()
		cy.get('[id=register-modal]').should('exist')
	});
});
