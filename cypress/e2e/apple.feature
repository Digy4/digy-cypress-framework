Feature: apple.com
  Background:
    Given I am in "https://www.apple.com/"

  Scenario: visiting the storepage
    When I click the button/link "[data-analytics-title='store']"
    Then the url should have "store"