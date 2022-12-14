Feature: demo.guru99.com fail
  Background:
    Given I am in "https://demo.guru99.com/test/newtours/index.php"
  @fail
  Scenario: failing the registerpage
    When I click the button/link "a[href*='registerr']"
    When I type "FirstTomato" to input field "[name='firstName']"
    Then the url should not have "register"