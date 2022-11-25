import {Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const clickArticle = async (number) => {
  cy.get(`.hnuser`).eq(number).click({force:true})
  cy.wait(30000)
  cy.go('back')
  cy.wait(30000)
}

When(/^I click user number "([^"]*)?"/, clickArticle)