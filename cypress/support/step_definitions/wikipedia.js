import {Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const linkCount = 5 // change back to 40 for 9 minute runtime

const clickAllLinks = async () => {
  for (let i = 0; i < linkCount; i++) {
    cy.get(`p>a`).eq(i).click({force:true});
    cy.wait(5000);
    cy.go('back');
    cy.wait(5000);
  }
}

When(/^I click all the links/, clickAllLinks);