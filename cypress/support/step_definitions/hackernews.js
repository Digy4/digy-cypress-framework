import {Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const clickArticle = async (number) => {
  cy.get(`.hnuser`).eq(number).click({force:true})
  cy.wait(5000)
  cy.go('back')
  cy.wait(5000)
}

When(/^I click user number "([^"]*)?"/, clickArticle)