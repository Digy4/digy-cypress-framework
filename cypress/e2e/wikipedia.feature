Feature: wikipedia.org
  Background:
    Given I am in "https://en.wikipedia.org/wiki/Main_Page"

  Scenario: looking at ant stuff
    When I type "ant" to input field "[name='search']"
    And I click the button/link "#searchButton"
    Then the url should have "Ant"
    When I click all the links
    Then the url should have "Ant"