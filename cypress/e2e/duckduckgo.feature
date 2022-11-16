Feature: duckduckgo.com
  Background:
    Given I am in "https://www.duckduckgo.com/"

  Scenario: visiting the searchpage
    When I type "ducks" to input field "#search_form_input_homepage"
    And I click the button/link "#search_button_homepage"
    Then the url should have "ducks"