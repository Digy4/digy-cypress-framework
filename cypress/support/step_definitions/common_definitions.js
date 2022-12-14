import {Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const goToUrl = (urlStr) => {
  cy.visit(urlStr)
};

const scrollToElement = async (selector) => {
  cy.get(`${selector}`).scrollIntoView({block: "center"})
}

const clickElement = async (selector) => {
  cy.get(`${selector}`).first().click()
}

const selectByValue = async (attrVal, selector) => {
  cy.get(`${selector}`).select(attrVal)
};

const setKeys = async (key, selector) => {
  cy.get(`${selector}`).focus().type(key, {force: true}) // added focus and force:true because Firefox
};

const urlContains = async (urlSubstring) => {
  cy.url().should('include', urlSubstring)
};

const urlNotContains = async (urlSubstring) => {
  cy.url().should('not.include', urlSubstring)
};

const expectElement = async (selector, content) => {
  cy.get(`${selector}=${content}`)
}

const expectElementPartial = async (selector, content) => {
  cy.get(`${selector}*=${content}`)
}

Given(/^I am in "([^"]*)?"$/, goToUrl);

When(/^I type "([^"]*)?" to input field "([^"]*)?"$/, setKeys);

When(/^I click the button\/link "([^"]*)?"$/, clickElement);

When(/^I select "([^"]*)?" from the dropdown "([^"]*)?"$/, selectByValue);

When(/^I scroll to "([^"]*)?"$/, scrollToElement);

When(/^I go back$/, async () => await browser.back());

When(/^I go to "([^"]*)?"$/, goToUrl);

Then(/^the url should have "([^"]*)?"$/, urlContains);

Then(/^the url should not have "([^"]*)?"$/, urlNotContains);

Then(/^there should be a\/an "([^"]*)?" with content "([^"]*)?"$/, expectElement);

Then(/^there should be a\/an "([^"]*)?" with partial content "([^"]*)?"$/, expectElementPartial);