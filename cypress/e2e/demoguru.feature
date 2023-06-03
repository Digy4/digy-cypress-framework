Feature: demo.guru99.com
  Background:
  @simple
  Scenario: visiting the registerpage 1
    Given I am in "https://demo.guru99.com/test/newtours/index.php"
    When I click the button/link "a[href*='register']"
    When I type "FirstTomato" to input field "[name='firstName']"
    Then the url should have "register"
  @simple
  Scenario: visiting the registerpage 2
    Given I am in "https://demo.guru99.com/test/newtours/index.php"
    When I click the button/link "a[href*='register']"
    When I type "FirstTomato" to input field "[name='firstName']"
    Then the url should have "register"
  @simple
  Scenario: visiting the registerpage 3
    Given I am in "https://demo.guru99.com/test/newtours/index.php"
    When I click the button/link "a[href*='register']"
    When I type "FirstTomato" to input field "[name='firstName']"
    Then the url should have "register"