Feature: hackernews.com
  Background:
    Given I am in "https://news.ycombinator.com/news"

  Scenario: viewing profile 26
  When I click the button/link ".morelink"
  And I click user number "26"
  Then the url should have "new"