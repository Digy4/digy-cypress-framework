Feature: demo.guru99.com
  Background:
    Given I am in "https://demo.guru99.com/test/newtours/index.php"

  Scenario: visiting the registerpage
    When I click the button/link "a[href*='register']"
    When I type "FirstTomato" to input field "[name='firstName']"
    Then the url should have "register"