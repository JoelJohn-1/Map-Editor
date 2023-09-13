describe('All of the register/login/logout stuff', () => {
    it("open register", () => {
		cy.visit("https://maps-united.vercel.app");
		cy.get("[id=registerButton]").click();
		cy.wait(500);
		cy.get('[id=register-modal]').should('exist')
	})

    it('registers an account', () => {
        cy.visit("https://maps-united.vercel.app");
        cy.get("[id=registerButton]").click();
        cy.get("[name=username]").type("test");
        cy.get("[name=register-email]").type("test@gmail.com");
        cy.get("[name=registerPassword]").type("1234");
        cy.get("[id=submitButton]").click();
        cy.wait(3000) 
    })

    it("close register", () => {
		cy.visit("https://maps-united.vercel.app");
		cy.get("[id=registerButton]").click();
		cy.wait(500);
		cy.get("[id=close-button]").click();
		cy.get("[id=register-modal]").should("not.exist");
	})

    it('does not log in due to incorrect credentials', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("lolololololololol@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.get("[id=errormsg]").contains("Account not found")
        cy.url().should('eq', 'https://maps-united.vercel.app/')
    })

    it('logs in with the correct credentials', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
    })

    it('logs out', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.get("[id=logoutButton]").click()
        cy.get("[id=logoutButton2]").click()
        cy.url().should('eq', 'https://maps-united.vercel.app/')
    })

    it('opens the reset password modal', () => {
        cy.visit("https://maps-united.vercel.app");
        cy.contains('Forgot Password?').click();
        cy.contains('Find your account').should('exist');
    })
})

// 7 tests