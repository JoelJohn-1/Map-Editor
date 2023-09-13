describe('uploads a geojson file and does basic map things', () => {
    it('uploads a geojson file', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.contains("Button", "Upload").click()
        cy.get('input[type="file"][hidden][accept=".json"]')
            .attachFile('custom.geo-3.json')
        cy.wait(3000)
    })

    it('renames map', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(3000)
        cy.get("[id=more-icon]").first().click()
        cy.on('uncaught:exception', (err, runnable) => {

            return false
        })
        cy.get("[id=rename-button]").first().click()
        cy.get('[name="name"]').type("test")
        cy.contains("Button", "Submit").click()
        cy.wait(2000)
    })

    it('goes to all maps screen', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.contains("Button", "All Maps").click()
        cy.url().should('eq', 'https://maps-united.vercel.app/maps')
    })

    it('creates a subregion', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get(`[aria-label="Edit mode"]`).click()
        cy.get(`[aria-label="Create subregion"]`).click()
        cy.wait(1000)
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        })
        cy.get('canvas').click(300,200)
        cy.wait(1000)
        cy.get('canvas').click(250,250)
        cy.wait(1000)
        cy.get('canvas').click(300,300)
        cy.get(".leaflet-marker-icon").then((icons) => {
            icons[3].click();
        })
        cy.get(`[aria-label="Save"]`).click()
    })

    it('undo creates a subregion', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get(`[aria-label="Edit mode"]`).click()
        cy.get(`[aria-label="Create subregion"]`).click()
        cy.wait(1000)
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        })
        cy.get('canvas').click(300,200)
        cy.wait(1000)
        cy.get('canvas').click(250,250)
        cy.wait(1000)
        cy.get('canvas').click(300,300)
        cy.get(".leaflet-marker-icon").then((icons) => {
            icons[3].click();
        })
        cy.get(`[aria-label="Save"]`).click()
        cy.get(`[aria-label="Undo"]`).click()
        cy.get(`[aria-label="Save"]`).click()
    })

    it('redo creates a subregion', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get(`[aria-label="Edit mode"]`).click()
        cy.get(`[aria-label="Create subregion"]`).click()
        cy.wait(1000)
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        })
        cy.get('canvas').click(300,200)
        cy.wait(1000)
        cy.get('canvas').click(250,250)
        cy.wait(1000)
        cy.get('canvas').click(300,300)
        cy.get(".leaflet-marker-icon").then((icons) => {
            icons[3].click();
        })
        cy.get(`[aria-label="Save"]`).click()
        cy.get(`[aria-label="Undo"]`).click()
        cy.get(`[aria-label="Save"]`).click()
        cy.get(`[aria-label="Redo"]`).click()
    })

    it('renames USA', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.wait(500)
        cy.get('canvas').dblclick(620, 390)
        cy.wait(1000)
        cy.get("[name=name]").type('test');
        cy.wait(1000)
        cy.contains("Button", "Submit").click()
        cy.wait(1000)
        cy.get(`[aria-label="Save"]`).click()
        cy.wait(1000)
    })

    it('undo rename USA', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.wait(500)
        cy.get('canvas').dblclick(620, 390)
        cy.wait(1000)
        cy.get("[name=name]").type('United States of America');
        cy.wait(1000)
        cy.contains("Button", "Submit").click()
        cy.wait(1000)
        cy.get(`[aria-label="Undo"]`).click()
        cy.get(`[aria-label="Save"]`).click()
    })

    it('redo rename USA', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.wait(500)
        cy.get('canvas').dblclick(620, 390)
        cy.wait(1000)
        cy.get("[name=name]").type('United States of America');
        cy.wait(1000)
        cy.contains("Button", "Submit").click()
        cy.wait(1000)
        cy.get(`[aria-label="Undo"]`).click()
        cy.get(`[aria-label="Redo"]`).click()
        cy.get(`[aria-label="Save"]`).click()
    })

    it('selects canada and splits it in half', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(1000)
        cy.get(`[aria-label="Split subregion"]`).click()
        cy.wait(1000)
        cy.get(".leaflet-marker-icon")
            .wait(500)
            .then((icons) => {
                icons[0].click();
            })
        cy.wait(500)
        cy.get('canvas').click(550, 250)
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        })
        cy.get(".leaflet-marker-icon")
            .wait(500)
            .then((icons) => {
            icons[icons.length-1].click();
        })
    })

    it('undo split region', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(1000)
        cy.get(`[aria-label="Split subregion"]`).click()
        cy.wait(1000)
        cy.get(".leaflet-marker-icon")
            .wait(500)
            .then((icons) => {
                icons[0].click();
            })
        cy.wait(500)
        cy.get('canvas').click(550, 250)
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        })
        cy.get(".leaflet-marker-icon")
            .wait(500)
            .then((icons) => {
            icons[icons.length-1].click();
        })
        cy.get(`[aria-label="Undo"]`).click()
    })

    it('redo split region', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(1000)
        cy.get(`[aria-label="Split subregion"]`).click()
        cy.wait(1000)
        cy.get(".leaflet-marker-icon")
            .wait(500)
            .then((icons) => {
                icons[0].click();
            })
        cy.wait(500)
        cy.get('canvas').click(550, 250)
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        })
        cy.get(".leaflet-marker-icon")
            .wait(500)
            .then((icons) => {
            icons[icons.length-1].click();
        })
        cy.get(`[aria-label="Undo"]`).click()
        cy.get(`[aria-label="Redo"]`).click()
    })

    it('selects canada and usa and merges it to test', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(3000)
        cy.get('canvas').click(650, 410)
        cy.wait(1000)
        cy.get(`[aria-label="Merge subregions"]`).click()
        cy.get("[name=name]").type('test');
        cy.contains("Button", "Submit").click() 
    })

    it('undo merge', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(3000)
        cy.get('canvas').click(650, 410)
        cy.wait(1000)
        cy.get(`[aria-label="Merge subregions"]`).click()
        cy.get("[name=name]").type('test');
        cy.contains("Button", "Submit").click() 
        cy.get(`[aria-label="Undo"]`).click()
    })

    it('redo merge', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(3000)
        cy.get('canvas').click(650, 410)
        cy.wait(1000)
        cy.get(`[aria-label="Merge subregions"]`).click()
        cy.get("[name=name]").type('test');
        cy.contains("Button", "Submit").click() 
        cy.get(`[aria-label="Undo"]`).click()
        cy.get(`[aria-label="Redo"]`).click()
    })

    it('selects canada and deletes it', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(1000)
        cy.get(`[aria-label="Delete subregion"]`).click()
        cy.wait(1000)
        cy.contains("Button", "Confirm").click()
    })

    it('undo delete region', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(1000)
        cy.get(`[aria-label="Delete subregion"]`).click()
        cy.wait(1000)
        cy.contains("Button", "Confirm").click()
        cy.get(`[aria-label="Undo"]`).click()
    })

    it('redo delete region', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get('canvas').should('be.visible')
        cy.get('canvas').click(600, 350)
        cy.wait(1000)
        cy.get(`[aria-label="Delete subregion"]`).click()
        cy.wait(1000)
        cy.contains("Button", "Confirm").click()
        cy.get(`[aria-label="Undo"]`).click()
        cy.get(`[aria-label="Redo"]`).click()
    })
    
    it('publishes map', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.wait(2000)
        cy.get("[class=App]").click(350,200)
        cy.get("Button").contains("Publish").click()
        cy.get("Button").contains("Confirm").click()
        cy.wait(2000)
    })

    it('searches for a map', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.contains("Button", "All Maps").click()
        cy.get('input[placeholder="Search..."]')
            .type('test')
            .type('{enter}')
    })

    it('goes to all maps screen for map to comment', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.contains("Button", "All Maps").click()
        cy.get('input[placeholder="Search..."]')
            .type('test')
            .type('{enter}')
        cy.get("[class=App]").click(350,200)
        cy.get("Button").contains("Comments").click()
        cy.get("[name=comment]")
            .type("test comment")
            .type('{enter}')
    })
    
    it('forks a map', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.contains("Button", "All Maps").click()
        cy.get("[id=more-icon]").first().click()
        cy.contains("Fork").click()
        cy.on('uncaught:exception', (err, runnable) => {

            return false
        })
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.get("[id=more-icon]").first().click()
        cy.on('uncaught:exception', (err, runnable) => {

        return false
        })
        cy.get("[id=delete-map-button]").first().click()
        cy.contains("Button", "Confirm").click()
    })

    it('deletes map', () => {
        cy.visit("https://maps-united.vercel.app")
        cy.get("[name=email]").type("test@gmail.com")
        cy.get("[name=password]").type("1234")
        cy.get("[id=loginButton]").click()
        cy.get("[id=more-icon]").first().click()
        cy.on('uncaught:exception', (err, runnable) => {
    
          return false
        })
        cy.get("[id=delete-map-button]").first().click()
        cy.contains("Button", "Confirm").click()
    })
})

// 23 tests 

        