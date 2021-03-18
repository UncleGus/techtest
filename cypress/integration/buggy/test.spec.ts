context('Buggy site', () => {
  context('Home page', () => {
    beforeEach(() => {
      cy.fixture('dashboard').as('dashboardData')
      cy.intercept('dashboard', { fixture: 'dashboard' })
      cy.visit('/')
    })

    it('Make votes are displayed correctly', function () {
      cy.contains(this.dashboardData.make.name).find('small').should('have.text', `(${this.dashboardData.make.votes} votes)`)
    })

    it('Model votes are displayed correctly', function () {
      cy.contains(`${this.dashboardData.model.make} ${this.dashboardData.model.name}`).find('small').should('have.text', `(${this.dashboardData.model.votes} votes)`)
    })
  })

  context('Api', () => {
    it('Has the correct schema', () => {
      cy.intercept('dashboard').as('dashboardResponse')
      cy.visit('/')
      cy.wait('@dashboardResponse').its('response.body')
        .should('have.property', 'model')
        .should('have.property', 'make')
    })
  })

  const newUserName = makeValidUsername(8)
  const newPassword = makeValidPassword(16)
  context('Registration', () => {
    before(() => {
      cy.visit('/register')
    })

    it('Can sign up a new user', () => {
      cy.intercept('/prod/users').as('register')
      cy.get('#username').clear().type(newUserName)
      cy.get('#firstName').clear().type('Fake')
      cy.get('#lastName').clear().type('Name')
      cy.get('#password').clear().type(newPassword)
      cy.get('#confirmPassword').clear().type(newPassword)

      cy.contains('button', 'Register').click()

      cy.wait('@register')
      cy.contains('div.alert-success', 'Registration is successful')
    })

    it('Can log in with newly signed up user', () => {
      cy.intercept('/prod/users/current').as('users')
      cy.get('nav input[name="login"]').clear().type(newUserName)
      cy.get('nav input[name="password"]').clear().type(newPassword)

      cy.contains('button[type="submit"]', 'Login').click()
      cy.wait('@users')

      cy.contains('nav span', 'Hi, Fake')
    })
  })
})

function makeValidUsername(length) {
  let result = ''
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const lettersLength = letters.length
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * lettersLength))
  }
  return result
}

function makeValidPassword(length) {
  let result = ''
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = `!@#$%^&*()_+[];',./{}:"<>?`
  const lettersLength = letters.length
  const numbersLength = numbers.length
  const symbolsLength = symbols.length
  for (let i = 0; i < length - 2; i++) {
    result += letters.charAt(Math.floor(Math.random() * lettersLength))
  }
  result += numbers.charAt(Math.floor(Math.random() * numbersLength))
  result += symbols.charAt(Math.floor(Math.random() * symbolsLength))
  return result
}