import {Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const goToUrl = (urlStr) => {
  cy.visit(urlStr)
  cy.wait(3000)
};

const scrollToElement = async (selector) => {
  cy.get(`${selector}`).scrollIntoView({block: "center"})
  cy.wait(3000)
}

const clickElement = async (selector) => {
  cy.get(`${selector}`).click()
}

/*
const moveToElement = async (selector) => {
  // hovering DNE in cypress
}
*/

const selectByValue = async (attrVal, selector) => {
  cy.get(`${selector}`).select(attrVal)
  cy.wait(3000)
};

const setKeys = async (key, selector) => {
  cy.get(`${selector}`).type(key)
  cy.wait(3000)
};

const urlContains = async (urlSubstring) => {
  cy.url().should('include', urlSubstring)
  cy.wait(3000)
};

const urlNotContains = async (urlSubstring) => {
  cy.url().should('not.include', urlSubstring)
  cy.wait(3000)
};

const expectElement = async (selector, content) => {
  cy.get(`${selector}=${content}`)
  cy.wait(3000)
}

const expectElementPartial = async (selector, content) => {
  cy.get(`${selector}*=${content}`)
  cy.wait(3000)
}

Given(/^I am in "([^"]*)?"$/, goToUrl);

When(/^I type "([^"]*)?" to input field "([^"]*)?"$/, setKeys);

When(/^I click the button\/link "([^"]*)?"$/, clickElement);

When(/^I select "([^"]*)?" from the dropdown "([^"]*)?"$/, selectByValue);

// When(/^I hover over "([^"]*)?"$/, moveToElement);

When(/^I scroll to "([^"]*)?"$/, scrollToElement);

When(/^I go back$/, async () => await browser.back());

When(/^I go to "([^"]*)?"$/, goToUrl);

Then(/^the url should have "([^"]*)?"$/, urlContains);

Then(/^the url should not have "([^"]*)?"$/, urlNotContains);

Then(/^there should be a\/an "([^"]*)?" with content "([^"]*)?"$/, expectElement);

Then(/^there should be a\/an "([^"]*)?" with partial content "([^"]*)?"$/, expectElementPartial);